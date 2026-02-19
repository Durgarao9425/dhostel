import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, Users, CreditCard, Shield } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setResetSent(true);
      toast.success('Password reset link sent to your email!');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSent(false);
        setForgotEmail('');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process forgot password request');
    } finally {
      setForgotLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      identifier: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError('');
      try {
        await login(values.identifier, values.password);

        const user = useAuthStore.getState().user;

        toast.success(`Welcome, ${user?.full_name}!`);

        if (user?.role_id === 1) {
          navigate('/dashboard');
        } else if (user?.role_id === 2) {
          navigate('/owner/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (error: any) {
        let errorMessage = 'Invalid credentials. Please try again.';

        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.status === 401) {
          errorMessage = 'Invalid email/phone or password. Please check your credentials.';
        } else if (error.response?.status === 400) {
          errorMessage = 'Please enter valid email/phone and password.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        setLoginError(errorMessage);
        toast.error(errorMessage);
        console.error('Login error:', error);
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

          {/* Error Alert */}
          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                 Phone or Email
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
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
              </button>
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

          {/* Error Alert */}
          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}

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
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                
              </button>
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Reset Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSent(false);
                  setForgotEmail('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {resetSent ? (
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 border border-green-300">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm mb-0.5">Check Your Email</p>
                  <p className="text-gray-500 text-xs">
                    We've sent a reset link to <span className="text-blue-500 font-medium">{forgotEmail}</span>
                  </p>
                </div>
                <p className="text-xs text-gray-400 pt-2">Expires in 1 hour</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-gray-600 mb-4">
                  Enter your email and we'll send a reset link.
                </p>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotEmail('');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl font-medium text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 px-3 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Link'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
