import { TrendingUp, Target, Award, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

export function SuccessRate() {
  const metrics = [
    {
      label: 'Overall Success Rate',
      value: '12.5%',
      change: '+2.5%',
      trend: 'up',
      description: 'From application to offer',
      color: 'bg-purple-500',
      icon: Target,
    },
    {
      label: 'Response Rate',
      value: '62.5%',
      change: '+5%',
      trend: 'up',
      description: 'Applications that got a response',
      color: 'bg-blue-500',
      icon: TrendingUp,
    },
    {
      label: 'Interview Conversion',
      value: '37.5%',
      change: '+2%',
      trend: 'up',
      description: 'Applications to interviews',
      color: 'bg-green-500',
      icon: Award,
    },
    {
      label: 'Offer Rate',
      value: '33.3%',
      change: '-5%',
      trend: 'down',
      description: 'Interviews to offers',
      color: 'bg-yellow-500',
      icon: Zap,
    },
  ];

  const conversionFunnel = [
    { id: 'funnel-applied', stage: 'Applied', count: 8, percentage: 100 },
    { id: 'funnel-responded', stage: 'Responded', count: 5, percentage: 62.5 },
    { id: 'funnel-interviewed', stage: 'Interviewed', count: 3, percentage: 37.5 },
    { id: 'funnel-offered', stage: 'Offered', count: 1, percentage: 12.5 },
  ];

  const monthlyTrends = [
    { id: 'trend-dec', month: 'Dec', successRate: 10 },
    { id: 'trend-jan', month: 'Jan', successRate: 10 },
    { id: 'trend-feb', month: 'Feb', successRate: 12.5 },
  ];

  const comparisonData = [
    { id: 'comp-yours', name: 'Your Success Rate', value: 12.5 },
    { id: 'comp-industry', name: 'Industry Average', value: 8 },
  ];

  const COLORS = ['#8B5CF6', '#3B82F6'];

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
              <Bar dataKey="count" fill="#8B5CF6" name="Applications" />
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
                fill="#8884d8"
                dataKey="value"
              >
                {comparisonData.map((entry) => (
                  <Cell key={entry.id} fill={COLORS[comparisonData.indexOf(entry) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              🎉 Great job! Your success rate is <strong>56% higher</strong> than the industry average of 8%.
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
              stroke="#8B5CF6" 
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