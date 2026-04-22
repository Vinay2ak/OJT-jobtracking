import { Bell } from 'lucide-react';

export function Notifications() {
  const notifications = [
    {
      id: 1,
      title: 'Interview Scheduled',
      message: 'Your interview with TechCorp is scheduled for tomorrow at 10:00 AM.',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Application Update',
      message: 'InnovateLabs has reviewed your application for Lead Frontend Developer.',
      time: '1 day ago',
      unread: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white border border-blue-700">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8" />
          <h2 className="text-2xl font-semibold">Notifications</h2>
        </div>
        <p className="text-blue-100">Stay up to date with your job application progress</p>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className={`surface rounded-lg border p-5 transition-shadow hover:shadow-md ${notification.unread ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className={`font-semibold text-lg ${notification.unread ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                  {notification.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{notification.time}</span>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No new notifications
          </div>
        )}
      </div>
    </div>
  );
}
