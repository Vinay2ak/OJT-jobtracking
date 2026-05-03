import { useState, useEffect } from 'react';
import { apiClient } from '../services/api'; // Adjust path if necessary

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const dashboardData = await apiClient.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Applications',
      value: data?.stats?.total || 0,
      icon: '💼',
      color: 'bg-blue-500',
      change: `${data?.stats?.total || 0} total jobs`
    },
    {
      label: 'Active Interviews',
      value: data?.stats?.interviewing || 0,
      icon: '📈',
      color: 'bg-green-500',
      change: 'Keep it up!'
    },
    {
      label: 'Pending Response',
      value: data?.stats?.applied || 0,
      icon: '⏰',
      color: 'bg-yellow-500',
      change: 'Awaiting feedback'
    },
    {
      label: 'Offers Received',
      value: data?.stats?.offered || 0,
      icon: '✅',
      color: 'bg-purple-500',
      change: 'Congratulations!'
    },
  ];

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          return (
            <div key={stat.label} className="rounded-lg border border-gray-200 dark:border-gray-700 surface p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.change}</p>
                </div>
                <div className={`${stat.color} flex items-center justify-center rounded-lg p-3 text-2xl text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
