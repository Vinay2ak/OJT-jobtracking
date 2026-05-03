// @ts-nocheck
const API_BASE_URL = "https://ojt-jobtracking-1906.onrender.com";
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
export const apiClient = {
  async getApplications() {
    const response = await fetch(`${API_BASE_URL}/api/applications/`, { headers: getHeaders() });
    if (!response.ok) return [];
    return response.json();
  },
  async createJob(data: any) {
    const payload = {
      ...data,
      // Ensure these are lowercase for the database
      role: (data.position || data.role || '').toLowerCase(),
      status: (data.status || 'applied').toLowerCase(),
      platform: (data.platform || 'manual').toLowerCase(),
      // Ensure we send empty strings instead of undefined for optional fields
      location: data.location || '',
      salary: data.salary || '',
    };
    const response = await fetch(`${API_BASE_URL}/api/applications/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      // If it fails, we show the actual error from the server in the alert
      const errorMessage = JSON.stringify(errorData);
      console.error("Backend Error:", errorData);
      throw new Error(errorMessage);
    }
    return response.json();
  },
  async updateJob(id: any, data: any) {
    const payload = {
      ...data,
      role: (data.position || data.role || '').toLowerCase(),
      status: (data.status || '').toLowerCase(),
      platform: (data.platform || '').toLowerCase(),
    };
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  },
  async deleteApplication(id: any) {
    await fetch(`${API_BASE_URL}/api/applications/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return true;
  },
  async getDashboardData() {
    const response = await fetch(`${API_BASE_URL}/api/jobs/dashboard/`, { headers: getHeaders() });
    if (!response.ok) return { stats: {} };
    return response.json();
  },
  // ==========================================
  // GMAIL INTEGRATION ENDPOINTS
  // ==========================================
  // 1. Get the Google Login URL to redirect the user
  async connectGmail() {
    const response = await fetch(`${API_BASE_URL}/api/accounts/gmail/connect/`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    // Most Django OAuth setups return the Google URL in JSON format, e.g., { url: "https://accounts.google.com/..." }
    // If it redirects directly, the browser will follow it, or we handle the JSON response.
    try {
      const data = await response.json();
      if (data.url || data.authorization_url) {
        window.location.href = data.url || data.authorization_url;
      } else {
         // Fallback if backend expects a direct redirect
         window.location.href = `${API_BASE_URL}/api/accounts/gmail/connect/?token=${localStorage.getItem("token")}`;
      }
    } catch(e) {
      // If backend redirects directly without JSON
      window.location.href = `${API_BASE_URL}/api/accounts/gmail/connect/?token=${localStorage.getItem("token")}`;
    }
  },
  // 2. Check if the user is currently connected
  async getGmailStatus() {
    const response = await fetch(`${API_BASE_URL}/api/accounts/gmail/status/`, {
      headers: getHeaders()
    });
    if (!response.ok) return { is_connected: false };
    return response.json();
  },
  // 3. Disconnect Gmail
  async disconnectGmail() {
    const response = await fetch(`${API_BASE_URL}/api/accounts/gmail/disconnect/`, {
      method: "POST",
      headers: getHeaders()
    });
    return response.ok;
  }
};
