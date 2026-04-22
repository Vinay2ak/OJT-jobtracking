import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';

export function Analytics() {
  // Status distribution data
  const statusData = [
    { id: 'status-applied', name: 'Applied', value: 0 },
    { id: 'status-interviewing', name: 'Interviewing', value: 0 },
    { id: 'status-offered', name: 'Offered', value: 0 },
    { id: 'status-rejected', name: 'Rejected', value: 0 },
  ];

  // Monthly applications data
  const monthlyData = [
    { id: 'month-jan', month: 'Jan', applications: 0 },
    { id: 'month-feb', month: 'Feb', applications: 0 },
  ];

  // Response rate data
  const responseRateData = [
    { id: 'rate-response', name: 'Response Rate', responses: 0, total: 0 },
    { id: 'rate-interview', name: 'Interview Rate', interviews: 0, total: 0 },
    { id: 'rate-offer', name: 'Offer Rate', offers: 0, total: 0 },
  ];

  const COLORS = ['#10b981', '#059669', '#34d399', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 surface dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Response Rate</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">0%</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No change</p>
        </div>
        <div className="rounded-lg border border-gray-200 surface dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Interview Rate</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">0%</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No change</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Offer Rate</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">0%</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No change</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Avg. Response Time</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">0 days</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No change</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Application Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#10b981"
                dataKey="value"
              >
                {statusData.map((entry) => (
                  <Cell key={entry.id} fill={COLORS[statusData.indexOf(entry) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Applications */}
        <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Applications Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Rates Chart */}
      <div className="rounded-lg border border-gray-200 surface dark:border-gray-700 p-6">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Conversion Funnel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={responseRateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="responses" fill="#10b981" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-6">
          <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">💡 Insight</h4>
          <p className="text-blue-800 dark:text-blue-200">
            Your response rate is above average! Companies typically respond within 5-10 days of application.
          </p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-6">
          <h4 className="mb-2 font-semibold text-green-900 dark:text-green-200">🎯 Tip</h4>
          <p className="text-green-800 dark:text-green-200">
            Focus on following up with "Applied" status applications after 1 week to increase your interview rate.
          </p>
        </div>
      </div>
    </div>
  );
}