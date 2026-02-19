import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { AdminLogin } from './pages/AdminLogin';
import { OwnerLogin } from './pages/OwnerLogin';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { OwnersPage } from './pages/OwnersPage';
import { HostelsPage } from './pages/HostelsPage';
import { OwnerHostelsPage } from './pages/OwnerHostelsPage';
import { RoomsPage } from './pages/RoomsPage';
import { StudentsPage } from './pages/StudentsPage';
import { MonthlyFeeManagementPage } from './pages/MonthlyFeeManagementPage';
import { FeeDetailsPage } from './pages/FeeDetailsPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Role-based Hostel Page Component
const HostelPageRouter: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role_id === 1;

  return isAdmin ? <HostelsPage /> : <OwnerHostelsPage />;
};

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth for this tab's independent session
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Routes>
          {/* Public Routes - Landing and Login Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>

          <Route
            path="/hostels"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HostelPageRouter />} />
          </Route>

          <Route
            path="/owners"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OwnersPage />} />
          </Route>

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ReportsPage />} />
          </Route>

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SettingsPage />} />
          </Route>

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfilePage />} />
          </Route>

          {/* Owner Routes - Prefixed with /owner */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>

          <Route
            path="/owner/rooms"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoomsPage />} />
          </Route>

          <Route
            path="/owner/students"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentsPage />} />
          </Route>

          {/* Redirect /owner/fees to /owner/monthly-fees */}
          <Route
            path="/owner/fees"
            element={
              <ProtectedRoute>
                <Navigate to="/owner/monthly-fees" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/monthly-fees"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MonthlyFeeManagementPage />} />
          </Route>

          <Route
            path="/owner/collections"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CollectionsPage />} />
          </Route>

          <Route
            path="/owner/fee-details/:studentId/:feeMonth"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FeeDetailsPage />} />
          </Route>

          <Route
            path="/owner/income"
            element={
              
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<IncomePage />} />
          </Route>

          <Route
            path="/owner/expenses"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ExpensesPage />} />
          </Route>

          <Route
            path="/owner/reports"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ReportsPage />} />
          </Route>

          <Route
            path="/owner/settings"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SettingsPage />} />
          </Route>

          <Route
            path="/owner/profile"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfilePage />} />
          </Route>

          {/* Redirect old owner paths to new /owner/* paths */}
          <Route path="/rooms" element={<Navigate to="/owner/rooms" replace />} />
          <Route path="/students" element={<Navigate to="/owner/students" replace />} />
          <Route path="/fees" element={<Navigate to="/owner/monthly-fees" replace />} />
          <Route path="/monthly-fees" element={<Navigate to="/owner/monthly-fees" replace />} />
          <Route path="/income" element={<Navigate to="/owner/income" replace />} />
          <Route path="/expenses" element={<Navigate to="/owner/expenses" replace />} />

          {/* Catch-all - Redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
