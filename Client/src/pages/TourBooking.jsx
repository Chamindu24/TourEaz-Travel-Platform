import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Footer from '../Components/Footer';
import { countries } from '../assets/nationalities';
import { Snackbar, Alert } from '@mui/material';

const foodCategoryMap = {
  0: 'Half Board',
  1: 'Full Board',
  2: 'All Inclusive'
};

const TourBooking = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get tour data from location state
  const {
    selectedTour,
    selectedCurrency,
    exchangeRates,
    finalPrice,
    finalOldPrice,
    selectedNightsKey,
    selectedNightsOption,
    selectedFoodCategory,
  } = location.state || {};

  console.log('TourBooking: location.state:', location.state);
  console.log('TourBooking: selectedTour:', selectedTour);

  // Booking form state
  const [bookingData, setBookingData] = useState({
    // Personal Information
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    phoneCountryCode: '+960',
    
    // Travel Details
    travelDate: '',
    travellerCount: selectedTour?.person_count || 1,
    
    // Additional Information
    specialRequests: '',
    emergencyContact: '',
    nationality: '',
    
    // Payment Information (for future use)
    paymentMethod: 'bank-transfer',
  });

  const [errors, setErrors] = useState({});
  const [tour, setTour] = useState(selectedTour);

  const steps = ['Tour Details', 'Personal Information', 'Travel Details', 'Review & Confirm'];

  // Country codes for phone selection
  const countryCodes = [
    { code: '+960', label: '🇲🇻 Maldives' },
    { code: '+1', label: '🇺🇸 USA' },
    { code: '+44', label: '🇬🇧 UK' },
    { code: '+91', label: '🇮🇳 India' },
    { code: '+971', label: '🇦🇪 UAE' },
    { code: '+65', label: '🇸🇬 Singapore' },
    // Add more as needed
  ];

  // Price conversion function
  const convertPrice = (priceInUSD) => {
    if (!exchangeRates || !exchangeRates[selectedCurrency]) {
      return priceInUSD?.toLocaleString() || '0';
    }
    return (priceInUSD * exchangeRates[selectedCurrency]).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate total price
  const calculateTotal = () => {
    return finalPrice || 0;
  };

  // Calculate savings
  const calculateSavings = () => {
    if (finalOldPrice && finalPrice) {
      return finalOldPrice - finalPrice;
    }
    return 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate current step
  const validateStep = (step) => {
    const errs = {};
    
    if (step === 1) {
      if (!bookingData.clientName.trim()) errs.clientName = 'Name is required';
      if (!bookingData.clientEmail.trim()) errs.clientEmail = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(bookingData.clientEmail)) errs.clientEmail = 'Invalid email format';
      if (!bookingData.clientPhone.trim()) errs.clientPhone = 'Phone number is required';
    }
    
    if (step === 2) {
      if (!bookingData.travelDate) errs.travelDate = 'Travel date is required';
      if (!bookingData.travellerCount || bookingData.travellerCount < 1) {
        errs.travellerCount = 'At least 1 traveller is required';
      }
      if (!bookingData.nationality) errs.nationality = 'Nationality is required';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    setLoading(true);
    try {
      const nightsOption = tour?.nights?.[String(selectedNightsKey)]?.[String(selectedNightsOption)]?.option || selectedNightsOption;
      const foodCategoryLabel = foodCategoryMap[String(selectedFoodCategory)] || selectedFoodCategory;
      const numericNightsKey = selectedNightsKey ? parseInt(selectedNightsKey, 10) : 0;

      const payload = {
        // Customer Information
        clientName: bookingData.clientName,
        clientEmail: bookingData.clientEmail,
        clientPhone: bookingData.clientPhone,
        phoneCountryCode: bookingData.phoneCountryCode,
        nationality: bookingData.nationality,
        emergencyContact: bookingData.emergencyContact,
        
        // Travel Details
        travelDate: bookingData.travelDate,
        travellerCount: bookingData.travellerCount,
        
        // Tour Information
        tourId: tour?._id || 'unknown',
        tourTitle: tour?.title || 'Tour Booking',
        selectedNightsKey: numericNightsKey,
        selectedNightsOption: nightsOption,
        selectedFoodCategory: foodCategoryLabel,
        
        // Pricing Information
        finalPrice: calculateTotal(),
        finalOldPrice: finalOldPrice || 0,
        currency: selectedCurrency || 'USD',
        
        // Additional Information
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod,
        
        // Tour Details for reference
        tourImage: tour?.tour_image || '',
        tourSummary: tour?.tour_summary || '',
        personCount: tour?.person_count || bookingData.travellerCount,
        country: tour?.country || '',
        validFrom: tour?.valid_from ? new Date(tour.valid_from) : null,
        validTo: tour?.valid_to ? new Date(tour.valid_to) : null,
      };

      const response = await axios.post('/tour-bookings', payload);
      
      setLoading(false);
      setShowConfirmation(true);
      
      // Show success notification
      setSnackbar({
        open: true,
        message: 'Your tour booking has been submitted successfully! Our team will contact you within 24 hours.',
        severity: 'success'
      });
      
      // Navigate after showing the notification
      setTimeout(() => {
        navigate('/tours');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Failed to submit booking. Please try again.',
        severity: 'error'
      });
    }
  };

  // For testing purposes - create dummy tour data if none exists
  useEffect(() => {
    if (!selectedTour) {
      // Create dummy tour data for testing
      const dummyTour = {
        _id: 'test-tour-123',
        title: 'Test Maldives Tour Package',
        tour_summary: 'A beautiful test tour package for the Maldives',
        tour_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920',
        person_count: 2,
        price: 1500,
        oldPrice: 1800,
        country: 'Maldives',
        valid_from: '2025-01-01',
        valid_to: '2025-12-31',
        nights: {
          '3': {
            'standard': { option: 'Standard Package', add_price: 0, old_add_price: 0 },
            'premium': { option: 'Premium Package', add_price: 300, old_add_price: 400 }
          },
          '5': {
            'standard': { option: 'Standard Package', add_price: 200, old_add_price: 300 },
            'premium': { option: 'Premium Package', add_price: 500, old_add_price: 700 }
          }
        },
        food_category: {
          '0': [0, 0, true], // Half Board
          '1': [150, 200, true], // Full Board
          '2': [300, 400, true] // All Inclusive
        }
      };
      
      console.log('TourBooking: Using dummy tour data for testing');
      setTour(dummyTour);
    }
  }, [selectedTour]);

  // Redirect if no tour data (only if not using dummy data)
  useEffect(() => {
    if (!selectedTour && !tour) {
      // Show error message instead of immediate redirect
      setSnackbar({
        open: true,
        message: 'Please select a tour first before proceeding to booking.',
        severity: 'warning'
      });
      setTimeout(() => {
        navigate('/tours');
      }, 3000);
    }
  }, [selectedTour, tour, navigate]);

  if (!selectedTour && !tour) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005E84] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tour details...</p>
          <p className="mt-2 text-sm text-gray-500">If this takes too long, please go back and select a tour first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0`}>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#0A435C] mb-4">Secure Your Tour Spot</h1>
            <p className="text-lg text-gray-600">Complete your booking for an unforgettable experience</p>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-2xl shadow-lg mb-8 p-6">
            <div className="relative">
              {/* Connecting Lines */}
              <div className="absolute top-5 left-0 right-0 flex items-center justify-between px-5">
                {steps.slice(0, -1).map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-0.5 mx-2 ${
                      activeStep > index ? 'bg-teal-300' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              
              {/* Step Circles */}
              <div className="relative flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center flex-1 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 border-2 ${
                      activeStep >= index 
                        ? 'bg-teal-500 text-white border-teal-300' 
                        : activeStep === index - 1 
                          ? 'bg-white text-[#005E84] border-[#005E84]' 
                          : 'bg-gray-200 text-gray-600 border-gray-200'
                    }`}>
                      {activeStep > index ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-xs text-center ${
                      activeStep >= index ? 'text-[#005E84] font-semibold' : 'text-gray-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            
            {/* Step 0: Tour Details */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Tour Summary</h2>
                
                {/* Tour Hero */}
                <div className="relative rounded-2xl overflow-hidden mb-6">
                  <img
                    src={tour.tour_image || '/placeholder-tour.jpg'}
                    alt={tour.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{tour.title}</h3>
                    <p className="text-gray-200">{tour.tour_summary}</p>
                  </div>
                </div>

                {/* Tour Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Duration</h4>
                      <p className="text-gray-600">{selectedNightsKey ? `${parseInt(selectedNightsKey) + 1} Days / ${selectedNightsKey} Nights` : 'Not selected'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Package Option</h4>
                      <p className="text-gray-600">
                        {tour?.nights?.[selectedNightsKey]?.[selectedNightsOption]?.option || 'Standard Package'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Meal Plan</h4>
                      <p className="text-gray-600">{foodCategoryMap[selectedFoodCategory] || 'Not selected'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Travellers</h4>
                      <p className="text-gray-600">{tour.person_count} Person(s)</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Valid Period</h4>
                      <p className="text-gray-600">
                        {new Date(tour.valid_from).toLocaleDateString()} - {new Date(tour.valid_to).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Country</h4>
                      <p className="text-gray-600">{tour.country}</p>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-[#005E84] to-[#075375] text-white p-6 rounded-lg">
                  <h4 className="text-xl font-bold mb-4">Price Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>{selectedCurrency} {convertPrice(finalPrice)}</span>
                    </div>
                    {calculateSavings() > 0 && (
                      <>
                        <div className="flex justify-between text-gray-300 line-through">
                          <span>Original Price:</span>
                          <span>{selectedCurrency} {convertPrice(finalOldPrice)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-300">
                          <span>You Save:</span>
                          <span>{selectedCurrency} {convertPrice(calculateSavings())}</span>
                        </div>
                      </>
                    )}
                    <div className="border-t border-white/30 pt-2 mt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span>{selectedCurrency} {convertPrice(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={bookingData.clientName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#005E84] focus:border-transparent ${
                        errors.clientName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={bookingData.clientEmail}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#005E84] focus:border-transparent ${
                        errors.clientEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.clientEmail && <p className="mt-1 text-xs text-red-600">{errors.clientEmail}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country Code *
                    </label>
                    <select
                      name="phoneCountryCode"
                      value={bookingData.phoneCountryCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005E84] focus:border-transparent"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="clientPhone"
                      value={bookingData.clientPhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#005E84] focus:border-transparent ${
                        errors.clientPhone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.clientPhone && <p className="mt-1 text-xs text-red-600">{errors.clientPhone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={bookingData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005E84] focus:border-transparent"
                    placeholder="Name and phone number of emergency contact"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Travel Details */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Travel Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Travel Date *
                    </label>
                    <input
                      type="date"
                      name="travelDate"
                      value={bookingData.travelDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#005E84] focus:border-transparent ${
                        errors.travelDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.travelDate && <p className="mt-1 text-xs text-red-600">{errors.travelDate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Travellers *
                    </label>
                    <input
                      type="number"
                      name="travellerCount"
                      value={bookingData.travellerCount}
                      onChange={handleChange}
                      min="1"
                      max="20"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#005E84] focus:border-transparent ${
                        errors.travellerCount ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.travellerCount && <p className="mt-1 text-xs text-red-600">{errors.travellerCount}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality *
                  </label>
                  <select
                    name="nationality"
                    value={bookingData.nationality}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#005E84] focus:border-transparent ${
                      errors.nationality ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your nationality</option>
                    {countries.map((country) => (
                      <option key={country.name} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.nationality && <p className="mt-1 text-xs text-red-600">{errors.nationality}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005E84] focus:border-transparent"
                    placeholder="Any special requirements, dietary restrictions, accessibility needs, etc."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Your Booking</h2>
                
                {/* Booking Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Tour Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Tour:</strong> {tour.title}</div>
                    <div><strong>Duration:</strong> {selectedNightsKey ? `${parseInt(selectedNightsKey) + 1} Days / ${selectedNightsKey} Nights` : 'Not selected'}</div>
                    <div><strong>Package:</strong> {tour?.nights?.[selectedNightsKey]?.[selectedNightsOption]?.option || 'Standard'}</div>
                    <div><strong>Meal Plan:</strong> {foodCategoryMap[selectedFoodCategory] || 'Not selected'}</div>
                    <div><strong>Travellers:</strong> {bookingData.travellerCount}</div>
                    <div><strong>Travel Date:</strong> {bookingData.travelDate ? new Date(bookingData.travelDate).toLocaleDateString() : 'Not selected'}</div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {bookingData.clientName}</div>
                    <div><strong>Email:</strong> {bookingData.clientEmail}</div>
                    <div><strong>Phone:</strong> {bookingData.phoneCountryCode} {bookingData.clientPhone}</div>
                    <div><strong>Nationality:</strong> {bookingData.nationality}</div>
                    {bookingData.emergencyContact && (
                      <div className="md:col-span-2"><strong>Emergency Contact:</strong> {bookingData.emergencyContact}</div>
                    )}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-[#005E84] to-[#075375] text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="text-xl font-bold">{selectedCurrency} {convertPrice(calculateTotal())}</span>
                    </div>
                    {calculateSavings() > 0 && (
                      <div className="flex justify-between text-green-300">
                        <span>You Save:</span>
                        <span>{selectedCurrency} {convertPrice(calculateSavings())}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Booking is subject to availability and confirmation</li>
                    <li>• Full payment is required to secure your booking</li>
                    <li>• Cancellation policy will be provided upon confirmation</li>
                    <li>• Travel insurance is recommended</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {activeStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Back
              </button>
            )}
            
            <div className="ml-auto">
              {activeStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#005E84] text-white rounded-lg hover:bg-[#075375] transition-colors font-medium"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-[#005E84] text-white rounded-lg hover:bg-[#075375] transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
     
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(s => ({ ...s, open: false }))} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TourBooking;
