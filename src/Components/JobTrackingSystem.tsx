import { useState, useEffect } from 'react';
import { ClipboardList, Target, Calendar, Users, FileText, Zap, CheckCircle2, TrendingUp } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { JobApplication } from '../types/application';
export function JobTrackingSystem() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 1. Function to fetch data from the backend
  const fetchData = async () => {
    if (!user?.id) return;
    try {
      const data = await apiClient.getApplications(user.id);
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setIsLoading(false);
    }
  };
  // 2. LIVE UPDATE LOGIC: This makes the page refresh every 5 seconds
  useEffect(() => {
    // Initial fetch
    fetchData();
    // Set up the interval for live updates
    const interval = setInterval(() => {
      fetchData();
    }, 5000); // 5000ms = 5 seconds
    // Clean up interval when you leave the page
    return () => clearInterval(interval);
  }, [user?.id]);
  // 3. Compute dynamic stats based on the live data
  const totalApplications = applications.length;
  const activeApplications = applications.filter(a => ['Applied', 'Interviewing'].includes(a.status)).length;
  const interviews = applications.filter(a => a.status === 'Interviewing').length;
  const offers = applications.filter(a => a.status === 'Offer' || a.status === 'Accepted').length;
  // Calculate success rate (Offers / Total)
  const successRate = totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0;
  if (isLoading && applications.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading tracking data...</div>;
  }
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Job Tracking System
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Live monitoring of your career progress</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          <Zap className="w-4 h-4 fill-current" /> Live Updates Active
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<ClipboardList className="text-blue-600" />} 
          label="Total Apps" 
          value={totalApplications} 
          trend="+12% this month" 
        />
        <StatCard 
          icon={<Target className="text-orange-600" />} 
          label="Active" 
          value={activeApplications} 
          trend="Currently processing" 
        />
        <StatCard 
          icon={<Calendar className="text-purple-600" />} 
          label="Interviews" 
          value={interviews} 
          trend="Upcoming sessions" 
        />
        <StatCard 
          icon={<CheckCircle2 className="text-green-600" />} 
          label="Offers" 
          value={offers} 
          trend={`${successRate}% Success Rate`} 
        />
      </div>
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pipeline Breakdown</h3>
            <div className="space-y-4">
              <ProgressBar label="Applied" count={applications.filter(a => a.status === 'Applied').length} total={totalApplications} color="bg-blue-500" />
              <ProgressBar label="Interviewing" count={interviews} total={totalApplications} color="bg-purple-500" />
              <ProgressBar label="Offers" count={offers} total={totalApplications} color="bg-green-500" />
              <ProgressBar label="Rejected" count={applications.filter(a => a.status === 'Rejected').length} total={totalApplications} color="bg-red-500" />
            </div>
          </div>
        </div>
        {/* Side Actions */}
        <div className="space-y-6">
          <div className="bg-blue-600 p-6 rounded-xl text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Track Everything</h3>
            <p className="text-blue-100 text-sm mb-4">Every application is a new opportunity. Keep your records up to date for the best analytics.</p>
            <button className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-50 transition-colors">
              Refresh Data Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// Small helper components
function StatCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-3">{trend}</div>
    </div>
  );
}
function ProgressBar({ label, count, total, color }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-bold text-gray-900 dark:text-white">{count}</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
