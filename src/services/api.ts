// @ts-nocheck
const API_BASE_URL = "https://ojt-jobtracking-1906.onrender.com";
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
export const apiClient = {
  async login(credentials: any) {
    const response = await fetch(`${API_BASE_URL}/api/token/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json" 
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorData.detail || "Login failed");
      } catch(e) {
        throw new Error("Backend Server Error (500). Please check your Render Logs.");
      }
    }
    const data = await response.json();
    if (data.access || data.token) {
      localStorage.setItem("token", data.access || data.token);
    }
    return data; 
  },
  async verifyOtp(email: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/api/accounts/verify-otp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Invalid verification code");
    }
    if (data.access) {
      localStorage.setItem("token", data.access);
    }
    return data;
  },
  async signup(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/accounts/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Signup failed");
    }
    return response.json();
  },
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
  
  async connectGmail() {
    try {
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
      if (data.auth_url || data.url || data.authorization_url) {
        window.location.href = data.auth_url || data.url || data.authorization_url;
      } else {
        alert("Error: Backend did not return a valid Google login URL.");
      }
    } catch(e) {
      alert("Network Error: Could not reach the backend server to connect Gmail.");
      console.error(e);
    }
  },
  
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
  },

  async scanGmail() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/gmail/scan/`, {
        method: "POST",
        headers: getHeaders()
      });
      if (!response.ok) return { message: "Scan failed", updates: [] };
      return await response.json();
    } catch(e) {
      return { message: "Scan failed", updates: [] };
    }
  }
};
