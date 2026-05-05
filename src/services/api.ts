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
  async login(emailOrCredentials: any, password?: string) {
    // FIX: Properly format the payload whether it's passed as (email, password) or a single object
    let payload;
    if (typeof emailOrCredentials === 'string' && password) {
      payload = { email: emailOrCredentials, password };
    } else if (typeof emailOrCredentials === 'string') {
      payload = { email: emailOrCredentials };
    } else {
      payload = emailOrCredentials;
    }

    const response = await fetch(`${API_BASE_URL}/api/token/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json" 
      },
      body: JSON.stringify(payload),
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

  // Alias to ensure both 'signup' and 'register' work flawlessly
  async signup(nameOrData: any, email?: string, password?: string, codingLanguages?: string) {
    return this.register(nameOrData, email, password, codingLanguages);
  },

  async register(nameOrData: any, email?: string, password?: string, codingLanguages?: string) {
    // FIX: Properly format the payload whether it's passed as 4 arguments or a single object
    let payload;
    if (typeof nameOrData === 'string' && email && password) {
      payload = { fullName: nameOrData, email, password, codingLanguages };
    } else if (typeof nameOrData === 'string') {
      try { payload = JSON.parse(nameOrData); } catch(e) { payload = nameOrData; }
    } else {
      payload = nameOrData;
    }

    const response = await fetch(`${API_BASE_URL}/api/accounts/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || error.detail || JSON.stringify(error);
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async getApplications() {
    const response = await fetch(`${API_BASE_URL}/api/applications/`, { headers: getHeaders() });
    if (!response.ok) return [];
    return response.json();
  },

  // NEW FUNCTION: Fetches applications with "interviewing" status and merges them with AI extracted Gmail links
  async getUpcomingInterviews() {
    try {
      const [appsResponse, interviewsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/applications/`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/interviews/upcoming/`, { headers: getHeaders() })
      ]);

      const apps = appsResponse.ok ? await appsResponse.json() : [];
      const aiInterviews = interviewsResponse.ok ? await interviewsResponse.json() : [];

      const interviewingApps = apps.filter((app: any) => 
        app.status === 'interviewing' || app.status === 'interview'
      );

      return interviewingApps.map((app: any) => {
        const aiData = aiInterviews.find((i: any) => 
          i.company === app.company && i.position === app.position
        );

        return {
          id: app.id,
          company: app.company,
          position: app.position,
          scheduled_date: aiData?.scheduledDate || app.lastUpdate || new Date().toISOString(),
          meeting_link: aiData?.meetingLink || '',
          meeting_platform: aiData?.meetingPlatform || '',
          interviewer_name: aiData?.interviewerName || '',
          notes: aiData?.notes || app.notes || ''
        };
      });
    } catch (error) {
      console.error("Failed to fetch interviews", error);
      return [];
    }
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
    try {
      const [dashResponse, interviewsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/jobs/dashboard/`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/interviews/upcoming/`, { headers: getHeaders() })
      ]);

      if (!dashResponse.ok) return { stats: {} };
      const data = await dashResponse.json();
      const aiInterviews = interviewsResponse.ok ? await interviewsResponse.json() : [];

      // Attach the AI-extracted interview date and link to the jobs in the dashboard
      const enhancedJobs = (data.all_jobs || []).map((job: any) => {
        const aiData = aiInterviews.find((i: any) => 
          i.company === job.company && i.position === job.position
        );
        return {
          ...job,
          interviewDate: aiData?.scheduledDate || null,
          meetingLink: aiData?.meetingLink || null
        };
      });

      return {
        ...data,
        all_jobs: enhancedJobs
      };
    } catch (e) {
      return { stats: {} };
    }
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
