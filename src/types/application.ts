export interface JobApplication {
  id: string;
  fullName: string;
  email: string;
  platform: 'LinkedIn' | 'Naukri' | 'Other';
  company: string;
  role: string;
  status: 'Applied' | 'Interview' | 'Rejected' | 'Offer';
  emailConsent: boolean;
  interviewDate?: string;
  meetingLink?: string;
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  platform: 'LinkedIn' | 'Naukri' | 'Other';
  company: string;
  role: string;
  status: 'Applied' | 'Interview' | 'Rejected' | 'Offer';
  emailConsent: boolean;
}
