/* ============================================
   CONTENT-INDEED.JS
   Detects job applications on Indeed
   ============================================ */

console.log("🟦 Job Tracker: Indeed content script loaded");

let lastTrackedIndeed = "";

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


// ---- Scrape job details from Indeed page ----
function scrapeIndeedJob() {
    // Job title
    let role =
        document.querySelector("h1.jobsearch-JobInfoHeader-title")?.innerText ||
        document.querySelector(".jobsearch-JobInfoHeader-title")?.innerText ||
        document.querySelector("h1[data-testid='jobsearch-JobInfoHeader-title']")?.innerText ||
        document.querySelector("h2.jobTitle")?.innerText ||
        document.querySelector(".jobTitle")?.innerText ||
        document.querySelector("h1")?.innerText ||
        "Unknown Role";

    // Company
    let company =
        document.querySelector("[data-company-name]")?.innerText ||
        document.querySelector(".jobsearch-CompanyInfoContainer a")?.innerText ||
        document.querySelector(".jobsearch-InlineCompanyRating-companyHeader a")?.innerText ||
        document.querySelector(".css-1ioi40n")?.innerText ||
        document.querySelector(".companyName")?.innerText ||
        "Unknown Company";

    // Location
    let location =
        document.querySelector("[data-testid='job-location']")?.innerText ||
        document.querySelector(".jobsearch-JobInfoHeader-subtitle .css-1restlb")?.innerText ||
        document.querySelector(".companyLocation")?.innerText ||
        "";

    // Salary
    let salary =
        document.querySelector("#salaryInfoAndJobType")?.innerText ||
        document.querySelector("[data-testid='attribute_snippet_testid']")?.innerText ||
        "";

    return {
        role: role.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary.trim(),
        platform: "indeed",
        job_url: window.location.href
    };
}


// ---- Click listener ----
document.addEventListener("click", function (e) {
    const target = e.target;
    if (!target) return;

    const btn = target.closest("button") || target.closest("a") || target;
    const text = (btn.innerText || btn.textContent || "").toLowerCase().trim();
    const ariaLabel = (btn.getAttribute("aria-label") || "").toLowerCase();

    // Detect apply buttons
    const isApplyBtn =
        text.includes("apply now") ||
        text.includes("apply on company site") ||
        text.includes("apply") ||
        btn.id === "indeedApplyButton" ||
        btn.classList.contains("jobsearch-IndeedApplyButton-newDesign") ||
        ariaLabel.includes("apply");

    if (!isApplyBtn) return;

    // Skip non-apply actions
    if (text.includes("save") || text.includes("report") || text.includes("share")) return;

    console.log("🟦 Indeed Apply detected!");

    const jobData = scrapeIndeedJob();
    const jobKey = jobData.role + jobData.company;

    if (jobKey === lastTrackedIndeed) return;
    lastTrackedIndeed = jobKey;

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


// ---- Watch for Indeed Apply modal (Indeed uses iframes/modals) ----
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;

            // Look for Indeed Apply modal submit
            const applyBtn = node.querySelector?.("#indeedApplyButton") ||
                node.querySelector?.("button[data-testid='indeedApplyButton']");

            if (applyBtn) {
                applyBtn.addEventListener("click", function () {
                    console.log("🟦 Indeed Apply modal button clicked");
                    const jobData = scrapeIndeedJob();
                    const jobKey = jobData.role + jobData.company;
                    if (jobKey === lastTrackedIndeed) return;
                    lastTrackedIndeed = jobKey;

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
