/* ============================================
   SYNC-LINKEDIN.JS
   Passively syncs job statuses from LinkedIn Applied Jobs
   ============================================ */

console.log("🟦 Job Tracker: LinkedIn Sync Script Loaded!");

// Define mapping of LinkedIn statuses to our Tracker statuses
function mapLinkedInStatus(statusText) {
    statusText = (statusText || "").toLowerCase().trim();
    if (statusText.includes("not selected") || statusText.includes("rejected")) {
         return "rejected";
    }
    if (statusText.includes("interview") || statusText.includes("viewed") || statusText.includes("downloaded") || statusText.includes("resume viewed")) {
         // Some tools categorize viewed as interview stage to alert user, 
         // but we have a "viewed" status if supported, let's map viewed to viewed and interview to interview.
         if (statusText.includes("interview")) return "interview";
         return "viewed";
    }
    if (statusText.includes("offer") || statusText.includes("hired")) {
         return "offer";
    }
    if (statusText.includes("applied")) {
         return "applied";
    }
    return "applied"; // Default
}

function syncLinkedInJobs() {
    console.log("🟦 Job Tracker: Scanning LinkedIn Applications...");
    const jobs = [];
    
    // Selecting all potential job entry containers seen in common LinkedIn layouts
    const jobItems = document.querySelectorAll('.reusable-search__result-container, .entity-result, .job-card-list__container');
    
    if (jobItems.length === 0) {
        console.log("🟦 Job Tracker: No job items found on page.");
        return;
    }

    jobItems.forEach(item => {
        // Role: usually the first link in the title area
        const roleNode = item.querySelector('.entity-result__title-text a, .app-aware-link, .job-card-list__title');
        // Company: usually the primary subtitle
        const companyNode = item.querySelector('.entity-result__primary-subtitle, .job-card-container__company-name, [class*="company"]');
        // Status: searching for badges or secondary info
        const statusNode = item.querySelector('.entity-result__secondary-subtitle, .entity-result__badge, .job-card-container__footer-item');
        
        if (roleNode && companyNode) {
            const role = roleNode.innerText.split('\n')[0].trim();
            const company = companyNode.innerText.trim();
            const rawStatus = statusNode ? statusNode.innerText.trim() : "Applied";
            
            console.log(`Found: ${role} at ${company} (Raw Status: ${rawStatus})`);
            
            jobs.push({
                company: company,
                role: role,
                status: mapLinkedInStatus(rawStatus),
                platform: "linkedin"
            });
        }
    });

    if (jobs.length > 0) {
        console.log(`🟦 Job Tracker: Sending ${jobs.length} jobs to sync.`);
        chrome.runtime.sendMessage({
            type: "SYNC_JOBS",
            data: jobs
        });
    }
}

// Run initially and then periodically
setTimeout(syncLinkedInJobs, 3000);
setInterval(syncLinkedInJobs, 10000);
