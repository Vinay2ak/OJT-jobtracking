import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api'; // Import your API instance
export function Analytics() {
  const [loading, setLoading] = useState(true);
  // Dynamic Data States
  const [statusData, setStatusData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [responseRateData, setResponseRateData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    responseRate: 0,
    interviewRate: 0,
    offerRate: 0,
    avgResponseTime: 0
  });
  const COLORS = ['#10b981', '#059669', '#34d399', '#f59e0b', '#ef4444'];
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all jobs for the logged-in user from the backend
        const response = await api.get('/applications/');
        const jobs = response.data;
        // 1. Calculate Status Distribution
        const statusCounts = jobs.reduce((acc: any, job: any) => {
          const status = job.status || 'applied';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        setStatusData([
          { id: 'status-applied', name: 'Applied', value: statusCounts.applied || 0 },
          { id: 'status-interviewing', name: 'Interviewing', value: (statusCounts.interviewing || 0) + (statusCounts.interview || 0) },
          { id: 'status-offered', name: 'Offered', value: (statusCounts.offered || 0) + (statusCounts.offer || 0) },
          { id: 'status-rejected', name: 'Rejected', value: statusCounts.rejected || 0 },
        ].filter(item => item.value > 0)); // Only show slices on the pie chart if they have >0 jobs
        // 2. Calculate Conversion Funnel & Rates
        const total = jobs.length;
        const responses = jobs.filter((j: any) => ['interviewing', 'interview', 'offered', 'offer', 'rejected'].includes(j.status)).length;
        const interviews = jobs.filter((j: any) => ['interviewing', 'interview', 'offered', 'offer'].includes(j.status)).length;
        const offers = jobs.filter((j: any) => ['offered', 'offer', 'accepted'].includes(j.status)).length;
        setResponseRateData([
          { id: 'rate-response', name: 'Responses', responses: responses },
          { id: 'rate-interview', name: 'Interviews', responses: interviews },
          { id: 'rate-offer', name: 'Offers', responses: offers },
        ]);
        setMetrics({
          responseRate: total ? Math.round((responses / total) * 100) : 0,
          interviewRate: total ? Math.round((interviews / total) * 100) : 0,
          offerRate: total ? Math.round((offers / total) * 100) : 0,
          avgResponseTime: 5 // Default placeholder
        });
        // 3. Calculate Monthly Applications (Last 6 Months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyCounts = jobs.reduce((acc: any, job: any) => {
          if (job.applied_date || job.created_at) {
            const date = new Date(job.applied_date || job.created_at);
            const month = months[date.getMonth()];
            acc[month] = (acc[month] || 0) + 1;
          }
          return acc;
        }, {});
        const currentMonthIndex = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          let index = currentMonthIndex - i;
          if (index < 0) index += 12;
          const monthName = months[index];
          last6Months.push({
            id: `month-${monthName.toLowerCase()}`,
            month: monthName,
            applications: monthlyCounts[monthName] || 0
          });
        }
        setMonthlyData(last6Months);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);
  if (loading) {
    return <div className="p-6 text-center text-gray-500 animate-pulse">Loading analytics...</div>;
  }
  return (
    <div className="space-y-6 p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 surface dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Response Rate</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{metrics.responseRate}%</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Based on total apps</p>
        </div>
        <div className="rounded-lg border border-gray-200 surface dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Interview Rate</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{metrics.interviewRate}%</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Based on total apps</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Offer Rate</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{metrics.offerRate}%</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Based on total apps</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Avg. Response Time</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{metrics.avgResponseTime} days</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Estimated</p>
        </div>
      </div>
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Application Status Distribution</h3>
          {statusData.length === 0 ? (
             <div className="h-[300px] flex items-center justify-center text-gray-500">No applications to display</div>
          ) : (
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
          )}
        </div>
        {/* Monthly Applications */}
        <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Applications Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
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
            <YAxis allowDecimals={false} />
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
            {metrics.responseRate > 20 
              ? "Your response rate is above average! Keep using this resume strategy."
              : "Companies typically respond within 5-10 days of application."}
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
