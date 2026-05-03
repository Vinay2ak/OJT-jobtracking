import { useState, useEffect } from 'react';
import { ClipboardList, Target, Calendar, Users, FileText, Zap, CheckCircle2, TrendingUp } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { JobApplication } from '../types/application';
export function JobTrackingSystem() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchData = async () => {
    // Try to find any ID available on the user object
    const userId = user?.id || user?._id || (user as any)?.uid;
    
    if (!userId) {
      // If we have a user object but no ID yet, wait a bit but stop the loading spinner
      if (user) setIsLoading(false);
      return;
    }
    try {
      const data = await apiClient.getApplications(userId);
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (error) {
      console.error("Tracking System Error:", error);
    } finally {
      setIsLoading(false); // DEFINITELY stop loading here
    }
  };
  useEffect(() => {
    // Initial fetch attempt
    fetchData();
    // LIVE UPDATE: Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user, user?.id]); // Re-run if user logs in or ID becomes available
  // Stats calculation
  const totalApplications = applications.length;
  const activeApplications = applications.filter(a => ['Applied', 'Interviewing', 'Interview'].includes(a.status)).length;
  const interviews = applications.filter(a => ['Interview', 'Interviewing'].includes(a.status)).length;
  const offers = applications.filter(a => ['Offer', 'Accepted', 'offered'].includes(a.status?.toLowerCase())).length;
  const successRate = totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0;
  // Show data as soon as it's available, OR stop loading after a few seconds anyway
  if (isLoading && applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Connecting to tracking service...</p>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Job Tracking System
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time metrics for {user?.name || 'your profile'}</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
          <Zap className="w-4 h-4 fill-current text-green-500" /> 
          <span className="animate-pulse">Live Updates Active</span>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ClipboardList className="text-blue-600" />} label="Total Apps" value={totalApplications} />
        <StatCard icon={<Target className="text-orange-600" />} label="Active" value={activeApplications} />
        <StatCard icon={<Calendar className="text-purple-600" />} label="Interviews" value={interviews} />
        <StatCard icon={<CheckCircle2 className="text-green-600" />} label="Offers" value={offers} />
      </div>
      {/* Pipeline Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Pipeline Status</h3>
        <div className="space-y-6">
          <ProgressBar label="Applied" count={applications.filter(a => a.status === 'Applied').length} total={totalApplications} color="bg-blue-500" />
          <ProgressBar label="Interviewing" count={interviews} total={totalApplications} color="bg-purple-500" />
          <ProgressBar label="Offers Received" count={offers} total={totalApplications} color="bg-green-500" />
          <ProgressBar label="Rejections" count={applications.filter(a => a.status === 'Rejected').length} total={totalApplications} color="bg-red-400" />
        </div>
      </div>
    </div>
  );
}
// Helpers
function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-2 bg-gray-50 dark:bg-gray-700 w-fit rounded-lg mb-4">{icon}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</div>
    </div>
  );
}
function ProgressBar({ label, count, total, color }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
        <span className="font-bold text-gray-900 dark:text-white">{count} ({Math.round(percentage)}%)</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
