export const DUMMY_STATS = {
    totalRooms: 50,
    occupiedRooms: 42,
    vacantRooms: 8,
    totalStudents: 120,
    activeStudents: 115,
    monthlyRevenue: 250000,
    pendingPayments: 5,
};

export const DUMMY_STUDENTS = [
    { id: '1', name: 'John Doe', room: '101', phone: '9876543210', status: 'Active', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', email: 'john.doe@example.com' },
    { id: '2', name: 'Jane Smith', room: '204', phone: '9876543211', status: 'Active', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', email: 'jane.smith@example.com' },
    { id: '3', name: 'Mike Ross', room: '305', phone: '9876543212', status: 'Pending', photo: null, email: 'mike.ross@example.com' },
    { id: '4', name: 'Harvey Specter', room: '501', phone: '9876543213', status: 'Active', photo: null, email: 'harvey@specter.com' },
    { id: '5', name: 'Rachel Zane', room: '102', phone: '9876543214', status: 'Inactive', photo: null, email: 'rachel@zane.com' },
];

export const DUMMY_PAYMENTS = [
    { id: '1', studentName: 'John Doe', room: '101', amount: 5000, date: '2026-02-15', status: 'Paid', method: 'UPI' },
    { id: '2', studentName: 'Jane Smith', room: '204', amount: 4500, date: '2026-02-16', status: 'Pending', method: 'Cash' },
    { id: '3', studentName: 'Mike Ross', room: '305', amount: 6000, date: '2026-02-17', status: 'Overdue', method: 'Transfer' },
];

export const DUMMY_ROOMS = [
    { id: '1', number: '101', floor: '1st', type: 'Double Sharing', occupancy: 2, totalCapacity: 2, price: 5000 },
    { id: '2', number: '102', floor: '1st', type: 'Single Sharing', occupancy: 0, totalCapacity: 1, price: 8000 },
    { id: '3', number: '201', floor: '2nd', type: 'Triple Sharing', occupancy: 2, totalCapacity: 3, price: 4000 },
    { id: '4', number: '202', floor: '2nd', type: 'Double Sharing', occupancy: 1, totalCapacity: 2, price: 5500 },
    { id: '5', number: '301', floor: '3rd', type: 'Dormitory', occupancy: 4, totalCapacity: 6, price: 3000 },
];

export const DUMMY_EXPENSES = [
    { id: '1', title: 'Electricity Bill Feb', amount: 4500, date: '2026-02-10', category: 'Utility', recordedBy: 'Admin' },
    { id: '2', title: 'Water Supply', amount: 1200, date: '2026-02-12', category: 'Utility', recordedBy: 'Admin' },
    { id: '3', title: 'Kitchen Grocery', amount: 8000, date: '2026-02-13', category: 'Food', recordedBy: 'Admin' },
    { id: '4', title: 'Wifi Monthly', amount: 999, date: '2026-02-01', category: 'Utility', recordedBy: 'Manager' },
];

export const DUMMY_NOTIFICATIONS = [
    { id: '1', title: 'Payment Received', message: 'John Doe paid ₹5000 for Feb rent', time: '2h ago', type: 'payment' },
    { id: '2', title: 'New Student', message: 'Jane Smith has joined the hostel', time: '5h ago', type: 'student' },
    { id: '3', title: 'Room Maintenance', message: 'Room 204 requires fan repair', time: '1d ago', type: 'alert' },
    { id: '4', title: 'Rent Due', message: 'Mike Ross rent is overdue by 2 days', time: '2d ago', type: 'payment' },
];
