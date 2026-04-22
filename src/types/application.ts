export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';
  location: string;
  salary?: string;
  appliedDate: string;
  lastUpdate: string;
  notes?: string;
  contactPerson?: string;
  contactEmail?: string;
  jobUrl?: string;
  followUp?: boolean;
}

export interface ApplicationFormData {
  company: string;
  position: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';
  location: string;
  salary?: string;
  appliedDate: string;
  notes?: string;
  contactPerson?: string;
  contactEmail?: string;
  jobUrl?: string;
  followUp?: boolean;
}
