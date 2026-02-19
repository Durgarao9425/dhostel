import React, { useEffect, useState, useMemo } from 'react';
import { Plus, TrendingUp, Edit, Trash2, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Income {
  income_id: number;
  hostel_id: number;
  hostel_name: string;
  income_date: string;
  amount: number;
  source: string;
  payment_mode: string;
  description: string;
  receipt_number: string;
}

interface IncomeFormData {
  hostel_id: string;
  income_date: string;
  amount: string;
  source: string;
  payment_mode_id: string;
  description: string;
  receipt_number: string;
}

interface PaymentMode {
  payment_mode_id: number;
  payment_mode_name: string;
  order_index?: number;
}

export const IncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTotalIncomeCard, setShowTotalIncomeCard] = useState<boolean>(false);
  // Default to current month in YYYY-MM format
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const incomePerPage = 10;

  const [formData, setFormData] = useState<IncomeFormData>({
    hostel_id: '1',
    income_date: new Date().toISOString().split('T')[0],
    amount: '',
    source: '',
    payment_mode_id: '',
    description: '',
    receipt_number: ''
  });

  useEffect(() => {
    fetchIncomes();
    fetchPaymentModes();
  }, [selectedMonth]);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      // Calculate start and end dates for the selected month
      const [year, month] = selectedMonth.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      const response = await api.get('/income', {
        params: {
          startDate: startDateStr,
          endDate: endDateStr
        }
      });
      setIncomes(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch income records');
      console.error('Fetch incomes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentModes = async () => {
    try {
      const response = await api.get('/fees/payment-modes');
      setPaymentModes(response.data.data);
    } catch (error) {
      console.error('Fetch payment modes error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      hostel_id: parseInt(formData.hostel_id),
      income_date: formData.income_date,
      amount: parseFloat(formData.amount),
      source: formData.source,
      payment_mode_id: parseInt(formData.payment_mode_id),
      description: formData.description || null,
      receipt_number: formData.receipt_number || null
    };

    try {
      if (editingIncome) {
        await api.put(`/income/${editingIncome.income_id}`, payload);
        toast.success('Income updated successfully');
      } else {
        await api.post('/income', payload);
        toast.success('Income recorded successfully');
      }
      fetchIncomes();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save income');
      console.error('Save income error:', error);
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    // Find payment_mode_id by matching payment_mode name
    const matchedPaymentMode = paymentModes.find(
      mode => mode.payment_mode_name === income.payment_mode
    );
    
    setFormData({
      hostel_id: income.hostel_id.toString(),
      income_date: income.income_date.split('T')[0],
      amount: income.amount.toString(),
      source: income.source,
      payment_mode_id: matchedPaymentMode ? matchedPaymentMode.payment_mode_id.toString() : '',
      description: income.description || '',
      receipt_number: income.receipt_number || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (incomeId: number) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;

    try {
      await api.delete(`/income/${incomeId}`);
      toast.success('Income deleted successfully');
      fetchIncomes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete income');
      console.error('Delete income error:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIncome(null);
    setFormData({
      hostel_id: '1',
      income_date: new Date().toISOString().split('T')[0],
      amount: '',
      source: '',
      payment_mode_id: '',
      description: '',
      receipt_number: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format month for display (e.g., "Jan 2026")
  const formatMonthDisplay = (monthValue: string) => {
    if (!monthValue) return '';
    const [year, month] = monthValue.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Filter incomes based on search query
  const filteredIncomes = useMemo(() => {
    if (!searchQuery.trim()) {
      return incomes;
    }

    const query = searchQuery.toLowerCase().trim();
    return incomes.filter(income => {
      const source = income.source?.toLowerCase() || '';
      const amount = income.amount?.toString() || '';
      const date = formatDate(income.income_date).toLowerCase();
      const paymentMode = income.payment_mode?.toLowerCase() || '';
      const receipt = income.receipt_number?.toLowerCase() || '';
      const description = income.description?.toLowerCase() || '';

      return (
        source.includes(query) ||
        amount.includes(query) ||
        date.includes(query) ||
        paymentMode.includes(query) ||
        receipt.includes(query) ||
        description.includes(query)
      );
    });
  }, [incomes, searchQuery]);

  const totalIncome = filteredIncomes.reduce((sum, inc) => {
    const amount = Number(inc.amount) || 0;
    return sum + amount;
  }, 0);

  // Pagination logic
  const totalPages = Math.ceil(filteredIncomes.length / incomePerPage);
  const indexOfLastIncome = currentPage * incomePerPage;
  const indexOfFirstIncome = indexOfLastIncome - incomePerPage;
  const currentIncomes = filteredIncomes.slice(indexOfFirstIncome, indexOfLastIncome);

  // Smart pagination display - show 3 pages at a time
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 3;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Reset pagination when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-4">
        {/* Mobile: Single Line Header with Month */}
        <div className="flex md:hidden items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">Income</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Desktop: Single Line Header */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Income Management</h1>
          </div>
          
          {/* Right: Search, Month, Total Income, Add Income */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search income..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Month Picker */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Total Income Card */}
            <div className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-medium">Total Income:</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</span>
              </div>
            </div>

            {/* Add Income Button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Income
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile Only */}
        <div className="relative md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by source, amount, date, payment mode, receipt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-2">
              Found {filteredIncomes.length} {filteredIncomes.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
      </div>

      {/* Income List */}
      <div>
        {incomes.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">No income records yet</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View - Expandable */}
            <div className="block md:hidden space-y-3">
              {filteredIncomes.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No income records found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search query</p>
                </div>
              ) : (
                currentIncomes.map((income) => {
                const isExpanded = expandedCardId === income.income_id;
                
                return (
                  <div
                    key={income.income_id}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all ${isExpanded ? 'shadow-lg' : ''}`}
                  >
                    <div className="p-4">
                      {/* Collapsed View - Always Visible */}
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedCardId(isExpanded ? null : income.income_id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-gray-900 truncate">{formatDate(income.income_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-base font-bold text-green-600">{formatCurrency(income.amount)}</span>
                        </div>
                      </div>

                      {/* Expanded View - Conditional */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
                          {/* Source */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Source</p>
                            <p className="text-sm font-semibold text-gray-900">{income.source}</p>
                          </div>

                          {/* Payment Details */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Payment Mode</p>
                              <p className="text-sm font-medium text-gray-900">{income.payment_mode}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Receipt</p>
                              <p className="text-sm font-medium text-gray-900">{income.receipt_number || '-'}</p>
                            </div>
                          </div>

                          {/* Description */}
                          {income.description && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Description</p>
                              <p className="text-sm text-gray-700">{income.description}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(income);
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(income.income_id);
                              }}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* Desktop Table View - Matching Monthly Fees Style */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              {filteredIncomes.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No income records found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search query</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-primary-600">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            S.NO
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-3 py-2 text-right text-[10px] font-medium text-white uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Payment Mode
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Receipt Number
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentIncomes.map((income, index) => (
                          <tr key={income.income_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {indexOfFirstIncome + index + 1}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {formatDate(income.income_date)}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {income.source}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs font-semibold text-green-600 text-right">
                              {formatCurrency(income.amount)}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {income.payment_mode}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {income.receipt_number || '-'}
                            </td>
                            <td className="px-3 py-1 text-xs text-gray-900 max-w-xs truncate">
                              {income.description || '-'}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-500">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEdit(income)}
                                  className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(income.income_id)}
                                  className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination - Web View Only */}
                  {filteredIncomes.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        {/* Left: Total Income Info */}
                        <div className="text-sm text-gray-600">
                          Showing <span className="font-semibold text-gray-900">{indexOfFirstIncome + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastIncome, filteredIncomes.length)}</span> of <span className="font-semibold text-gray-900">{filteredIncomes.length}</span> records
                        </div>

                        {/* Center: Pagination Controls */}
                        <div className="flex items-center space-x-1">
                          {/* Previous Button */}
                          {currentPage > 1 && (
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-white text-blue-600 hover:bg-blue-50 border border-gray-300 hover:border-blue-600"
                            >
                              Previous
                            </button>
                          )}

                          {/* Page Numbers */}
                          {getPaginationPages().map((pageNumber, index) => (
                            <button
                              key={index}
                              onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === pageNumber
                                  ? "bg-primary-600 text-white border border-primary-600"
                                  : "bg-white text-gray-700 border border-gray-300 hover:border-primary-600 hover:text-primary-600"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          ))}

                          {/* Next Button */}
                          {currentPage < totalPages && (
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-white text-blue-600 hover:bg-blue-50 border border-gray-300 hover:border-blue-600"
                            >
                              Next
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Total Income Bottom Sheet - Mobile Only */}
      {showTotalIncomeCard && (
        <div className="md:hidden fixed inset-0 z-30">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300"
            onClick={() => setShowTotalIncomeCard(false)}
          ></div>

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-10 transform transition-transform duration-300 ease-out">
            {/* Drag Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Content */}
            <div className="px-6 pb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Total Income</h3>
                <button
                  onClick={() => setShowTotalIncomeCard(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Total Income for Selected Month</p>
                  <p className="text-4xl font-bold text-green-600 mb-1">{formatCurrency(totalIncome)}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on {filteredIncomes.length} {filteredIncomes.length === 1 ? 'record' : 'records'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Month:</span>
                  <span className="font-medium text-gray-900">
                    {formatMonthDisplay(selectedMonth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons - Mobile Only */}
      {!showModal && !showTotalIncomeCard && (
        <>
          {/* Left Side: Total Income Button (Orange) */}
          <button
            onClick={() => setShowTotalIncomeCard(true)}
            className="fixed bottom-6 left-6 z-40 h-14 w-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center md:hidden"
            title="View Total Income"
          >
            <Plus className="h-6 w-6" />
          </button>

          {/* Right Side: Add Income Button (Blue) */}
          <button
            onClick={() => setShowModal(true)}
            className="fixed bottom-6 right-6 z-40 h-14 w-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center md:hidden"
            title="Add Income"
          >
            <Plus className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Add/Edit Modal - Bottom Sheet on Mobile, Centered on Desktop */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>

          {/* Mobile: Bottom Sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto z-10">
            {/* Drag Handle */}
            <div className="sticky top-0 bg-white rounded-t-2xl pt-3 pb-2 z-20">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>
              <div className="px-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingIncome ? 'Edit Income' : 'Add New Income'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Income Date *
                    </label>
                    <input
                      type="date"
                      name="income_date"
                      value={formData.income_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Source *
                    </label>
                    <input
                      type="text"
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Student Fees, Rent, Other"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Payment Mode *
                    </label>
                    <select
                      name="payment_mode_id"
                      value={formData.payment_mode_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select mode</option>
                      {paymentModes.map(mode => (
                        <option key={mode.payment_mode_id} value={mode.payment_mode_id}>
                          {mode.payment_mode_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Receipt Number
                    </label>
                    <input
                      type="text"
                      name="receipt_number"
                      value={formData.receipt_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., RCP-2025-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Additional details about the income..."
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingIncome ? 'Update Income' : 'Add Income'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop: Centered Modal */}
          <div className="hidden md:flex items-center justify-center min-h-screen px-4 py-4">
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingIncome ? 'Edit Income' : 'Add New Income'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Income Date *
                    </label>
                    <input
                      type="date"
                      name="income_date"
                      value={formData.income_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Source *
                    </label>
                    <input
                      type="text"
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Student Fees, Rent, Other"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Payment Mode *
                    </label>
                    <select
                      name="payment_mode_id"
                      value={formData.payment_mode_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select mode</option>
                      {paymentModes.map(mode => (
                        <option key={mode.payment_mode_id} value={mode.payment_mode_id}>
                          {mode.payment_mode_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Receipt Number
                    </label>
                    <input
                      type="text"
                      name="receipt_number"
                      value={formData.receipt_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., RCP-2025-001"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Additional details about the income..."
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingIncome ? 'Update Income' : 'Add Income'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
