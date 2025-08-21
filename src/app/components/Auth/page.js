'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle } from 'react-icons/fi';
import Login from '../Login';

// An SVG icon component for the password visibility toggle
const EyeIcon = ({ closed }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-500"
  >
    {closed ? (
      <>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
        <line x1="2" x2="22" y1="2" y2="22"></line>
      </>
    ) : (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </>
    )}
  </svg>
);

// The main Sign In component
const SignInPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed.');
      }

      console.log('Login successful:', result);

      const userRole = result.user.role;
      const id = result.user.id;
      switch (userRole) {
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'SUPER_ADMIN':
          router.push('/superadmin');
          break;
        case 'EMPLOYEE':
          router.push(`/employee/${id}/profile`);
          break;
        case 'COMPANY':
          router.push('/company/overview');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordComponent onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_bottom,_#3b82f6_0%,_#bfdbfe_40%,_#ffffff_80%)] font-sans p-4">
      {/* --- RESPONSIVE CHANGE ---
        - From `h-[65vh]` to `min-h-[65vh]` to prevent content overflow on small screens.
        - Added `flex-col md:flex-row` to stack elements on mobile.
        - Removed fixed `m-4 sm:m-8` as parent `p-4` now handles outer spacing.
      */}
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl min-h-[65vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left decorative panel */}
        {/* --- RESPONSIVE CHANGE ---
          - `hidden md:flex` correctly hides this panel on mobile.
          - Padding adjusted from `p-12` to `p-8 md:p-12`.
          - Font sizes adjusted for better readability on medium screens.
        */}
        <div className="w-full md:w-1/2 hidden md:flex flex-col rounded-2xl justify-between mt-3 mb-3 ml-0 md:ml-4 p-8 md:p-12 text-white bg-gradient-to-br from-blue-300 to-blue-800">
          <div>
            <div className="font-extrabold text-2xl md:text-[30px] align-middle text-center flex items-center justify-center">
              <FiCheckCircle className="mr-2" /> VETTIFY
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-8">Welcome Back</h1>
            <p className="mt-4 text-orange-100">
              Login to track your progress, stay ahead, and keep your growth curve soaring. Whether you're leading the way or making it happen, your journey starts here.
            </p>
          </div>
          <Login />
        </div>

        {/* Right Sign-in Form Panel */}
        {/* --- RESPONSIVE CHANGE ---
          - `w-full md:w-1/2` ensures it takes full width on mobile.
          - Padding adjusted from `p-8 sm:p-12` to a more consistent `p-6 sm:p-12`.
          - Font sizes adjusted to be smaller on mobile (`text-2xl sm:text-3xl`).
        */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sign In</h1>
            <p className="mt-2 text-gray-500">Log in to track, manage, and grow like never before.</p>
          </div>

          <form onSubmit={handleLogin} className="w-full max-w-sm mt-8 space-y-4">
            <div>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Email"
                value={userData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Password"
                value={userData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-4"
              >
                <EyeIcon closed={showPassword} />
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold bg-gradient-to-br from-blue-300 to-blue-800 font-sans rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* --- RESPONSIVE CHANGE ---
            - Stacks vertically on small screens (`flex-col sm:flex-row`).
            - Adds spacing for the stacked layout (`space-y-2 sm:space-y-0`).
          */}
          <div className="w-full max-w-sm mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <input
                id="keep-signed-in"
                type="checkbox"
                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="keep-signed-in" className="ml-2 text-gray-600">
                Keep me signed in
              </label>
            </div>
            <button
              onClick={() => setShowForgotPassword(true)}
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Forgot Password?
            </button>
          </div>

          <p className="mt-8 text-sm text-gray-500 text-center">
            Don’t have an account?{' '}
            <a href="#" className="font-bold text-gray-700 hover:underline">
              Contact Administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// The ForgotPasswordComponent is already quite responsive due to its simple, centered layout.
// No major changes are needed here.
const ForgotPasswordComponent = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Could not send reset link. Please try again.');
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl text-center">
        <img
          src="https://placehold.co/100x40/ffffff/000000?text=Logo"
          alt="Company Logo"
          className="w-24 mx-auto mb-6"
          onError={(e) => (e.target.src = 'https://placehold.co/100x40?text=Logo')}
        />
        <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>

        {!submitted ? (
          <>
            <p className="mt-4 text-gray-500">
              Don't worry! Just type in the email you registered with and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white font-semibold bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-4 text-gray-600">
              Great! If an account with that email exists, a password reset link has been sent.
            </p>
            <button
              onClick={onBack}
              className="mt-6 w-full py-3 font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-800"
            >
              Back to Sign In
            </button>
          </>
        )}

        <button onClick={onBack} className="mt-4 text-sm text-gray-500 hover:underline">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default SignInPage;
