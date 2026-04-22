const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-domain.com/api';

export const apiClient = {
  // Auth endpoints
  async register(name: string, email: string, password: string, codingLanguages: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, codingLanguages }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  // Job applications
  async getApplications(userId: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/applications?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  },

  async createApplication(data: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create application');
    return response.json();
  },
};