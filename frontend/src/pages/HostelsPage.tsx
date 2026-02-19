import React, { useState, useEffect } from 'react';
import { Building2, Plus, Mail, Phone, Search, MapPin, Edit, Trash2, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { AddHostelModal } from '../components/modals/AddHostelModal';
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
  hostel_type: string;
  owner_id: number;
  owner_name?: string;
  contact_number?: string;
  email?: string;
  amenities?: string[];
  created_at?: string;
}

export const HostelsPage: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [filteredHostels, setFilteredHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = hostels.filter(hostel =>
        hostel.hostel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hostel.email && hostel.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hostel.contact_number && hostel.contact_number.includes(searchTerm))
      );
      setFilteredHostels(filtered);
    } else {
      setFilteredHostels(hostels);
    }
  }, [searchTerm, hostels]);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hostels');
      setHostels(response.data.data || []);
      setFilteredHostels(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch hostels:', error);
      toast.error('Failed to load hostels');
      // Dummy data for development
      const dummyHostels = [
        {
          hostel_id: 1,
          hostel_name: 'Sunrise Boys Hostel',
          address: 'Gachibowli',
          city: 'Hyderabad',
          state: 'Telangana',
          hostel_type: 'Boys',
          owner_id: 2,
          owner_name: 'Mahendra Reddy'
        },
        {
          hostel_id: 2,
          hostel_name: 'GreenView Girls Hostel',
          address: 'Kukatpally',
          city: 'Hyderabad',
          state: 'Telangana',
          hostel_type: 'Girls',
          owner_id: 3,
          owner_name: 'Priya Sharma'
        },
      ];
      setHostels(dummyHostels);
      setFilteredHostels(dummyHostels);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchHostels();
    setIsAddModalOpen(false);
  };

  const handleDelete = async (hostelId: number, hostelName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${hostelName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(hostelId);
    try {
      await api.delete(`/hostels/${hostelId}`);
      toast.success('Hostel deleted successfully!');
      fetchHostels();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete hostel';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hostels</h1>
          <p className="text-gray-600 mt-1">Manage hostels and their information</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add New Hostel
        </button>
      </div>

      {/* Search and Hostel Count */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hostels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm hover:shadow-md"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredHostels.length}</span> Hostel{filteredHostels.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Hostels Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading hostels...</p>
        </div>
      ) : filteredHostels.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {searchTerm ? 'No hostels found' : 'No hostels yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first hostel'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add New Hostel
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHostels.map((hostel) => (
            <Card key={hostel.hostel_id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{hostel.hostel_name}</h3>
                    <p className="text-xs text-gray-500">ID: {hostel.hostel_id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  hostel.hostel_type === 'Boys'
                    ? 'bg-blue-100 text-blue-700'
                    : hostel.hostel_type === 'Girls'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {hostel.hostel_type}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {hostel.address}, {hostel.city}
                    {hostel.state && `, ${hostel.state}`}
                    {hostel.pincode && ` - ${hostel.pincode}`}
                  </span>
                </div>
                {hostel.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{hostel.email}</span>
                  </div>
                )}
                {hostel.contact_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{hostel.contact_number}</span>
                  </div>
                )}
                {hostel.owner_name && (
                  <div className="flex items-center justify-between text-sm pt-2">
                    <span className="text-gray-600">Owner:</span>
                    <span className="font-medium text-gray-900">{hostel.owner_name}</span>
                  </div>
                )}

                {/* Amenities */}
                {hostel.amenities && hostel.amenities.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1.5">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {hostel.amenities.slice(0, 4).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {hostel.amenities.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{hostel.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(hostel.hostel_id, hostel.hostel_name)}
                    disabled={deletingId === hostel.hostel_id}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === hostel.hostel_id ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedHostel(hostel);
                      setIsEditModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Update
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Hostel Modal */}
      <AddHostelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Hostel Modal */}
      {selectedHostel && (
        <EditHostelModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedHostel(null);
          }}
          onSuccess={handleAddSuccess}
          hostel={selectedHostel}
        />
      )}
    </div>
  );
};
