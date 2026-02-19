import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Plus, Mail, Phone, Search, Edit, Trash2, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { AddOwnerModal } from '../components/modals/AddOwnerModal';
import { EditOwnerModal } from '../components/modals/EditOwnerModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Owner {
  user_id: number;
  full_name: string;
  email?: string;
  phone: string;
  created_at?: string;
}

export const OwnersPage: React.FC = () => {
  const location = useLocation();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    ownerId: number;
    ownerName: string;
  }>({
    isOpen: false,
    ownerId: 0,
    ownerName: '',
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  // Check if we should open the Add Owner modal from navigation state
  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsAddModalOpen(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = owners.filter(owner =>
        owner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (owner.email && owner.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        owner.phone.includes(searchTerm)
      );
      setFilteredOwners(filtered);
    } else {
      setFilteredOwners(owners);
    }
  }, [searchTerm, owners]);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/owners');
      setOwners(response.data.data || []);
      setFilteredOwners(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
      toast.error('Failed to load owners');
      // Dummy data for development
      const dummyOwners = [
        { user_id: 2, full_name: 'Mahendra Reddy', email: 'mahendra@gmail.com', phone: '9876543210' },
        { user_id: 3, full_name: 'Priya Sharma', email: 'priya@gmail.com', phone: '9876543211' },
        { user_id: 4, full_name: 'Rajesh Kumar', email: 'rajesh@gmail.com', phone: '9876543212' },
      ];
      setOwners(dummyOwners);
      setFilteredOwners(dummyOwners);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchOwners();
    setIsAddModalOpen(false);
  };

  const handleDeleteClick = (userId: number, fullName: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      ownerId: userId,
      ownerName: fullName,
    });
  };

  const handleDeleteConfirm = async () => {
    const { ownerId } = deleteConfirmModal;
    setDeletingId(ownerId);
    try {
      await api.delete(`/users/owners/${ownerId}`);
      toast.success('Owner deleted successfully!');
      fetchOwners();
      setDeleteConfirmModal({ isOpen: false, ownerId: 0, ownerName: '' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete owner';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, ownerId: 0, ownerName: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hostel Owners</h1>
          <p className="text-gray-600 mt-1">Manage hostel owners and their information</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add New Owner
        </button>
      </div>

      {/* Search and Owner Count */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search owners..."
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
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredOwners.length}</span> Owner{filteredOwners.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Owners Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading owners...</p>
        </div>
      ) : filteredOwners.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {searchTerm ? 'No owners found' : 'No owners yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first hostel owner'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add New Owner
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map((owner) => (
            <Card key={owner.user_id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{owner.full_name}</h3>
                    <p className="text-xs text-gray-500">Owner ID: {owner.user_id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {owner.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{owner.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{owner.phone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleDeleteClick(owner.user_id, owner.full_name)}
                  disabled={deletingId === owner.user_id}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === owner.user_id ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => {
                    setSelectedOwner(owner);
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Update
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Owner Modal */}
      <AddOwnerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Owner Modal */}
      {selectedOwner && (
        <EditOwnerModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOwner(null);
          }}
          onSuccess={handleAddSuccess}
          owner={selectedOwner}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Owner"
        message="Are you sure you want to delete this owner?"
        itemName={deleteConfirmModal.ownerName}
        loading={deletingId === deleteConfirmModal.ownerId}
      />
    </div>
  );
};
