const API_BASE_URL = "https://ojt-jobtracking-1906.onrender.com";

// @ts-ignore
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiClient = {
  // @ts-ignore
  async getApplications() {
    const response = await fetch(`${API_BASE_URL}/api/applications/`, { headers: getHeaders() });
    return response.json();
  },
  // @ts-ignore
  async createJob(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/applications/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  // @ts-ignore
  async updateJob(id: any, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  // @ts-ignore
  async deleteApplication(id: any) {
    await fetch(`${API_BASE_URL}/api/applications/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return true;
  },
  async getDashboardData() {
    const response = await fetch(`${API_BASE_URL}/api/jobs/dashboard/`, { headers: getHeaders() });
    return response.json();
  },
};
