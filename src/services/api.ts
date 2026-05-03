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
      role: (data.position || data.role || '').toLowerCase(),
      status: (data.status || 'applied').toLowerCase(),
      platform: (data.platform || 'manual').toLowerCase(),
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
    try {
      // Use the exact same getHeaders() that works for your other API calls
      const response = await fetch(`${API_BASE_URL}/api/accounts/gmail/connect/`, {
        method: "GET",
        headers: getHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert("Backend Error: " + (errorData.detail || "Unauthorized. Please check your login."));
        return;
      }
      
      const data = await response.json();
      
      // Successfully got the Google URL from Django, now redirect the user!
      if (data.auth_url || data.url || data.authorization_url) {
        window.location.href = data.auth_url || data.url || data.authorization_url;
      } else {
        alert("Error: Backend did not return a valid Google login URL.");
      }
    } catch(e) {
      alert("Network Error: Could not reach the backend server to connect Gmail. Please check your browser console.");
      console.error(e);
    }
  },
  
  // 2. Check if the user is currently connected
  async getGmailStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/gmail/status/`, {
        method: "GET",
        headers: getHeaders()
      });
      if (!response.ok) return { is_connected: false };
      return await response.json();
    } catch(e) {
      return { is_connected: false };
    }
  },
  
  // 3. Disconnect Gmail
  async disconnectGmail() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/gmail/disconnect/`, {
        method: "POST",
        headers: getHeaders()
      });
      return response.ok;
    } catch(e) {
      return false;
    }
  }
};
