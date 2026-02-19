import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Edit, Users, Home, DollarSign, Layers } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { EditHostelModal } from '../components/modals/EditHostelModal';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Hostel {
  hostel_id: number;
  hostel_name: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  contact_number: string;
  email: string;
  hostel_type: string;
  total_floors?: number;
  owner_id: number;
  owner_name?: string;
  admission_fee?: number;
  amenities?: string[];
  created_at?: string;
}

export const OwnerHostelsPage: React.FC = () => {
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [totalRooms, setTotalRooms] = useState<number>(0);
  const [activeStudents, setActiveStudents] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchHostel();
  }, []);

  useEffect(() => {
    if (hostel?.hostel_id) {
      fetchTotalRooms();
      fetchActiveStudents();
    }
  }, [hostel?.hostel_id]);

  const fetchHostel = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hostels');
      const hostels = response.data.data || [];

      // Owner should only see their own hostel (filtered by backend)
      if (hostels.length > 0) {
        setHostel(hostels[0]);
      }
    } catch (error) {
      console.error('Failed to fetch hostel:', error);
      toast.error('Failed to load hostel details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalRooms = async () => {
    try {
      const response = await api.get(`/rooms?hostel_id=${hostel?.hostel_id}`);
      const rooms = response.data.data || [];
      setTotalRooms(rooms.length);
    } catch (error) {
      console.error('Failed to fetch rooms count:', error);
    }
  };

  const fetchActiveStudents = async () => {
    try {
      const response = await api.get(`/students?hostel_id=${hostel?.hostel_id}`);
      const students = response.data.data || [];
      // Count only active students
      const activeCount = students.filter((s: any) => s.status === 1).length;
      setActiveStudents(activeCount);
    } catch (error) {
      console.error('Failed to fetch students count:', error);
    }
  };

  const handleEditSuccess = () => {
    fetchHostel();
    fetchTotalRooms(); // Refresh rooms count after edit
    fetchActiveStudents(); // Refresh active students count after edit
    setIsEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Hostel</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage your hostel information</p>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading hostel details...</p>
        </div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Hostel</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage your hostel information</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No hostel assigned</h3>
            <p className="text-xs text-gray-600">
              Please contact the admin to get a hostel assigned to your account.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Hostel</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage your hostel information</p>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <Edit className="h-4 w-4" />
          Edit Details
        </button>
      </div>

      {/* Hostel Card - Full Width */}
      <Card>
        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{hostel.hostel_name}</h2>
              </div>
            </div>
            <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
              hostel.hostel_type === 'Boys'
                ? 'bg-blue-100 text-blue-700'
                : hostel.hostel_type === 'Girls'
                ? 'bg-pink-100 text-pink-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {hostel.hostel_type}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Address</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {hostel.address}<br />
                    {hostel.city}
                    {hostel.state && `, ${hostel.state}`}
                    {hostel.pincode && ` - ${hostel.pincode}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Email</p>
                  <p className="text-xs text-gray-600 mt-1">{hostel.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Contact Number</p>
                  <p className="text-xs text-gray-600 mt-1">{hostel.contact_number}</p>
                </div>
              </div>

              {hostel.owner_name && (
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Owner</p>
                    <p className="text-xs text-gray-600 mt-1">{hostel.owner_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hostel Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Hostel Information</h3>

              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Active Students</p>
                  <p className="text-xs text-gray-600 mt-1">{activeStudents}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Home className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Total Rooms</p>
                  <p className="text-xs text-gray-600 mt-1">{totalRooms}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Actual rooms created in system</p>
                </div>
              </div>

              {hostel.total_floors && (
                <div className="flex items-start gap-3">
                  <Layers className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Number of Floors</p>
                    <p className="text-xs text-gray-600 mt-1">{hostel.total_floors}</p>
                  </div>
                </div>
              )}

              {hostel.admission_fee !== undefined && hostel.admission_fee !== null && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Admission Fee</p>
                    <p className="text-xs text-gray-600 mt-1">
                      ₹{typeof hostel.admission_fee === 'string' ? Math.floor(parseFloat(hostel.admission_fee)) : Math.floor(hostel.admission_fee)}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Amenities Section */}
          {hostel.amenities && hostel.amenities.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {hostel.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Edit Hostel Modal */}
      {hostel && (
        <EditHostelModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          hostel={hostel}
          isOwner={true}
        />
      )}
    </div>
  );
};
