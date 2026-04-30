/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Plus, Briefcase, Users, Award, XCircle } from 'lucide-react';
import { apiClient } from '../services/api';

interface DashboardViewProps {
  setCurrentView: (view: string) => void;
}

export default function DashboardView({ setCurrentView }: DashboardViewProps) {
  const [stats, setStats] = useState({ total: 0, interviewing: 0, offers: 0, rejected: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getDashboardData()
      .then(data => {
        setStats(data.stats || { total: 0, interviewing: 0, offers: 0, rejected: 0 });
        setRecentJobs(data.recent_jobs || []);
      })
      .catch(err => console.error('Failed to fetch dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  const statsData = [
    { title: 'Total Applications', value: stats.total, icon: Briefcase, color: 'bg-blue-500' },
    { title: 'Interviewing', value: stats.interviewing, icon: Users, color: 'bg-yellow-500' },
    { title: 'Offers', value: stats.offers, icon: Award, color: 'bg-green-500' },
    { title: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-lg shadow-blue-900/10 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome back!</h2>
          <p className="text-blue-100 max-w-md text-lg">
            {loading ? 'Loading your dashboard...' : `You have ${stats.interviewing} active interview${stats.interviewing !== 1 ? 's' : ''} this week. Keep up the great momentum!`}
          </p>
          <button 
            onClick={() => setCurrentView('jobs')}
            className="mt-2 surface text-blue-700 dark:text-blue-300 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-600 transition-all shadow-sm flex items-center gap-2 hover:shadow hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add Application
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => {
          const Icon = stat.icon;
          return (
          <div key={i} className="surface rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{stat.value}</p>
            </div>
          </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="surface rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Applications</h3>
          <button 
            onClick={() => setCurrentView('jobs')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No applications yet. Start tracking your job search!</div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-700 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 font-semibold border-b border-gray-100 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3.5">Company</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700 text-sm">
              {recentJobs.slice(0, 4).map((job: any) => {
                const status = String(job.status || '').toLowerCase();
                return (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 flex items-center justify-center font-bold text-xs ring-1 ring-gray-200 dark:ring-gray-600 group-hover:ring-blue-100 transition-all shadow-sm">
                        {(job.company || '').charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{job.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{job.position || job.role}</td>
                  <td className="px-6 py-4">
                    <span className={`status ${status === 'interviewing' ? 'status-interviewing' :
                        status === 'offered' ? 'status-offered' :
                        status === 'rejected' ? 'status-rejected' : 'status-applied'
                      } px-3 py-1.5 inline-block`}>
                      {(job.status || '').charAt(0).toUpperCase() + (job.status || '').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-300 font-medium">{job.applied_date || job.appliedDate || job.applied}</td>
                </tr>
              );
            })}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
