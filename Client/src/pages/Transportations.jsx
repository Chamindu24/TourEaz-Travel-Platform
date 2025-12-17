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
  RefreshCw
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={"rounded-lg bg-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100 cursor-pointer"}
                onClick={() => handleViewDetails(transport._id)}
              >
                {/* Image */}
                <div className="relative h-64 sm:h-72">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  <img
                    src={transport.mainImage}
                    alt={transport.name}
                    className="w-full h-full object-cover  "
                  />
                   <div className="absolute bottom-0 left-0 right-0 h-full bg-black/0 group-hover:bg-black/35 transition-all duration-300 z-[15]"></div>
                  {transport.availability !== 'available' && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {transport.availability}
                    </div>
                  )}

                  <motion.div 
                    className="absolute top-0 left-0 z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <span className="inline-flex items-center px-3 py-1  text-sm font-medium bg-teal-300 text-white backdrop-blur-sm">
                      
                      
                        {getVehicleIcon(transport.type)}
                      <span className="ml-1">{transport.type}</span>
                   
                    </span>
                  </motion.div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform transition-all duration-300 hover:scale-105  group-hover:translate-x-4">
                      <motion.h4 
                        className="font-bold text-xl text-white line-clamp-2 mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        {transport.name}
                      </motion.h4>
                      <motion.p 
                        className="text-gray-200 text-sm flex items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      >
                        {/* Capacity */}
                      <div className="flex items-center text-sm text-gray-100">
                        <Users className="w-4 h-4 mr-1 text-white" />
                        <span>{transport.capacity} seats</span>
                      </div>
                      </motion.p>
                    </div>
                </div>

                {/* Content */}
                <motion.div 
                  className="p-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  
                  <div className="flex justify-between items-center mb-1">                                      
                  {transport.descriptionShort && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {transport.descriptionShort}
                    </p>
                  )}                 
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="truncate">{transport.location}</span>
                    </div>
                  </div>

                  {/* Features */}
                  {transport.features && transport.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {transport.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-teal-800/50 text-gray-900  ring-1 ring-teal-500 px-2 py-0.5 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {transport.features.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          +{transport.features.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price and Rating */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-300">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <DollarSign className="w-6 h-6 text-black font-bold" />
                        <span className="text-3xl font-bold text-gray-900">
                          {transport.pricePerDay}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">/day</span>
                      </div>
                      {/* Rating */}
                      {transport.rating > 0 && (
                        <div className="flex items-center mr-3">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-semibold text-gray-700">
                            {transport.rating.toFixed(1)}
                          </span>
                          {transport.reviewCount > 0 && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({transport.reviewCount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                   {/* View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(transport._id);
                      }}
                      className="w-32 mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-white hover:text-black border-2 hover:border-teal-500 transition-colors"
                    >
                      View Details
                    </button>
                  </div>


                </motion.div>
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
