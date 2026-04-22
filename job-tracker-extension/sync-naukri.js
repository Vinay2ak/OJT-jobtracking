/* ============================================
   SYNC-NAUKRI.JS
   Passively syncs job statuses from Naukri Applied Jobs
   ============================================ */

console.log("🏢 Job Tracker: Naukri Sync Script Loaded!");

// Define mapping of Naukri statuses to our Tracker statuses
function mapNaukriStatus(statusText) {
    statusText = (statusText || "").toLowerCase().trim();
    if (statusText.includes("rejected") || statusText.includes("not shortlisted") || statusText.includes("no longer considered")) {
        return "rejected";
    }
    if (statusText.includes("interview") || statusText.includes("shortlisted") || statusText.includes("under review") || statusText.includes("action taken")) {
        return "interview";
    }
    if (statusText.includes("offer") || statusText.includes("selected") || statusText.includes("hired")) {
        return "offer";
    }
    if (statusText.includes("viewed") || statusText.includes("seen by recruiter")) {
        return "viewed";
    }
    return "applied"; // Default fallback
}

// Extract job cards and sync
function syncNaukriJobs() {
    console.log("🏢 Job Tracker: Scanning Naukri Applications...");
    const jobs = [];
    
    // Selecting Naukri job cards with broader selectors
    const jobItems = document.querySelectorAll('.app-card, .application-card, .tuple, .job-card, [class*="card"], [class*="tuple"]');
    
    if (jobItems.length === 0) {
        console.log("🏢 Job Tracker: No application cards found on page.");
        return;
    }

    jobItems.forEach(item => {
        // Extract Role
        const roleNode = item.querySelector('.role, .designation, h2, h3, .job-title');
        // Extract Company
        const companyNode = item.querySelector('.company, .org, .info-org, [class*="company"]');
        // Extract Status
        const statusNode = item.querySelector('.status, .state, .msg, [class*="status"], [class*="state"]');
        
        if (roleNode && companyNode) {
            const role = roleNode.innerText.trim();
            const company = companyNode.innerText.trim();
            const rawStatus = statusNode ? statusNode.innerText.trim() : "Applied";
            
            console.log(`Found: ${role} at ${company} (Raw Status: ${rawStatus})`);
            
            jobs.push({
                company: company,
                role: role,
                status: mapNaukriStatus(rawStatus),
                platform: "naukri"
            });
        }
    });

    if (jobs.length > 0) {
        console.log(`🏢 Job Tracker: Sending ${jobs.length} jobs to sync.`);
        chrome.runtime.sendMessage({
            type: "SYNC_JOBS",
            data: jobs
        });
    }
}

// Run the sync shortly after page load, and then every 10 seconds to catch SPA navigations
setTimeout(syncNaukriJobs, 3000);
setInterval(syncNaukriJobs, 10000);
