import { MoreVertical, Edit2, Trash2, ExternalLink, Star } from 'lucide-react';
import type { JobApplication } from '../types/application';
import { useState } from 'react';

interface ApplicationTableProps {
  applications: JobApplication[];
  compact?: boolean;
  onEdit?: (application: JobApplication) => void;
  onDelete?: (id: string) => void;
  onToggleFollowUp?: (id: string) => void;
}

export function ApplicationTable({ applications, compact, onEdit, onDelete, onToggleFollowUp }: ApplicationTableProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-700';
      case 'interviewing':
        return 'bg-yellow-100 text-yellow-700';
      case 'offered':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'accepted':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {!compact && (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
              </>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Update
            </th>
            {!compact && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="surface divide-y divide-gray-200 dark:divide-gray-700">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <button
                    title={app.followUp ? 'Unmark follow-up' : 'Mark for follow-up'}
                    onClick={() => onToggleFollowUp?.(app.id)}
                    className={`p-1 rounded ${app.followUp ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400 dark:text-gray-400 dark:hover:text-yellow-400'}`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{app.company}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900 dark:text-gray-100">{app.position}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)} dark:bg-opacity-20 dark:text-gray-200`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </td>
              {!compact && (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {app.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {app.salary || '-'}
                  </td>
                </>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatDate(app.appliedDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatDate(app.lastUpdate)}
              </td>
              {!compact && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setActiveMenu(activeMenu === app.id ? null : app.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeMenu === app.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveMenu(null)}
                        />
                        <div className="absolute right-0 mt-2 w-48 surface rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                          <button
                            onClick={() => {
                              onEdit?.(app);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Job
                            </a>
                          )}
                          <button
                            onClick={() => {
                              onToggleFollowUp?.(app.id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            {app.followUp ? 'Unmark Follow-up' : 'Mark for Follow-up'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this application?')) {
                                onDelete?.(app.id);
                              }
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
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
        <div className="text-center py-12 text-gray-500">
          No applications found
        </div>
      )}
    </div>
  );
}
