import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const loginSchema = Yup.object({
  identifier: Yup.string()
    .required('Email or mobile number is required')
    .test('identifier', 'Invalid email or mobile number', (value) => {
      if (!value) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^[0-9]{10}$/;
      return emailRegex.test(value) || mobileRegex.test(value);
    }),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      identifier: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values.identifier, values.password);

        // Check if user is Main Admin
        const user = useAuthStore.getState().user;
        if (user?.role_id !== 1) {
          toast.error('Access denied. This portal is for Main Admin only.');
          useAuthStore.getState().logout();
          setSubmitting(false);
          return;
        }

        toast.success('Welcome, Main Admin!');
        navigate('/dashboard');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Invalid credentials');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Main Admin Portal
          </h1>
          <p className="text-gray-600">Sign in to manage the entire system</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <Input
            name="identifier"
            type="text"
            label="Email or Mobile Number"
            placeholder="admin@hostelapp.com or 9876543210"
            prefixIcon={<Mail className="h-5 w-5 text-gray-400" />}
            value={formik.values.identifier}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.identifier && formik.errors.identifier
                ? formik.errors.identifier
                : undefined
            }
          />

          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
            prefixIcon={<Lock className="h-5 w-5 text-gray-400" />}
            suffixIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.password && formik.errors.password
                ? formik.errors.password
                : undefined
            }
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            isLoading={formik.isSubmitting}
          >
            Login as Admin
          </Button>

          <div className="flex items-center justify-center text-xs">
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              
            </Link>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-xs text-indigo-800 font-medium mb-2">
            Admin Access Only
          </p>
          <p className="text-xs text-indigo-600">
            This portal is restricted to Main Admin users. You will have access to all hostels, owners, and system-wide operations.
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Demo Admin Credentials:</p>
          <p className="font-mono mt-1 text-indigo-600">admin@hostelapp.com / password123</p>
        </div>
      </Card>
    </div>
  );
};
