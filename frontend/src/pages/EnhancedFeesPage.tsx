import React, { useEffect, useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Receipt, Search, Users, TrendingUp, Clock, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

interface StudentWithDues {
  student_id: number;
  hostel_id: number;
  student_name: string;
  phone: string;
  email: string;
  hostel_name: string;
  room_number: string;
  floor_number: number;
  monthly_rent: number;
  admission_date: string;
  due_date: string | null;
  total_dues: number;
  total_paid: number;
  unpaid_count: number;
  paid_count: number;
  payment_status: 'Paid' | 'Pending' | 'No Dues';
  dues: Array<{
    due_id: number;
    due_month: string;
    due_amount: number;
    paid_amount: number;
    balance_amount: number;
    due_date: string;
    is_carried_forward: boolean;
    carried_from_month: string | null;
    fee_type: string;
  }>;
  paid_dues: any[];
}

interface Payment {
  payment_id: number;
  student_id: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  hostel_name?: string;
  payment_date: string;
  amount_paid: number;
  payment_mode: string;
  payment_for_month: string;
  receipt_number: string;
  transaction_reference?: string;
  remarks: string;
  fee_type?: string;
}

interface PaymentMode {
  payment_mode_id: number;
  payment_mode_name: string;
}

interface PaymentFormData {
  student_id: string;
  hostel_id: string;
  amount_paid: string;
  payment_mode_id: string;
  due_date: string;
  payment_date: string;
  transaction_reference: string;
  remarks: string;
}

export const EnhancedFeesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid' | 'payments'>('all');
  const [allStudents, setAllStudents] = useState<StudentWithDues[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithDues[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDueDateModal, setShowDueDateModal] = useState(false);
  const [dueDayInput, setDueDayInput] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDues | null>(null);
  const [studentPaymentHistory, setStudentPaymentHistory] = useState<Payment[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [formData, setFormData] = useState<PaymentFormData>({
    student_id: '',
    hostel_id: '1',
    amount_paid: '',
    payment_mode_id: '',
    due_date: new Date().toISOString().split('T')[0],
    payment_date: new Date().toISOString().split('T')[0],
    transaction_reference: '',
    remarks: ''
  });

  // Summary stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsWithDues: 0,
    fullyPaidStudents: 0,
    totalPendingAmount: 0,
    totalCollected: 0
  });

  useEffect(() => {
    fetchAvailableMonths();
    fetchPaymentModes();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchAllData(selectedMonth);
    }
  }, [selectedMonth]);

  useEffect(() => {
    filterStudents();
  }, [activeTab, searchTerm, allStudents]);

  const fetchAllData = async (month?: string) => {
    try {
      setLoading(true);
      const monthParam = month || selectedMonth;
      const [studentsRes, paymentsRes] = await Promise.all([
        api.get(`/fees/all-students${monthParam ? `?month=${monthParam}` : ''}`),
        api.get('/fees/payments')
      ]);

      const students = studentsRes.data.data;
      setAllStudents(students);
      setPayments(paymentsRes.data.data);

      // Calculate stats
      const totalStudents = students.length;
      const studentsWithDues = students.filter((s: StudentWithDues) => s.total_dues > 0).length;
      const fullyPaidStudents = students.filter((s: StudentWithDues) => s.payment_status === 'Paid').length;
      const totalPendingAmount = students.reduce((sum: number, s: StudentWithDues) => sum + s.total_dues, 0);
      const totalCollected = students.reduce((sum: number, s: StudentWithDues) => sum + s.total_paid, 0);

      setStats({
        totalStudents,
        studentsWithDues,
        fullyPaidStudents,
        totalPendingAmount,
        totalCollected
      });
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Fetch data error:', error);
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

  const fetchAvailableMonths = async () => {
    try {
      const response = await api.get('/fees/available-months');
      const months = response.data.data;
      setAvailableMonths(months);

      // Set current month as default
      if (months.length > 0 && !selectedMonth) {
        const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(months.includes(currentMonth) ? currentMonth : months[0]);
      }
    } catch (error) {
      console.error('Fetch available months error:', error);
    }
  };

  const filterStudents = () => {
    let filtered = [...allStudents];

    // Filter by tab
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(s => s.total_dues > 0);
        break;
      case 'paid':
        filtered = filtered.filter(s => s.payment_status === 'Paid');
        break;
      case 'payments':
        return; // No filtering for payments tab
      case 'all':
      default:
        break;
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.student_name.toLowerCase().includes(term) ||
        s.phone?.includes(term) ||
        s.room_number?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term)
      );
    }

    setFilteredStudents(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRowClick = async (student: StudentWithDues) => {
    setSelectedStudent(student);
    setShowHistoryModal(true);
    setStudentPaymentHistory([]); // Reset to empty array

    // Fetch payment history for this student
    try {
      const response = await api.get(`/fees/student/${student.student_id}/payments`);
      if (response.data.success) {
        setStudentPaymentHistory(response.data.data || []);
      } else {
        console.error('API returned success: false', response.data);
        setStudentPaymentHistory([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch payment history:', error);
      console.error('Error details:', error.response?.data);
      setStudentPaymentHistory([]);
      toast.error(error.response?.data?.error || 'Failed to load payment history');
    }
  };

  const handleCollectPayment = (student: StudentWithDues, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    setSelectedStudent(student);

    // Automatically set due date:
    // 1. If student has a due_date set, use it
    // 2. Otherwise, use today's date as default
    const dueDate = student.due_date
      ? (typeof student.due_date === 'string' && student.due_date.includes('-')
          ? student.due_date.split('T')[0]
          : new Date(student.due_date).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0];

    setFormData({
      student_id: student.student_id.toString(),
      hostel_id: student.hostel_id.toString(),
      amount_paid: student.total_dues.toString(),
      payment_mode_id: '',
      due_date: dueDate,
      payment_date: new Date().toISOString().split('T')[0],
      transaction_reference: '',
      remarks: ''
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      student_id: parseInt(formData.student_id),
      hostel_id: parseInt(formData.hostel_id),
      amount_paid: parseFloat(formData.amount_paid),
      payment_mode_id: parseInt(formData.payment_mode_id),
      due_date: formData.due_date,
      payment_date: formData.payment_date,
      transaction_reference: formData.transaction_reference || null,
      remarks: formData.remarks || null
    };

    try {
      const response = await api.post('/fees/payments', payload);
      toast.success(`Payment recorded! Receipt: ${response.data.data.receipt_number}`);
      setShowPaymentModal(false);
      setSelectedStudent(null);
      fetchAllData(); // Refresh data
      setFormData({
        student_id: '',
        hostel_id: '1',
        amount_paid: '',
        payment_mode_id: '',
        due_date: new Date().toISOString().split('T')[0],
        payment_date: new Date().toISOString().split('T')[0],
        transaction_reference: '',
        remarks: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record payment');
      console.error('Record payment error:', error);
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedStudent(null);
    setFormData({
      student_id: '',
      hostel_id: '1',
      amount_paid: '',
      payment_mode_id: '',
      due_date: new Date().toISOString().split('T')[0],
      payment_date: new Date().toISOString().split('T')[0],
      transaction_reference: '',
      remarks: ''
    });
  };

  const getDaySuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const handleSetDueDate = async () => {
    if (!selectedStudent || !dueDayInput) {
      toast.error('Please enter a valid day (1-31)');
      return;
    }

    const day = parseInt(dueDayInput);
    if (day < 1 || day > 31) {
      toast.error('Day must be between 1 and 31');
      return;
    }

    try {
      await api.put(`/fees/student/${selectedStudent.student_id}/due-date`, {
        due_day: day
      });
      toast.success(`Monthly due date set to ${day}${getDaySuffix(day)} of each month`);
      setShowDueDateModal(false);
      setDueDayInput('');

      // Refresh students data
      await fetchAllData();

      // Calculate the due date for current month based on the day just set
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const dueDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      setFormData({
        student_id: selectedStudent.student_id.toString(),
        hostel_id: selectedStudent.hostel_id.toString(),
        amount_paid: selectedStudent.total_dues.toString(),
        payment_mode_id: '',
        due_date: dueDate,
        payment_date: new Date().toISOString().split('T')[0],
        transaction_reference: '',
        remarks: ''
      });
      setShowPaymentModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to set due date');
    }
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

  const formatDateForDisplay = formatDate; // Alias for payment history modal

  const formatDueDateDDMMYYYY = (dateString: string) => {
    if (!dateString) return '----';
    // Parse date string directly to avoid timezone conversion issues
    // Expected format: YYYY-MM-DD
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    // Fallback to Date object if format is different
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Utility function to check if a date is overdue
  // const isOverdue = (dueDate: string) => {
  //   return new Date(dueDate) < new Date();
  // };

  const getStatusBadge = (status: string) => {
    const badges = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-red-100 text-red-800',
      'No Dues': 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatMonthLabel = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">Track payments and manage student dues</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Pending Dues</p>
                <p className="text-xl font-bold text-red-600">{stats.studentsWithDues}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fully Paid</p>
                <p className="text-xl font-bold text-green-600">{stats.fullyPaidStudents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalPendingAmount)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Collected</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="inline-block h-5 w-5 mr-2" />
            All Students ({allStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertCircle className="inline-block h-5 w-5 mr-2" />
            Pending Dues ({stats.studentsWithDues})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'paid'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="inline-block h-5 w-5 mr-2" />
            Fully Paid ({stats.fullyPaidStudents})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Receipt className="inline-block h-5 w-5 mr-2" />
            Payment History
          </button>
        </nav>
      </div>

      {/* Search Bar */}
      {activeTab !== 'payments' && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Students List */}
      {activeTab !== 'payments' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary-600">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    S.NO
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    Admission Date
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    Due
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.student_id}
                    onClick={() => handleRowClick(student)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {student.student_name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {student.room_number || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {student.admission_date ? formatDate(student.admission_date) : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {student.due_date ? formatDueDateDDMMYYYY(student.due_date) : '----'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {student.monthly_rent ? `₹${Math.floor(student.monthly_rent)}` : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatCurrency(student.total_paid)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <span className={`font-semibold ${student.total_dues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(student.total_dues)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusBadge(student.payment_status)}`}>
                        {student.payment_status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        {student.payment_status === 'Pending' ? (
                          <button
                            onClick={(e) => handleCollectPayment(student, e)}
                            className="px-3 py-1 bg-primary-600 text-white text-[10px] rounded hover:bg-primary-700 transition-colors"
                            title="Pay"
                          >
                            Pay
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleCollectPayment(student, e)}
                            className="px-3 py-1 bg-gray-600 text-white text-[10px] rounded hover:bg-gray-700 transition-colors"
                            title="View Payment History"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm
                  ? 'No students found matching your search.'
                  : 'No students found.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payment records found</p>
            </div>
          ) : (
            payments.map(payment => (
              <Card key={payment.payment_id}>
                <Card.Body>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {payment.first_name} {payment.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{payment.phone}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm">
                            <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">{payment.payment_mode}</span>
                          </div>
                          {payment.payment_for_month && (
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">For: {payment.payment_for_month}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">Receipt: {payment.receipt_number}</span>
                          </div>
                        </div>
                        {payment.remarks && (
                          <p className="mt-2 text-sm text-gray-600 italic">
                            Note: {payment.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(payment.amount_paid)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(payment.payment_date)}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Transaction History Modal */}
      {showHistoryModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowHistoryModal(false)}></div>

            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden z-10">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-gray-800">{selectedStudent.student_name}</h2>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Receipt className="h-4 w-4 mr-1" />
                        Room: {selectedStudent.room_number || '-'}
                      </span>
                      <span>|</span>
                      <span>Phone: {selectedStudent.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Transaction History Cards */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {studentPaymentHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">No payment history found</p>
                    <p className="text-gray-400 text-sm mt-1">This student hasn't made any payments yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentPaymentHistory.map((payment) => (
                      <div
                        key={payment.payment_id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
                      >
                        {/* Payment Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              {formatDateForDisplay(payment.payment_date)}
                            </p>
                            <p className="text-xl font-bold text-primary-600 mt-1">
                              {formatCurrency(payment.amount_paid)}
                            </p>
                          </div>
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            Paid
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-2 border-t border-gray-100 pt-3">
                          <div className="flex items-center text-sm">
                            <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">{payment.payment_mode || 'N/A'}</span>
                          </div>

                          {payment.fee_type && (
                            <div className="flex items-center text-sm">
                              <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">{payment.fee_type}</span>
                            </div>
                          )}

                          {payment.payment_for_month && (
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">For: {payment.payment_for_month}</span>
                            </div>
                          )}

                          <div className="flex items-center text-sm">
                            <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600 text-xs">Receipt: {payment.receipt_number}</span>
                          </div>

                          {payment.transaction_reference && (
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 text-xs">Ref: {payment.transaction_reference}</span>
                            </div>
                          )}

                          {payment.remarks && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-500 italic">"{payment.remarks}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedStudent.total_dues > 0 && (
                  <button
                    onClick={(e) => {
                      setShowHistoryModal(false);
                      handleCollectPayment(selectedStudent, e);
                    }}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Record New Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={handleCloseModal}></div>

            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Record Payment
              </h2>

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  {selectedStudent.student_name}
                </p>
                <p className="text-sm text-gray-600">{selectedStudent.phone}</p>
                <p className="text-sm text-gray-600">Room: {selectedStudent.room_number}</p>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Fees - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Fees
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(selectedStudent.monthly_rent || 0)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Pending Dues - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pending Dues
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(selectedStudent.total_dues)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-red-600 font-semibold cursor-not-allowed"
                    />
                  </div>

                  {/* Amount Paying */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Paying *
                    </label>
                    <input
                      type="number"
                      name="amount_paid"
                      value={formData.amount_paid}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1"
                      max={selectedStudent.total_dues}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Mode *
                    </label>
                    <select
                      name="payment_mode_id"
                      value={formData.payment_mode_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select mode</option>
                      {paymentModes.map(mode => (
                        <option key={mode.payment_mode_id} value={mode.payment_mode_id}>
                          {mode.payment_mode_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="payment_date"
                      value={formData.payment_date}
                      onChange={handleInputChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Transaction Reference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Reference
                    </label>
                    <input
                      type="text"
                      name="transaction_reference"
                      value={formData.transaction_reference}
                      onChange={handleInputChange}
                      placeholder="UTR/Txn ID (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Remarks */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Any additional notes... (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Due Date Modal - Set Monthly Due Date */}
      {showDueDateModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowDueDateModal(false)}></div>

            <div className="relative bg-white rounded-lg max-w-md w-full p-6 z-10">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Set Monthly Due Date
              </h2>

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  {selectedStudent.student_name}
                </p>
                <p className="text-sm text-gray-600">Room: {selectedStudent.room_number}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  On which day of the month should monthly rent be due? (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDayInput}
                  onChange={(e) => setDueDayInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 5, 10, 15"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be used for all future monthly rent dues
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDueDateModal(false);
                    setDueDayInput('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetDueDate}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Set Due Date
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
