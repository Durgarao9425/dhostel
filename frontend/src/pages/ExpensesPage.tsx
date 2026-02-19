import React, { useEffect, useState, useMemo } from 'react';
import { Plus, DollarSign, Search, X, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Expense {
  expense_id: number;
  hostel_id: number;
  hostel_name: string;
  category_id: number;
  category_name: string;
  expense_date: string;
  amount: number;
  payment_mode: string;
  vendor_name: string;
  description: string;
  bill_number: string;
}

interface ExpenseCategory {
  category_id: number;
  category_name: string;
  description: string;
  order_index?: number;
  sort_order?: number;
}

interface ExpenseFormData {
  hostel_id: string;
  category_id: string;
  expense_date: string;
  amount: string;
  payment_mode_id: string;
  vendor_name: string;
  description: string;
  bill_number: string;
}

interface PaymentMode {
  payment_mode_id: number;
  payment_mode_name: string;
  order_index?: number;
}

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 10;
  const [showTotalExpensesCard, setShowTotalExpensesCard] = useState<boolean>(false);
  // Default to current month in YYYY-MM format
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [formData, setFormData] = useState<ExpenseFormData>({
    hostel_id: '1',
    category_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_mode_id: '',
    vendor_name: '',
    description: '',
    bill_number: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchPaymentModes();
  }, [selectedMonth]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // Calculate start and end dates for the selected month (avoid timezone shift)
      const [year, month] = selectedMonth.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      const response = await api.get('/expenses', {
        params: {
          startDate: startDateStr,
          endDate: endDateStr
        }
      });
      setExpenses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch expenses');
      console.error('Fetch expenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/expenses/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
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
      category_id: parseInt(formData.category_id),
      expense_date: formData.expense_date,
      amount: parseFloat(formData.amount),
      payment_mode_id: parseInt(formData.payment_mode_id),
      vendor_name: formData.vendor_name || null,
      description: formData.description || null,
      bill_number: formData.bill_number || null
    };

    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.expense_id}`, payload);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses', payload);
        toast.success('Expense recorded successfully');
      }
      fetchExpenses();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save expense');
      console.error('Save expense error:', error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    // Find payment_mode_id by matching payment_mode name
    const matchedPaymentMode = paymentModes.find(
      mode => mode.payment_mode_name === expense.payment_mode
    );
    
    setFormData({
      hostel_id: expense.hostel_id.toString(),
      category_id: expense.category_id.toString(),
      expense_date: expense.expense_date.split('T')[0],
      amount: expense.amount.toString(),
      payment_mode_id: matchedPaymentMode ? matchedPaymentMode.payment_mode_id.toString() : '',
      vendor_name: expense.vendor_name || '',
      description: expense.description || '',
      bill_number: expense.bill_number || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (expenseId: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await api.delete(`/expenses/${expenseId}`);
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete expense');
      console.error('Delete expense error:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      hostel_id: '1',
      category_id: '',
      expense_date: new Date().toISOString().split('T')[0],
      amount: '',
      payment_mode_id: '',
      vendor_name: '',
      description: '',
      bill_number: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
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

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      'Utilities': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-yellow-100 text-yellow-800',
      'Salaries': 'bg-purple-100 text-purple-800',
      'Groceries': 'bg-green-100 text-green-800',
      'Supplies': 'bg-pink-100 text-pink-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[categoryName] || 'bg-gray-100 text-gray-800';
  };

  // Filter expenses based on search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) {
      return expenses;
    }

    const query = searchQuery.toLowerCase().trim();
    return expenses.filter(expense => {
      const category = expense.category_name?.toLowerCase() || '';
      const amount = expense.amount?.toString() || '';
      const date = formatDate(expense.expense_date).toLowerCase();
      const paymentMode = expense.payment_mode?.toLowerCase() || '';
      const vendor = expense.vendor_name?.toLowerCase() || '';
      const billNumber = expense.bill_number?.toLowerCase() || '';
      const description = expense.description?.toLowerCase() || '';

      return (
        category.includes(query) ||
        amount.includes(query) ||
        date.includes(query) ||
        paymentMode.includes(query) ||
        vendor.includes(query) ||
        billNumber.includes(query) ||
        description.includes(query)
      );
    });
  }, [expenses, searchQuery]);

  const totalExpenses = filteredExpenses.reduce((sum, exp) => {
    const amount = Number(exp.amount) || 0;
    return sum + amount;
  }, 0);

  // Pagination Logic
  const totalPages = Math.ceil(filteredExpenses.length / expensesPerPage);
  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstExpense, indexOfLastExpense);

  const getPaginationPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 3) {
      // Show all pages if 3 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and current/nearby pages
      pages.push(1);

      if (currentPage > 2) {
        pages.push('...');
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (newSearchQuery: string) => {
    setSearchQuery(newSearchQuery);
    setCurrentPage(1); // Reset to first page when searching
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
            <h1 className="text-lg font-bold text-gray-900 truncate">Expenses</h1>
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
            <h1 className="text-xl font-bold text-gray-900">Expense Management</h1>
          </div>
          
          {/* Right: Search, Month, Total Expenses, Add Expense */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
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

            {/* Total Expenses Card */}
            <div className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-medium">Total Expenses:</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>

            {/* Add Expense Button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile Only */}
        <div className="relative md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by category, amount, date, payment mode, vendor, bill..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-2">
              Found {filteredExpenses.length} {filteredExpenses.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
      </div>

      {/* Expense List */}
      <div>
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">No expenses recorded yet</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View - Expandable */}
            <div className="block md:hidden space-y-3">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No expense records found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search query</p>
                </div>
              ) : (
                currentExpenses.map((expense) => {
                  const isExpanded = expandedCardId === expense.expense_id;
                  
                  return (
                    <div
                      key={expense.expense_id}
                      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all ${isExpanded ? 'shadow-lg' : ''}`}
                    >
                      <div className="p-4">
                        {/* Collapsed View - Always Visible */}
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedCardId(isExpanded ? null : expense.expense_id)}
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
                              <p className="text-base font-semibold text-gray-900 truncate">{formatDate(expense.expense_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-base font-bold text-red-600">{formatCurrency(expense.amount)}</span>
                          </div>
                        </div>

                        {/* Expanded View - Conditional */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            {/* Category */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Category</p>
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category_name)}`}>
                                {expense.category_name}
                              </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Payment Mode</p>
                                <p className="text-sm font-medium text-gray-900">{expense.payment_mode}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Vendor</p>
                                <p className="text-sm font-medium text-gray-900">{expense.vendor_name || '-'}</p>
                              </div>
                            </div>

                            {/* Bill Number */}
                            {expense.bill_number && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Bill Number</p>
                                <p className="text-sm font-medium text-gray-900">{expense.bill_number}</p>
                              </div>
                            )}

                            {/* Description */}
                            {expense.description && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Description</p>
                                <p className="text-sm text-gray-700">{expense.description}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(expense);
                                }}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(expense.expense_id);
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
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No expense records found</p>
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
                            Category
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-3 py-2 text-right text-[10px] font-medium text-white uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Payment Mode
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Vendor
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Bill Number
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentExpenses.map((expense, index) => (
                          <tr key={expense.expense_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {indexOfFirstExpense + index + 1}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {formatDate(expense.expense_date)}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap">
                              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getCategoryColor(expense.category_name)}`}>
                                {expense.category_name}
                              </span>
                            </td>
                            <td className="px-3 py-1 text-xs text-gray-900 max-w-xs truncate">
                              {expense.description || '-'}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs font-semibold text-red-600 text-right">
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {expense.payment_mode}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {expense.vendor_name || '-'}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                              {expense.bill_number || '-'}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-500">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(expense.expense_id)}
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
                  {filteredExpenses.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        {/* Left: Total Expenses Info */}
                        <div className="text-sm text-gray-600">
                          Showing <span className="font-semibold text-gray-900">{indexOfFirstExpense + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastExpense, filteredExpenses.length)}</span> of <span className="font-semibold text-gray-900">{filteredExpenses.length}</span> records
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

      {/* Total Expenses Bottom Sheet - Mobile Only */}
      {showTotalExpensesCard && (
        <div className="md:hidden fixed inset-0 z-30">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300"
            onClick={() => setShowTotalExpensesCard(false)}
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
                <h3 className="text-lg font-semibold text-gray-900">Total Expenses</h3>
                <button
                  onClick={() => setShowTotalExpensesCard(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Total Expenses for Selected Month</p>
                  <p className="text-4xl font-bold text-red-600 mb-1">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on {filteredExpenses.length} {filteredExpenses.length === 1 ? 'record' : 'records'}
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
      {!showModal && !showTotalExpensesCard && (
        <>
          {/* Left Side: Total Expenses Button (Orange) */}
          <button
            onClick={() => setShowTotalExpensesCard(true)}
            className="fixed bottom-6 left-6 z-40 h-14 w-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center md:hidden"
            title="View Total Expenses"
          >
            <Plus className="h-6 w-6" />
          </button>

          {/* Right Side: Add Expense Button (Blue) */}
          <button
            onClick={() => setShowModal(true)}
            className="fixed bottom-6 right-6 z-40 h-14 w-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center md:hidden"
            title="Add Expense"
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
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expense Date *
                    </label>
                    <input
                      type="date"
                      name="expense_date"
                      value={formData.expense_date}
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
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      name="vendor_name"
                      value={formData.vendor_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., ABC Electric Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Bill Number
                    </label>
                    <input
                      type="text"
                      name="bill_number"
                      value={formData.bill_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., INV-2025-001"
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
                      placeholder="Additional details about the expense..."
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
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop: Centered Modal */}
          <div className="hidden md:flex items-center justify-center min-h-screen px-4 py-4">
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expense Date *
                    </label>
                    <input
                      type="date"
                      name="expense_date"
                      value={formData.expense_date}
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
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      name="vendor_name"
                      value={formData.vendor_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., ABC Electric Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Bill Number
                    </label>
                    <input
                      type="text"
                      name="bill_number"
                      value={formData.bill_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., INV-2025-001"
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
                      placeholder="Additional details about the expense..."
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
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
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
