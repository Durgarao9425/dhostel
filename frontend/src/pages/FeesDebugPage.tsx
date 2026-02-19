import React, { useEffect, useState } from 'react';
import api from '../services/api';
// import toast from 'react-hot-toast';

export const FeesDebugPage: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // Test 1: All students endpoint
      try {
        const res1 = await api.get('/fees/all-students');
        info.allStudents = {
          success: true,
          count: res1.data.data?.length || 0,
          data: res1.data.data
        };
      } catch (err: any) {
        info.allStudents = {
          success: false,
          error: err.response?.data?.error || err.message
        };
      }

      // Test 2: Dues endpoint
      try {
        const res2 = await api.get('/fees/dues');
        info.dues = {
          success: true,
          count: res2.data.data?.length || 0,
          data: res2.data.data
        };
      } catch (err: any) {
        info.dues = {
          success: false,
          error: err.response?.data?.error || err.message
        };
      }

      // Test 3: Payments endpoint
      try {
        const res3 = await api.get('/fees/payments');
        info.payments = {
          success: true,
          count: res3.data.data?.length || 0,
          data: res3.data.data
        };
      } catch (err: any) {
        info.payments = {
          success: false,
          error: err.response?.data?.error || err.message
        };
      }

      // Test 4: Payment modes
      try {
        const res4 = await api.get('/fees/payment-modes');
        info.paymentModes = {
          success: true,
          count: res4.data.data?.length || 0,
          data: res4.data.data
        };
      } catch (err: any) {
        info.paymentModes = {
          success: false,
          error: err.response?.data?.error || err.message
        };
      }

      // Test 5: Fee categories
      try {
        const res5 = await api.get('/fee-categories');
        info.feeCategories = {
          success: true,
          count: res5.data.data?.length || 0,
          data: res5.data.data
        };
      } catch (err: any) {
        info.feeCategories = {
          success: false,
          error: err.response?.data?.error || err.message
        };
      }

      setDebugInfo(info);
      setLoading(false);
    } catch (error) {
      console.error('Debug info fetch error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Fees Management Debug</h1>
        <p>Loading debug information...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-2">Fees Management Debug Information</h1>
        <p className="text-gray-600">Check API responses and database status</p>
        <button
          onClick={fetchDebugInfo}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Debug Info
        </button>
      </div>

      {/* All Students API */}
      <div className="border rounded-lg p-4">
        <h2 className="text-base font-bold mb-2">1. All Students API (/fees/all-students)</h2>
        {debugInfo.allStudents?.success ? (
          <div>
            <p className="text-green-600 font-medium">✓ Success</p>
            <p>Students found: <strong>{debugInfo.allStudents.count}</strong></p>
            {debugInfo.allStudents.count === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 font-medium">⚠️ No students found!</p>
                <p className="text-sm text-yellow-700 mt-1">
                  You need to add students first through the Students page.
                </p>
              </div>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                View raw data
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(debugInfo.allStudents.data, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-medium">✗ Failed</p>
            <p className="text-red-600">{debugInfo.allStudents?.error}</p>
          </div>
        )}
      </div>

      {/* Dues API */}
      <div className="border rounded-lg p-4">
        <h2 className="text-base font-bold mb-2">2. Student Dues API (/fees/dues)</h2>
        {debugInfo.dues?.success ? (
          <div>
            <p className="text-green-600 font-medium">✓ Success</p>
            <p>Students with unpaid dues: <strong>{debugInfo.dues.count}</strong></p>
            {debugInfo.dues.count === 0 && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800 font-medium">ℹ️ No unpaid dues found</p>
                <p className="text-sm text-blue-700 mt-1">
                  This could mean: (1) No dues generated yet, (2) All students paid, or (3) No students exist
                </p>
              </div>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                View raw data
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(debugInfo.dues.data, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-medium">✗ Failed</p>
            <p className="text-red-600">{debugInfo.dues?.error}</p>
          </div>
        )}
      </div>

      {/* Payments API */}
      <div className="border rounded-lg p-4">
        <h2 className="text-base font-bold mb-2">3. Payments API (/fees/payments)</h2>
        {debugInfo.payments?.success ? (
          <div>
            <p className="text-green-600 font-medium">✓ Success</p>
            <p>Total payments: <strong>{debugInfo.payments.count}</strong></p>
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-medium">✗ Failed</p>
            <p className="text-red-600">{debugInfo.payments?.error}</p>
          </div>
        )}
      </div>

      {/* Payment Modes API */}
      <div className="border rounded-lg p-4">
        <h2 className="text-base font-bold mb-2">4. Payment Modes API (/fees/payment-modes)</h2>
        {debugInfo.paymentModes?.success ? (
          <div>
            <p className="text-green-600 font-medium">✓ Success</p>
            <p>Payment modes available: <strong>{debugInfo.paymentModes.count}</strong></p>
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                View modes
              </summary>
              <ul className="mt-2 space-y-1">
                {debugInfo.paymentModes.data?.map((mode: any) => (
                  <li key={mode.payment_mode_id} className="text-sm">
                    • {mode.payment_mode_name || mode.mode_name}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-medium">✗ Failed</p>
            <p className="text-red-600">{debugInfo.paymentModes?.error}</p>
          </div>
        )}
      </div>

      {/* Fee Categories API */}
      <div className="border rounded-lg p-4">
        <h2 className="text-base font-bold mb-2">5. Fee Categories API (/fee-categories)</h2>
        {debugInfo.feeCategories?.success ? (
          <div>
            <p className="text-green-600 font-medium">✓ Success</p>
            <p>Fee categories: <strong>{debugInfo.feeCategories.count}</strong></p>
            {debugInfo.feeCategories.count === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 font-medium">⚠️ No fee categories found!</p>
                <p className="text-sm text-yellow-700 mt-1">
                  You need to create fee categories first before generating dues.
                </p>
              </div>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                View categories
              </summary>
              <ul className="mt-2 space-y-1">
                {debugInfo.feeCategories.data?.map((cat: any) => (
                  <li key={cat.fee_structure_id} className="text-sm">
                    • {cat.fee_type}: ₹{cat.amount} ({cat.frequency})
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-medium">✗ Failed</p>
            <p className="text-red-600">{debugInfo.feeCategories?.error}</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
        <h2 className="text-base font-bold mb-2">📋 Recommendations</h2>
        <div className="space-y-2">
          {debugInfo.allStudents?.count === 0 && (
            <p>1. ❌ Add students through the Students page first</p>
          )}
          {debugInfo.feeCategories?.count === 0 && (
            <p>2. ❌ Create fee categories (Rent, Electricity, etc.)</p>
          )}
          {debugInfo.dues?.count === 0 && debugInfo.allStudents?.count > 0 && (
            <p>3. ❌ Generate monthly dues using the API or add a "Generate Dues" button</p>
          )}
          {debugInfo.allStudents?.count > 0 && debugInfo.feeCategories?.count > 0 && debugInfo.dues?.count === 0 && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800 font-medium">✅ Ready to generate dues!</p>
              <p className="text-sm text-green-700 mt-1">
                You have students and fee categories. Now generate dues for the current month.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
