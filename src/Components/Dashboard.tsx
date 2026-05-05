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
  LayoutGrid,
  Zap
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
      color: 'text-blue-600',
      bg: 'bg-blue-600/10',
      description: 'Jobs tracked'
    },
    { 
      label: 'Active Interviews', 
      value: data?.stats?.interviewing || 0, 
      icon: <Users className="w-6 h-6" />, 
      color: 'text-indigo-600',
      bg: 'bg-indigo-600/10',
      description: 'Upcoming meetings'
    },
    { 
      label: 'Pending Response', 
      value: data?.stats?.applied || 0, 
      icon: <Clock className="w-6 h-6" />, 
      color: 'text-amber-600',
      bg: 'bg-amber-600/10',
      description: 'Waiting for feedback'
    },
    { 
      label: 'Offers Received', 
      value: data?.stats?.offered || 0, 
      icon: <CheckCircle className="w-6 h-6" />, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-600/10',
      description: 'Success stories'
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-100">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-xs font-bold uppercase tracking-widest">Live Job Tracking</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
            <p className="text-blue-100/80 mt-1 font-medium">You've applied to {data?.stats?.total || 0} jobs so far. Keep pushing!</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
             <div className="text-right">
                <p className="text-xs font-semibold text-blue-100 uppercase">Current Status</p>
                <p className="text-lg font-bold">Active Search</p>
             </div>
             <TrendingUp className="w-8 h-8 text-blue-300" />
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group rounded-2xl border border-gray-200 dark:border-gray-800 surface p-6 hover:shadow-xl hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center gap-5">
              <div className={`${stat.bg} ${stat.color} flex items-center justify-center rounded-2xl p-4 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 surface overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-800/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Applications</h2>
              <p className="text-sm text-gray-500 mt-0.5">Manage your latest job pursuits.</p>
            </div>
          </div>
          <Link 
            to="/applications" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-2">
              <ApplicationTable 
                applications={data?.all_jobs?.slice(0, 5) || []} 
                compact={true} 
              />
              {(!data?.all_jobs || data.all_jobs.length === 0) && (
                <div className="text-center py-16">
                   <LayoutGrid className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                   <p className="text-gray-500 font-medium">No applications found yet. Start your journey!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
