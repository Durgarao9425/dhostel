import React, { useEffect, useState, useCallback } from 'react';
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Receipt, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

interface StudentDue {
  student_id: number;
  student_name: string;
  phone: string;
  hostel_name: string;
  room_number: string;
  floor_number: number;
  monthly_rent: number;
  total_dues: number;
  dues: Array<{
    due_id: number;
    due_month: string;
    due_amount: number;
    due_date: string;
  }>;
}

interface Payment {
  payment_id: number;
  student_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  hostel_name: string;
  payment_date: string;
  amount_paid: number;
  payment_mode: string;
  payment_for_month: string;
  receipt_number: string;
  remarks: string;
}

interface PaymentMode {
  payment_mode_id: number;
  mode_name: string;
}

interface PaymentFormData {
  student_id: string;
  hostel_id: string;
  amount_paid: string;
  payment_mode_id: string;
  payment_date: string;
  payment_for_month: string;
  transaction_reference: string;
  remarks: string;
}

export const FeesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dues' | 'payments'>('dues');
  const [studentDues, setStudentDues] = useState<StudentDue[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDue | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    student_id: '',
    hostel_id: '1',
    amount_paid: '',
    payment_mode_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_for_month: '',
    transaction_reference: '',
    remarks: ''
  });

  const fetchData = useCallback(async () => {
    console.log('[FeesPage] fetchData called, activeTab:', activeTab);
    try {
      console.log('[FeesPage] Setting loading to true');
      setLoading(true);
      if (activeTab === 'dues') {
        console.log('[FeesPage] Fetching dues from /fees/dues');
        const response = await api.get('/fees/dues', {
          timeout: 10000 // 10 second timeout
        });
        console.log('[FeesPage] Dues response received:', response);
        console.log('[FeesPage] Response data:', response.data);
        if (response.data && response.data.success) {
          console.log('[FeesPage] Setting studentDues:', response.data.data);
          setStudentDues(response.data.data || []);
        } else {
          console.error('[FeesPage] Response not successful:', response.data);
          throw new Error(response.data?.error || 'Failed to fetch dues');
        }
      } else {
        console.log('[FeesPage] Fetching payments from /fees/payments');
        const response = await api.get('/fees/payments', {
          timeout: 10000 // 10 second timeout
        });
        console.log('[FeesPage] Payments response received:', response);
        console.log('[FeesPage] Response data:', response.data);
        if (response.data && response.data.success) {
          console.log('[FeesPage] Setting payments:', response.data.data);
          setPayments(response.data.data || []);
        } else {
          console.error('[FeesPage] Response not successful:', response.data);
          throw new Error(response.data?.error || 'Failed to fetch payments');
        }
      }
      console.log('[FeesPage] fetchData completed successfully');
    } catch (error: any) {
      console.error('[FeesPage] fetchData error caught:', error);
      console.error('[FeesPage] Error details:', {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        status: error?.response?.status,
        code: error?.code
      });
      const errorMessage = error?.response?.data?.error || error?.message || `Failed to fetch ${activeTab}`;
      toast.error(errorMessage);
      // Set empty arrays on error to prevent loading state
      if (activeTab === 'dues') {
        console.log('[FeesPage] Setting studentDues to empty array due to error');
        setStudentDues([]);
      } else {
        console.log('[FeesPage] Setting payments to empty array due to error');
        setPayments([]);
      }
    } finally {
      console.log('[FeesPage] Setting loading to false in finally block');
      setLoading(false);
    }
  }, [activeTab]);

  const fetchPaymentModes = useCallback(async () => {
    console.log('[FeesPage] fetchPaymentModes called');
    try {
      console.log('[FeesPage] Fetching payment modes from /fees/payment-modes');
      const response = await api.get('/fees/payment-modes');
      console.log('[FeesPage] Payment modes response:', response);
      console.log('[FeesPage] Payment modes data:', response.data);
      setPaymentModes(response.data.data || []);
      console.log('[FeesPage] Payment modes set successfully');
    } catch (error) {
      console.error('[FeesPage] Fetch payment modes error:', error);
      setPaymentModes([]);
    }
  }, []);

  // Fetch payment modes only once on mount
  useEffect(() => {
    console.log('[FeesPage] useEffect: fetchPaymentModes triggered (mount)');
    fetchPaymentModes();
  }, [fetchPaymentModes]);

  // Fetch data when tab changes
  useEffect(() => {
    console.log('[FeesPage] useEffect: fetchData triggered, activeTab:', activeTab);
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCollectPayment = (student: StudentDue) => {
    setSelectedStudent(student);
    setFormData({
      student_id: student.student_id.toString(),
      hostel_id: '1',
      amount_paid: student.total_dues.toString(),
      payment_mode_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_for_month: student.dues[0]?.due_month || '',
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
      payment_date: formData.payment_date,
      payment_for_month: formData.payment_for_month || null,
      transaction_reference: formData.transaction_reference || null,
      remarks: formData.remarks || null
    };

    try {
      const response = await api.post('/fees/payments', payload);
      toast.success(`Payment recorded! Receipt: ${response.data.data.receipt_number}`);
      setShowPaymentModal(false);
      setSelectedStudent(null);
      fetchData();
      setFormData({
        student_id: '',
        hostel_id: '1',
        amount_paid: '',
        payment_mode_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_for_month: '',
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
      payment_date: new Date().toISOString().split('T')[0],
      payment_for_month: '',
      transaction_reference: '',
      remarks: ''
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  console.log('[FeesPage] Render - loading:', loading, 'activeTab:', activeTab, 'studentDues.length:', studentDues.length, 'payments.length:', payments.length);

  if (loading) {
    console.log('[FeesPage] Rendering loading spinner');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-600">Track payments and manage student dues</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dues')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dues'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertCircle className="inline-block h-5 w-5 mr-2" />
            Pending Dues ({studentDues.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="inline-block h-5 w-5 mr-2" />
            Payment History
          </button>
        </nav>
      </div>

      {/* Pending Dues Tab */}
      {activeTab === 'dues' && (
        <div className="space-y-4">
          {studentDues.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">All payments are up to date!</p>
            </div>
          ) : (
            studentDues.map(student => (
              <Card key={student.student_id}>
                <Card.Body>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {student.student_name}
                          </h3>
                          <p className="text-sm text-gray-500">{student.phone}</p>
                          <p className="text-sm text-gray-500">{student.hostel_name}</p>
                          {student.room_number && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Room:</span> {student.room_number}
                              {student.floor_number && ` | Floor: ${student.floor_number}`}
                            </p>
                          )}
                          {student.monthly_rent && (
                            <p className="text-xs text-gray-500 mt-1">
                              Monthly Rent: {formatCurrency(student.monthly_rent)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Total Due</p>
                          <p className="text-xl font-bold text-red-600">
                            {formatCurrency(student.total_dues)}
                          </p>
                        </div>
                      </div>

                      {/* Dues Breakdown */}
                      <div className="space-y-2 mb-4">
                        {student.dues.map(due => (
                          <div
                            key={due.due_id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isOverdue(due.due_date)
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-yellow-50 border border-yellow-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <Calendar className={`h-4 w-4 mr-2 ${
                                isOverdue(due.due_date) ? 'text-red-600' : 'text-yellow-600'
                              }`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {due.due_month}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Due: {formatDate(due.due_date)}
                                  {isOverdue(due.due_date) && (
                                    <span className="ml-2 text-red-600 font-medium">
                                      (Overdue)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(due.due_amount)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleCollectPayment(student)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <DollarSign className="h-5 w-5 mr-2" />
                        Collect Payment
                      </button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))
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
                <p className="text-base font-bold text-blue-600 mt-2">
                  Total Dues: {formatCurrency(selectedStudent.total_dues)}
                </p>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Paid *
                    </label>
                    <input
                      type="number"
                      name="amount_paid"
                      value={formData.amount_paid}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

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
                          {mode.mode_name}
                        </option>
                      ))}
                    </select>
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment For Month
                    </label>
                    <input
                      type="month"
                      name="payment_for_month"
                      value={formData.payment_for_month}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Reference
                    </label>
                    <input
                      type="text"
                      name="transaction_reference"
                      value={formData.transaction_reference}
                      onChange={handleInputChange}
                      placeholder="UTR/Txn ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Any additional notes..."
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
    </div>
  );
};
