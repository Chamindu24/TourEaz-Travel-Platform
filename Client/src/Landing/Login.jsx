import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const palette = {
  platinum: "#E7E9E5",
  ash_gray: "#B7C5C7",
  lapis_lazuli: "#005E84",
  indigo_dye: "#075375",
  indigo_dye2: "#0A435C"
};

// Enhanced animations and micro-interactions
const animations = {
  fadeIn: "animate-[fadeIn_0.6s_ease-out]",
  slideUp: "animate-[slideUp_0.5s_ease-out]",
  float: "animate-[float_3s_ease-in-out_infinite]",
  shimmer: "animate-[shimmer_2s_linear_infinite]",
  pulse: "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
};

const Login = ({ setIsAuthenticated }) => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [showPassword, setShowPassword] = useState(false); // Enhanced UX: password visibility toggle
  const [focusedField, setFocusedField] = useState(null); // Enhanced UX: field focus states
  const [loginSuccess, setLoginSuccess] = useState(false); // Enhanced UX: success state

  // Luxurious Maldives-themed background images with higher quality
  const backgroundImages = [
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1586861635167-e5223aedc9b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1520483601560-389dff434fdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  ];

  // Enhanced image slideshow with smoother transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 6000); // Slower transition for more luxurious feel
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Enhanced form handling with better UX
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear errors as user types for better UX
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Enhanced error display - no intrusive popup
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (typeof setIsAuthenticated === 'function') {
        setIsAuthenticated(true);
      }

      // Enhanced success feedback - elegant transition instead of popup
      setLoginSuccess(true);

      try {
        const userResponse = await axios.get('/users/me');
        setUser(userResponse.data);
        const loggedInRole = userResponse?.data?.role;
        
        // Smooth transition before redirect
        setTimeout(() => {
          // Handle post-login redirect
          const bookingIntent = location.state?.bookingIntent;
          const from = location.state?.from;

          // If admin, go straight to admin dashboard
          if (loggedInRole === 'admin') {
            navigate('/admin');
            return;
          }

          if (bookingIntent) {
            // Redirect to the booking page with the saved data
            switch (bookingIntent.type) {
              case 'hotel':
                navigate('/bookingRequest', { state: bookingIntent.data });
                break;
              case 'activity':
                navigate(`/activities/${bookingIntent.data.activityId}/booking`, {
                  state: {
                    selectedDate: bookingIntent.data.selectedDate,
                    guests: bookingIntent.data.guests,
                    bookingType: bookingIntent.data.bookingType // Preserve the booking type
                  }
                });
                break;
              case 'tour':
                // For tours, redirect back to the tour details page and auto-open inquiry form
                navigate(bookingIntent.returnTo, {
                  state: { openInquiry: true, tourBookingData: bookingIntent.data }
                });
                break;
              case 'tour-booking':
                // For tour booking, redirect back to the tour details page
                // (future booking form will be implemented here)
                navigate(bookingIntent.returnTo, {
                  state: { proceedToBooking: true, tourBookingData: bookingIntent.data }
                });
                break;
              default:
                navigate(from?.pathname || '/');
            }
          } else if (from?.pathname) {
            // Regular redirect after authentication
            navigate(from.pathname + (from.search || ''), { replace: true });
          } else {
            navigate('/'); // Default redirect to home page
          }
        }, 1500); // Allow success animation to play

      } catch (userError) {
        console.error('Failed to fetch user data after login:', userError);
        // Enhanced error handling - subtle notification
        setErrors({ general: 'Logged in but user data could not be loaded. Please refresh.' });
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle email verification required
      if (err.response?.status === 401 && err.response?.data?.needsVerification) {
        setErrors({ 
          general: 'Please verify your email to log in. Check your email for the verification link.' 
        });
        // Optionally show resend verification option
        Swal.fire({
          icon: 'warning',
          title: 'Email Verification Required',
          text: 'Your email is not verified yet. Would you like to request a new verification email?',
          showCancelButton: true,
          confirmButtonText: 'Resend Email',
          cancelButtonText: 'Go to Verification',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/verify-email', { state: { email: formData.email } });
          } else {
            navigate('/verify-email');
          }
        });
      } else if (err.response?.status === 403 && err.response?.data?.status === 'pending') {
        setErrors({ 
          general: 'Your account is pending approval. You will be notified once approved.' 
        });
      } else {
        setErrors({ 
          general: err.response?.data?.msg || 'Login failed. Please check your credentials and try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative  overflow-hidden">
      {/* Enhanced Custom CSS Animations (matching Register page) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        @keyframes success-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .backdrop-blur-lg {
          backdrop-filter: blur(16px);
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
        /* Hide browser's password reveal button */
        input[type="password"]::-ms-reveal { display: none; }
        input[type="password"]::-webkit-credentials-auto-fill-button { display: none; }
      `}</style>





      {/* Login Success Overlay */}
      {loginSuccess && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden">
          {/* Minimalist Top/Bottom Borders (Frame) */}
          <div className="absolute top-10 left-10 right-10 h-[1px] bg-gray-100 origin-left animate-[scaleX_1s_ease_forwards]" />
          <div className="absolute bottom-10 left-10 right-10 h-[1px] bg-gray-100 origin-right animate-[scaleX_1s_ease_forwards]" />

          <div className="relative flex flex-col items-center">
            {/* The Counter-Slide Text Container */}
            <div className="flex overflow-hidden">
              <h2 className="text-[#0A435C] font-black text-6xl md:text-9xl tracking-tighter uppercase leading-none
                            animate-[slideDown_0.8s_cubic-bezier(0.87,0,0.13,1)_both]">
                TOUR
              </h2>
              <h2 className="text-teal-500 font-black text-6xl md:text-9xl tracking-tighter uppercase leading-none
                            animate-[slideUp_0.8s_cubic-bezier(0.87,0,0.13,1)_both]">
                EAZ
              </h2>
            </div>

            {/* The Floating Vertical Liaison Tag */}
            <div className="absolute -right-16 top-0 bottom-0 flex items-center">
              <div className="h-full w-[1px] bg-teal-500/20 animate-[scaleY_0.8s_ease_0.4s_both]" />
              <p className="ml-4 [writing-mode:vertical-lr] text-[10px] font-bold tracking-[0.6em] text-gray-300 uppercase
                            opacity-0 animate-[fadeIn_0.5s_ease_1s_forwards]">
                Digital Concierge
              </p>
            </div>

            {/* Centered Decorative Dot */}
            <div className="mt-8 flex flex-col items-center">
              <div className="w-1 h-1 bg-teal-500 rounded-full animate-ping" />
              <p className="mt-4 text-[10px] font-mono text-gray-400 tracking-widest opacity-0 animate-[fadeIn_0.5s_ease_0.8s_forwards]">
                VERIFIED_SECURE_2025
              </p>
            </div>
          </div>

          {/* The Sweep Exit (A teal sheet that cleans the screen) */}
          <div className="absolute inset-0 bg-[#0A435C] -translate-x-full animate-[finalSweep_0.8s_cubic-bezier(0.87,0,0.13,1)_1.8s_forwards]" />

          <style>{`
            @keyframes scaleX {
              0% { transform: scaleX(0); }
              100% { transform: scaleX(1); }
            }
            @keyframes scaleY {
              0% { transform: scaleY(0); }
              100% { transform: scaleY(1); }
            }
            @keyframes slideDown {
              0% { transform: translateY(-100%); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideUp {
              0% { transform: translateY(100%); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes fadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes finalSweep {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      )}

      {/* Main Content - Split Screen Layout */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Information */}
        <div
          className="hidden lg:flex lg:w-1/2 items-start justify-center mt-3.5  p-12 relative overflow-hidden"
          style={{
            backgroundImage: "url('/login3.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",

          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-teal-500/30 z-10 pointer-events-none backdrop-blur-[1px]"></div>
          {/* Animated gradient pulse */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5 z-20 pointer-events-none animate-pulse-slow"></div>

          {/* Floating clouds */}
          <motion.div
            className="absolute top-20 left-[-100px] w-40 opacity-70 z-15"
            animate={{ x: [0, 600, -100] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 640 512" fill="white" className="w-full h-full">
              <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144z"/>
            </svg>
          </motion.div>
          <motion.div
            className="absolute top-40 left-[-150px] w-56 opacity-50 z-15"
            animate={{ x: [0, 700, -200] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 640 512" fill="white" className="w-full h-full">
              <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144z"/>
            </svg>
          </motion.div>

          {/* Flying airplane */}
          <motion.div
            className="absolute top-10 mt-10 left-[-50px] z-30"
            animate={{ x: [0, 700, -100], rotate: [0, 15, -10] }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 576 512" fill="white" className="w-14 h-14">
              <path d="M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-7.8 6.4-12.8 6.4l-42 0c-7.8 0-14-6.3-14-14c0-1.3 .2-2.6 .5-3.9L32 256 .5 145.9c-.4-1.3-.5-2.6-.5-3.9c0-7.8 6.3-14 14-14l42 0c5 0 9.8 2.4 12.8 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z"/>
            </svg>
          </motion.div>

          {/* Sparkles for magic feel */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 bg-yellow-300 rounded-full z-30`}
              style={{
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 80}%`,
              }}
              animate={{ y: [0, -15, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i,
              }}
            />
          ))}

          <div className="fixed z-40 mt-20 max-w-2xl px-8 flex gap-8">
                
                {/* 1. Vertical Brand Side-Bar (Very 'Famous Site' Style) */}
                <div className="hidden md:flex flex-col items-center justify-between py-2 border-r border-white/10 pr-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/80 [writing-mode:vertical-lr] rotate-180">
                    Ceylon Chronicles
                  </span>
                  <div className="h-24 w-[2px] bg-gradient-to-b from-transparent via-yellow-500 to-transparent" />
                  <span className="text-yellow-500 font-serif italic text-xl">25’</span>
                </div>

                <div className="flex-1 space-y-10">
                  
                  {/* 2. Overlapping Headlines */}
                  <div className="relative">
                    <motion.span 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="block text-yellow-400 font-mono text-xs tracking-[0.3em] uppercase mb-2"
                    >
                      Exclusive Access
                    </motion.span>
                    <h1 className="text-7xl font-black text-white leading-[0.85] tracking-tighter">
                      THE <br />
                      <span className="relative inline-block mt-2">
                        UNSEEN
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ delay: 0.5, duration: 1 }}
                          className="absolute -bottom-2 left-0 h-4 bg-yellow-400/20 -z-10" 
                        />
                      </span>
                      <br />
                      ISLAND.
                    </h1>
                  </div>

                  {/* 3. The "Focus" Narrative */}
                  <p className="text-xl text-gray-200 font-light leading-relaxed max-w-sm">
                    Beyond the tourist trails lie <span className="text-white border-b border-white/90">ancient whispers</span> and untouched horizons. Log in to claim your itinerary.
                  </p>

                  {/* 4. Action-Driven Floating Card */}
                  {location.state?.bookingIntent && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="group flex items-center gap-4 p-1 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl hover:border-white/40 transition-all cursor-pointer"
                    >
                      <div className="h-14 w-14 rounded-xl bg-white overflow-hidden flex items-center justify-center">
                        {/* This would be a tiny thumbnail of the hotel/activity */}
                        <div className="text-black font-black text-xs">GO</div>
                      </div>
                      <div className="pr-6">
                        <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Resume Journey</p>
                        <p className="text-white font-semibold text-sm">
                          Finish booking your {location.state.bookingIntent.type}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* 5. The "Trust" Bar */}
                  <div className="pt-8 flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                    {/* Replace these with real travel partner logos */}
                    <span className="text-white font-bold tracking-tighter text-lg">LUXE</span>
                    <span className="text-white font-serif italic text-lg">Voyager</span>
                    <span className="text-white font-sans font-light tracking-[0.2em] text-xs uppercase">Safari Co.</span>
                  </div>
                </div>
              </div>
        </div>


        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2  flex items-center justify-center -mt-20 p-4 sm:p-8">
          <div className="w-full max-w-md">
            <div className={`bg-white/50 backdrop-blur-lg rounded-md  p-8   ${animations.slideUp}`}>
              <div className="text-start mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-1 bg-teal-500 rounded-full"></div> {/* Brand accent line */}
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome Back
                  </h2>
                </div>
                <p className="text-slate-500 font-medium pl-4">
                  Sign in to your travel agent portal
                </p>
              </div>

              {/* Enhanced Error Display */}
              {errors.general && (
                <div className="mb-6 bg-red-400/15 border border-red-500 text-red-600 px-4 py-3 rounded-xl backdrop-blur-sm">
                  {errors.general}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-lg font-medium text-teal-200">
                    Email Address 
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFocus('email')}
                      onBlur={handleBlur}
                      autoComplete="username"
                      className={`w-full px-4 py-3 bg-teal-600/10 border ${
                        errors.email 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : focusedField === 'email'
                            ? 'border-teal-400 focus:border-teal-400'
                            : 'border-black/15 focus:border-teal-400'
                      } rounded-lg text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                      placeholder="Enter your email address"
                    />

                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-lg font-medium text-teal-200">
                    Password 
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus('password')}
                      onBlur={handleBlur}
                      autoComplete="current-password"
                      className={`w-full px-4 py-3 pr-12 bg-teal-600/10 border ${
                        errors.password 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : focusedField === 'password'
                            ? 'border-teal-400 focus:border-teal-400'
                            : 'border-black/15 focus:border-teal-400'
                      } rounded-lg text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-400/20`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-teal-400 focus:ring-teal-400 border-white/30 rounded bg-white/10"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-teal-200">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full  py-3 px-6 tracking-wide rounded-md font-semibold text-xl transition-all duration-200 ${
                    isLoading
                      ? 'bg-teal-300 cursor-not-allowed text-teal-900'
                      : 'bg-teal-500 hover:bg-white text-white shadow-lg hover:text-black transform hover:scale-[1.02] active:scale-[0.98]'
                  } focus:outline-none focus:ring-4 focus:ring-blue-400/20 border-2 hover:border-teal-500`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing you in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Register Link */}
                <div className="text-center ">
                  <p className="text-teal-200">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200 hover:underline"
                    >
                      Create account here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;