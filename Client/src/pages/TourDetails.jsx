import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Typography, Box, Button, IconButton } from '@mui/material';
import TourImages from '../Components/TourImages';
import Itinerary from '../Components/Itinerary';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { Clock, Calendar, DollarSign, Users, Star, MapPin, Check, Eye, X, ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import Footer from '../Components/Footer';
import { useAuthCheck } from '../hooks/useAuthCheck';

function useDeviceType() {
  const [deviceType, setDeviceType] = useState({
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceType({
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}

const ImageGalleryPopup = ({ images, title, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="absolute top-4 left-4 text-white z-10 bg-black bg-opacity-50 rounded-lg px-4 py-2">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm opacity-80">{currentImageIndex + 1} of {images.length}</p>
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 transition-colors duration-200"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 transition-colors duration-200"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Main Image */}
        <div className="max-w-5xl max-h-full flex items-center justify-center">
          <img
            src={images[currentImageIndex]}
            alt={`${title} ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 rounded-lg p-2 max-w-md overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentImageIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TourDetails = ({ sidebarOpen }) => {
  const { tourId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { requireAuthForBooking } = useAuthCheck();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState({});
  
  // Image popup states
  const [destinationPopup, setDestinationPopup] = useState(false);
  const [activityPopup, setActivityPopup] = useState(false);
  const [hotelPopup, setHotelPopup] = useState(false);

  const { isMobile, isTablet } = useDeviceType();

  // Use the currency from localStorage consistently.
  const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';

  // Food category map remains unchanged.
  const foodCategoryMap = {
    0: 'Half Board',
    1: 'Full Board',
    2: 'All Inclusive'
  };

  // New state for selections.
  const [selectedNightsKey, setSelectedNightsKey] = useState(null);
  const [selectedNightsOption, setSelectedNightsOption] = useState(null);
  // IMPORTANT: Only select a food category if its boolean value is true.
  const [selectedFoodCategory, setSelectedFoodCategory] = useState(null);

  // Price conversion function using selectedCurrency.
  const convertPrice = (priceInUSD) => {
    if (!exchangeRates[selectedCurrency]) return priceInUSD.toLocaleString();
    return (priceInUSD * exchangeRates[selectedCurrency]).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/9609969974`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const response = await axios.get(`/tours/${tourId}`); 
        console.log(response);
        setTour(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tour details:', error);
        setLoading(false);  
      }
    };

    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        setExchangeRates(response.data.rates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };
  
    fetchExchangeRates();
    window.scrollTo(0, 0);
    fetchTourDetails();
  }, [tourId]); 

  useEffect(() => {
    if (tour) {
      // Initialize nights selection if available.
      if (tour.nights && typeof tour.nights === 'object') {
        const nightsKeys = Object.keys(tour.nights);
        if (nightsKeys.length > 0) {
          setSelectedNightsKey(nightsKeys[0]);
          const firstOptions = tour.nights[nightsKeys[0]];
          const optionKeys = Object.keys(firstOptions);
          if (optionKeys.length > 0) {
            setSelectedNightsOption(optionKeys[0]);
          }
        }
      }
      // Initialize food category selection only with those having boolean true.
      if (tour.food_category && typeof tour.food_category === 'object') {
        const availableFoodKeys = Object.keys(tour.food_category).filter(
          key => tour.food_category[key][2] === true
        );
        if (availableFoodKeys.length > 0) {
          setSelectedFoodCategory(availableFoodKeys[0]);
        }
      }
    }
  }, [tour]);

  // Compute days and nights.
  const nightsCount = selectedNightsKey ? parseInt(selectedNightsKey) : 0;
  const daysCount = nightsCount + 1;

  const personCount = tour ? tour.person_count : 1;

  // Compute total price based on selections.
  const basePrice = tour ? tour.price : 0;
  const oldBasePrice = tour ? tour.oldPrice : 0;
  const nightsAddPrice = (selectedNightsKey && selectedNightsOption && tour && tour.nights[selectedNightsKey])
    ? tour.nights[selectedNightsKey][selectedNightsOption].add_price
    : 0;
  const foodAddPrice = (selectedFoodCategory && tour && tour.food_category)
    ? tour.food_category[selectedFoodCategory][0] * nightsCount * personCount
    : 0;
  const totalPrice = basePrice + nightsAddPrice + foodAddPrice;

  const nightsOldPrice = (selectedNightsKey && selectedNightsOption && tour && tour.nights[selectedNightsKey])
    ? tour.nights[selectedNightsKey][selectedNightsOption].old_add_price
    : 0;
  const foodOldPrice = (selectedFoodCategory && tour && tour.food_category)
    ? tour.food_category[selectedFoodCategory][1] * nightsCount * personCount
    : 0;
  const finalOldPrice = oldBasePrice + nightsOldPrice + foodOldPrice;

  // Handle post-login auto-open inquiry form or proceed to booking
  useEffect(() => {
    if (location.state?.openInquiry) {
      // Navigate to inquiry page with current selections
      navigate(`/tours/${tourId}/inquiry`, {
        state: {
          selectedTour: tour,
          selectedCurrency,
          exchangeRates,
          finalPrice: totalPrice,
          finalOldPrice,
          selectedNightsKey,
          selectedNightsOption,
          selectedFoodCategory,
        }
      });
      // Clear the state to avoid reopening on subsequent visits
      navigate(location.pathname, { replace: true });
    } else if (location.state?.proceedToBooking) {
      // Navigate to booking page after login
      navigate(`/tours/${tourId}/booking`, {
        state: {
          selectedTour: tour,
          selectedCurrency,
          exchangeRates,
          finalPrice: totalPrice,
          finalOldPrice,
          selectedNightsKey,
          selectedNightsOption,
          selectedFoodCategory,
        }
      });
      // Clear the state to avoid reopening on subsequent visits
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, tourId, tour, selectedCurrency, exchangeRates, totalPrice, finalOldPrice, selectedNightsKey, selectedNightsOption, selectedFoodCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className={`transition-all duration-300 ${sidebarOpen ? 'sm:pl-64' : 'sm:pl-16'} pl-0`}>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tour details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className={`transition-all duration-300 ${sidebarOpen ? 'sm:pl-64' : 'sm:pl-16'} pl-0`}>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tour not found</h2>
              <Button
                onClick={() => navigate('/tours')}
                className="bg-teal-500 hover:bg-teal-500 text-white px-6 py-2 rounded-lg"
              >
                Back to Tours
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handler to open inquiry page - no authentication required
  const handleOpenDialog = () => {
    console.log('handleOpenDialog called');
    console.log('tourId:', tourId);
    console.log('tour:', tour);
    console.log('Navigation path:', `/tours/${tourId}/inquiry`);

    if (!tourId) {
      console.error('tourId is undefined! Trying alternative navigation.');
      // Try navigating to standalone inquiry page
      navigate('/inquiry', {
        state: {
          selectedTour: tour,
          selectedCurrency,
          exchangeRates,
          finalPrice: totalPrice,
          finalOldPrice,
          selectedNightsKey,
          selectedNightsOption,
          selectedFoodCategory,
        }
      });
      return;
    }

    if (!tour) {
      console.error('tour is undefined! Cannot navigate to inquiry page.');
      alert('Error: Cannot open inquiry page. Tour data is missing.');
      return;
    }

    try {
      // Navigate to inquiry page with current selections
      navigate(`/tours/${tourId}/inquiry`, {
        state: {
          selectedTour: tour,
          selectedCurrency,
          exchangeRates,
          finalPrice: totalPrice,
          finalOldPrice,
          selectedNightsKey,
          selectedNightsOption,
          selectedFoodCategory,
        }
      });
      console.log('Navigation successful');
    } catch (error) {
      console.error('Navigation failed:', error);
      // Try alternative navigation
      console.log('Trying alternative navigation to /inquiry');
      navigate('/inquiry', {
        state: {
          selectedTour: tour,
          selectedCurrency,
          exchangeRates,
          finalPrice: totalPrice,
          finalOldPrice,
          selectedNightsKey,
          selectedNightsOption,
          selectedFoodCategory,
        }
      });
    }
  };

  // Handler for "Book Now" button - requires authentication
  const handleBookNow = () => {
    // Prepare tour booking data
    const tourBookingData = {
      tourId: tour?._id,
      tourName: tour?.name,
      selectedNightsKey,
      selectedNightsOption, 
      selectedFoodCategory,
      finalPrice: totalPrice,
      finalOldPrice
    };

    // Check authentication before proceeding to booking
    if (!requireAuthForBooking('tour-booking', tourBookingData)) {
      return; // User will be redirected to login
    }

    // User is authenticated, navigate to booking page
    navigate(`/tours/${tourId}/booking`, {
      state: {
        selectedTour: tour,
        selectedCurrency,
        exchangeRates,
        finalPrice: totalPrice,
        finalOldPrice,
        selectedNightsKey,
        selectedNightsOption,
        selectedFoodCategory,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`transition-all duration-300 ${sidebarOpen ? 'sm:pl-64' : 'sm:pl-16'} pl-0`}>
        {/* Navigation removed */}

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-12 max-w-[1600px] mx-auto">
          {/* Enhanced Hero Section */}
          <div className="relative mb-12">
            <div
              className="relative h-72 sm:h-80 lg:h-96 bg-cover bg-center rounded-3xl overflow-hidden shadow-2xl"
              style={{
                backgroundImage: tour.tour_image 
                  ? `url(${tour.tour_image})`
                  : "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920')"
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
                <div className="animate-in slide-in-from-bottom-4 duration-700">
                  <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
                    {tour.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white" />
                      <span className="text-white font-medium text-sm sm:text-base">
                        {daysCount} Days / {nightsCount} Nights
                      </span>
                    </div>
                    <div className="flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white" />
                      <span className="text-white font-medium text-sm sm:text-base">
                        For {personCount} Person(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-white/90">
                    <Star className="w-5 h-5 mr-2 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium">Premium Experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 lg:gap-12">
            {/* Left Column - Package Options and Images */}
            <div className="xl:col-span-3 space-y-8">
              {/* Enhanced Package Selection */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-teal-500 p-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Sparkles className="w-7 h-7 mr-3 text-gray-100" />
                    Customize Your Experience
                  </h2>
                  <p className="text-gray-100 mt-2">Tailor your perfect getaway with our flexible options</p>
                </div>

                <div className="p-8 space-y-8">
                  {/* Duration Selection */}
                  {tour.nights && (
                    <div className="animate-in fade-in-50 duration-500">
                      <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-teal-500" />
                        Choose Your Duration
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.keys(tour.nights).map((key) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedNightsKey(key);
                              setSelectedNightsOption(Object.keys(tour.nights[key])[0]);
                            }}
                            className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                              selectedNightsKey === key
                                ? 'border-teal-500 bg-gray-50 ring-2 ring-teal-500/20 shadow-md'
                                : 'border-gray-200 hover:border-teal-500 bg-white hover:bg-gray-50'
                            }`}
                          >
                            {selectedNightsKey === key && (
                              <div className="absolute -top-2 -right-2 bg-teal-500 text-white rounded-full p-1">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            )}
                            <div className={`font-bold text-lg ${selectedNightsKey === key ? 'text-[#0A435C]' : 'text-gray-700'}`}>
                              {key} Nights
                            </div>
                            <div className={`text-sm ${selectedNightsKey === key ? 'text-teal-500' : 'text-gray-400'}`}>
                              {parseInt(key) + 1} Days
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Package Options */}
                  {selectedNightsKey && tour.nights[selectedNightsKey] && (
                    <div className="animate-in slide-in-from-left-4 duration-500">
                      <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-teal-500" />
                        Package Options
                      </h3>
                      <div className="space-y-3">
                        {Object.keys(tour.nights[selectedNightsKey]).map((optKey) => (
                          <button
                            key={optKey}
                            onClick={() => setSelectedNightsOption(optKey)}
                            className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-md transform hover:scale-[1.02] ${
                              selectedNightsOption === optKey
                                ? 'border-teal-500 bg-gray-50 ring-2 ring-teal-500/20'
                                : 'border-gray-200 hover:border-teal-500 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className={`font-semibold text-lg ${selectedNightsOption === optKey ? 'text-[#0A435C]' : 'text-gray-700'}`}>
                                {tour.nights[selectedNightsKey][optKey].option}
                              </div>
                              {selectedNightsOption === optKey && (
                                <CheckCircle className="w-5 h-5 text-teal-500" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meal Plan Selection */}
                  {tour.food_category && (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                      <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-teal-500" />
                        Select Meal Plan
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.keys(tour.food_category)
                          .filter(key => tour.food_category[key][2] === true)
                          .map((key) => (
                            <button
                              key={key}
                              onClick={() => setSelectedFoodCategory(key)}
                              className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                                selectedFoodCategory === key
                                  ? 'border-[#0A435C] bg-gray-50 ring-2 ring-[#0A435C]/20 shadow-md'
                                  : 'border-gray-200 hover:border-teal-500 bg-white hover:bg-gray-50'
                              }`}
                            >
                              {selectedFoodCategory === key && (
                                <div className="absolute -top-2 -right-2 bg-[#0A435C] text-white rounded-full p-1">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              )}
                              <div className={`font-semibold text-center ${selectedFoodCategory === key ? 'text-[#0A435C]' : 'text-gray-700'}`}>
                                {foodCategoryMap[key]}
                              </div>
                            </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Package Includes */}
                  {tour.facilities && tour.facilities.length > 0 && (
                    <div className="animate-in fade-in-50 duration-700">
                      <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                        <Check className="w-5 h-5 mr-2 text-[#0A435C]" />
                        What's Included
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tour.facilities.map((facility, index) => (
                          <div
                            key={index}
                            className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-teal-50 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                          >
                            <div className="bg-teal-500 rounded-full p-1 mr-3 flex-shrink-0">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-700 font-medium">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Image Gallery Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-teal-500 p-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Eye className="w-7 h-7 mr-3 text-gray-100" />
                    Visual Journey
                  </h2>
                  <p className="text-gray-100 mt-2">Explore stunning destinations, activities, and accommodations</p>
                </div>

                {/* Enhanced Image Preview Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Destinations Preview */}
                    {tour.destination_images && tour.destination_images.length > 0 && (
                      <div 
                        className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.03]" 
                        onClick={() => setDestinationPopup(true)}
                      >
                        <div className="relative rounded-2xl overflow-hidden shadow-lg h-64 bg-gradient-to-br from-teal-500 to-teal-500">
                          <img
                            src={tour.destination_images[0]}
                            alt="Destinations"
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500"></div>
                          
                          {/* Enhanced View Icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="bg-white/25 backdrop-blur-md rounded-full p-4 border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                              <Eye className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          
                          {/* Enhanced Label */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="text-white">
                              <p className="font-bold text-xl mb-1">Destinations</p>
                              <p className="text-sm text-white/90 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {tour.destination_images.length} Amazing Places
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Activities Preview */}
                    {tour.activity_images && tour.activity_images.length > 0 && (
                      <div 
                        className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.03]" 
                        onClick={() => setActivityPopup(true)}
                      >
                        <div className="relative rounded-2xl overflow-hidden shadow-lg h-64 bg-gradient-to-br from-teal-500 to-[#0A435C]">
                          <img
                            src={tour.activity_images[0]}
                            alt="Activities"
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500"></div>
                          
                          {/* Enhanced View Icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="bg-white/25 backdrop-blur-md rounded-full p-4 border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                              <Eye className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          
                          {/* Enhanced Label */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="text-white">
                              <p className="font-bold text-xl mb-1">Activities</p>
                              <p className="text-sm text-white/90 flex items-center">
                                <Star className="w-4 h-4 mr-1" />
                                {tour.activity_images.length} Exciting Adventures
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hotels Preview */}
                    {tour.hotel_images && tour.hotel_images.length > 0 && (
                      <div 
                        className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.03]" 
                        onClick={() => setHotelPopup(true)}
                      >
                        <div className="relative rounded-2xl overflow-hidden shadow-lg h-64 bg-gradient-to-br from-[#0A435C] to-teal-500">
                          <img
                            src={tour.hotel_images[0]}
                            alt="Hotels"
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500"></div>
                          
                          {/* Enhanced View Icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="bg-white/25 backdrop-blur-md rounded-full p-4 border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                              <Eye className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          
                          {/* Enhanced Label */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="text-white">
                              <p className="font-bold text-xl mb-1">Accommodations</p>
                              <p className="text-sm text-white/90 flex items-center">
                                <Sparkles className="w-4 h-4 mr-1" />
                                {tour.hotel_images.length} Luxury Hotels
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Itinerary Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-teal-500 p-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Calendar className="w-7 h-7 mr-3 text-gray-100" />
                    Your Journey Timeline
                  </h2>
                  <p className="text-gray-100 mt-2">Day-by-day breakdown of your amazing adventure</p>
                </div>
                <div className="p-8">
                  <Itinerary selectedNightsKey={selectedNightsKey} />
                </div>
              </div>
            </div>

            {/* Enhanced Right Column - Booking Summary */}
            <div className="xl:col-span-1">
              <div className="sticky top-8 space-y-4">
                {/* Premium Price Card */}
                <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-500 rounded-2xl shadow-2xl overflow-hidden border border-teal-400">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">Total Investment</h3>
                      <div className="bg-teal-500 rounded-full p-1">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="text-center mb-3">
                      <div className="text-2xl font-extrabold text-white mb-1">
                        {selectedCurrency} {convertPrice(totalPrice)}
                      </div>
                      {finalOldPrice > totalPrice && (
                        <div className="text-gray-300 line-through text-lg mb-1">
                          {selectedCurrency} {convertPrice(finalOldPrice)}
                        </div>
                      )}
                      <div className="text-gray-200 text-sm">
                        For {personCount} Person(s)
                      </div>
                    </div>

                    {finalOldPrice > totalPrice && (
                      <div className="bg-[#0A435C]/30 border border-teal-500/50 rounded-xl p-2 mb-3">
                        <div className="text-white font-semibold text-center text-xs">
                          You Save {selectedCurrency} {convertPrice(finalOldPrice - totalPrice)}!
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Tour Details Cards */}
                <div className="space-y-2">
                  {/* Duration Card */}
                  <div className="bg-white rounded-xl shadow-lg p-3 border-l-4 border-teal-500 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-1 mr-2">
                        <Clock className="w-4 h-4 text-teal-500" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-700 text-sm">Duration</div>
                        <div className="text-gray-600 text-xs">{daysCount} Days / {nightsCount} Nights</div>
                      </div>
                    </div>
                  </div>

                  {/* Valid Period Card */}
                  <div className="bg-white rounded-xl shadow-lg p-3 border-l-4 border-teal-500 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-1 mr-2">
                        <Calendar className="w-4 h-4 text-teal-500" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-700 text-sm">Valid Period</div>
                        <div className="text-gray-600 text-xs">
                          {new Date(tour.valid_from).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })} - {new Date(tour.valid_to).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Card */}
                  <div className="bg-white rounded-xl shadow-lg p-3 border-l-4 border-teal-500 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-1 mr-2">
                        <CalendarMonthIcon className="w-4 h-4 text-teal-500" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-700 text-sm">Offer Expires</div>
                        <div className="text-[#0A435C] font-semibold text-xs">
                          {new Date(tour.expiry_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-2">
                  {/* Primary CTA - Book Now */}
                  <button
                    onClick={handleBookNow}
                    className="w-full bg-teal-500 hover:bg-white text-white hover:text-black border-2 hover:border-teal-500 font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-2xl hover:shadow-teal-500/25 transform hover:scale-[1.02] hover:-translate-y-1 group"
                  >
                    <CalendarMonthIcon className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-sm">Secure Your Spot</span>
                  </button>

                  {/* Secondary CTA - Inquire */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenDialog();
                    }}
                    className="w-full bg-white text-black border-2 border-teal-500 hover:bg-teal-500 duration-500 hover:text-white font-semibold py-2 px-4 rounded-md transition-all  flex items-center justify-center shadow-xl hover:shadow-teal-500/25 transform hover:scale-[1.05] group"
                  >
                    <SendIcon className="w-3 h-3 mr-1 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Get Custom Quote</span>
                  </button>
                  
                  {/* Tertiary Action */}
                  <button
                    onClick={() => navigate('/tours')}
                    className="w-full bg-teal-500 hover:bg-white text-white hover:text-black border-2 hover:border-teal-500 font-semibold py-2 px-4 rounded-md transition-all duration-500  border-gray-300  transform hover:scale-[1.05]"
                  >
                    ← Explore More Tours
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Image Gallery Popups */}
      <ImageGalleryPopup
        images={tour?.destination_images}
        title="Destinations"
        isOpen={destinationPopup}
        onClose={() => setDestinationPopup(false)}
      />
      
      <ImageGalleryPopup
        images={tour?.activity_images}
        title="Activities"
        isOpen={activityPopup}
        onClose={() => setActivityPopup(false)}
      />
      
      <ImageGalleryPopup
        images={tour?.hotel_images}
        title="Hotels"
        isOpen={hotelPopup}
        onClose={() => setHotelPopup(false)}
      />
    </div>
  );
};

export default TourDetails;
