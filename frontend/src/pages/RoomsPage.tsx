import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Home,
  Search,
  X,
  Building2,
  Layers,
  BedDouble,
  DollarSign,
  Wifi,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";

interface Room {
  room_id: number;
  hostel_id: number;
  hostel_name: string;
  room_number: string;
  room_type_id: number;
  room_type_name: string;
  floor_number: number;
  occupied_beds: number;
  available_beds: number;
  total_capacity?: number;
  rent_per_bed: number;
  is_available: boolean;
  amenities: string[];
}

interface RoomType {
  room_type_id: number;
  room_type_name: string;
  description?: string;
}

interface RoomFormData {
  room_number: string;
  room_type_id: string;
  floor_number: string;
  occupied_beds: string;
  rent_per_bed: string;
  amenities: string[];
}

export const RoomsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatsCard, setShowStatsCard] = useState(false);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [totalFloors, setTotalFloors] = useState<number | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    roomId: number | null;
    roomNumber: string;
  }>({
    isOpen: false,
    roomId: null,
    roomNumber: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<RoomFormData>({
    room_number: "",
    room_type_id: "",
    floor_number: "",
    occupied_beds: "0",
    rent_per_bed: "",
    amenities: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "full"
  >("all");
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 10;

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    fetchHostelInfo();
    fetchRoomAmenities();
  }, []);

  const fetchRoomAmenities = async () => {
    try {
      const response = await api.get('/amenities/rooms');
      if (response.data.success) {
        // Extract amenity names from the response
        const amenityNames = response.data.data.map((amenity: any) => amenity.amenity_name);
        setAmenitiesList(amenityNames);
      }
    } catch (error) {
      console.error('Fetch room amenities error:', error);
      // Fallback to default amenities if API fails
      setAmenitiesList([
        "AC",
        "Attached Bathroom",
        "WiFi",
        "Balcony",
        "Window",
        "Cupboard",
        "Study Table",
        "Chair",
      ]);
    }
  };

  const fetchHostelInfo = async () => {
    try {
      const response = await api.get('/hostels');
      const hostels = response.data.data || [];
      // Owner should only see their own hostel (filtered by backend)
      if (hostels.length > 0) {
        setTotalFloors(hostels[0].total_floors || null);
      }
    } catch (error) {
      console.error('Failed to fetch hostel info:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/rooms");
      setRooms(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch rooms");
      console.error("Fetch rooms error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await api.get("/rooms/types");
      const types = response.data.data || [];
      const sortedTypes = types.sort(
        (a: RoomType, b: RoomType) => a.room_type_id - b.room_type_id
      );
      setRoomTypes(sortedTypes);
    } catch (error) {
      console.error("Fetch room types error:", error);
      toast.error("Failed to fetch room types");
      setRoomTypes([
        { room_type_id: 1, room_type_name: "Single" },
        { room_type_id: 2, room_type_name: "Double" },
        { room_type_id: 3, room_type_name: "Triple" },
        { room_type_id: 4, room_type_name: "Four Sharing" },
        { room_type_id: 5, room_type_name: "Five Sharing" },
        { room_type_id: 6, room_type_name: "Six Sharing" },
      ]);
    }
  };

  // Filter and search logic
  const filteredRooms = useMemo(() => {
    let filtered = [...rooms];

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const searchNumber = parseFloat(searchQuery);
      const isNumericSearch = !isNaN(searchNumber) && searchQuery.trim() !== "";

      filtered = filtered.filter(
        (room) => {
          // Text-based search
          const matchesText =
            room.room_number.toLowerCase().includes(searchLower) ||
            room.room_type_name.toLowerCase().includes(searchLower) ||
            room.floor_number?.toString().includes(searchQuery);

          // Rent-based search (if numeric)
          const matchesRent = isNumericSearch
            ? Math.floor(room.rent_per_bed) === Math.floor(searchNumber) ||
              room.rent_per_bed.toString().includes(searchQuery)
            : false;

          return matchesText || matchesRent;
        }
      );

      // Sort by rent if numeric search
      if (isNumericSearch) {
        filtered.sort((a, b) => a.rent_per_bed - b.rent_per_bed);
      }
    }

    // Apply status filter
    if (statusFilter === "available") {
      filtered = filtered.filter((room) => room.available_beds > 0);
    } else if (statusFilter === "full") {
      filtered = filtered.filter((room) => room.available_beds === 0);
    }

    return filtered;
  }, [rooms, searchQuery, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination display logic - show 3 pages at a time
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 3;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is 3 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show 3 pages centered around current page
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Calculate statistics from rooms data
  const roomStatistics = useMemo(() => {
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((sum, room) => {
      // Use total_capacity if available, otherwise calculate from room_type_id or occupied + available
      const capacity = room.total_capacity || (room.occupied_beds + room.available_beds) || room.room_type_id || 0;
      return sum + capacity;
    }, 0);
    const totalOccupied = rooms.reduce((sum, room) => sum + (room.occupied_beds || 0), 0);
    const totalAvailable = rooms.reduce((sum, room) => sum + (room.available_beds || 0), 0);
    
    return {
      totalRooms,
      totalBeds,
      totalOccupied,
      totalAvailable
    };
  }, [rooms]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.room_number.trim()) {
      errors.room_number = "Room Number is required";
    }

    if (!formData.room_type_id) {
      errors.room_type_id = "Room Type is required";
    }

    if (!formData.floor_number) {
      errors.floor_number = "Floor Number is required";
    }

    if (!formData.occupied_beds || formData.occupied_beds === "") {
      errors.occupied_beds = "Occupied Beds is required";
    } else if (parseInt(formData.occupied_beds) < 0) {
      errors.occupied_beds = "Occupied Beds must be 0 or greater";
    }

    if (!formData.rent_per_bed || formData.rent_per_bed === "") {
      errors.rent_per_bed = "Rent Per Bed is required";
    } else if (parseFloat(formData.rent_per_bed) <= 0) {
      errors.rent_per_bed = "Rent Per Bed must be greater than 0";
    }

    if (!formData.amenities || formData.amenities.length === 0) {
      errors.amenities = "At least one amenity must be selected";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const payload = {
      hostel_id: user?.hostel_id || 0,  // Use logged-in user's hostel_id
      room_number: formData.room_number,
      room_type_id: parseInt(formData.room_type_id),
      floor_number: parseInt(formData.floor_number),
      occupied_beds: parseInt(formData.occupied_beds),
      rent_per_bed: parseFloat(formData.rent_per_bed),
      amenities: formData.amenities,
    };

    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.room_id}`, payload);
        toast.success("Room updated successfully");
      } else {
        await api.post("/rooms", payload);
        toast.success("Room created successfully");
      }
      fetchRooms();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save room");
      console.error("Save room error:", error);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type_id: room.room_type_id.toString(),
      floor_number: room.floor_number?.toString() || "",
      occupied_beds: room.occupied_beds?.toString() || "0",
      rent_per_bed: room.rent_per_bed.toString(),
      amenities: room.amenities || [],
    });
    // Refresh hostel info when opening edit modal
    fetchHostelInfo();
    setShowModal(true);
  };

  const handleDeleteClick = (roomId: number, roomNumber: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      roomId,
      roomNumber,
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({
      isOpen: false,
      roomId: null,
      roomNumber: "",
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModal.roomId) return;

    setIsDeleting(true);
    try {
      const response = await api.delete(`/rooms/${deleteConfirmModal.roomId}`);
      toast.success(response.data?.message || "Room deleted successfully");
      fetchRooms();
      setDeleteConfirmModal({
        isOpen: false,
        roomId: null,
        roomNumber: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete room");
      console.error("Delete room error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData({
      room_number: "",
      room_type_id: "",
      floor_number: "",
      occupied_beds: "0",
      rent_per_bed: "",
      amenities: [],
    });
    setFormErrors({});
  };

  const handleViewRoom = (room: Room) => {
    setViewingRoom(room);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingRoom(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="md:hidden space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Room Management</h1>
            <p className="text-sm text-gray-600">Manage hostel rooms and availability</p>
          </div>
        </div>

        {/* Mobile Search and Filter - Single Line */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by room, type, floor, or rent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "available" | "full")
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent whitespace-nowrap"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>

      {/* Desktop: Single Line Header */}
      <div className="hidden md:flex items-center justify-between gap-4 -mt-8">
        {/* Left: Title */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Room Management</h1>
        </div>
        
        {/* Right: Search, Status Filter, Add Room */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by room, type, floor, or rent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "available" | "full")
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
          </select>

          {/* Add Room Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm whitespace-nowrap"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Room
          </button>
        </div>
      </div>

      {/* Mobile Card View - Expandable */}
      <div className="block md:hidden space-y-3">
        {currentRooms.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? "No rooms found matching your search."
                : "No rooms found. Add your first room to get started."}
            </p>
          </div>
        ) : (
          currentRooms.map((room) => {
            const isExpanded = expandedCardId === room.room_id;
            
            return (
              <div
                key={room.room_id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all ${isExpanded ? 'shadow-lg' : ''}`}
              >
                <div className="p-4">
                  {/* Collapsed View - Always Visible */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedCardId(isExpanded ? null : room.room_id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 truncate">{room.room_number}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            room.available_beds > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {room.available_beds > 0 ? "Available" : "Full"}
                        </span>
                        <span className="text-base font-bold text-gray-900">₹{Math.floor(room.rent_per_bed)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded View - Conditional */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Floor</p>
                          <p className="text-sm font-medium text-gray-900">{room.floor_number || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Room Type</p>
                          <p className="text-sm font-medium text-gray-900">{room.room_type_name || `Type ${room.room_type_id}`}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Occupied</p>
                          <p className="text-sm font-medium text-gray-900">{room.occupied_beds}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Available</p>
                          <p className="text-sm font-medium text-gray-900">{room.available_beds}</p>
                        </div>
                      </div>

                      {/* Amenities */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Amenities</p>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(room);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(room.room_id, room.room_number);
                          }}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                  S.NO
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                  Room Number
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                  Floor
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                  Occupied
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                  Available
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                  Rent/Bed
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRooms.map((room, index) => (
                <tr
                  key={room.room_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewRoom(room)}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {indexOfFirstRoom + index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {room.room_number}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {room.floor_number || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {room.room_type_name || `Type ${room.room_type_id}`}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {room.occupied_beds}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {room.available_beds}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    ₹{Math.floor(room.rent_per_bed)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                        room.available_beds > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.available_beds > 0 ? "Available" : "Full"}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(room.room_id, room.room_number)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? "No rooms found matching your search."
                : "No rooms found. Add your first room to get started."}
            </p>
          </div>
        )}

        {/* Pagination - Inside table container - Web View Only */}
        {filteredRooms.length > 0 && (
          <div className="hidden md:block px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Left: Total Rows Info */}
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{indexOfFirstRoom + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastRoom, filteredRooms.length)}</span> of <span className="font-semibold text-gray-900">{filteredRooms.length}</span> rooms
              </div>

              {/* Center: Pagination Controls */}
              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-white text-blue-600 hover:bg-blue-50 border border-gray-300 hover:border-blue-600"
                  >
                    Previous
                  </button>
                )}

                {/* Page Numbers */}
                {getPaginationPages().map((pageNumber, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === pageNumber
                        ? "bg-primary-600 text-white border border-primary-600"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-primary-600 hover:text-primary-600"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                {/* Next Button */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-white text-blue-600 hover:bg-blue-50 border border-gray-300 hover:border-blue-600"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>

          {/* Mobile: Bottom Sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto z-10">
            {/* Drag Handle and Header */}
            <div className="sticky top-0 bg-white rounded-t-2xl pt-3 pb-2 z-20">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>
              <div className="px-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-4 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.room_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="101"
                    />
                    {formErrors.room_number && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.room_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="room_type_id"
                      value={formData.room_type_id}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.room_type_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select type</option>
                      {roomTypes.map((type) => (
                        <option
                          key={type.room_type_id}
                          value={type.room_type_id}
                        >
                          {type.room_type_name || `Type ${type.room_type_id}`}
                        </option>
                      ))}
                    </select>
                    {formErrors.room_type_id && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.room_type_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Number <span className="text-red-500">*</span>
                    </label>
                    {totalFloors && totalFloors > 0 ? (
                      <div>
                        <select
                          name="floor_number"
                          value={formData.floor_number}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            formErrors.floor_number ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Floor</option>
                          {Array.from({ length: totalFloors }, (_, i) => i + 1).map((floor) => (
                            <option key={floor} value={floor.toString()}>
                              {floor}
                            </option>
                          ))}
                        </select>
                        {formErrors.floor_number && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.floor_number}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="number"
                          name="floor_number"
                          value={formData.floor_number}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            formErrors.floor_number ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="1"
                        />
                        {formErrors.floor_number ? (
                          <p className="mt-1 text-xs text-red-600">{formErrors.floor_number}</p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">
                            Please set "Number of Floors" in hostel settings first
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupied Beds <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="occupied_beds"
                      value={formData.occupied_beds}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.occupied_beds ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {formErrors.occupied_beds && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.occupied_beds}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rent Per Bed (₹/month) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="rent_per_bed"
                      value={formData.rent_per_bed}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.rent_per_bed ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="5000"
                    />
                    {formErrors.rent_per_bed && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.rent_per_bed}</p>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.amenities && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.amenities}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingRoom ? "Update Room" : "Create Room"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop: Centered Modal */}
          <div className="hidden md:flex items-center justify-center min-h-screen px-4 py-4">
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.room_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="101"
                    />
                    {formErrors.room_number && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.room_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="room_type_id"
                      value={formData.room_type_id}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.room_type_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select type</option>
                      {roomTypes.map((type) => (
                        <option
                          key={type.room_type_id}
                          value={type.room_type_id}
                        >
                          {type.room_type_name || `Type ${type.room_type_id}`}
                        </option>
                      ))}
                    </select>
                    {formErrors.room_type_id && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.room_type_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Number <span className="text-red-500">*</span>
                    </label>
                    {totalFloors && totalFloors > 0 ? (
                      <div>
                        <select
                          name="floor_number"
                          value={formData.floor_number}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            formErrors.floor_number ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Floor</option>
                          {Array.from({ length: totalFloors }, (_, i) => i + 1).map((floor) => (
                            <option key={floor} value={floor.toString()}>
                              {floor}
                            </option>
                          ))}
                        </select>
                        {formErrors.floor_number && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.floor_number}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="number"
                          name="floor_number"
                          value={formData.floor_number}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            formErrors.floor_number ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="1"
                        />
                        {formErrors.floor_number ? (
                          <p className="mt-1 text-xs text-red-600">{formErrors.floor_number}</p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">
                            Please set "Number of Floors" in hostel settings first
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupied Beds <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="occupied_beds"
                      value={formData.occupied_beds}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.occupied_beds ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {formErrors.occupied_beds && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.occupied_beds}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rent Per Bed (₹/month) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="rent_per_bed"
                      value={formData.rent_per_bed}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.rent_per_bed ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="5000"
                    />
                    {formErrors.rent_per_bed && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.rent_per_bed}</p>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.amenities && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.amenities}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingRoom ? "Update Room" : "Create Room"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Bottom Sheet - Mobile Only */}
      {showStatsCard && (
        <div className="md:hidden fixed inset-0 z-30">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300"
            onClick={() => setShowStatsCard(false)}
          ></div>

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-10 transform transition-transform duration-300 ease-out">
            {/* Drag Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Content */}
            <div className="px-6 pb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Room Statistics</h3>
                <button
                  onClick={() => setShowStatsCard(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="space-y-4">
                {/* Total Rooms */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Total Rooms</p>
                      <p className="text-3xl font-bold text-blue-600">{roomStatistics.totalRooms}</p>
                    </div>
                    <Home className="h-8 w-8 text-blue-400" />
                  </div>
                </div>

                {/* Total Beds */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Total Beds</p>
                      <p className="text-3xl font-bold text-purple-600">{roomStatistics.totalBeds}</p>
                    </div>
                    <BedDouble className="h-8 w-8 text-purple-400" />
                  </div>
                </div>

                {/* Occupied Count */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Occupied</p>
                      <p className="text-3xl font-bold text-orange-600">{roomStatistics.totalOccupied}</p>
                    </div>
                    <Layers className="h-8 w-8 text-orange-400" />
                  </div>
                </div>

                {/* Available Count */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Available</p>
                      <p className="text-3xl font-bold text-green-600">{roomStatistics.totalAvailable}</p>
                    </div>
                    <BedDouble className="h-8 w-8 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons - Mobile Only */}
      {!showModal && !showViewModal && !showStatsCard && (
        <>
          {/* Left Side: Statistics Button (Orange) */}
          <button
            onClick={() => setShowStatsCard(true)}
            className="fixed bottom-6 left-6 z-40 h-14 w-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center md:hidden"
            title="View Room Statistics"
          >
            <Plus className="h-6 w-6" />
          </button>

          {/* Right Side: Add Room Button (Blue) */}
          <button
            onClick={() => setShowModal(true)}
            className="fixed bottom-6 right-6 z-40 h-14 w-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center md:hidden"
            title="Add Room"
          >
            <Plus className="h-6 w-6" />
          </button>
        </>
      )}

      {/* View Room Details Modal */}
      {showViewModal && viewingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Room {viewingRoom.room_number}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {viewingRoom.hostel_name}
                  </p>
                </div>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Room Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Room Information</h3>
                  
                  {/* 2-Column Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Room Number */}
                    <div className="flex items-start gap-3">
                      <Home className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Room Number</p>
                        <p className="text-xs text-gray-600 mt-1">{viewingRoom.room_number}</p>
                      </div>
                    </div>

                    {/* Floor Number */}
                    <div className="flex items-start gap-3">
                      <Layers className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Floor Number</p>
                        <p className="text-xs text-gray-600 mt-1">Floor {viewingRoom.floor_number || "-"}</p>
                      </div>
                    </div>

                    {/* Room Type */}
                    <div className="flex items-start gap-3">
                      <BedDouble className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Room Type</p>
                        <p className="text-xs text-gray-600 mt-1">{viewingRoom.room_type_name || "-"}</p>
                      </div>
                    </div>

                    {/* Hostel */}
                    <div className="flex items-start gap-3">
                      <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Hostel</p>
                        <p className="text-xs text-gray-600 mt-1">{viewingRoom.hostel_name}</p>
                      </div>
                    </div>

                    {/* Rent Per Bed */}
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Rent Per Bed</p>
                        <p className="text-xs text-gray-600 mt-1">₹{Math.floor(viewingRoom.rent_per_bed)}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start gap-3">
                      <BedDouble className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Status</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {viewingRoom.is_available ? "Available" : "Unavailable"}
                        </p>
                      </div>
                    </div>

                    {/* Occupied Beds */}
                    <div className="flex items-start gap-3">
                      <BedDouble className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Occupied Beds</p>
                        <p className="text-xs text-gray-600 mt-1">{viewingRoom.occupied_beds}</p>
                      </div>
                    </div>

                    {/* Available Beds */}
                    <div className="flex items-start gap-3">
                      <BedDouble className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Available Beds</p>
                        <p className="text-xs text-gray-600 mt-1">{viewingRoom.available_beds}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amenities - Full Width */}
                  {viewingRoom.amenities && viewingRoom.amenities.length > 0 && (
                    <div className="flex items-start gap-3 mt-4">
                      <Wifi className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Amenities</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {viewingRoom.amenities.map((amenity, index) => (
                            <span key={index} className="text-xs text-gray-600">
                              {amenity}
                              {index < viewingRoom.amenities.length - 1 && <span className="mx-1">,</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={handleCloseViewModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Room"
        message="Are you sure you want to delete this room?"
        itemName={`Room ${deleteConfirmModal.roomNumber}`}
        loading={isDeleting}
      />
    </div>
  );
};
