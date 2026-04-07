import { mockApplications } from '../data/mockData';
import { ApplicationTable } from './AplicationTable';
import { useOutletContext } from 'react-router-dom';

interface OutletContextType {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export function Dashboard() {
  const context = useOutletContext() as OutletContextType | undefined;
  const { setIsModalOpen } = context || { setIsModalOpen: () => { /* fallback handler */ } };

  const stats = [
    {
      label: 'Total Applications',
      value: mockApplications.length,
      icon: '💼',
      color: 'bg-blue-500',
      change: '+3 this week'
    },
    {
      label: 'Active Interviews',
      value: mockApplications.filter(app => app.status === 'interviewing').length,
      icon: '📈',
      color: 'bg-green-500',
      change: '+2 this week'
    },
    {
      label: 'Pending Response',
      value: mockApplications.filter(app => app.status === 'applied').length,
      icon: '⏰',
      color: 'bg-yellow-500',
      change: '+1 this week'
    },
    {
      label: 'Offers Received',
      value: mockApplications.filter(app => app.status === 'offered').length,
      icon: '✅',
      color: 'bg-purple-500',
      change: '+1 this month'
    },
  ];

  const recentApplications = mockApplications
    .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      {/* Add Application Card */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-blue-700 p-8 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
      >
        <div className="absolute -mr-32 -mt-32 right-0 top-0 h-64 w-64 rounded-full bg-blue-500 opacity-20" />
        <div className="absolute -mb-24 -ml-24 bottom-0 left-0 h-48 w-48 rounded-full bg-blue-400 opacity-20" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center rounded-2xl bg-white bg-opacity-20 p-6 text-5xl backdrop-blur-sm">
              ➕
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-3xl font-bold text-white">
                Add New Application
                <span className="text-2xl">✨</span>
              </h3>
              <p className="text-lg text-blue-100">
                Click here to track a new job application and keep your search organized
              </p>
            </div>
          </div>
            <div className="hidden md:block">
            <div className="rounded-xl surface px-8 py-4 text-lg font-semibold text-blue-600 dark:text-blue-300 transition-colors hover:bg-blue-50 dark:hover:bg-gray-600">
              Get Started →
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          return (
            <div key={stat.label} className="rounded-lg border border-gray-200 dark:border-gray-700 surface p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.change}</p>
                </div>
                <div className={`${stat.color} flex items-center justify-center rounded-lg p-3 text-2xl text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 surface">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
        </div>
        <ApplicationTable applications={recentApplications} compact />
      </div>
    </div>
  );
}