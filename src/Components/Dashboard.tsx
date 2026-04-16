export function Dashboard() {
  const stats = [
    {
      label: 'Total Applications',
      value: 0,
      icon: '💼',
      color: 'bg-blue-500',
      change: '0 this week'
    },
    {
      label: 'Active Interviews',
      value: 0,
      icon: '📈',
      color: 'bg-green-500',
      change: '0 this week'
    },
    {
      label: 'Pending Response',
      value: 0,
      icon: '⏰',
      color: 'bg-yellow-500',
      change: '0 this week'
    },
    {
      label: 'Offers Received',
      value: 0,
      icon: '✅',
      color: 'bg-purple-500',
      change: '0 this month'
    },
  ];

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