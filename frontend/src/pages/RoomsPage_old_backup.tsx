import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Home,
  Search,
  // Filter,
  X,
  Building2,
  Layers,
  Users,
  BedDouble,
  DollarSign,
  Wifi,
  Wind,
  Bath,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

interface Room {
  room_id: number;
  hostel_id: number;
  hostel_name: string;
  room_number: string;
  room_type_id: number;
  room_type_name: string;
  floor_number: number;
  capacity: number;
  occupied_beds: number;
  available_beds: number;
  rent_per_bed: number;
  is_available: boolean;
  amenities: string[];
}

interface RoomType {
  room_type_id: number;
  room_type_name: string;
  description?: string;
}

interface Hostel {
  hostel_id: number;
  hostel_name: string;
}

interface RoomFormData {
  hostel_id: string;
  room_number: string;
  room_type_id: string;
  floor_number: string;
  capacity: string;
  occupied_beds: string;
  rent_per_bed: string;
  amenities: string[];
}

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({
    hostel_id: "",
    room_number: "",
    room_type_id: "",
    floor_number: "",
    capacity: "",
    occupied_beds: "0",
    rent_per_bed: "",
    amenities: [],
  });

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "full"
  >("all");
  const [selectedHostelId, setSelectedHostelId] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 10;

  const amenitiesList = [
    "AC",
    "Attached Bathroom",
    "WiFi",
    "Balcony",
    "Window",
    "Cupboard",
    "Study Table",
    "Chair",
  ];

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    fetchHostels();
  }, []);

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

  const fetchHostels = async () => {
    try {
      const response = await api.get("/hostels");
      setHostels(response.data.data || []);
    } catch (error) {
      console.error("Fetch hostels error:", error);
      toast.error("Failed to fetch hostels");
    }
  };

  // Filter and search logic
  const filteredRooms = useMemo(() => {
    let filtered = [...rooms];

    // Apply hostel filter
    if (selectedHostelId !== "all") {
      filtered = filtered.filter(
        (room) => room.hostel_id === parseInt(selectedHostelId)
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (room) =>
          room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.room_type_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          room.hostel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.floor_number?.toString().includes(searchQuery)
      );
    }

    // Apply status filter
    if (statusFilter === "available") {
      filtered = filtered.filter((room) => room.available_beds > 0);
    } else if (statusFilter === "full") {
      filtered = filtered.filter((room) => room.available_beds === 0);
    }

    return filtered;
  }, [rooms, searchQuery, statusFilter, selectedHostelId]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedHostelId]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      hostel_id: parseInt(formData.hostel_id),
      room_number: formData.room_number,
      room_type_id: parseInt(formData.room_type_id),
      floor_number: parseInt(formData.floor_number),
      capacity: parseInt(formData.capacity),
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
      hostel_id: room.hostel_id.toString(),
      room_number: room.room_number,
      room_type_id: room.room_type_id.toString(),
      floor_number: room.floor_number?.toString() || "",
      capacity: room.capacity.toString(),
      occupied_beds: room.occupied_beds?.toString() || "0",
      rent_per_bed: room.rent_per_bed.toString(),
      amenities: room.amenities || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (roomId: number) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await api.delete(`/rooms/${roomId}`);
      toast.success("Room deleted successfully");
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete room");
      console.error("Delete room error:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData({
      hostel_id: "",
      room_number: "",
      room_type_id: "",
      floor_number: "",
      capacity: "",
      occupied_beds: "0",
      rent_per_bed: "",
      amenities: [],
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600">Manage hostel rooms and availability</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Room
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by room number, type, hostel, floor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Hostel Filter */}
          <select
            value={selectedHostelId}
            onChange={(e) => setSelectedHostelId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Hostels</option>
            {hostels.map((hostel) => (
              <option key={hostel.hostel_id} value={hostel.hostel_id}>
                {hostel.hostel_name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "available" | "full")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  S.NO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Hostel Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Room Number
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Floor
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Occupied
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Available
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Rent/Bed
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Amenities
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
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
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {indexOfFirstRoom + index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {room.hostel_name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {room.room_number}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {room.floor_number || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {room.room_type_name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {room.capacity}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {room.occupied_beds}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {room.available_beds}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    ₹{room.rent_per_bed}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {room.amenities && room.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 2).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            +{room.amenities.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        room.available_beds > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.available_beds > 0 ? "Available" : "Full"}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(room);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(room.room_id);
                        }}
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

        {/* Pagination - Inside table container */}
        {filteredRooms.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstRoom + 1} to{" "}
              {Math.min(indexOfLastRoom, filteredRooms.length)} of{" "}
              {filteredRooms.length} rooms
            </div>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === pageNumber
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {currentRooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery || statusFilter !== "all"
              ? "No rooms found matching your criteria"
              : "No rooms found. Add your first room to get started."}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={handleCloseModal}
            ></div>

            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingRoom ? "Edit Room" : "Add New Room"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hostel *
                    </label>
                    <select
                      name="hostel_id"
                      value={formData.hostel_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Hostel</option>
                      {hostels.map((hostel) => (
                        <option
                          key={hostel.hostel_id}
                          value={hostel.hostel_id}
                        >
                          {hostel.hostel_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Type *
                    </label>
                    <select
                      name="room_type_id"
                      value={formData.room_type_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Number
                    </label>
                    <input
                      type="number"
                      name="floor_number"
                      value={formData.floor_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity (Total Beds) *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupied Beds *
                    </label>
                    <input
                      type="number"
                      name="occupied_beds"
                      value={formData.occupied_beds}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max={formData.capacity || undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Beds (Auto-calculated)
                    </label>
                    <input
                      type="number"
                      value={
                        formData.capacity && formData.occupied_beds
                          ? parseInt(formData.capacity) - parseInt(formData.occupied_beds)
                          : formData.capacity || 0
                      }
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rent Per Bed (₹/month) *
                    </label>
                    <input
                      type="number"
                      name="rent_per_bed"
                      value={formData.rent_per_bed}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="5000"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
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

      {/* View Room Details Modal */}
      {showViewModal && viewingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-start space-x-3">
                        <Home className="h-5 w-5 text-primary-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Room Number
                          </p>
                          <p className="mt-1 text-base font-semibold text-gray-900">
                            {viewingRoom.room_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <BedDouble className="h-5 w-5 text-primary-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Room Type
                          </p>
                          <p className="mt-1 text-base font-semibold text-gray-900">
                            {viewingRoom.room_type_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Layers className="h-5 w-5 text-primary-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Floor Number
                          </p>
                          <p className="mt-1 text-base font-semibold text-gray-900">
                            Floor {viewingRoom.floor_number || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Building2 className="h-5 w-5 text-primary-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Hostel
                          </p>
                          <p className="mt-1 text-base font-semibold text-gray-900">
                            {viewingRoom.hostel_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Occupancy Details
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Users className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900">
                          {viewingRoom.capacity}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Total Capacity
                        </p>
                      </div>

                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <BedDouble className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-orange-900">
                          {viewingRoom.occupied_beds}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">Occupied</p>
                      </div>

                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <BedDouble className="h-5 w-5 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-900">
                          {viewingRoom.available_beds}
                        </p>
                        <p className="text-xs text-green-600 mt-1">Available</p>
                      </div>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Occupancy Rate
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {(
                            (viewingRoom.occupied_beds / viewingRoom.capacity) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            viewingRoom.occupied_beds === viewingRoom.capacity
                              ? "bg-red-600"
                              : (viewingRoom.occupied_beds /
                                  viewingRoom.capacity) *
                                  100 >=
                                75
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${
                              (viewingRoom.occupied_beds /
                                viewingRoom.capacity) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Amenities
                    </h3>
                    {viewingRoom.amenities &&
                    viewingRoom.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {viewingRoom.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300"
                          >
                            {amenity.toLowerCase().includes("wifi") && (
                              <Wifi className="h-4 w-4 mr-1.5 text-primary-600" />
                            )}
                            {amenity.toLowerCase().includes("ac") && (
                              <Wind className="h-4 w-4 mr-1.5 text-primary-600" />
                            )}
                            {amenity.toLowerCase().includes("bathroom") && (
                              <Bath className="h-4 w-4 mr-1.5 text-primary-600" />
                            )}
                            {amenity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No amenities listed
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column - Pricing */}
                <div className="space-y-6">
                  {/* Pricing Card */}
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Pricing
                    </h3>
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-primary-900">
                        ₹{viewingRoom.rent_per_bed}
                      </p>
                      <p className="text-sm text-primary-600 mt-1">
                        Per Bed / Month
                      </p>
                    </div>

                    {viewingRoom.available_beds > 0 ? (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 text-center">
                          <span className="font-semibold">
                            {viewingRoom.available_beds}
                          </span>{" "}
                          bed(s) available
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 text-center font-semibold">
                          Fully Occupied
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Card */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Status
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Availability
                        </p>
                        <p className="mt-1">
                          {viewingRoom.is_available ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium bg-red-100 text-red-800">
                              Unavailable
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Room ID
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          #{viewingRoom.room_id}
                        </p>
                      </div>
                    </div>
                  </div>
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
    </div>
  );
};
