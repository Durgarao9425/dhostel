import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, DollarSign, FileText, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalRooms: number;
  totalStudents: number;
  occupancyRate: number;
  totalBeds: number;
  occupiedBeds: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netProfit: number;
  feeCollection: number;
  feeCollectionCount: number;
  pendingDuesCount: number;
  pendingDuesAmount: number;
}

interface Activity {
  type: 'payment' | 'admission' | 'expense' | 'income';
  id: number;
  date: string;
  student_name?: string;
  room_number?: string;
  amount?: number;
  category_name?: string;
  source?: string;
  description?: string;
  created_at: string;
}

export const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
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

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/activity/recent?limit=5');
      setActivities(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return { icon: DollarSign, bg: 'bg-green-100', color: 'text-green-600' };
      case 'admission':
        return { icon: Users, bg: 'bg-blue-100', color: 'text-blue-600' };
      case 'expense':
        return { icon: FileText, bg: 'bg-red-100', color: 'text-red-600' };
      case 'income':
        return { icon: TrendingUp, bg: 'bg-purple-100', color: 'text-purple-600' };
      default:
        return { icon: AlertCircle, bg: 'bg-gray-100', color: 'text-gray-600' };
    }
  };

  const getActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case 'payment':
        return 'Payment Received';
      case 'admission':
        return 'New Student Admitted';
      case 'expense':
        return 'Expense Added';
      case 'income':
        return 'Income Recorded';
      default:
        return 'Activity';
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'payment':
        return `${activity.student_name} paid ₹${activity.amount?.toLocaleString('en-IN')}`;
      case 'admission':
        return `${activity.student_name} allocated to Room ${activity.room_number}`;
      case 'expense':
        return `${activity.category_name} - ₹${activity.amount?.toLocaleString('en-IN')}`;
      case 'income':
        return `${activity.source} - ₹${activity.amount?.toLocaleString('en-IN')}`;
      default:
        return activity.description || '';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
        <h1 className="text-xl font-bold text-gray-900">Hostel Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          title="Fee Collection"
          value={formatCurrency(stats.feeCollection)}
          icon={CreditCard}
          color="yellow"
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
                  <button
                    onClick={() => navigate('/fees')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
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
                onClick={() => navigate('/rooms')}
                className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Rooms</span>
              </button>
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
          {activities.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const { icon: Icon, bg, color } = getActivityIcon(activity.type);
                return (
                  <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-start">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">{getActivityTitle(activity)}</p>
                      <p className="text-sm text-gray-600">{getActivityDescription(activity)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
