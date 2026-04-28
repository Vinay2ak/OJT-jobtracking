/* ============================================
   CONTENT-LINKEDIN.JS
   Detects "Apply" and "Easy Apply" on LinkedIn
   ============================================ */

console.log("🔗 Job Tracker: LinkedIn content script loaded");

let lastTrackedLinkedIn = "";

// ---- Toast notification on page ----
function showPageToast(message) {
    const existing = document.getElementById("jt-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "jt-toast";
    toast.innerHTML = `
        <div style="
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 14px 24px;
            border-radius: 12px;
            font-family: -apple-system, sans-serif;
            font-size: 14px;
            font-weight: 600;
            z-index: 999999;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: jtSlideIn 0.4s ease-out;
        ">
            <span style="font-size:18px;">✅</span>
            <span>${message}</span>
        </div>
        <style>
            @keyframes jtSlideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes jtSlideOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(20px); }
            }
        </style>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        const inner = toast.querySelector("div");
        if (inner) inner.style.animation = "jtSlideOut 0.3s ease-in forwards";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}


// ---- Scrape job details from LinkedIn page ----
function scrapeLinkedInJob() {
    // Job title
    let role =
        document.querySelector(".job-details-jobs-unified-top-card__job-title h1")?.innerText ||
        document.querySelector(".job-details-jobs-unified-top-card__job-title")?.innerText ||
        document.querySelector(".jobs-unified-top-card__job-title")?.innerText ||
        document.querySelector("h1.t-24")?.innerText ||
        document.querySelector("h1")?.innerText ||
        "Unknown Role";

    // Company name
    let company =
        document.querySelector(".job-details-jobs-unified-top-card__company-name")?.innerText ||
        document.querySelector(".jobs-unified-top-card__company-name")?.innerText ||
        document.querySelector(".job-details-jobs-unified-top-card__primary-description-container .app-aware-link")?.innerText ||
        document.querySelector("[data-company-name]")?.innerText ||
        "Unknown Company";

    // Location
    let location =
        document.querySelector(".job-details-jobs-unified-top-card__bullet")?.innerText ||
        document.querySelector(".jobs-unified-top-card__bullet")?.innerText ||
        "";

    // Clean up
    role = role.trim();
    company = company.trim();
    location = location.trim();

    return {
        role,
        company,
        location,
        platform: "linkedin",
        job_url: window.location.href
    };
}


// ---- Click listener for Apply buttons ----
document.addEventListener("click", function (e) {
    const target = e.target;
    if (!target) return;

    // Find the button (could be clicking a child element like span inside button)
    const btn = target.closest("button") || target;
    const text = (btn.innerText || btn.textContent || "").toLowerCase().trim();

    // Detect "Easy Apply" or "Apply" button clicks
    const isApplyBtn =
        text.includes("easy apply") ||
        text.includes("apply") ||
        btn.classList.contains("jobs-apply-button") ||
        btn.getAttribute("aria-label")?.toLowerCase().includes("apply");

    if (!isApplyBtn) return;

    // Don't track "Save", "Follow", or navigation buttons
    if (text.includes("save") || text.includes("follow") || text.includes("share")) return;

    console.log("🔗 LinkedIn Apply detected!");

    const jobData = scrapeLinkedInJob();
    const jobKey = jobData.role + jobData.company;

    // Prevent duplicate tracking
    if (jobKey === lastTrackedLinkedIn) return;
    lastTrackedLinkedIn = jobKey;

    console.log("Job Data:", jobData);

    // Send to background worker
    chrome.runtime.sendMessage(
        { type: "JOB_APPLIED", data: jobData },
        (response) => {
            if (response && response.success) {
                showPageToast(`Tracked: ${jobData.role} at ${jobData.company}`);
            } else {
                console.log("Track failed:", response?.error);
            }
        }
    );
}, true);


// ---- Also detect Easy Apply modal submissions ----
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;

            // Look for the submit button in the Easy Apply modal
            const submitBtn = node.querySelector?.("button[aria-label='Submit application']") ||
                node.querySelector?.("button[aria-label='Review']");

            if (submitBtn) {
                submitBtn.addEventListener("click", function () {
                    console.log("🔗 LinkedIn Easy Apply submitted!");

                    const jobData = scrapeLinkedInJob();
                    const jobKey = jobData.role + jobData.company;
                    if (jobKey === lastTrackedLinkedIn) return;
                    lastTrackedLinkedIn = jobKey;

                    chrome.runtime.sendMessage(
                        { type: "JOB_APPLIED", data: jobData },
                        (response) => {
                            if (response && response.success) {
                                showPageToast(`Tracked: ${jobData.role} at ${jobData.company}`);
                            }
                        }
                    );
                }, { once: true });
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
