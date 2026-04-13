import React, { useState } from 'react';
import api from '../apiClient';
import { DownloadCloud, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [timeframe, setTimeframe] = useState('this_month');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/analytics/report?timeframe=${timeframe}`);
      const expenses = data.data;

      if (!expenses || expenses.length === 0) {
        toast.error('No data found for this timeframe.');
        setLoading(false);
        return;
      }

      // Convert to CSV
      const headers = ['Date', 'Title', 'Category', 'Amount (₹)', 'Description'];
      const csvRows = [headers.join(',')];

      expenses.forEach(exp => {
        // Format date strictly to YYYY-MM-DD for better Excel compatibility
        const dateObj = new Date(exp.date);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const row = [
          formattedDate,
          `"${exp.title.replace(/"/g, '""')}"`,
          `"${exp.category}"`,
          exp.amount,
          `"${(exp.description || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      
      // Add BOM (\uFEFF) to force Excel to read document as UTF-8
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `expenses_report_${timeframe}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report downloaded!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analysis</h1>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Expense Data</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Timeframe
            </label>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
              <option value="all_time">All Time</option>
            </select>
          </div>

          <button 
            onClick={handleExport} 
            disabled={loading}
            className="btn btn-primary gap-2 w-full sm:w-auto flex items-center justify-center p-2.5"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
            {loading ? 'Generating...' : 'Generate & Download CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
