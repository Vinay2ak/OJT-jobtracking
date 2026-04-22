/* ============================================
   BACKGROUND.JS — Extension Service Worker
   Handles API communication & notifications
   ============================================ */

const API_BASE = "https://ojt-jobtracking-1906.onrender.com";

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "JOB_APPLIED") {
        handleJobApplied(message.data).then(result => {
            sendResponse(result);
        }).catch(err => {
            sendResponse({ success: false, error: err.message });
        });
        return true; // Keep channel open for async response
    }

    if (message.type === "SYNC_JOBS") {
        handleSyncJobs(message.data).then(result => {
            sendResponse(result);
        }).catch(err => {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }

    if (message.type === "LOGIN") {
        handleLogin(message.data).then(result => {
            sendResponse(result);
        }).catch(err => {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }

    if (message.type === "LOGOUT") {
        chrome.storage.local.remove(["token", "refresh_token", "user_email"], () => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (message.type === "GET_STATUS") {
        chrome.storage.local.get(["token", "user_email"], (result) => {
            sendResponse({
                loggedIn: !!result.token,
                email: result.user_email || ""
            });
        });
        return true;
    }
});


/* ---- Handle Job Applied ---- */
async function handleJobApplied(data) {
    const result = await chrome.storage.local.get(["token"]);
    const token = result.token;

    if (!token) {
        return { success: false, error: "Not logged in" };
    }

    try {
        const res = await fetch(`${API_BASE}/api/jobs/extension-add/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                company: data.company,
                role: data.role,
                platform: data.platform,
                job_url: data.job_url || "",
                location: data.location || "",
                salary: data.salary || ""
            })
        });

        const responseData = await res.json();

        if (res.ok) {
            // Show notification
            const notifResult = await chrome.storage.local.get(["notif_enabled"]);
            const notifEnabled = notifResult.notif_enabled !== false;

            if (notifEnabled) {
                chrome.notifications.create({
                    type: "basic",
                    title: "✅ Job Tracked!",
                    message: `${data.role} at ${data.company}`,
                    iconUrl: "icon128.png"
                });
            }

            // Update badge
            updateBadge();

            return { success: true, data: responseData };
        } else if (res.status === 401) {
            return { success: false, error: "Session expired. Please login again." };
        } else {
            return { success: false, error: responseData.error || "Failed to track job" };
        }
    } catch (err) {
        return { success: false, error: "Cannot connect to server" };
    }
}


/* ---- Handle Login ---- */
async function handleLogin(data) {
    try {
        const res = await fetch(`${API_BASE}/api/accounts/login-otp/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.email, otp: data.otp })
        });

        const responseData = await res.json();

        if (res.ok && responseData.access) {
            await chrome.storage.local.set({
                token: responseData.access,
                refresh_token: responseData.refresh,
                user_email: data.email,
                notif_enabled: true
            });

            updateBadge();
            return { success: true };
        } else {
            return { success: false, error: responseData.error || "Login failed" };
        }
    } catch (err) {
        return { success: false, error: "Cannot connect to server" };
    }
}


/* ---- Badge: show today's count ---- */
async function updateBadge() {
    const result = await chrome.storage.local.get(["token"]);
    if (!result.token) {
        chrome.action.setBadgeText({ text: "" });
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/jobs/dashboard/`, {
            headers: { "Authorization": `Bearer ${result.token}` }
        });

        if (res.ok) {
            const data = await res.json();
            const count = data.stats.total || 0;
            chrome.action.setBadgeText({ text: count > 0 ? count.toString() : "" });
            chrome.action.setBadgeBackgroundColor({ color: "#3b82f6" });
        }
    } catch (err) {
        // Silently fail
    }
}

// Update badge on startup
updateBadge();

/* ---- Handle Sync Jobs ---- */
async function handleSyncJobs(jobsData) {
    const result = await chrome.storage.local.get(["token"]);
    const token = result.token;

    if (!token) {
        return { success: false, error: "Not logged in" };
    }

    try {
        const res = await fetch(`${API_BASE}/api/jobs/extension-sync/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ jobs: jobsData })
        });

        const responseData = await res.json();

        if (res.ok) {
            // If any statuses genuinely updated, we can optionally notify the user
            if (responseData.updated_count > 0) {
                const notifResult = await chrome.storage.local.get(["notif_enabled"]);
                if (notifResult.notif_enabled !== false) {
                    chrome.notifications.create({
                        type: "basic",
                        title: "🔄 Job Status Updated!",
                        message: `Synced ${responseData.updated_count} status change(s) automatically.`,
                        iconUrl: "icon128.png"
                    });
                }
            }
            return { success: true, data: responseData };
        } else {
            return { success: false, error: responseData.error || "Failed to sync jobs" };
        }
    } catch (err) {
        return { success: false, error: "Cannot connect to server for syncing" };
    }
}
