// @ts-nocheck
import { MoreVertical, Edit2, Trash2, ExternalLink, Building2, Calendar, Layout } from 'lucide-react';
import type { JobApplication } from '../types/application';
import { useState } from 'react';
interface ApplicationTableProps {
  applications: JobApplication[];
  compact?: boolean;
  onEdit?: (application: JobApplication) => void;
  onDelete?: (id: string) => void;
}
export function ApplicationTable({ applications, compact, onEdit, onDelete }: ApplicationTableProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('applied')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('interview')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s.includes('offer')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('reject')) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return <span className="text-gray-400 dark:text-gray-500 italic text-[10px]">no date mentioned</span>;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return <span className="text-gray-400 italic text-[10px]">no date mentioned</span>;
    }
  };
  return (
    <div className="overflow-visible w-full">
      <table className="w-full border-separate border-spacing-y-3 px-2">
        <thead>
          <tr className="text-gray-400 text-[10px] uppercase tracking-[0.15em] font-black">
            <th className="px-6 py-2 text-left">Company & Role</th>
            <th className="px-6 py-2 text-left">Status</th>
            {!compact && (
              <>
                <th className="px-6 py-2 text-left">Platform</th>
                <th className="px-6 py-2 text-left">Applicant Email</th>
              </>
            )}
            <th className="px-6 py-2 text-left">Interview Date</th>
            {!compact && <th className="px-6 py-2 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="overflow-visible">
          {applications.map((app, index) => (
            <tr 
              key={app.id} 
              style={{ animationDelay: `${index * 80}ms` }}
              className={`group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both hover:translate-x-1 transition-all relative ${activeMenu === app.id ? 'z-50' : 'z-0'}`}
            >
              {/* Company & Role */}
              <td className="px-6 py-4 bg-white dark:bg-gray-800/50 rounded-l-2xl border-y border-l border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{app.company}</div>
                    <div className="text-xs text-gray-500 font-medium">{app.role || app.position}</div>
                  </div>
                </div>
              </td>
              {/* Status */}
              <td className="px-6 py-4 bg-white dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-all">
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(app.status)} dark:bg-opacity-10`}>
                  {app.status?.toUpperCase()}
                </span>
              </td>
              {!compact && (
                <>
                  <td className="px-6 py-4 bg-white dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-all text-xs font-medium text-gray-600 dark:text-gray-400">
                    {app.platform}
                  </td>
                  <td className="px-6 py-4 bg-white dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-all text-xs text-gray-500">
                    {app.email || app.applicantEmail}
                  </td>
                </>
              )}
              {/* Interview Date */}
              <td className="px-6 py-4 bg-white dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-all">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {formatDate(app.interviewDate)}
                </div>
              </td>
              {!compact && (
                <td className="px-6 py-4 bg-white dark:bg-gray-800/50 rounded-r-2xl border-y border-r border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-all text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setActiveMenu(activeMenu === app.id ? null : app.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeMenu === app.id && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-[70] animate-in zoom-in-95 duration-200">
                          <button
                            onClick={() => { onEdit?.(app); setActiveMenu(null); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" /> Edit Details
                          </button>
                          {app.meetingLink && (
                            <a href={app.meetingLink} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 transition-colors">
                              <ExternalLink className="w-4 h-4" /> Join Meeting
                            </a>
                          )}
                          <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                          <button
                            onClick={() => { onDelete?.(app.id); setActiveMenu(null); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Tracking
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {applications.length === 0 && (
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
           <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
           <p className="text-gray-500 font-bold">Your job journey starts here!</p>
           <p className="text-xs text-gray-400 mt-1">No applications tracked in this view yet.</p>
        </div>
      )}
    </div>
  );
}
