import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  User,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Tooltip } from '../ui/Tooltip';
import toast from 'react-hot-toast';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
      setIsLoggingOut(false);
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const isAdmin = user?.role_id === 1;

  const navigation = isAdmin
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Hostels', href: '/hostels', icon: Building2 },
        { name: 'Owners', href: '/owners', icon: Users },
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    : [
        { name: 'Dashboard', href: '/owner/dashboard', icon: Home },
        { name: 'Rooms', href: '/owner/rooms', icon: Building2 },
        { name: 'Students', href: '/owner/students', icon: Users },
        { name: 'Monthly Fees', href: '/owner/monthly-fees', icon: DollarSign },
        { name: 'Collections', href: '/owner/collections', icon: CreditCard },
        { name: 'Incomes', href: '/owner/income', icon: TrendingUp },
        { name: 'Expenses', href: '/owner/expenses', icon: FileText },
        { name: 'Reports', href: '/owner/reports', icon: FileText },
        { name: 'Settings', href: '/owner/settings', icon: Settings },
      ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--content-bg)' }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, slide-in on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text-color)' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200 flex-shrink-0 relative">
          <h1 className="text-sm font-bold text-center leading-tight flex items-center gap-2" style={{ color: 'var(--sidebar-text-color)' }}>
            <span className="text-yellow-500">★</span>
            <span className="text-orange-500">★</span>
            <span>
              Hostel<br />
              Administrative<br />
              System
            </span>
            <span className="text-yellow-500">★</span>
            <span className="text-orange-500">★</span>
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute right-4 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--sidebar-text-color)' }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.href
                  ? 'text-white'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: location.pathname === item.href ? 'var(--primary-color)' : 'transparent',
                color: location.pathname === item.href ? 'white' : 'var(--sidebar-text-color)',
                opacity: location.pathname === item.href ? 1 : 0.9,
              }}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - Header */}
        <header className="h-20 flex-shrink-0 shadow-md" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text-color)' }}>
          <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden hover:opacity-80 focus:outline-none transition-opacity"
              style={{ color: 'var(--header-text-color)' }}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page Title - Left Side */}
            <div className="flex-1 ml-4 lg:ml-0">
              <h1 className="text-xl font-bold" style={{ color: 'var(--header-text-color)' }}>
                {location.pathname === '/dashboard' || location.pathname === '/owner/dashboard' ? 'Dashboard' :
                 location.pathname === '/hostels' ? 'Hostels' :
                 location.pathname === '/owners' ? 'Owners' :
                 location.pathname === '/rooms' || location.pathname === '/owner/rooms' ? 'Rooms' :
                 location.pathname === '/students' || location.pathname === '/owner/students' ? 'Students' :
                 location.pathname === '/monthly-fees' || location.pathname === '/owner/monthly-fees' ? 'Monthly Fees' :
                 location.pathname === '/income' || location.pathname === '/owner/income' ? 'Income' :
                 location.pathname === '/expenses' || location.pathname === '/owner/expenses' ? 'Expenses' :
                 location.pathname === '/reports' || location.pathname === '/owner/reports' ? 'Reports' :
                 location.pathname === '/settings' || location.pathname === '/owner/settings' ? 'Settings' :
                 location.pathname === '/profile' || location.pathname === '/owner/profile' ? 'Profile' :
                 'Dashboard'}
              </h1>
            </div>

            {/* Right side - Container with Profile, Name/Role, and Logout */}
            <div 
              className="flex items-center gap-3 px-4 py-2 rounded-lg"
              style={{ 
                backgroundColor: 'var(--sidebar-bg)',
                opacity: 0.9
              }}
            >
              {/* Profile Icon */}
              <Tooltip text="View Profile" position="bottom">
                <button
                  onClick={() => navigate(isAdmin ? '/profile' : '/owner/profile')}
                  className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <User className="h-4 w-4 text-primary-600" />
                </button>
              </Tooltip>

              {/* User Info - Name and Role */}
              <div className="hidden sm:flex flex-col items-start">
                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--header-text-color)' }}>{user?.full_name}</p>
                <p className="text-xs font-normal" style={{ color: 'var(--header-text-color)', opacity: 0.9 }}>{user?.role}</p>
              </div>

              {/* Logout Button */}
              <Tooltip text="Logout" position="bottom">
                <button
                  onClick={handleLogoutClick}
                  className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-primary-600" />
                </button>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--content-bg)' }}>
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Confirm Logout</h2>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to logout?
              </p>
              <p className="text-sm text-gray-600">
                You will need to login again to access your account.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
