import { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, Target, Calendar, Zap, 
  CheckCircle2, TrendingUp, ArrowUpRight, 
  Briefcase, Clock, Ban 
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { JobApplication } from '../types/application';
export function JobTrackingSystem() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 1. Live Fetch Logic (Functionality remains unchanged)
  const fetchData = useCallback(async () => {
    try {
      const data = await apiClient.getApplications();
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (error) {
      console.error("Tracking System Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live every 5s
    return () => clearInterval(interval);
  }, [fetchData]);
  // 2. Stats Calculation
  const total = applications.length;
  const getCount = (status: string[]) => applications.filter(a => status.includes(a.status?.toLowerCase() || '')).length;
  
  const appliedCount = getCount(['applied']);
  const interviewCount = getCount(['interview', 'interviewing']);
  const offerCount = getCount(['offer', 'accepted', 'offered']);
  const rejectedCount = getCount(['rejected']);
  const activeCount = appliedCount + interviewCount;
  if (isLoading && total === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Initializing Live Tracking...</p>
      </div>
    );
  }
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Job Tracking System
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Welcome back, <span className="font-semibold text-blue-600">{user?.name || 'User'}</span>. Here is your live career pipeline.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm border border-green-100 dark:border-green-900/30 px-4 py-2 rounded-2xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">
            Live Sync Active
          </span>
        </div>
      </div>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Briefcase className="w-6 h-6" />} 
          label="Total Applications" 
          value={total} 
          color="blue"
          sub="Lifetime apps"
        />
        <StatCard 
          icon={<Clock className="w-6 h-6" />} 
          label="Active Pipeline" 
          value={activeCount} 
          color="orange"
          sub="Applied & Interviews"
        />
        <StatCard 
          icon={<Calendar className="w-6 h-6" />} 
          label="Interviews" 
          value={interviewCount} 
          color="purple"
          sub="Upcoming sessions"
        />
        <StatCard 
          icon={<CheckCircle2 className="w-6 h-6" />} 
          label="Offers Won" 
          value={offerCount} 
          color="green"
          sub="Success stories"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Analytics Card */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pipeline Breakdown</h3>
            <span className="text-sm text-gray-400 font-medium">Real-time distribution</span>
          </div>
          
          <div className="space-y-8">
            <ProgressBar label="Applied" count={appliedCount} total={total} color="bg-blue-500" icon={<ClipboardList className="w-4 h-4" />} />
            <ProgressBar label="Interviewing" count={interviewCount} total={total} color="bg-purple-500" icon={<Calendar className="w-4 h-4" />} />
            <ProgressBar label="Offers Received" count={offerCount} total={total} color="bg-green-500" icon={<CheckCircle2 className="w-4 h-4" />} />
            <ProgressBar label="Rejections" count={rejectedCount} total={total} color="bg-red-400" icon={<Ban className="w-4 h-4" />} />
          </div>
        </div>
        {/* Quick Insight Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Success Rate</h3>
              <div className="text-5xl font-black mb-4">
                {total > 0 ? Math.round((offerCount / total) * 100) : 0}%
              </div>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Your application-to-offer ratio is calculated live. Keep up the great work!
              </p>
              <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold py-3 rounded-xl hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                Download Report <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                   <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Active Status</h4>
             </div>
             <p className="text-sm text-gray-500 dark:text-gray-400">
                You have <span className="font-bold text-gray-900 dark:text-white">{activeCount}</span> applications currently in progress. 
                Focus on the <span className="text-purple-600 font-bold">{interviewCount}</span> interviews scheduled this week.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// UI Components
function StatCard({ icon, label, value, color, sub }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-7 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
      <div className={`p-3 w-fit rounded-2xl mb-6 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-4xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{value}</div>
      <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400 italic">{sub}</div>
    </div>
  );
}
function ProgressBar({ label, count, total, color, icon }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
           {icon}
           <span className="font-bold tracking-wide text-sm uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-gray-400">{Math.round(percentage)}%</span>
           <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md font-black text-gray-900 dark:text-white text-sm">
             {count}
           </span>
        </div>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden p-1">
        <div 
          className={`h-full rounded-full ${color} shadow-sm transition-all duration-1000 ease-in-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
