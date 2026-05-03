const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ojt-jobtracking-1906.onrender.com";

// Helper to get headers with token
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiClient = {
  // ... Auth endpoints (register, login, loginWithGoogle, verifyOtp remain the same) ...
  
  // Job applications - CHANGED TO /api/applications/
  async getApplications() {
    const response = await fetch(`${API_BASE_URL}/api/applications/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch applications");
    return response.json();
  },

  async createJob(data: any) {
    // Note: Payload mapping is now handled automatically by the backend, 
    // but sending it clean like this is good practice.
    const payload = {
      fullName: data.fullName,
      email: data.email,
      company: data.company,
      role: data.role,
      platform: data.platform || 'manual',
      location: data.location || '',
      salary: data.salary || '',
      notes: data.notes || '',
    };
    
    const response = await fetch(`${API_BASE_URL}/api/applications/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to create job application");
    }
    return response.json();
  },

  // CHANGED TO /api/applications/ to match the createJob endpoint
  async updateJob(id: string | number, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update job application");
    return response.json();
  },

  // CHANGED TO /api/applications/
  async deleteApplication(id: string | number) {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete application");
    return true;
  },

  // Dashboard stats - THIS IS CORRECT
  async getDashboardData() {
    const response = await fetch(`${API_BASE_URL}/api/jobs/dashboard/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch dashboard data");
    return response.json();
  },

  // ... rest of the methods (Gmail, Interviews) are correct ...
};
