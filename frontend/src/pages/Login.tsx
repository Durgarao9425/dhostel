import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Mail, Lock, Eye, EyeOff, Building2, Users, CreditCard, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

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

export const Login: React.FC = () => {
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
        toast.success('Login successful!');

        const user = useAuthStore.getState().user;
        if (user?.role_id === 1) {
          navigate('/dashboard');
        } else if (user?.role_id === 2) {
          navigate('/owner/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Invalid credentials');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      {/* Mobile View */}
      <div className="flex-1 flex flex-col md:hidden">
        {/* Top Section with Illustration */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-4">
          {/* Hostel Icon */}
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="w-16 h-16 text-white" />
            </div>
            {/* Floating icons */}
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Hostel Management
          </h1>
          <p className="text-gray-500 text-center text-sm max-w-xs">
            Simplify your hostel operations with smart room and fee management
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-t-3xl shadow-lg px-6 py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-1 text-center">Welcome Back</h2>
          <p className="text-gray-500 text-sm mb-6 text-center">Sign in to continue</p>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="identifier"
                  type="text"
                  placeholder="Enter email or phone"
                  value={formik.values.identifier}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    formik.touched.identifier && formik.errors.identifier
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                />
              </div>
              {formik.touched.identifier && formik.errors.identifier && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.identifier}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition shadow-md disabled:opacity-50"
            >
              {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          {/* Features */}
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-1">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500">Secure</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-1">
                <Building2 className="w-5 h-5 text-cyan-500" />
              </div>
              <p className="text-xs text-gray-500">Easy</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-1">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-500">Smart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex flex-1">
        {/* Left Side - Illustration */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-cyan-50">
          {/* Hostel Illustration */}
          <div className="relative mb-8">
            <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center shadow-xl">
              <Building2 className="w-24 h-24 text-white" />
            </div>
            {/* Floating icons */}
            <div className="absolute -top-4 -right-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
              <Users className="w-7 h-7 text-blue-500" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
              <CreditCard className="w-7 h-7 text-cyan-500" />
            </div>
            <div className="absolute top-1/2 -left-8 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.4s' }}>
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div className="absolute top-0 left-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.6s' }}>
              <Building2 className="w-5 h-5 text-purple-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Hostel Management
          </h1>
          <p className="text-gray-600 text-center text-lg max-w-md mb-8">
            Simplify your hostel operations with smart room allocation, fee tracking, and student management
          </p>

          {/* Features */}
          <div className="flex gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-2">
                <Building2 className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Room Management</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-7 h-7 text-cyan-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Fee Tracking</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-2">
                <Users className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Student Records</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md flex flex-col justify-center p-12 bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="identifier"
                  type="text"
                  placeholder="Enter email or phone number"
                  value={formik.values.identifier}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    formik.touched.identifier && formik.errors.identifier
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                />
              </div>
              {formik.touched.identifier && formik.errors.identifier && (
                <p className="mt-1 text-sm text-red-500">{formik.errors.identifier}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-500">{formik.errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Secure login with enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
