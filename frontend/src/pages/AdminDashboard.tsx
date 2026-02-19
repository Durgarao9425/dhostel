import React, { useEffect, useState } from 'react';
import { Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import api from '../services/api';

interface DashboardStats {
  total_hostels: number;
  total_owners: number;
  total_rooms: number;
  total_students: number;
}

interface RecentHostel {
  hostel_id: number;
  hostel_name: string;
  address: string;
  city: string;
  owner_name: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentHostels, setRecentHostels] = useState<RecentHostel[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/reports/dashboard-stats');
      setStats(response.data.data.stats);
      setRecentHostels(response.data.data.recent_hostels);
      setLoading(false);
    } catch (error: any) {
      // Use dummy data if API fails (backend not running)
      console.log('Using dummy data - backend may not be running');
      setStats({
        total_hostels: 3,
        total_owners: 3,
        total_rooms: 56,
        total_students: 120,
      });
      setRecentHostels([
        {
          hostel_id: 1,
          hostel_name: 'Sunrise Boys Hostel',
          address: 'Gachibowli',
          city: 'Hyderabad',
          owner_name: 'Mahendra Reddy'
        },
        {
          hostel_id: 2,
          hostel_name: 'GreenView Girls Hostel',
          address: 'Kukatpally',
          city: 'Hyderabad',
          owner_name: 'Priya Sharma'
        },
        {
          hostel_id: 3,
          hostel_name: 'TechPark Co-Ed Hostel',
          address: 'HITEC City',
          city: 'Hyderabad',
          owner_name: 'Rajesh Kumar'
        }
      ]);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your system overview</p>
      </div>

      {/* Stats Grid - Count-based metrics only */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <div
          onClick={() => navigate('/hostels')}
          className="cursor-pointer transform transition-transform hover:scale-105"
        >
          <StatCard
            title="Total Hostels"
            value={stats?.total_hostels || 0}
            icon={Building2}
            color="indigo"
          />
        </div>

        <div
          onClick={() => navigate('/owners')}
          className="cursor-pointer transform transition-transform hover:scale-105"
        >
          <StatCard
            title="Total Owners"
            value={stats?.total_owners || 0}
            icon={Users}
            color="blue"
          />
        </div>
      </div>

      {/* Recent Hostels */}
      <Card>
        <Card.Header>
          <h3 className="text-base font-semibold text-gray-900">Recent Hostels</h3>
        </Card.Header>
        <Card.Body>
          {recentHostels.length > 0 ? (
            <div className="space-y-4">
              {recentHostels.map((hostel) => (
                <div
                  key={hostel.hostel_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{hostel.hostel_name}</p>
                    <p className="text-sm text-gray-500">
                      {hostel.address}, {hostel.city}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Owner: {hostel.owner_name}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/hostels')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No hostels added yet</p>
              <button
                onClick={() => navigate('/hostels')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Go to Hostels page to add
              </button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
