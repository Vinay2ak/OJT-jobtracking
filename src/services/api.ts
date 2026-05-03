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

  async createJob(data: any) {
    // We send the data exactly as the form provides it, 
    // and the backend will handle the mapping.
    const response = await fetch(`${API_BASE_URL}/api/applications/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        ...data,
        // Ensure the backend gets the 'role' field it wants
        role: data.position || data.role, 
        status: data.status || 'applied',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend Validation Error:", errorData);
      throw new Error("Validation Failed");
    }
    return response.json();
  },

  async updateJob(id: any, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        ...data,
        role: data.position || data.role,
      }),
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
