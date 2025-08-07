'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// An SVG icon component for the password visibility toggle
const EyeIcon = ({ closed }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
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

      // --- NEW: Role-based redirection logic ---
      const userRole = result.user.role;
      const id = result.user.id
      switch (userRole) {
        case 'ADMIN':
        case 'SUPER_ADMIN':
          router.push('/admin'); // Redirect admins
          break;
        case 'EMPLOYEE':
          router.push(`/employee/${id}/profile`); // Redirect employees
          break;
        case 'COMPANY':
          router.push('/company/overview'); // Redirect company users
          break;
        default:
          router.push('/dashboard'); // Default redirect
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-300 to-blue-800 font-sans">
      <div className="relative flex w-full max-w-4xl min-h-[70vh] m-4 sm:m-8 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left decorative panel */}
        <div className="w-1/2 hidden md:flex flex-col rounded-2xl justify-between h-180 mt-2 ml-2 p-12 text-white bg-gradient-to-br from-blue-300 to-blue-800">
          <div>
            <img 
              src="Svg/logo.svg" 
              alt="Company Logo" 
              className="w-24"
              onError={(e) => e.target.src='https://placehold.co/100x40?text=Logo'}
            />
            <h1 className="text-4xl font-bold mt-8">Welcome Back</h1>
            <p className="mt-4 text-orange-100">
              Login to see your performance and keep your learning curve like no one else.
            </p>
          </div>
          <img 
            src="Svg/signin.svg" 
            alt="Sign In Illustration" 
            className="w-full max-w-xs mx-auto"
            onError={(e) => e.target.src='https://placehold.co/400x300?text=Illustration'}
          />
        </div>

        {/* Right Sign-in Form Panel */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm text-center">
            <h1 className="text-3xl font-bold text-gray-800">Sign In</h1>
            <p className="mt-2 text-gray-500">Let’s open your skill repository.</p>
          </div>

          <form onSubmit={handleLogin} className="w-full max-w-sm mt-8 space-y-4">
            {/* Email Input */}
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
            
            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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
            
            {/* Error Message */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold bg-gradient-to-br from-blue-300 to-blue-800 font-sans rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="w-full max-w-sm mt-6 flex justify-between items-center text-sm">
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

          <p className="mt-8 text-sm text-gray-500">
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

// A separate component for the Forgot Password flow
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
      // API call to your backend to send a password reset link
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
          onError={(e) => e.target.src='https://placehold.co/100x40?text=Logo'}
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
