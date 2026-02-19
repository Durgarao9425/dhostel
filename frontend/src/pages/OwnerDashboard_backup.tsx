import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, DollarSign, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalRooms: number;
  totalStudents: number;
  occupancyRate: number;
  totalBeds: number;
  occupiedBeds: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netProfit: number;
  pendingDuesCount: number;
  pendingDuesAmount: number;
}

export const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard-stats');
      setStats(response.data.data);
    } catch (error: any) {
      toast.error('Failed to fetch dashboard statistics');
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hostel Dashboard</h1>
        <p className="text-gray-600">Hostel Owner Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(stats.monthlyIncome)}
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(stats.monthlyExpenses)}
          icon={FileText}
          color="red"
        />
      </div>

      {/* Occupancy and Profit */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
          </Card.Header>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-primary-600">
                  {stats.occupancyRate.toFixed(1)}%
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {stats.occupiedBeds} of {stats.totalBeds} beds occupied
                </p>
              </div>
              <TrendingUp className="h-16 w-16 text-primary-200" />
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Net Profit</h3>
          </Card.Header>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-4xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.netProfit)}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  This month
                </p>
              </div>
              <DollarSign className="h-16 w-16 text-gray-200" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Income</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(stats.monthlyIncome)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Expenses</p>
                <p className="font-semibold text-red-600">
                  {formatCurrency(stats.monthlyExpenses)}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
              {stats.pendingDuesCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  {stats.pendingDuesCount} pending
                </span>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {stats.pendingDuesCount > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {stats.pendingDuesCount} student{stats.pendingDuesCount > 1 ? 's' : ''} have pending fees
                    </p>
                    <p className="text-xs text-gray-600">
                      Total pending: {formatCurrency(stats.pendingDuesAmount)}
                    </p>
                  </div>
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">All payments are up to date!</p>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/students')}
                className="p-4 text-center bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <Users className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Add Student</span>
              </button>
              <button
                onClick={() => navigate('/fees')}
                className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Record Payment</span>
              </button>
              <button
                onClick={() => navigate('/expenses')}
                className="p-4 text-center bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <FileText className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Add Expense</span>
              </button>
              <button
                onClick={() => navigate('/rooms')}
                className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Rooms</span>
              </button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Payment Received</p>
                <p className="text-sm text-gray-600">Ravi Kumar paid ₹5,000 for January 2025</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">New Student Admitted</p>
                <p className="text-sm text-gray-600">Naveen Kumar allocated to Room 301</p>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Expense Added</p>
                <p className="text-sm text-gray-600">Electricity bill - ₹3,500</p>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
