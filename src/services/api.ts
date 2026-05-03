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
    // ... other code ...

    // ... other code ...

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


  // ... rest of the code ...

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
};
