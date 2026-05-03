import { useState, useEffect } from 'react';
import { ClipboardList, Target, Calendar, Users, FileText, Zap, CheckCircle2, TrendingUp } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { JobApplication } from '../types/application';
export function JobTrackingSystem() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 1. Improved Fetch Data function
  const fetchData = async () => {
    // Check for both 'id' and '_id' just in case
    const userId = user?.id || user?._id;
    
    if (!userId) {
      // If we are logged in but still no ID, we might be waiting for auth to finish
      return; 
    }
    try {
      const data = await apiClient.getApplications(userId);
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setIsLoading(false); // Stop loading once the API responds
    }
  };
  // 2. LIVE UPDATE: Fetch every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]); // Re-run if user object changes
  // 3. Stats calculation
  const totalApplications = applications.length;
  const activeApplications = applications.filter(a => ['Applied', 'Interviewing', 'Interview'].includes(a.status)).length;
  const interviews = applications.filter(a => ['Interview', 'Interviewing'].includes(a.status)).length;
  const offers = applications.filter(a => ['Offer', 'Accepted'].includes(a.status)).length;
  const successRate = totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0;
  // 4. Robust Loading State: Only show if we truly have no data and are loading
  if (isLoading && applications.length === 0) {
    if (!user) return <div className="p-8 text-center text-gray-500 font-medium">Please log in to view tracking...</div>;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse font-medium">Syncing live tracking data...</p>
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
          <p className="text-gray-500 dark:text-gray-400">Real-time application metrics</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
          <Zap className="w-4 h-4 fill-current text-green-500" /> 
          <span className="animate-pulse">Live</span>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ClipboardList className="text-blue-600" />} label="Total Applications" value={totalApplications} trend="Lifetime" />
        <StatCard icon={<Target className="text-orange-600" />} label="Active Pipeline" value={activeApplications} trend="Current" />
        <StatCard icon={<Calendar className="text-purple-600" />} label="Interviews" value={interviews} trend="Scheduled" />
        <StatCard icon={<CheckCircle2 className="text-green-600" />} label="Offers/Accepted" value={offers} trend={`${successRate}% Success`} />
      </div>
      {/* Charts / Progress Area */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Application Pipeline</h3>
        <div className="space-y-6">
          <ProgressBar label="Applied" count={applications.filter(a => a.status === 'Applied').length} total={totalApplications} color="bg-blue-500" />
          <ProgressBar label="Interviewing" count={interviews} total={totalApplications} color="bg-purple-500" />
          <ProgressBar label="Offers" count={offers} total={totalApplications} color="bg-green-500" />
          <ProgressBar label="Rejected" count={applications.filter(a => a.status === 'Rejected').length} total={totalApplications} color="bg-red-400" />
        </div>
      </div>
    </div>
  );
}
// Sub-components
function StatCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
      <div className="p-2 bg-gray-50 dark:bg-gray-700 w-fit rounded-lg mb-4">{icon}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</div>
      <div className="mt-4 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 w-fit px-2 py-1 rounded uppercase font-bold">{trend}</div>
    </div>
  );
}
function ProgressBar({ label, count, total, color }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
        <span className="font-bold text-gray-900 dark:text-white">{count} ({Math.round(percentage)}%)</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
        <div className={`h-3 rounded-full ${color} shadow-sm transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
