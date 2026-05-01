import type { JobApplication } from '../types/application';

export const mockApplications: JobApplication[] = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    platform: 'LinkedIn',
    company: 'TechCorp',
    role: 'Senior Frontend Developer',
    status: 'Interview',
    interviewDate: '2026-02-15T10:00:00Z',
    meetingLink: 'https://zoom.us/j/123456789'
  },
  {
    id: '2',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    platform: 'Naukri',
    company: 'StartupXYZ',
    role: 'Full Stack Engineer',
    status: 'Applied'
  },
  {
    id: '3',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    platform: 'Other',
    company: 'BigTech Inc',
    role: 'Software Engineer III',
    status: 'Offer'
  },
  {
    id: '4',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    platform: 'LinkedIn',
    company: 'FinanceHub',
    role: 'Frontend Developer',
    status: 'Rejected'
  },
  {
    id: '5',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    platform: 'Other',
    company: 'DataStream',
    role: 'React Developer',
    status: 'Interview'
  },
  {
    id: '6',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    platform: 'LinkedIn',
    company: 'CloudSystems',
    role: 'UI/UX Engineer',
    status: 'Applied'
  },
  {
    id: '7',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    platform: 'Naukri',
    company: 'InnovateLabs',
    role: 'Lead Frontend Developer',
    status: 'Interview'
  },
  {
    id: '8',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    platform: 'Other',
    company: 'MediaCo',
    role: 'JavaScript Developer',
    status: 'Applied'
  }
];

export const statsData = [
  { name: 'Total', value: 8 },
  { name: 'Interviewing', value: 4 },
  { name: 'Offers', value: 1 },
  { name: 'Rejected', value: 1 }
];

export const jobsData = mockApplications;
