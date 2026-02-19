import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export const ReportsPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isOwner = user?.role_id === 2;
  const isOwnerReports = location.pathname === '/owner/reports';

  // Default to current month in YYYY-MM format
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const handleDownloadExcel = async () => {
    if (!selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    try {
      setDownloadingExcel(true);
      const response = await api.get('/analytics/download/excel', {
        params: { month: selectedMonth },
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Income_Expense_Report_${selectedMonth}.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Excel report downloaded successfully');
    } catch (error: any) {
      console.error('Excel download error:', error);
      toast.error(error.response?.data?.error || 'Failed to download Excel report');
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Show download option only for owners on owner reports page
  if (isOwnerReports && isOwner) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Download monthly income and expense reports</p>
        </div>

        {/* Download Section - Responsive UI */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Month Selector */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Month:
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Excel Download Button - Full width on mobile */}
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel || !selectedMonth}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-800 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-blue-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {downloadingExcel ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4" />
                <span>Download Excel</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default placeholder for other users or admin reports page
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-500">
          {isOwnerReports && !isOwner
            ? 'Reports are only available for Hostel Owners.'
            : 'Reports Page (Coming soon)'}
        </p>
      </div>
    </div>
  );
};
