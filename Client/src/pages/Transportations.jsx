import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../axios';
import { 
  Car, 
  Users, 
  DollarSign, 
  MapPin, 
  Star,
  Filter,
  Search,
  X,
  RefreshCw,
  Eye,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';



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

const Transportations = () => {
  const { isMobile, isTablet } = useDeviceType();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [transportations, setTransportations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch transportations from backend
  const fetchTransportations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (vehicleType && vehicleType !== '') params.type = vehicleType;
      if (capacity && capacity !== '') params.capacity = capacity;
      if (location) params.location = location;
      params.status = 'active';
      
      const response = await axios.get('/transportations', { params });
      setTransportations(response.data);
    } catch (err) {
      console.error('Error fetching transportations:', err);
      setError('Failed to fetch transportations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportations();
    // eslint-disable-next-line
  }, []);

  // Handle view details navigation
  const handleViewDetails = (transportationId) => {
    navigate(`/transportations/${transportationId}`);
  };

  // Handle search/filter submit
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchActivities();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setVehicleType('');
    setCapacity('');
    setLocation('');
    fetchTransportations();
  };

  // Fetch transportations when any filter changes
  useEffect(() => {
    fetchTransportations();
    // eslint-disable-next-line
  }, [vehicleType, searchQuery, capacity, location]);

  const getVehicleIcon = (type) => {
    return <Car className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <motion.header
        className="bg-cover bg-center mt-2 h-32 sm:h-40 lg:h-80 shadow-lg   overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/travel-services/investment.jpg')",
        }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-start justify-center h-full text-white  pl-10 sm:pl-10 lg:pl-28">
          <motion.h1 
            className="text-lg sm:text-xl md:text-3xl lg:text-5xl font-extrabold drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Find Your Perfect Ride
          </motion.h1>
          <motion.p 
            className="text-xs sm:text-sm md:text-lg lg:text-xl mt-2 drop-shadow-md max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Explore our wide range of transportation options for your journey
          </motion.p>
        </div>
      </motion.header>

      {/* Search and Filter Section */}
      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10 max-w-[1400px] mx-auto">

        <motion.div 
                  className="-mt-5 sm:-mt-16 md:-mt-4 lg:-mt-24 z-10 mb-8 bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {/* Filter Header */}
          <div className="bg-gradient-to-r from-teal-300 to-teal-400 px-6 py-4 rounded-t-2xl rounded-b-none">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Find Your Perfect Ride
            </h2>
            <p className="text-blue-100 text-sm mt-1">Search and filter rides to match your preferences</p>
          </div>
          
        <form onSubmit={handleSearch} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end">

            {/* Search Input */}
            <div className="lg:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-teal-600" />
                  Search Rides
                </span>
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-teal-600" />
                  Vehicle Type
                </span>
              </label>

              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="bus">Bus</option>
                <option value="luxury-car">Luxury Car</option>
                <option value="suv">SUV</option>
                <option value="minivan">Minivan</option>
                <option value="coach">Coach</option>
                <option value="private-transfer">Private Transfer</option>
                <option value="shuttle">Shuttle</option>
              </select>
            </div>

            {/* Capacity */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  Capacity
                </span>
              </label>

              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Any Capacity</option>
                <option value="2">2+ Passengers</option>
                <option value="4">4+ Passengers</option>
                <option value="7">7+ Passengers</option>
                <option value="15">15+ Passengers</option>
                <option value="30">30+ Passengers</option>
              </select>
            </div>

            {/* Location */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  Location
                </span>
              </label>

              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-32 h-12 bg-white text-black border-2 border-teal-500 rounded-md font-semibold 
                        hover:bg-teal-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>

            <button
              type="submit"
              className="w-32 h-12 bg-teal-500 text-white rounded-md font-semibold 
                        hover:bg-white hover:text-black border-2 hover:border-teal-500 transition-all duration-200 
                        flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </form>

          
      </motion.div>

      {/* Results Section */}
      <motion.div 
          className="mt-4 sm:mt-6 lg:mt-8 min-h-[300px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
        {/* Results Header */}
        {/*
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Vehicles
            {transportations.length > 0 && (
              <span className="ml-2 text-lg font-normal text-gray-600">
                ({transportations.length} results)
              </span>
            )}
          </h2>
        </div>*/}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && transportations.length === 0 && (
          <div className="text-center py-12">
            <Car className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Transportation Grid */}
        {!loading && !error && transportations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transportations.map((transport) => (
              <motion.div
                key={transport._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col bg-white border border-gray-400 hover:border-gray-100 rounded-2xl group cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden"
                onClick={() => handleViewDetails(transport._id)}
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  {/* Image with Grayscale to Color transition */}
                  <img
                    src={transport.mainImage}
                    alt={transport.name}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  />

                  {/* Hover Overlay: Darkens slightly to make "Check Availability" pop */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

                  {/* Floating Category Tag */}
                  <div className="absolute top-4 left-0 z-10">
                    <div className="bg-teal-600 text-white text-[10px] font-black tracking-[0.2em] uppercase py-2 px-4 pr-6 rounded-r-full shadow-lg">
                      {transport.type}
                    </div>
                  </div>

                  {/* Glassmorphism Availability Bar - Slides up on hover */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                    <span className="text-white text-xs font-bold uppercase tracking-widest">Available Now</span>
                    <div className="bg-white/20 p-1 rounded-full">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3 h-3 text-teal-500" />
                      <p className="text-teal-600 text-[10px] font-bold uppercase tracking-widest">
                        {transport.location}
                      </p>
                    </div>
                    <h4 className="text-2xl font-semibold text-slate-900 group-hover:text-teal-200 transition-colors duration-300">
                      {transport.name}
                    </h4>
                  </div>

                  {/* Specs Row */}
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-50 mb-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-700">{transport.capacity} Seats</span>
                    </div>
                    {transport.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        <span className="text-xs font-bold text-slate-700">{transport.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Features Section - Clean Pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {transport.features?.slice(0, 3).map((feature, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-bold text-slate-500 bg-slate-100/50 border border-slate-200 px-2 py-1 rounded-md uppercase tracking-tighter"
                      >
                        {feature}
                      </span>
                    ))}
                    {transport.features?.length > 3 && (
                      <span className="text-[10px] font-bold text-teal-600 px-2 py-1 italic">
                        +{transport.features.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Final Row: Price and Primary Button */}
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Daily Rate</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900">${transport.pricePerDay}</span>
                        <span className="text-xs text-slate-500 font-medium italic">/day</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(transport._id);
                      }}
                      className="flex items-center gap-2 bg-teal-500 hover:bg-white border-2 hover:border-teal-500 hover:text-black text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-slate-200 active:scale-95 group/btn"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest">Reserve</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      </main>
    </div>
  );
};

export default Transportations;
