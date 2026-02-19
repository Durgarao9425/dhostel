import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Edit, Users, Home, DollarSign, Layers, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
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

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [totalRooms, setTotalRooms] = useState<number>(0);
  const [activeStudents, setActiveStudents] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role_id === 2) {
      fetchHostel();
    } else {
      setLoading(false);
    }
  }, [user]);

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
    fetchTotalRooms();
    fetchActiveStudents();
    setIsEditModalOpen(false);
  };

  if (!user) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Profile</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">View your profile information</p>
        </div>
        <Card>
          <div className="text-center py-8 sm:py-12">
            <p className="text-xs sm:text-sm text-gray-500">No user data available</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">View and manage your hostel information</p>
      </div>

      {/* Hostel Details Card - Only for Hostel Owners */}
      {user.role_id === 2 && (
        <>
          {loading ? (
            <Card>
              <div className="text-center py-8 sm:py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-xs sm:text-sm text-gray-600">Loading hostel details...</p>
              </div>
            </Card>
          ) : !hostel ? (
            <Card>
              <div className="text-center py-8 sm:py-12">
                <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">No hostel assigned</h3>
                <p className="text-[10px] sm:text-xs text-gray-600 px-4">
                  Please contact the admin to get a hostel assigned to your account.
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-4 sm:p-6">
                {/* Hostel Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{hostel.hostel_name}</h2>
                    </div>
                    <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0 ${
                      hostel.hostel_type === 'Boys'
                        ? 'bg-blue-100 text-blue-700'
                        : hostel.hostel_type === 'Girls'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {hostel.hostel_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-end flex-shrink-0">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Edit Details</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                  </div>
                </div>

                {/* Hostel Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Contact Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Contact Information</h3>

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
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Hostel Information</h3>

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
                  <div className="pt-4 sm:pt-6 border-t border-gray-200">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Available Amenities</h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {hostel.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-primary-50 text-primary-700 text-[10px] sm:text-xs font-medium rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

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




