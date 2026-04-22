/* ============================================
   POPUP.JS — Extension Popup Logic
   ============================================ */

const API_BASE = "https://ojt-jobtracking-1906.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();

    // Email step: Send OTP
    document.getElementById("popupSendOtp").addEventListener("click", sendOTP);

    // OTP step: Verify
    document.getElementById("popupVerifyOtp").addEventListener("click", verifyOTP);

    // Back button
    document.getElementById("popupBackBtn").addEventListener("click", () => {
        document.getElementById("popupEmailStep").style.display = "block";
        document.getElementById("popupOtpStep").style.display = "none";
        hideError();
    });

    // Open dashboard
    document.getElementById("openDashboard").addEventListener("click", () => {
        chrome.tabs.create({ url: API_BASE + "/" });
    });

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "LOGOUT" }, () => {
            showLoginUI();
        });
    });

    // Enter key support
    document.getElementById("popupEmail").addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendOTP();
    });
    document.getElementById("popupOtp").addEventListener("keydown", (e) => {
        if (e.key === "Enter") verifyOTP();
    });
});


function checkLoginStatus() {
    chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response) => {
        if (response && response.loggedIn) {
            showLoggedInUI(response.email);
            loadStats();
        } else {
            showLoginUI();
        }
    });
}

function showLoginUI() {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("loggedInSection").style.display = "none";
    document.getElementById("popupEmailStep").style.display = "block";
    document.getElementById("popupOtpStep").style.display = "none";
}

function showLoggedInUI(email) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("loggedInSection").style.display = "block";
    document.getElementById("popupUserEmail").textContent = email || "Connected";
}

function showError(msg) {
    const el = document.getElementById("errorMsg");
    el.textContent = msg;
    el.style.display = "block";
}

function hideError() {
    document.getElementById("errorMsg").style.display = "none";
}


async function sendOTP() {
    hideError();
    const email = document.getElementById("popupEmail").value.trim();
    if (!email) { showError("Enter your email"); return; }

    const btn = document.getElementById("popupSendOtp");
    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
        const res = await fetch(`${API_BASE}/api/accounts/send-otp/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (res.ok) {
            document.getElementById("popupEmailStep").style.display = "none";
            document.getElementById("popupOtpStep").style.display = "block";
        } else {
            const data = await res.json();
            showError(data.error || "Failed to send OTP");
        }
    } catch (err) {
        showError("Cannot connect to server. Is it running?");
    }

    btn.disabled = false;
    btn.textContent = "Send OTP";
}


async function verifyOTP() {
    hideError();
    const email = document.getElementById("popupEmail").value.trim();
    const otp = document.getElementById("popupOtp").value.trim();
    if (!otp) { showError("Enter the OTP"); return; }

    const btn = document.getElementById("popupVerifyOtp");
    btn.disabled = true;
    btn.textContent = "Verifying...";

    chrome.runtime.sendMessage({
        type: "LOGIN",
        data: { email, otp }
    }, (response) => {
        if (response && response.success) {
            showLoggedInUI(email);
            loadStats();
        } else {
            showError(response?.error || "Login failed");
        }
        btn.disabled = false;
        btn.textContent = "Sign In";
    });
}


async function loadStats() {
    try {
        const result = await chrome.storage.local.get(["token"]);
        if (!result.token) return;

        const res = await fetch(`${API_BASE}/api/jobs/dashboard/`, {
            headers: { "Authorization": `Bearer ${result.token}` }
        });

        if (res.ok) {
            const data = await res.json();
            document.getElementById("popupTotalJobs").textContent = data.stats.total || 0;
            document.getElementById("popupApplied").textContent = data.stats.applied || 0;
            document.getElementById("popupOffers").textContent = data.stats.offer || 0;
        }
    } catch (err) {
        // Silently fail
    }
}
