import { useState, useEffect } from 'react';
import { ClipboardList, Target, Calendar, Users, FileText, Zap, CheckCircle2, TrendingUp } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface TrackingApplication {
  id: string;
  company: string;
  position: string;
  appliedDate: string;
  lastUpdate: string;
  status?: string;
}

export function JobTrackingSystem() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<TrackingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const data = await apiClient.getApplications(user.id);
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch applications", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Compute dynamic stats
  const totalApplications = applications.length;
  const activeApplications = applications.filter(a => ['applied', 'interviewing', 'offered'].includes((a.status || '').toLowerCase())).length;
  const interviews = applications.filter(a => (a.status || '').toLowerCase() === 'interviewing').length;
  const offers = applications.filter(a => (a.status || '').toLowerCase() === 'offered').length;

  const applicationsByStatus = {
    applied: applications.filter(a => (a.status || '').toLowerCase() === 'applied'),
    interviewing: applications.filter(a => (a.status || '').toLowerCase() === 'interviewing'),
    offered: applications.filter(a => (a.status || '').toLowerCase() === 'offered'),
    accepted: applications.filter(a => (a.status || '').toLowerCase() === 'accepted'),
    rejected: applications.filter(a => (a.status || '').toLowerCase() === 'rejected'),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white border-2 border-indigo-500 shadow-lg">
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl">
            <ClipboardList className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Job Tracking System</h2>
            <p className="text-indigo-100 mt-1">Comprehensive overview of your job search journey</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Total
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-green-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Active Applications</p>
          <p className="text-3xl font-bold text-gray-900">{activeApplications}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              In Progress
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Interviews Scheduled</p>
          <p className="text-3xl font-bold text-gray-900">{interviews}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-yellow-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
              Success
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Offers Received</p>
          <p className="text-3xl font-bold text-gray-900">{offers}</p>
        </div>
      </div>

      {/* Tracking Board */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          Application Pipeline
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Applied Column */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-blue-900">Applied</h4>
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {applicationsByStatus.applied.length}
              </span>
            </div>
            <div className="space-y-3">
              {applicationsByStatus.applied.slice(0, 3).map(app => (
                <div key={app.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{app.company}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{app.position}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
              {applicationsByStatus.applied.length > 3 && (
                <p className="text-xs text-blue-600 text-center">+{applicationsByStatus.applied.length - 3} more</p>
              )}
            </div>
          </div>

          {/* Interviewing Column */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Interviewing</h4>
              <span className="bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {applicationsByStatus.interviewing.length}
              </span>
            </div>
            <div className="space-y-3">
              {applicationsByStatus.interviewing.slice(0, 3).map(app => (
                <div key={app.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{app.company}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{app.position}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(app.lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
              {applicationsByStatus.interviewing.length > 3 && (
                <p className="text-xs text-yellow-600 text-center">+{applicationsByStatus.interviewing.length - 3} more</p>
              )}
            </div>
          </div>

          {/* Offered Column */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-green-900 dark:text-green-200">Offered</h4>
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {applicationsByStatus.offered.length}
              </span>
            </div>
            <div className="space-y-3">
              {applicationsByStatus.offered.slice(0, 3).map(app => (
                <div key={app.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{app.company}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{app.position}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(app.lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
              {applicationsByStatus.offered.length > 3 && (
                <p className="text-xs text-green-600 text-center">+{applicationsByStatus.offered.length - 3} more</p>
              )}
            </div>
          </div>

          {/* Accepted Column */}
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-200">Accepted</h4>
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {applicationsByStatus.accepted.length}
              </span>
            </div>
            <div className="space-y-3">
              {applicationsByStatus.accepted.slice(0, 3).map(app => (
                <div key={app.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{app.company}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{app.position}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(app.lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
              {applicationsByStatus.accepted.length === 0 && (
                <p className="text-xs text-gray-500 text-center">No accepted offers yet</p>
              )}
            </div>
          </div>

          {/* Rejected Column */}
          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-red-900 dark:text-red-200">Rejected</h4>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {applicationsByStatus.rejected.length}
              </span>
            </div>
            <div className="space-y-3">
              {applicationsByStatus.rejected.slice(0, 3).map(app => (
                <div key={app.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{app.company}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{app.position}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(app.lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
              {applicationsByStatus.rejected.length > 3 && (
                <p className="text-xs text-red-600 text-center">+{applicationsByStatus.rejected.length - 3} more</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Document Management</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Keep track of resumes, cover letters, and other application documents in one place.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Interview Scheduling</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Never miss an interview with automatic reminders and calendar integration.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Contact Tracking</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Maintain relationships with recruiters and hiring managers throughout your search.
          </p>
        </div>
      </div>
    </div>
  );
}
