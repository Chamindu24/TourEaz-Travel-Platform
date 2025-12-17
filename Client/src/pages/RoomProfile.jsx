import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthCheck } from '../hooks/useAuthCheck';
import DatePicker from 'react-datepicker';
import {
  FaBed,
  FaRulerCombined,
  FaUsers,
  FaArrowLeft,
  FaBook,
  FaCheckCircle,
  FaShip,
  FaPlane,
  FaCar,
  FaPlaneDeparture,
} from 'react-icons/fa';
import Footer from '../Components/Footer';

// Helper: compute price including market surcharge
const getRoomPrice = (room, market) => {
  const surcharge = room.prices?.find(p => p.market === market)?.price || 0;
  return Number(room.basePrice || 0) + surcharge;
};

const getTransportIcon = (method) => {
  const lowerMethod = method.toLowerCase();
  if (lowerMethod.includes('boat') || lowerMethod.includes('ship')) return <FaShip className="text-lapis_lazuli" />;
  if (lowerMethod.includes('plane') && !lowerMethod.includes('domestic')) return <FaPlane className="text-lapis_lazuli" />;
  if (lowerMethod.includes('domestic flight')) return <FaPlaneDeparture className="text-lapis_lazuli" />;
  return <FaCar className="text-lapis_lazuli" />;
};

export default function EnhancedRoomProfile() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { requireAuthForBooking } = useAuthCheck();

  const previousRoute = location.state?.previousRoute || '/search';
  const [selectedMarket, setSelectedMarket] = useState(location.state?.selectedMarket || '');
  
  // Initialize dates from location state if available
  useEffect(() => {
    if (location.state?.checkIn) {
      setBookingDates(prev => ({
        ...prev,
        checkIn: new Date(location.state.checkIn)
      }));
    }
    if (location.state?.checkOut) {
      setBookingDates(prev => ({
        ...prev,
        checkOut: new Date(location.state.checkOut)
      }));
    }
  }, [location.state]);

  const [roomData, setRoomData] = useState(null);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [selectedMarketObj, setSelectedMarketObj] = useState(
    selectedMarket ? null : null // will set after markets load
  );
  const [marketSearch, setMarketSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState(null);
  const [perNightPrice, setPerNightPrice] = useState(0);
  const [availableMarkets, setAvailableMarkets] = useState([]);
  // Add booking date state
  const [bookingDates, setBookingDates] = useState({
    checkIn: null,
    checkOut: null
  });
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.market-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data: room } = await axios.get(`/rooms/${roomId}`);
        const hotelId = typeof room.hotel === 'object' ? room.hotel._id : room.hotel;
        const { data: hotel } = await axios.get(`/hotels/${hotelId}`);

        const mealPlans = hotel.mealPlans || [];
        let cheapest = mealPlans.length
          ? mealPlans.reduce((min, p) => p.price < min.price ? p : min, mealPlans[0])
          : null;

        const computedPrice = getRoomPrice(room, selectedMarket);
        setRoomData({
          ...room,
          hotelId,
          hotelName: hotel.name,
          basePricePerNight: computedPrice,
          images: room.gallery,
          highlights: room.highlights || [],
          mealPlans
        });
        if (cheapest) setSelectedMealPlan(cheapest);
      } catch (err) {
        console.error(err);
        setError('Room not found');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId, selectedMarket]);

  useEffect(() => {
    if (!roomData) return;

    const { checkIn, checkOut } = location.state || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let periodPrice = 0;
    if (roomData?.pricePeriods?.length) {
      const applicablePeriod = roomData.pricePeriods
        .filter(period => {
          const start = new Date(period.startDate);
          const end = new Date(period.endDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return start <= today && end >= today;
        })
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];

      if (applicablePeriod) {
        periodPrice = applicablePeriod.price;
      }
    }

    const market = selectedMarketObj?.name || selectedMarket;
    const surcharge = roomData?.prices?.find(p => p.market === market)?.price || 0;
    const finalPerNightPrice = Math.round(periodPrice + surcharge) * 100 / 100;

    setPerNightPrice(finalPerNightPrice);
  }, [roomData, location.state, selectedMarketObj, selectedMarket]);

  // Fetch all available markets from backend
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const { data } = await axios.get('/rooms/markets');
        setAvailableMarkets(data.map(m => ({ name: m })));
      } catch (err) {
        setAvailableMarkets([
          { name: 'India' },
          { name: 'China' },
          { name: 'Middle East' },
          { name: 'South East Asia' },
          { name: 'Asia' },
          { name: 'Europe' },
          { name: 'Russia & CIS' },
        ]);
      }
    };
    fetchMarkets();
  }, []);

  useEffect(() => {
    if (selectedMarket && availableMarkets.length > 0) {
      const found = availableMarkets.find(m => m.name === selectedMarket);
      setSelectedMarketObj(found || null);
    }
  }, [selectedMarket, availableMarkets]);

  const handleBack = () => navigate(previousRoute);

  const handleBookNow = () => {
    if (!roomData) return;

    if (!selectedMarketObj?.name && !selectedMarket) {
      alert('Please select your market before booking');
      return;
    }

    // Use our bookingDates state instead of location.state
    const { checkIn, checkOut } = bookingDates;

    if (!checkIn || !checkOut) {
      alert('Please select both check-in and check-out dates before booking');
      return;
    }

    // No need to convert since we're already storing Date objects
    if (!(checkIn instanceof Date) || isNaN(checkIn.getTime())) {
      alert('Invalid check-in date. Please select a valid date.');
      return;
    }

    if (!(checkOut instanceof Date) || isNaN(checkOut.getTime())) {
      alert('Invalid check-out date. Please select a valid date.');
      return;
    }

    if (checkIn >= checkOut) {
      alert('Check-out date must be after check-in date.');
      return;
    }

    // Prepare booking data
    const bookingData = {
      roomId: roomData._id,
      hotelId: roomData.hotelId,
      roomName: roomData.roomName,
      hotelName: roomData.hotelName,
      basePricePerNight: perNightPrice,
      mealPlan: selectedMealPlan,
      market: selectedMarketObj?.name || selectedMarket,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      previousRoute: location.state?.previousRoute || '/search'
    };

    // Check authentication before proceeding to booking
    if (!requireAuthForBooking('hotel', bookingData)) {
      return; // User will be redirected to login
    }

    // User is authenticated, proceed to booking
    navigate('/bookingRequest', {
      state: bookingData
    });
  };

  const handleInquireNow = () => {
    if (!roomData) return;

    // Prepare inquiry data
    const inquiryData = {
      roomId: roomData._id,
      hotelId: roomData.hotelId,
      roomName: roomData.roomName,
      hotelName: roomData.hotelName,
      basePricePerNight: perNightPrice,
      mealPlan: selectedMealPlan,
      market: selectedMarketObj?.name || selectedMarket,
      checkIn: bookingDates.checkIn?.toISOString(),
      checkOut: bookingDates.checkOut?.toISOString(),
      previousRoute: location.state?.previousRoute || '/search'
    };

    // Navigate to room inquiry page
    navigate(`/rooms/${roomId}/inquiry`, {
      state: inquiryData
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="text-center p-10 text-red-500 text-xl font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={handleBack}
          className="flex items-center text-indigo_dye hover:text-indigo_dye mb-6 transition duration-300"
        >
          <FaArrowLeft className="mr-2 text-lg" /> Back to {roomData.hotelName}
        </button>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md">
            <div className="relative h-[500px] overflow-hidden rounded-t-2xl shadow-lg group">

              {/* Main Image */}
              <img
                src={roomData.images[activeImage]}
                alt={roomData.roomName}
                className="w-full h-full object-cover rounded-t-2xl transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gradient Overlay (intensifies on hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent pointer-events-none transition-colors duration-300 group-hover:from-black/80 group-hover:via-black/55" />

              {/* Centered Title (appears on hover) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 sm:px-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg mb-2 leading-tight">
                  {roomData.roomName}
                </h1>
                <p className="text-white/90 text-lg sm:text-xl font-medium drop-shadow-md">
                  {roomData.hotelName}
                </p>
              </div>

              {/* Image Counter */}
              <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-md">
                {activeImage + 1} / {roomData.images.length}
              </div>

              {/* Dots Navigation */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {roomData.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`transition-all duration-300 rounded-full
                      ${
                        activeImage === idx
                          ? 'w-8 h-2 bg-white'
                          : 'w-2 h-2 bg-white/60 hover:bg-white'
                      }`}
                  />
                ))}
              </div>

            </div>

              <div className="flex p-2 gap-2 overflow-x-auto">
                {roomData.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`View ${idx + 1}`}
                    className={`h-24 w-36 object-cover cursor-pointer rounded-lg transition-all ${
                      activeImage === idx ? 'ring-2 ring-teal-500' : 'hover:ring-2 hover:ring-teal-500/60'
                    }`}
                    onClick={() => setActiveImage(idx)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-emerald-50/60 rounded-md shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Room</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {roomData.description}
              </p>
              {roomData.highlights.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Room Highlights
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roomData.highlights.map((hl, i) => (
                      <li key={i} className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-3 text-lg" />
                        <span className="text-gray-700">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-amber-50/60 rounded-md shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Room Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <FaRulerCombined className="text-teal-500 mr-3 text-2xl" />
                  <div>
                    <p className="text-sm text-gray-500">Room Size</p>
                    <p className="font-medium text-gray-800">{roomData.size} m²</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaBed className="text-teal-500 mr-3 text-2xl" />
                  <div>
                    <p className="text-sm text-gray-500">Bed Type</p>
                    <p className="font-medium text-gray-800">{roomData.bedType}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaUsers className="text-teal-500 mr-3 text-2xl" />
                  <div>
                    <p className="text-sm text-gray-500">Occupancy</p>
                    <p className="font-medium text-gray-800">
                      {roomData.maxOccupancy.adults} Adults,{' '}
                      {roomData.maxOccupancy.children} Children
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {roomData.transportations && roomData.transportations.length > 0 && (
              <div className="bg-emerald-50 rounded-md shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transportation</h2>
                <div className="flex flex-wrap gap-2">
                  {roomData.transportations.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-teal-900 text-teal-200 px-4 py-2 rounded-lg text-sm">
                      {getTransportIcon(t.method)}
                      <span className="font-medium">
                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}: {t.method}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50/60 rounded-md shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomData.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-md shadow-md p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
  
                {/* Price Section */}
                <div className="flex-1">
                  <h3 className="text-sm  tracking-wide text-gray-800 mb-1">
                    Price Details
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-teal-300">
                      ${perNightPrice}
                    </span>
                    <span className="ml-2 text-lg text-gray-600">/ night</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-20 bg-gray-500"></div>

                {/* Room Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-teal-300">
                    {roomData.roomName}
                  </h1>
                  <p className="text-lg text-gray-800 mt-1">
                    {roomData.hotelName}
                  </p>
                </div>

              </div>

                {selectedMarketObj?.name && (
                  <div className="text-sm text-indigo_dye mt-1">
                    Price adjusted for {selectedMarketObj.name} market
                    {roomData.prices?.find(p => p.market === selectedMarketObj.name)?.price > 0 && (
                      <span className="ml-1">
                        (+${roomData.prices.find(p => p.market === selectedMarketObj.name).price} surcharge)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4 market-dropdown">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Market <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full h-10 px-3 border ${!selectedMarketObj?.name && !selectedMarket ? 'border-red-300' : 'border-gray-300'} rounded-md inline-block focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm`}
                    placeholder="Search market..."
                    value={marketSearch || (selectedMarketObj ? selectedMarketObj.name : '')}
                    onChange={e => {
                      setMarketSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onClick={() => setShowDropdown(prev => !prev)}
                  />
                  {selectedMarketObj && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-800"
                      onClick={() => {
                        setSelectedMarketObj(null);
                        setMarketSearch('');
                        setSelectedMarket('');
                      }}
                    >
                      ×
                    </button>
                  )}
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-y-auto">
                      {availableMarkets
                        .filter(m =>
                          marketSearch === ''
                            ? true
                            : m.name.toLowerCase().includes(marketSearch.toLowerCase())
                        )
                        .map(m => (
                          <div
                            key={m.name}
                            className="px-4 py-2 hover:bg-[#B7C5C733] cursor-pointer"
                            onClick={() => {
                              setSelectedMarketObj(m);
                              setMarketSearch(m.name);
                              setSelectedMarket(m.name);
                              setShowDropdown(false);
                            }}
                          >
                            {m.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {!selectedMarketObj?.name && !selectedMarket && (
                  <p className="text-red-500 text-sm mt-1">Please select your market</p>
                )}
              </div>

               <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Your Dates
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Check-in Date
                    </label>
                    <div
                      className="relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => datePickerRef.current?.setOpen(true)}
                    >
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={
                          bookingDates.checkIn
                            ? bookingDates.checkIn.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : ""
                        }
                        readOnly
                        placeholder="Select check-in date"
                        className="w-full pl-9 pr-3 py-2 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg cursor-pointer text-xs"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Check-out Date
                    </label>
                    <div
                      className="relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => datePickerRef.current?.setOpen(true)}
                    >
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lapis_lazuli">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={
                          bookingDates.checkOut
                            ? bookingDates.checkOut.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : ""
                        }
                        readOnly
                        placeholder="Select check-out date"
                        className="w-full pl-9 pr-3 py-2 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg cursor-pointer text-xs"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Hidden DatePicker for date selection */}
                <DatePicker
                  selectsRange
                  startDate={bookingDates.checkIn}
                  endDate={bookingDates.checkOut}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setBookingDates({
                      checkIn: start,
                      checkOut: end
                    });
                  }}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  popperPlacement="bottom-start"
                  ref={datePickerRef}
                  className="absolute opacity-0 pointer-events-none"
                />

                {bookingDates.checkIn && bookingDates.checkOut && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm">
                    <p className="font-medium text-green-800 flex items-center">
                      <FaCheckCircle className="mr-2" /> 
                      {Math.ceil((bookingDates.checkOut - bookingDates.checkIn) / (1000 * 60 * 60 * 24))} nights selected
                    </p>
                  </div>
                )}

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Plan
                </label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  value={selectedMealPlan?.planName || ''}
                  onChange={e => {
                    const plan = roomData.mealPlans.find(p => p.planName === e.target.value);
                    setSelectedMealPlan(plan);
                  }}
                >
                  {roomData.mealPlans.map(p => (
                    <option key={p.planName} value={p.planName}>
                      {p.planName} (+${p.price})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleInquireNow}
                className="w-full mb-3 bg-white duration-300 text-black border-2 border-teal-500 hover:bg-teal-500 hover:text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
              >
                <FaCheckCircle className="text-lg" /> Inquire Now
              </button>
              <button
                onClick={handleBookNow}
                className="w-full bg-teal-500 hover:bg-white hover:text-black border-2 hover:border-teal-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl gap-2 hover:scale-105"
              >
                <FaBook className="text-lg" /> Book Now
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <style>{`
        .react-datepicker {
          font-family: 'Inter', sans-serif;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          width: 260px;
          z-index: 1000;
          background-color: white;
        }
        @media (min-width: 640px) {
          .react-datepicker {
            width: 280px;
          }
        }
        @media (min-width: 768px) {
          .react-datepicker {
            width: 300px;
          }
        }
        .react-datepicker__header {
          background-color: #005E84;
          color: white;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          padding: 0.5rem;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: white;
          font-weight: 600;
          font-size: 0.7rem;
        }
        @media (min-width: 640px) {
          .react-datepicker__current-month,
          .react-datepicker__day-name {
            font-size: 0.75rem;
          }
        }
        @media (min-width: 768px) {
          .react-datepicker__current-month,
          .react-datepicker__day-name {
            font-size: 0.875rem;
          }
        }
        .react-datepicker__day {
          color: #1f2937;
          border-radius: 0.375rem;
          transition: all 0.2s;
          width: 30px;
          height: 30px;
          line-height: 30px;
          font-size: 0.7rem;
        }
        @media (min-width: 640px) {
          .react-datepicker__day {
            width: 32px;
            height: 32px;
            line-height: 32px;
            font-size: 0.75rem;
          }
        }
        @media (min-width: 768px) {
          .react-datepicker__day {
            width: 36px;
            height: 36px;
            line-height: 36px;
            font-size: 0.875rem;
          }
        }
        .react-datepicker__day:hover {
          background-color: #E7E9E5;
          color: #005E84;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--in-range,
        .react-datepicker__day--in-selecting-range {
          background-color: #E7E9E5;
          color: #005E84;
        }
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: #005E84 !important;
          color: white !important;
        }
        .react-datepicker__day--range-start:hover,
        .react-datepicker__day--range-end:hover {
          background-color: #075375 !important;
        }
        .react-datepicker__day--outside-month {
          color: #d1d5db;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        .react-datepicker__navigation-icon::before {
          border-color: white;
        }
        .react-datepicker__triangle {
          display: none;
        }
        .react-datepicker-popper {
          z-index: 1000;
        }
        .react-datepicker__month-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
}