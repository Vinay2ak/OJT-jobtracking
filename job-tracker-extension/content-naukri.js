/* ============================================
   CONTENT-NAUKRI.JS
   Detects job applications on Naukri.com
   ============================================ */

console.log("🏢 Job Tracker: Naukri content script loaded");

let lastTrackedNaukri = "";

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


// ---- Scrape job details from Naukri page ----
function scrapeNaukriJob() {
    // Job title
    let role =
        document.querySelector("h1.styles_jd-header-title__rZwM1")?.innerText ||
        document.querySelector(".jd-header-title")?.innerText ||
        document.querySelector("h1")?.innerText ||
        "Unknown Role";

    // Company
    let company =
        document.querySelector(".styles_jd-header-comp-name__MvqAI a")?.innerText ||
        document.querySelector(".jd-header-comp-name a")?.innerText ||
        document.querySelector(".companyInfo a")?.innerText ||
        document.querySelector("[data-company-name]")?.innerText ||
        "Unknown Company";

    // Location
    let location =
        document.querySelector(".styles_jhc__loc__kz2FV")?.innerText ||
        document.querySelector(".location")?.innerText ||
        "";

    // Salary
    let salary =
        document.querySelector(".styles_jhc__salary__jdfEC")?.innerText ||
        document.querySelector(".salary")?.innerText ||
        "";

    return {
        role: role.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary.trim(),
        platform: "naukri",
        job_url: window.location.href
    };
}


// ---- Click listener ----
document.addEventListener("click", function (e) {
    const target = e.target;
    if (!target) return;

    const btn = target.closest("button") || target.closest("a") || target;
    const text = (btn.innerText || btn.textContent || "").toLowerCase().trim();

    // Detect apply buttons
    const isApplyBtn =
        text.includes("apply") ||
        text.includes("apply on company site") ||
        btn.id?.toLowerCase().includes("apply") ||
        btn.classList.contains("apply-button") ||
        btn.closest("#apply-button") !== null ||
        btn.closest(".styles_jhc__apply-button-container__12B8J") !== null;

    if (!isApplyBtn) return;

    // Skip non-apply buttons
    if (text.includes("save") || text.includes("share") || text.includes("report")) return;

    console.log("🏢 Naukri Apply detected!");

    const jobData = scrapeNaukriJob();
    const jobKey = jobData.role + jobData.company;

    if (jobKey === lastTrackedNaukri) return;
    lastTrackedNaukri = jobKey;

    console.log("Job Data:", jobData);

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


// ---- Watch for dynamically loaded apply buttons (Naukri is SPA-like) ----
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;

            // Check for "Applied Successfully" confirmation
            const successText = node.innerText || "";
            if (
                successText.includes("applied successfully") ||
                successText.includes("Already Applied")
            ) {
                console.log("🏢 Naukri: Application confirmed via DOM change");
                // Already tracked via click, but log for debugging
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
