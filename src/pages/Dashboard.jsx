import React, { useEffect, useState } from 'react';
import api from '../apiClient';
import { TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, trendRes, insRes] = await Promise.all([
          api.get('/api/analytics/summary'),
          api.get(`/api/analytics/trend?timeframe=${timeframe}`),
          api.get('/api/analytics/insights')
        ]);
        setSummary(sumRes.data.data);
        setTrend(trendRes.data.data);
        setInsights(insRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div className="card h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="card h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="card h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="card col-span-1 md:col-span-2 h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="card h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    );
  }

  const pieData = summary?.categoryBreakdown?.map(cat => ({
    name: cat.category,
    value: parseFloat(cat.total)
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        {insights?.insight && (
          <div className="bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg text-sm font-medium border border-primary-100 dark:border-primary-800 flex items-center gap-2">
            {insights.insight.includes('more') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {insights.insight}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IndianRupee className="w-16 h-16 text-primary-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent This Month</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            ₹{parseFloat(summary?.totalSpent || 0).toFixed(2)}
          </p>
        </div>

        <div className="card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Average</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            ₹{(parseFloat(summary?.totalSpent || 0) / new Date().getDate()).toFixed(2)}
          </p>
        </div>

        <div className="card relative overflow-hidden">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Single Expense</h3>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{parseFloat(summary?.highestExpense?.amount || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
              {summary?.highestExpense?.title || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <div className="card col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spending Trend</h3>
            <select 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="daily">Daily (30 days)</option>
              <option value="weekly">Weekly (12 weeks)</option>
              <option value="monthly">Monthly (6 months)</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, className: "dark:fill-gray-400" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, className: "dark:fill-gray-400" }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="card col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
          <div className="h-72 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${value}`} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data this month
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
