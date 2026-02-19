import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Hostel {
  hostel_id: number;
  hostel_name: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  hostel_type: string;
  total_floors?: number;
  owner_id: number;
  owner_name?: string;
  admission_fee?: number;
  amenities?: string[];
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

interface EditHostelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hostel: Hostel;
  isOwner?: boolean; // true if Owner is editing, false/undefined if Admin is editing
}

export const EditHostelModal: React.FC<EditHostelModalProps> = ({ isOpen, onClose, onSuccess, hostel, isOwner = false }) => {
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);
  const [formData, setFormData] = useState({
    hostel_name: hostel.hostel_name,
    address: hostel.address,
    city: hostel.city,
    state: hostel.state || '',
    pincode: hostel.pincode || '',
    hostel_type: hostel.hostel_type,
    total_floors: hostel.total_floors?.toString() || '',
    owner_id: hostel.owner_id.toString(),
    admission_fee: (hostel.admission_fee || 0).toString(),
    amenities: hostel.amenities || [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when hostel prop changes
  useEffect(() => {
    setFormData({
      hostel_name: hostel.hostel_name,
      address: hostel.address,
      city: hostel.city,
      state: hostel.state || '',
      pincode: hostel.pincode || '',
      hostel_type: hostel.hostel_type,
      total_floors: hostel.total_floors?.toString() || '',
      owner_id: hostel.owner_id.toString(),
      admission_fee: (hostel.admission_fee || 0).toString(),
      amenities: hostel.amenities || [],
    });
    setErrors({});
  }, [hostel]);

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
      console.log('Failed to fetch owners');
      toast.error('Failed to load owners list');
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
        { amenity_id: 8, amenity_name: 'CCTV' },
        { amenity_id: 9, amenity_name: 'Security Guard' },
        { amenity_id: 10, amenity_name: 'Power Backup' },
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

    // Only validate owner_id for admin (not for owner)
    if (!isOwner && !formData.owner_id) {
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
        amenities: formData.amenities,
      };

      // Include owner_id only for admin (not for owner)
      if (!isOwner) {
        payload.owner_id = parseInt(formData.owner_id);
      }

      // Include total_floors if provided
      if (formData.total_floors && formData.total_floors.trim() !== '') {
        payload.total_floors = parseInt(formData.total_floors);
      }

      // Include admission_fee if provided
      if (formData.admission_fee && formData.admission_fee.trim() !== '') {
        payload.admission_fee = parseFloat(formData.admission_fee);
      }

      await api.put(`/hostels/${hostel.hostel_id}`, payload);

      toast.success('Hostel updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update hostel';
      toast.error(errorMessage);

      // Handle specific errors
      if (errorMessage.includes('name')) {
        setErrors({ hostel_name: 'Hostel name already exists' });
      }
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
          <h2 className="text-xl font-bold text-gray-900">Edit Hostel</h2>
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

          {/* Number of Floors - Show for both Admin and Owner */}
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

          {/* Owner Selection - Show dropdown for admin, read-only for owner */}
          {isOwner ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hostel Owner
              </label>
              <input
                type="text"
                value={hostel.owner_name || 'N/A'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hostel Owner <span className="text-red-500">*</span>
              </label>
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
            </div>
          )}

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hostel Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map(amenity => (
                <button
                  key={amenity.amenity_id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.amenity_name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.amenities.includes(amenity.amenity_name)
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {amenity.amenity_name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Click to select/deselect amenities available at this hostel
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Update the hostel information. All changes will be saved immediately.
            </p>
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
              {loading ? 'Updating...' : 'Update Hostel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
