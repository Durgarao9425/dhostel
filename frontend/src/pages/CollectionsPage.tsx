import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, IndianRupee, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Payment {
  payment_id: number;
  amount: number;
  payment_date: string;
  receipt_number: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  student_name: string;
  room_number: string | null;
  payment_mode: string | null;
}

export const CollectionsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/monthly-fees/collections', {
        params: { month: selectedMonth }
      });
      setPayments(response.data.data.payments || []);
    } catch (error) {
      toast.error('Failed to fetch collections');
      console.error('Fetch collections error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const formatMonthDisplay = (monthStr: string) => {
    const [y, m] = monthStr.split('-').map(Number);
    return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  // Group payments by date
  const groupedPayments = useMemo(() => {
    const groups: Record<string, { payments: Payment[]; total: number }> = {};
    payments.forEach((p) => {
      const date = p.payment_date.split('T')[0];
      if (!groups[date]) {
        groups[date] = { payments: [], total: 0 };
      }
      groups[date].payments.push(p);
      groups[date].total += Number(p.amount);
    });
    const sorted = Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
    return sorted;
  }, [payments]);

  const monthTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden md:flex items-center justify-between">
        <h1 className="text-sm font-bold text-gray-900">Payment Collections</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 text-xs font-medium">Total Collected:</span>
              <span className="text-sm font-bold text-green-600">{formatCurrency(monthTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-bold text-gray-900">Collections</h1>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2 py-1 text-[10px] border border-gray-300 rounded-lg bg-white"
          />
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <span className="text-xs text-gray-600">Total: </span>
          <span className="text-sm font-bold text-green-600">{formatCurrency(monthTotal)}</span>
          <span className="text-[10px] text-gray-500 ml-1">({payments.length} transactions)</span>
        </div>
      </div>

      {/* Content */}
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No Collections</h3>
          <p className="text-xs text-gray-500">No payments recorded for {formatMonthDisplay(selectedMonth)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedPayments.map(([date, group]) => (
            <div key={date} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Date Header */}
              <div className="bg-primary-600 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-semibold text-white">{formatDate(date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-primary-100">{group.payments.length} payment{group.payments.length > 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-0.5 bg-white/20 rounded px-1.5 py-0.5">
                    <IndianRupee className="h-2.5 w-2.5 text-white" />
                    <span className="text-xs font-bold text-white">{formatCurrency(group.total)}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-600 uppercase tracking-wider w-10">S.No</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-600 uppercase tracking-wider">Student Name</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-600 uppercase tracking-wider">Room</th>
                      <th className="px-3 py-1.5 text-right text-[10px] font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-600 uppercase tracking-wider">Payment Mode</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-600 uppercase tracking-wider">Receipt No</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-600 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.payments.map((payment, idx) => (
                      <tr key={payment.payment_id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{idx + 1}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{payment.student_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{payment.room_number || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-green-600 text-right">{formatCurrency(Number(payment.amount))}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{payment.payment_mode || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{payment.receipt_number || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{formatTime(payment.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {group.payments.map((payment) => (
                  <div key={payment.payment_id} className="px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{payment.student_name}</p>
                      <p className="text-[10px] text-gray-500">
                        {payment.room_number ? `Room ${payment.room_number}` : ''}
                        {payment.payment_mode ? ` · ${payment.payment_mode}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-green-600">{formatCurrency(Number(payment.amount))}</p>
                      <p className="text-[10px] text-gray-400">{formatTime(payment.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Summary - Desktop */}
      {payments.length > 0 && (
        <div className="hidden md:flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500">Month:</span>
              <span className="ml-1 text-xs font-medium text-gray-900">{formatMonthDisplay(selectedMonth)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Transactions:</span>
              <span className="ml-1 text-xs font-bold text-gray-900">{payments.length}</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Total Collected:</span>
            <span className="ml-1 text-sm font-bold text-green-600">{formatCurrency(monthTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
