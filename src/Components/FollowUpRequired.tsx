import { Bell, Clock, Mail, Phone, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function FollowUpRequired() {
  const [followUps, setFollowUps] = useState([
    {
      id: '1',
      company: 'StartupXYZ',
      position: 'Full Stack Engineer',
      appliedDate: '2026-02-01',
      daysSince: 11,
      status: 'No Response',
      priority: 'high',
      action: 'Send follow-up email',
      contactEmail: 'hr@startupxyz.com',
      completed: false,
    },
    {
      id: '2',
      company: 'CloudSystems',
      position: 'UI/UX Engineer',
      appliedDate: '2026-02-05',
      daysSince: 7,
      status: 'Waiting for Response',
      priority: 'medium',
      action: 'Check application status',
      contactEmail: 'careers@cloudsystems.com',
      completed: false,
    },
    {
      id: '3',
      company: 'MediaCo',
      position: 'JavaScript Developer',
      appliedDate: '2026-02-08',
      daysSince: 4,
      status: 'Recently Applied',
      priority: 'low',
      action: 'Wait 3 more days before following up',
      contactEmail: 'jobs@mediaco.com',
      completed: false,
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleMarkComplete = (id: string) => {
    setFollowUps((prev) => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white border border-green-700">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8" />
          <h2 className="text-2xl font-semibold">Follow Up Required</h2>
        </div>
        <p className="text-green-100">{followUps.filter(f => !f.completed).length} applications need your attention</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{followUps.filter(f => f.priority === 'high' && !f.completed).length}</p>
            </div>
          </div>
        </div>

        <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Medium Priority</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{followUps.filter(f => f.priority === 'medium' && !f.completed).length}</p>
            </div>
          </div>
        </div>

        <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{followUps.filter(f => f.completed).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Follow Up List */}
      <div className="space-y-4">
        {followUps.map((item) => (
          <div 
            key={item.id}
            className={`surface rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all ${item.completed ? 'opacity-60' : 'hover:shadow-lg'}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleMarkComplete(item.id)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <div>
                    <h3 className={`font-semibold text-lg ${item.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                      {item.position}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{item.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(item.priority)}`}>
                    {item.priority.toUpperCase()} PRIORITY
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <span className="text-sm">Applied {item.daysSince} days ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Bell className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <span className="text-sm">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <span className="text-sm">{item.contactEmail}</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-medium">Recommended Action:</span> {item.action}
                  </p>
                </div>

                {!item.completed && (
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Send Email
                    </button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Make Call
                    </button>
                    <button 
                      onClick={() => handleMarkComplete(item.id)}
                      className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Email Template Section */}
      <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Follow-Up Email Template</h3>
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            <strong>Subject:</strong> Following up on [Position] Application
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{`Dear Hiring Manager,

I hope this email finds you well. I wanted to follow up on my application for the [Position] role that I submitted on [Date]. I remain very interested in this opportunity and believe my skills and experience would be a great fit for your team.

I would appreciate any update on the status of my application or next steps in the hiring process.

Thank you for your time and consideration.

Best regards,
[Your Name]`}</p>
        </div>
      </div>
    </div>
  );
}
