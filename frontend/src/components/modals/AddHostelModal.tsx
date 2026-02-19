import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface AddHostelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Owner {
  user_id: number;
  full_name: string;
  email: string;
}

interface Amenity {
  amenity_id: number;
  amenity_name: string;
  amenity_icon?: string;
  description?: string;
}

export const AddHostelModal: React.FC<AddHostelModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role_id === 1;
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);
  const [formData, setFormData] = useState({
    hostel_name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    hostel_type: 'Boys',
    owner_id: '',
    admission_fee: '',
    total_floors: '',
    amenities: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchOwners();
      fetchAmenities();
    }
  }, [isOpen]);

  const fetchOwners = async () => {
    try {
      const response = await api.get('/users/owners');
      setOwners(response.data.data || []);
    } catch (error) {
      console.log('Failed to fetch owners, using dummy data');
      // Dummy data for development
      setOwners([
        { user_id: 2, full_name: 'Mahendra Reddy', email: 'mahendra@gmail.com' },
        { user_id: 3, full_name: 'Priya Sharma', email: 'priya@gmail.com' },
        { user_id: 4, full_name: 'Rajesh Kumar', email: 'rajesh@gmail.com' },
      ]);
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await api.get('/amenities');
      setAmenitiesList(response.data.data || []);
    } catch (error) {
      console.log('Failed to fetch amenities, using default data');
      // Default amenities if API fails
      setAmenitiesList([
        { amenity_id: 1, amenity_name: 'WiFi' },
        { amenity_id: 2, amenity_name: 'Laundry' },
        { amenity_id: 3, amenity_name: 'Meals' },
        { amenity_id: 4, amenity_name: 'AC' },
        { amenity_id: 5, amenity_name: 'Hot Water' },
        { amenity_id: 6, amenity_name: 'Gym' },
        { amenity_id: 7, amenity_name: 'Parking' },
      ]);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hostel_name || formData.hostel_name.length < 3) {
      newErrors.hostel_name = 'Hostel name must be at least 3 characters';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.owner_id) {
      newErrors.owner_id = 'Please select an owner';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        hostel_name: formData.hostel_name,
        address: formData.address,
        city: formData.city,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
        hostel_type: formData.hostel_type,
        owner_id: parseInt(formData.owner_id),
        admission_fee: formData.admission_fee ? parseFloat(formData.admission_fee) : undefined,
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
      };
      
      // Include total_floors only if provided and user is admin
      if (isAdmin && formData.total_floors && formData.total_floors.trim() !== '') {
        payload.total_floors = parseInt(formData.total_floors);
      }
      
      await api.post('/hostels', payload);

      toast.success('Hostel created successfully!');
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        hostel_name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        hostel_type: 'Boys',
        owner_id: '',
        admission_fee: '',
        total_floors: '',
        amenities: [],
      });
      setErrors({});
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create hostel');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add New Hostel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hostel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hostel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hostel_name"
              value={formData.hostel_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.hostel_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Sunrise Boys Hostel"
            />
            {errors.hostel_name && (
              <p className="mt-1 text-sm text-red-600">{errors.hostel_name}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Plot No., Street, Area"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* City, State, PIN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Hyderabad"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Telangana"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="500032"
              />
            </div>
          </div>

          {/* Hostel Type & Admission Fee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hostel Type <span className="text-red-500">*</span>
              </label>
              <select
                name="hostel_type"
                value={formData.hostel_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-Ed">Co-Ed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Fee (₹)
              </label>
              <input
                type="number"
                name="admission_fee"
                value={formData.admission_fee}
                onChange={handleChange}
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 5000"
              />
            </div>
          </div>

          {/* Number of Floors - Only show for Admin */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Floors
              </label>
              <input
                type="number"
                name="total_floors"
                value={formData.total_floors}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 3"
              />
              <p className="mt-1 text-xs text-gray-500">
                Total number of floors in the hostel
              </p>
            </div>
          )}

          {/* Owner Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Hostel Owner <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/owners', { state: { openAddModal: true } });
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add New Owner
              </button>
            </div>
            <select
              name="owner_id"
              value={formData.owner_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.owner_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select owner...</option>
              {owners.map(owner => (
                <option key={owner.user_id} value={owner.user_id}>
                  {owner.full_name} ({owner.email})
                </option>
              ))}
            </select>
            {errors.owner_id && (
              <p className="mt-1 text-sm text-red-600">{errors.owner_id}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Don't see the owner? Click "Add New Owner" to register them first
            </p>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map(amenity => (
                <button
                  key={amenity.amenity_id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.amenity_name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.amenities.includes(amenity.amenity_name)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {amenity.amenity_name}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Hostel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
