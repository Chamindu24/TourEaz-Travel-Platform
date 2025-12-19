import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const palette = {
  platinum: "#E7E9E5",
  ash_gray: "#B7C5C7",
  lapis_lazuli: "#005E84",
  indigo_dye: "#075375",
  indigo_dye2: "#0A435C"
};

// Enhanced animations and micro-interactions (matching Login page)
const animations = {
  fadeIn: "animate-[fadeIn_0.6s_ease-out]",
  slideUp: "animate-[slideUp_0.5s_ease-out]",
  float: "animate-[float_3s_ease-in-out_infinite]",
  shimmer: "animate-[shimmer_2s_linear_infinite]",
  pulse: "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
};

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phoneNumber: '',
    password: '',
    repeatPassword: '',
    userType: 'traveler', // 'traveler' or 'service-provider'
    services: [], // For service providers
    companyName: '',
    companyDescription: '',
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Luxurious Maldives-themed background images (matching Login page)
  const backgroundImages = [
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1586861635167-e5223aedc9b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1520483601560-389dff434fdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  ];

  // Enhanced form handling with better UX (matching Login page)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors as user types for better UX
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleUserTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      userType: type,
      services: [] // Reset services when changing user type
    }));
    // Clear userType errors
    if (errors.userType || errors.services) {
      setErrors(prev => ({ ...prev, userType: '', services: '' }));
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
    const requiredFields = [
      'firstName', 'lastName', 'email', 'country', 'phoneNumber', 'password', 'repeatPassword'
    ];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate user type selection
    if (!formData.userType) {
      newErrors.userType = 'Please select a user type';
    }

    // Validate services for service providers
    if (formData.userType === 'service-provider') {
      if (formData.services.length === 0) {
        newErrors.services = 'Please select at least one service';
      }
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required for service providers';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (formData.password.trim() !== formData.repeatPassword.trim()) {
      newErrors.repeatPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🎯 api.baseURL =', axios.defaults.baseURL);
      console.log('📤 Posting to:', axios.defaults.baseURL + '/auth/register');

      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        userType: formData.userType,
      };

      // Add service provider specific data
      if (formData.userType === 'service-provider') {
        registrationData.services = formData.services;
        registrationData.companyName = formData.companyName;
        registrationData.companyDescription = formData.companyDescription;
      }

      await axios.post('/auth/register', registrationData, {headers:{ 'Content-Type': 'application/json'}});
      
      // Enhanced success feedback - elegant transition instead of popup
      setRegistrationSuccess(true);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        phoneNumber: '',
        password: '',
        repeatPassword: '',
        userType: 'traveler',
        services: [],
        companyName: '',
        companyDescription: '',
      });
      
      // Smooth transition before redirect to verify email
      setTimeout(() => {
        navigate('/verify-email', { state: { email: registrationData.email } });
      }, 3000);
      
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ 
        general: error.response?.data?.msg || error.response?.data?.message || 'Registration failed. Please check your information and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced image slideshow with smoother transitions (matching Login page)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  if (registrationSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center animate-[success-pulse_1s_ease-in-out]">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
          <p className="text-white/80 mb-2">Check your email to verify your account.</p>
          <p className="text-white/70 text-sm">Redirecting to verification page...</p>
        </div>
        <style>{`
          @keyframes success-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Custom CSS Animations (matching Login page) */}
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


      {/* Main Content - Split Screen Layout */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Information */}
        <div
          className="hidden lg:flex lg:w-1/2 items-start justify-center mt-3.5  p-12 relative overflow-hidden"
          style={{
            backgroundImage: "url('/register2.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            
           
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-teal-500/20 z-10 pointer-events-none backdrop-blur-[1px]"></div>
          {/* Animated gradient pulse */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5 z-20 pointer-events-none animate-pulse-slow"></div>

          <div className={`max-w-md mt-16 fixed z-30 ${animations.slideUp}`}>
            {/* The "Orbit" Label - A small detail that circles the main heading */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex -space-x-1">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full relative z-10"></div>
              </div>
              <span className="text-xs font-bold text-white/80 uppercase tracking-[0.5em]">
                Current Discovery / 08
              </span>
            </div>

            <div className="space-y-6">
              {/* High-Impact Serif Heading */}
              <h1 className="text-6xl font-serif text-white leading-tight tracking-tighter italic">
                The <span className="not-italic font-sans font-black text-yellow-300">Pearl.</span>
              </h1>

              {/* The "Floating Node" Card */}
              <div className="bg-gradient-to-br from-white/20 to-transparent backdrop-blur-3xl border border-white/20 p-1 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="bg-zinc-950/40 rounded-[22px] p-6">
                  <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                    Experience a curated selection of <span className="text-white border-b border-yellow-400/50 pb-1">secret villas</span> and uncharted wildlife trails across the southern plains.
                  </p>

                  {/* Feature Grid with "Glass" Buttons */}
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Private Aviation', icon: '✈️' },
                      { label: 'UNESCO Heritage Tours', icon: '🏛️' }
                    ].map((item, i) => (
                      <div key={i} className="group flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                          <span className="text-xs font-bold text-white/80 group-hover:text-white uppercase tracking-widest">{item.label}</span>
                        </div>
                        <svg className="w-4 h-4 text-zinc-600 group-hover:text-yellow-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* The "CTA" Group */}
              <div className="flex items-center space-x-4 pt-4">
                <button className="px-8 py-4 bg-yellow-400 rounded-full text-black font-black uppercase text-[10px] tracking-widest shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:-translate-y-1 transition-all">
                  Start Journey
                </button>
                <button className="p-4 rounded-full border-2 border-white/40 text-white hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <div className={`bg-white/10 backdrop-blur-lg  py-8  ${animations.slideUp}`}>
              {/* Form Header */}
              <div className="text-start mb-8">
                {/* The Heading: Bold and clear */}
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
                  Get Started
                </h2>
                
                {/* The Subtext: Dimmer color to create visual hierarchy */}
                <p className="text-lg text-slate-500 font-medium">
                  Join <span className="text-teal-600 font-bold">12,000+</span> travelers exploring the world today.
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error Display */}
                {errors.general && (
                  <div className="bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm">
                    {errors.general}
                  </div>
                )}

                {/* User Type Selection */}
                <div className="space-y-2">
                  <label className="block text-lg font-medium text-teal-200">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleUserTypeChange('traveler')}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                        formData.userType === 'traveler'
                          ? 'bg-teal-500/20 border-teal-400 text-teal-200'
                          : 'bg-teal-600/10 border-black/15 text-gray-400 hover:border-teal-400/50'
                      } flex items-center justify-center space-x-2`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-3m6 3l6-3" />
                      </svg>
                      <span>Traveler</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUserTypeChange('service-provider')}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                        formData.userType === 'service-provider'
                          ? 'bg-teal-500/20 border-teal-400 text-teal-200'
                          : 'bg-teal-600/10 border-black/15 text-gray-400 hover:border-teal-400/50'
                      } flex items-center justify-center space-x-2`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Service Provider</span>
                    </button>
                  </div>
                  {errors.userType && (
                    <p className="text-red-300 text-sm">{errors.userType}</p>
                  )}
                </div>

                {/* Name Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="block text-lg font-medium text-teal-200">
                      First Name 
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onFocus={() => handleFocus('firstName')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 bg-teal-600/10 border ${
                          errors.firstName 
                            ? 'border-red-400/50 focus:border-red-400' 
                            : focusedField === 'firstName'
                              ? 'border-teal-400 focus:border-teal-400'
                              : 'border-black/15 focus:border-teal-400'
                        } rounded-xl text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                        placeholder="Enter your first name"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-300 text-sm">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="block text-lg font-medium text-teal-200">
                      Last Name 
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onFocus={() => handleFocus('lastName')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 bg-teal-600/10 border ${
                          errors.lastName 
                            ? 'border-red-400/50 focus:border-red-400' 
                            : focusedField === 'lastName'
                              ? 'border-teal-400 focus:border-teal-400'
                              : 'border-black/15 focus:border-teal-400'
                        } rounded-xl text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                        placeholder="Enter your last name"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-300 text-sm">{errors.lastName}</p>
                    )}
                  </div>
                </div>

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
                      } rounded-xl text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                      placeholder="Enter your email address"
                    />

                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Country and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Country */}
                  <div className="space-y-2">
                    <label className="block text-lg font-medium text-teal-200">
                      Country 
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        onFocus={() => handleFocus('country')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 bg-teal-600/10 border ${
                          errors.country 
                            ? 'border-red-400/50 focus:border-red-400' 
                            : focusedField === 'country'
                              ? 'border-teal-400 focus:border-teal-400'
                              : 'border-black/15 focus:border-teal-400'
                        } rounded-xl text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                        placeholder="Your country"
                      />
                    </div>
                    {errors.country && (
                      <p className="text-red-300 text-sm">{errors.country}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="block text-lg font-medium text-teal-200">
                      Phone Number 
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        onFocus={() => handleFocus('phoneNumber')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 bg-teal-600/10 border ${
                          errors.phoneNumber 
                            ? 'border-red-400/50 focus:border-red-400' 
                            : focusedField === 'phoneNumber'
                              ? 'border-teal-400 focus:border-teal-400'
                              : 'border-black/15 focus:border-teal-400'
                        } rounded-xl text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                        placeholder="Your phone number"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-red-300 text-sm">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                {/* Service Provider Fields - Conditional Rendering */}
                {formData.userType === 'service-provider' && (
                  <>
                    {/* Company Name */}
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-teal-200">
                        Company/Business Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          onFocus={() => handleFocus('companyName')}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 bg-teal-600/10 border ${
                            errors.companyName 
                              ? 'border-red-400/50 focus:border-red-400' 
                              : focusedField === 'companyName'
                                ? 'border-teal-400 focus:border-teal-400'
                                : 'border-black/15 focus:border-teal-400'
                          } rounded-xl text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                          placeholder="Enter your company/business name"
                        />
                      </div>
                      {errors.companyName && (
                        <p className="text-red-300 text-sm">{errors.companyName}</p>
                      )}
                    </div>

                    {/* Company Description */}
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-teal-200">
                        Company Description (Optional)
                      </label>
                      <div className="relative">
                        <textarea
                          name="companyDescription"
                          value={formData.companyDescription}
                          onChange={handleChange}
                          onFocus={() => handleFocus('companyDescription')}
                          onBlur={handleBlur}
                          rows="3"
                          className={`w-full px-4 py-3 bg-teal-600/10 border ${
                            focusedField === 'companyDescription'
                              ? 'border-teal-400 focus:border-teal-400'
                              : 'border-black/15 focus:border-teal-400'
                          } rounded-xl text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                          placeholder="Brief description of your services"
                        />
                      </div>
                    </div>

                    {/* Services Selection */}
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-teal-200">
                        Select Services Offered
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'tour-packages', label: 'Tour Packages', icon: '🗺️' },
                          { id: 'excursions', label: 'Excursions (Tourist Activities)', icon: '🎭' },
                          { id: 'accommodation', label: 'Accommodation (Hotel/Resort/Guest Houses)', icon: '🏨' },
                          { id: 'transportation', label: 'Transportation (Vehicle + Driver/Guide)', icon: '🚗' }
                        ].map(service => (
                          <label key={service.id} className="flex items-center space-x-3 p-3 bg-teal-600/10 border border-black/15 rounded-lg hover:border-teal-400/50 cursor-pointer transition-all duration-200">
                            <input
                              type="checkbox"
                              checked={formData.services.includes(service.id)}
                              onChange={() => handleServiceToggle(service.id)}
                              className="w-5 h-5 rounded accent-teal-400 cursor-pointer"
                            />
                            <span className="text-lg">{service.icon}</span>
                            <span className="text-teal-100 font-medium flex-1">{service.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.services && (
                        <p className="text-red-300 text-sm">{errors.services}</p>
                      )}
<div className="mt-4 flex gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
  {/* Info Icon */}
  <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  
  <p className="text-sm text-slate-600 leading-relaxed">
    <span className="font-bold text-slate-900">Admin Approval:</span> To maintain quality, new services are reviewed by our team before going live.
  </p>
</div>
                    </div>
                  </>
                )}

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
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 bg-teal-600/10 border ${
                        errors.password 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : focusedField === 'password'
                            ? 'border-teal-400 focus:border-teal-400'
                            : 'border-black/15 focus:border-teal-400'
                      } rounded-xl text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-400 transition-colors duration-200"
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

                {/* Repeat Password */}
                <div className="space-y-2">
                  <label className="block text-lg font-medium text-teal-200">
                    Confirm Password 
                  </label>
                  <div className="relative">
                    <input
                      type={showRepeatPassword ? "text" : "password"}
                      name="repeatPassword"
                      value={formData.repeatPassword}
                      onChange={handleChange}
                      onFocus={() => handleFocus('repeatPassword')}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 bg-teal-600/10 border ${
                        errors.repeatPassword 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : focusedField === 'repeatPassword'
                            ? 'border-teal-400 focus:border-teal-400'
                            : 'border-black/15 focus:border-teal-400'
                      } rounded-xl text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/20`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-400 transition-colors duration-200"
                    >
                      {showRepeatPassword ? (
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
                  {errors.repeatPassword && (
                    <p className="text-red-500 text-sm">{errors.repeatPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-md font-semibold text-xl transition-all duration-200 ${
                    isLoading
                      ? 'bg-blue-400/50 cursor-not-allowed text-blue-100'
                      : 'bg-teal-500 hover:bg-white text-white shadow-lg hover:text-black transform hover:scale-[1.02] active:scale-[0.98]'
                  } focus:outline-none focus:ring-4 focus:ring-blue-400/20 border-2 hover:border-teal-500`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center ">
                  <p className="text-teal-200">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-blue-500 hover:text-blue-600 font-semibold transition-colors duration-200 hover:underline"
                    >
                      Sign in here
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

export default Register;
