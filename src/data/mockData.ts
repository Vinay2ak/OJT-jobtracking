import type { JobApplication } from '../types/application';

export const mockApplications: JobApplication[] = [
  {
    id: '1',
    company: 'TechCorp',
    position: 'Senior Frontend Developer',
    status: 'interviewing',
    location: 'San Francisco, CA',
    salary: '$120k - $150k',
    appliedDate: '2026-01-15',
    lastUpdate: '2026-02-10',
    notes: 'Second round interview scheduled',
    contactPerson: 'Sarah Johnson',
    contactEmail: 'sarah.j@techcorp.com',
    jobUrl: 'https://techcorp.com/careers/frontend-dev'
    ,followUp: false
  },
  {
    id: '2',
    company: 'StartupXYZ',
    position: 'Full Stack Engineer',
    status: 'applied',
    location: 'Remote',
    salary: '$100k - $130k',
    appliedDate: '2026-02-01',
    lastUpdate: '2026-02-01',
    notes: 'Waiting for response',
    jobUrl: 'https://startupxyz.com/jobs',
    followUp: true
  },
  {
    id: '3',
    company: 'BigTech Inc',
    position: 'Software Engineer III',
    status: 'offered',
    location: 'Seattle, WA',
    salary: '$140k - $170k',
    appliedDate: '2026-01-05',
    lastUpdate: '2026-02-08',
    notes: 'Offer received! Need to respond by Feb 20',
    contactPerson: 'Michael Chen',
    contactEmail: 'm.chen@bigtech.com',
    followUp: false
  },
  {
    id: '4',
    company: 'FinanceHub',
    position: 'Frontend Developer',
    status: 'rejected',
    location: 'New York, NY',
    salary: '$110k - $135k',
    appliedDate: '2026-01-20',
    lastUpdate: '2026-01-28',
    notes: 'Position filled internally',
    followUp: false
  },
  {
    id: '5',
    company: 'DataStream',
    position: 'React Developer',
    status: 'interviewing',
    location: 'Austin, TX',
    salary: '$105k - $125k',
    appliedDate: '2026-01-25',
    lastUpdate: '2026-02-05',
    notes: 'Technical assessment completed',
    contactPerson: 'Emily Rodriguez',
    contactEmail: 'emily.r@datastream.io',
    followUp: true
  },
  {
    id: '6',
    company: 'CloudSystems',
    position: 'UI/UX Engineer',
    status: 'applied',
    location: 'Boston, MA',
    salary: '$115k - $140k',
    appliedDate: '2026-02-05',
    lastUpdate: '2026-02-05',
    jobUrl: 'https://cloudsystems.com/careers',
    followUp: false
  },
  {
    id: '7',
    company: 'InnovateLabs',
    position: 'Lead Frontend Developer',
    status: 'interviewing',
    location: 'Remote',
    salary: '$130k - $160k',
    appliedDate: '2026-01-18',
    lastUpdate: '2026-02-11',
    notes: 'Final round with CTO next week',
    contactPerson: 'David Park',
    contactEmail: 'david@innovatelabs.com',
    followUp: false
  },
  {
    id: '8',
    company: 'MediaCo',
    position: 'JavaScript Developer',
    status: 'applied',
    location: 'Los Angeles, CA',
    salary: '$95k - $120k',
    appliedDate: '2026-02-08',
    lastUpdate: '2026-02-08',
    followUp: false
  }
];

export const statsData = [
  { name: 'Total', value: 8 },
  { name: 'Interviewing', value: 4 },
  { name: 'Offers', value: 1 },
  { name: 'Rejected', value: 1 }
];

export const jobsData = mockApplications;
