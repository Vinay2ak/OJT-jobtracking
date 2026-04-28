const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ojt-jobtracking-1906.onrender.com";

export const apiClient = {
  // Auth endpoints
  async register(name: string, email: string, password: string, codingLanguages: string) {
    // Django username cannot have spaces, so we'll use a sanitized version of name or just email
    const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
    
    const response = await fetch(`${API_BASE_URL}/api/accounts/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        username: username, // Use a valid username string
        name: name, 
        email, 
        password, 
        codingLanguages 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Extract the first error message from field-specific errors if needed
      let errorMessage = errorData.error || errorData.message || errorData.detail;
      
      if (!errorMessage && typeof errorData === 'object') {
        const firstKey = Object.keys(errorData)[0];
        if (firstKey) {
          const firstError = errorData[firstKey];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          errorMessage = `${firstKey}: ${errorMessage}`;
        }
      }
      
      throw new Error(errorMessage || "Registration failed");
    }
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || "Login failed");
    }
    return response.json();
  },

  async loginWithGoogle(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/accounts/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || "Google login failed");
    }
    return response.json();
  },

  async verifyOtp(email: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/api/accounts/verify-otp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || "Invalid OTP");
    }
    return response.json();
  },


  // Job applications
  async getApplications(userId: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/applications?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch applications");
    return response.json();
  },

  async createApplication(data: any) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create application");
    return response.json();
  },

  async updateApplication(id: string, data: any) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update application");
    return response.json();
  },

  async deleteApplication(id: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to delete application");
    return response.json();
  },
};
