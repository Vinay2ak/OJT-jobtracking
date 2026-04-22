import { TrendingUp, Target, Award, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

export function SuccessRate() {
  const metrics = [
    {
      label: 'Overall Success Rate',
      value: '0%',
      change: '0%',
      trend: 'up',
      description: 'From application to offer',
      color: 'bg-purple-500',
      icon: Target,
    },
    {
      label: 'Response Rate',
      value: '0%',
      change: '0%',
      trend: 'up',
      description: 'Applications that got a response',
      color: 'bg-blue-500',
      icon: TrendingUp,
    },
    {
      label: 'Interview Conversion',
      value: '0%',
      change: '0%',
      trend: 'up',
      description: 'Applications to interviews',
      color: 'bg-green-500',
      icon: Award,
    },
    {
      label: 'Offer Rate',
      value: '0%',
      change: '0%',
      trend: 'up',
      description: 'Interviews to offers',
      color: 'bg-yellow-500',
      icon: Zap,
    },
  ];

  const conversionFunnel = [
    { id: 'funnel-applied', stage: 'Applied', count: 0, percentage: 0 },
    { id: 'funnel-responded', stage: 'Responded', count: 0, percentage: 0 },
    { id: 'funnel-interviewed', stage: 'Interviewed', count: 0, percentage: 0 },
    { id: 'funnel-offered', stage: 'Offered', count: 0, percentage: 0 },
  ];

  const monthlyTrends = [
    { id: 'trend-dec', month: 'Dec', successRate: 0 },
    { id: 'trend-jan', month: 'Jan', successRate: 0 },
    { id: 'trend-feb', month: 'Feb', successRate: 0 },
  ];

  const comparisonData = [
    { id: 'comp-yours', name: 'Your Success Rate', value: 0 },
    { id: 'comp-industry', name: 'Industry Average', value: 0 },
  ];

  const COLORS = ['#10b981', '#059669'];

  return (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white border border-purple-700">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8" />
          <h2 className="text-2xl font-semibold">Success Rate Analytics</h2>
        </div>
        <p className="text-purple-100">Track your job search performance and conversion rates</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? ArrowUp : ArrowDown;
            return (
            <div key={metric.label} className="surface rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  {metric.change}
                </span>
              </div>
              <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-1">{metric.label}</h3>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{metric.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionFunnel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10b981" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {conversionFunnel.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.stage}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-16 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate Comparison */}
        <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Comparison with Industry Average</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={comparisonData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#10b981"
                dataKey="value"
              >
                {comparisonData.map((entry) => (
                  <Cell key={entry.id} fill={COLORS[comparisonData.indexOf(entry) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              No success rate data is available right now.
            </p>
          </div>
        </div>
      </div>

      {/* Trend Over Time */}
      <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Success Rate Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="successRate" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Success Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            What's Working Well
          </h3>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your response rate (62.5%) is significantly above average
              </p>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Interview conversion rate is trending upward
              </p>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Overall success rate improved by 2.5% this month
              </p>
            </li>
          </ul>
        </div>

        <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Focus on interview preparation to improve offer conversion rate
              </p>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Consider tailoring applications to improve quality over quantity
              </p>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Follow up with pending applications to boost response rate further
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}