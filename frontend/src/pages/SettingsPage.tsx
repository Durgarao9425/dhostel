import React from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, Palette, Type, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store/authStore';

export const SettingsPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme, setThemeMode, setPrimaryColor, setFontSize, setFontFamily } = useTheme();
  
  const isAdmin = user?.role_id === 1;
  const isOwner = user?.role_id === 2;
  const isOwnerSettings = location.pathname === '/owner/settings';
  const isAdminSettings = location.pathname === '/settings';

  // Font options for owner
  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'System Default', label: 'System Default' },
  ];

  // Font size options
  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  // Access control
  if (isAdminSettings && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Access denied. Admin settings are for Main Admin only.</p>
        </div>
      </div>
    );
  }

  if (isOwnerSettings && !isOwner) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Access denied. Owner settings are for Hostel Owners only.</p>
        </div>
      </div>
    );
  }

  // Owner Settings - Appearance/UI Settings
  if (isOwnerSettings && isOwner) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Appearance Settings</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Customize the look and feel of your dashboard</p>
        </div>

        {/* Settings Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Theme Mode */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              {theme.mode === 'light' ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
              <label className="text-sm font-medium text-gray-900 dark:text-white">Theme Mode</label>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="themeMode"
                  value="light"
                  checked={theme.mode === 'light'}
                  onChange={() => setThemeMode('light')}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Light</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="themeMode"
                  value="dark"
                  checked={theme.mode === 'dark'}
                  onChange={() => setThemeMode('dark')}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Dark</span>
              </label>
            </div>
          </div>

          {/* Primary Theme Color */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-900 dark:text-white">Primary Theme Color</label>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 sm:w-auto min-w-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="#4f46e5"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 sm:max-w-none">Applied to header, sidebar, buttons, and highlights</span>
            </div>
          </div>

          {/* Font Size */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Type className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-900 dark:text-white">Font Size</label>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              {fontSizeOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="fontSize"
                    value={option.value}
                    checked={theme.fontSize === option.value}
                    onChange={() => setFontSize(option.value as 'small' | 'medium' | 'large')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="pb-4 sm:pb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Type className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-900 dark:text-white">Font Family</label>
            </div>
            <select
              value={theme.fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {fontOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> All changes are applied immediately and saved automatically. Your preferences will persist across sessions.
          </p>
        </div>
      </div>
    );
  }

  // Admin Settings - Keep existing admin customization (if needed)
  // For now, return null or placeholder
  if (isAdminSettings && isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Admin settings (Coming soon)</p>
        </div>
      </div>
    );
  }

  return null;
};
