// @ts-nocheck
import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { ApplicationTable } from './AplicationTable';
import { 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getDashboardData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { 
      label: 'Total Applications', 
      value: data?.stats?.total || 0, 
      icon: <Briefcase className="w-6 h-6" />, 
      color: 'bg-blue-600',
      description: 'Jobs tracked'
    },
    { 
      label: 'Active Interviews', 
      value: data?.stats?.interviewing || 0, 
      icon: <Users className="w-6 h-6" />, 
      color: 'bg-indigo-600',
      description: 'Upcoming meetings'
    },
    { 
      label: 'Pending Response', 
      value: data?.stats?.applied || 0, 
      icon: <Clock className="w-6 h-6" />, 
      color: 'bg-amber-600',
      description: 'Waiting for feedback'
    },
    { 
      label: 'Offers Received', 
      value: data?.stats?.offered || 0, 
      icon: <CheckCircle className="w-6 h-6" />, 
      color: 'bg-emerald-600',
      description: 'Success stories'
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your progress and manage your recent career moves.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold border border-blue-100 dark:border-blue-800">
          <TrendingUp className="w-4 h-4" />
          You've applied to {data?.stats?.total || 0} jobs so far!
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group rounded-2xl border border-gray-200 dark:border-gray-800 surface p-6 hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-400 font-medium">{stat.description}</p>
              </div>
              <div className={`${stat.color} flex items-center justify-center rounded-2xl p-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area (Where you marked red) */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 surface overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-800/20">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Applications</h2>
            <p className="text-sm text-gray-500 mt-1">A summary of your latest job tracking activity.</p>
          </div>
          <Link 
            to="/applications" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-2">
              <ApplicationTable 
                applications={data?.all_jobs?.slice(0, 5) || []} 
                compact={true} 
              />
              {(!data?.all_jobs || data.all_jobs.length === 0) && (
                <div className="text-center py-12">
                   <p className="text-gray-500 italic">No applications found yet. Start by adding one!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
