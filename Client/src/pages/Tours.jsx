import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../axios';

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

const Tours = () => {
  const { isMobile, isTablet } = useDeviceType();
  const { state } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchTerm = state?.searchTerm || null;
  const titlePassed = state?.title || null;

  // Get URL parameters
  const query = new URLSearchParams(location.search);
  const initialSearchTerm = searchTerm || query.get('search') || '';
  const initialNights = query.get('nights') || '';
  const initialCountry = titlePassed || query.get('country') || '';
  const initialMarket = query.get('market') || '';
  const initialMinPrice = query.get('minPrice') || '';
  const initialMaxPrice = query.get('maxPrice') || '';

  // State management
  const [searchQuery, setSearchQuery] = useState(initialSearchTerm);
  const [nights, setNights] = useState(initialNights);
  const [destination, setDestination] = useState(initialCountry);
  const [market, setMarket] = useState(initialMarket);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';

  // Convert price using selectedCurrency
  const convertPrice = (priceInUSD) => {
    if (!exchangeRates[selectedCurrency]) return priceInUSD.toLocaleString();
    return (priceInUSD * exchangeRates[selectedCurrency]).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const localToUSD = (localPrice) => {
    if (!exchangeRates[selectedCurrency]) return localPrice;
    return localPrice / exchangeRates[selectedCurrency];
  };

  // Market mapping
  const marketMapping = {
    1: 'Indian',
    2: 'Chinese',
    3: 'Asian',
    4: 'Middle East',
    5: 'Russia and CIS',
    6: 'Rest of the World',
  };

  // Debounce for suggestions
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSuggestionLoading(true);
    const handler = setTimeout(async () => {
      try {
        const response = await axios.get('/tours', {
          params: { search: searchQuery }
        });
        if (response.data && Array.isArray(response.data)) {
          const tourTitles = response.data
            .filter(tour => tour.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(tour => tour.title)
            .slice(0, 5);
          setSuggestions(tourTitles);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestionLoading(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch tours from backend
  const fetchTours = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (nights) params.append('nights', nights);
      if (destination) params.append('country', destination);
      if (market) params.append('market', market);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await axios.get(`/tours?${params.toString()}`);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter tours based on criteria
        const filteredTours = response.data.filter(tour => {
          const currentDate = new Date();
          const tourExpiryDate = new Date(tour.expiry_date);
          if (tourExpiryDate < currentDate) return false;

          const searchNightsValue = nights ? parseInt(nights, 10) : null;
          const marketMatch = !market || (Array.isArray(tour.markets) && tour.markets.includes(Number(market)));
          const minValUSD = minPrice ? localToUSD(parseFloat(minPrice)) : null;
          const maxValUSD = maxPrice ? localToUSD(parseFloat(maxPrice)) : null;
          const hasMatchingNights = !searchNightsValue || 
            (tour.nights && Object.keys(tour.nights).includes(searchNightsValue.toString()));

          return (
            (!searchQuery || tour.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
            hasMatchingNights &&
            (!minValUSD || tour.price >= minValUSD) &&
            (!maxValUSD || tour.price <= maxValUSD) &&
            (!destination || tour.country.toLowerCase().includes(destination.toLowerCase())) &&
            marketMatch
          );
        });
        
        setTours(filteredTours);
      } else {
        setError('Failed to fetch tours');
      }
    } catch (err) {
      setError('Failed to fetch tours');
    } finally {
      setLoading(false);
    }
  };

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // Use fetch instead of axios to avoid credentials issue
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Set default rates if API fails
        setExchangeRates({
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          AUD: 1.35,
          CAD: 1.25,
          JPY: 110
        });
      }
    };
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    fetchTours();
    // eslint-disable-next-line
  }, []);

  // Handle view details navigation
  const handleViewDetails = (tourId) => {
    setNavigating(true);
    setTimeout(() => {
      navigate(`/tours/${tourId}`);
    }, 200);
  };

  // Handle search/filter submit
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    fetchTours();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setNights('');
    setDestination('');
    setMarket('');
    setMinPrice('');
    setMaxPrice('');
    setShowSuggestions(false);
    // Clear URL parameters
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  // Fetch tours when any filter changes
  useEffect(() => {
    fetchTours();
    // eslint-disable-next-line
  }, [nights, destination, market, minPrice, maxPrice]);

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    fetchTours();
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
        <motion.header
          className="bg-cover bg-center mt-2 h-32 sm:h-40 lg:h-80 shadow-lg   overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(to bottom,  rgba(0, 94, 132, 0.65),rgba(0, 0, 0, 0.55)), url('/travel-services/tours.jpg')",
          }}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col items-start justify-center h-full text-white  pl-10 sm:pl-10 lg:pl-28">
            <motion.h1 
              className="text-lg sm:text-xl md:text-3xl lg:text-6xl font-extrabold drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Sri Lanka Tour Packages
            </motion.h1>
            <motion.p 
              className="text-xs sm:text-sm md:text-lg lg:text-xl mt-2 drop-shadow-md max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Discover paradise with our exclusive tour packages and unforgettable experiences
            </motion.p>
          </div>
        </motion.header>
      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10 max-w-[1400px] mx-auto">
        

        {/* Enhanced Filtering Section */}
        <motion.div 
          className="-mt-5 sm:-mt-16 md:-mt-4 lg:-mt-20 z-10 mb-8 bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden"
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
              Find Your Perfect Tour Package
            </h2>
            <p className="text-blue-100 text-sm mt-1">Search and filter tours to match your travel preferences</p>
          </div>

          {/* Filter Form */}
          <form onSubmit={handleSearch} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end">
              {/* Search Input with Icon */}
              <div className="lg:col-span-4 relative">
                <label htmlFor="tour-search" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Tours
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="tour-search"
                    type="text"
                    placeholder="Try 'Maldives Honeymoon', 'Family Package'..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="w-full pl-4 pr-10 py-3 border-2 border-gray-200  focus:ring-2 focus:ring-teal-500/50 rounded-xl transition-all duration-200 outline-none text-sm placeholder-gray-400 bg-gray-50 focus:bg-white"
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Enhanced Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {suggestionLoading && (
                      <div className="px-4 py-3 text-gray-400 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#005E84] border-t-transparent"></div>
                        Loading suggestions...
                      </div>
                    )}
                    {suggestions.map((s, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#005E84]/5 hover:to-[#0A435C]/5 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all duration-150 flex items-center gap-2"
                        onMouseDown={() => handleSuggestionClick(s)}
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-gray-700">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Input */}
              <div className="lg:col-span-2">
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Destination
                  </span>
                </label>
                <input
                  id="destination"
                  type="text"
                  placeholder="Country/City"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200  focus:ring-2 focus:ring-teal-500/50 rounded-xl transition-all duration-200 outline-none text-sm bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Nights Input */}
              <div className="lg:col-span-2">
                <label htmlFor="nights" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Nights
                  </span>
                </label>
                <input
                  id="nights"
                  type="number"
                  min="1"
                  max="30"
                  value={nights}
                  onChange={e => setNights(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200  focus:ring-2 focus:ring-teal-500/50 rounded-xl transition-all duration-200 outline-none text-sm bg-gray-50 focus:bg-white"
                  placeholder="7"
                />
              </div>

              {/* Market Select */}
              <div className="lg:col-span-2">
                <label htmlFor="market" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Market
                  </span>
                </label>
                <select
                  id="market"
                  value={market}
                  onChange={e => setMarket(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200  focus:ring-2 focus:ring-teal-500/50 rounded-xl transition-all duration-200 outline-none text-sm bg-gray-50 focus:bg-white"
                >
                  <option value="">All Markets</option>
                  {Object.entries(marketMapping).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="lg:col-span-2 flex flex-col sm:flex-row gap-2 w-full">
                <button
                  type="submit"
                  className="flex-1 bg-teal-500 text-white px-4 py-2 rounded-md font-semibold shadow-lg hover:shadow-xl hover:bg-white hover:text-black border-2 hover:border-teal-500 transition-all duration-200 flex items-center justify-center gap-2 text-sm min-w-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 bg-white text-black px-4 py-2 rounded-md font-semibold shadow-md hover:shadow-lg border-2 border-teal-500 hover:text-white hover:bg-teal-500 transition-all duration-200 flex items-center justify-center gap-2 text-sm min-w-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>
            </div>

            {/* Price Range Row */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 lg:gap-6 mt-4">
              {/* Min Price */}
              <div className="lg:col-span-2">
                <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Min Price ({selectedCurrency})
                  </span>
                </label>
                <input
                  id="min-price"
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200  focus:ring-2 focus:ring-teal-500/50 rounded-xl transition-all duration-200 outline-none text-sm bg-gray-50 focus:bg-white"
                  placeholder="0"
                />
              </div>

              {/* Max Price */}
              <div className="lg:col-span-2">
                <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Max Price ({selectedCurrency})
                  </span>
                </label>
                <input
                  id="max-price"
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200  focus:ring-2 focus:ring-teal-500/50 rounded-xl transition-all duration-200 outline-none text-sm bg-gray-50 focus:bg-white"
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || destination || nights || market || minPrice || maxPrice) && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#005E84]/10 text-[#005E84] rounded-full text-xs font-medium">
                      Search: "{searchQuery}"
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="ml-1 hover:text-[#0A435C]"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {destination && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#005E84]/10 text-[#005E84] rounded-full text-xs font-medium">
                      Destination: {destination}
                      <button
                        type="button"
                        onClick={() => setDestination('')}
                        className="ml-1 hover:text-[#0A435C]"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {nights && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#005E84]/10 text-[#005E84] rounded-full text-xs font-medium">
                      Nights: {nights}
                      <button
                        type="button"
                        onClick={() => setNights('')}
                        className="ml-1 hover:text-[#0A435C]"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {market && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#005E84]/10 text-[#005E84] rounded-full text-xs font-medium">
                      Market: {marketMapping[market]}
                      <button
                        type="button"
                        onClick={() => setMarket('')}
                        className="ml-1 hover:text-[#0A435C]"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#005E84]/10 text-[#005E84] rounded-full text-xs font-medium">
                      Price: {minPrice || '0'} - {maxPrice || '∞'} {selectedCurrency}
                      <button
                        type="button"
                        onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                        className="ml-1 hover:text-[#0A435C]"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </form>
        </motion.div>

        {/* Tours List Section */}
        <motion.div 
          className="mt-4 sm:mt-6 lg:mt-8 min-h-[300px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {(loading || navigating) ? (
            <div className="flex justify-center items-center h-60">
              <div
                className="animate-spin rounded-full h-16 w-16 border-4 border-lapis_lazuli-500 border-t-indigo_dye-500 border-b-ash_gray-500 border-r-platinum-500 bg-platinum-500 shadow-lg"
                style={{
                  borderTopColor: '#0A435C', // indigo_dye 2
                  borderBottomColor: '#B7C5C7', // ash_gray
                  borderLeftColor: '#005E84', // lapis_lazuli
                  borderRightColor: '#E7E9E5', // platinum
                  backgroundColor: '#E7E9E5', // platinum
                }}
              ></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : tours.length === 0 ? (
            <div className="text-center py-8 text-ash_gray-400">No tours found.</div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {tours.map((tour, index) => (
                <motion.div
                  key={tour._id}
                  /*variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8 }}*/
                  className="group cursor-pointer"
                  onClick={() => handleViewDetails(tour._id)}
                >
                  <div className="rounded-lg bg-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
                    <div className="relative h-64 sm:h-72">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                      <motion.img
                        src={tour.tour_image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800'}
                        alt={tour.title}
                        className="w-full h-full object-cover "
                        
                      />
                      
                      {/* Duration Badge */}
                      <motion.div 
                        className="absolute top-0 left-0 z-20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                      >
                        <span className="inline-flex items-center px-3 py-1  text-sm font-medium bg-teal-300 text-white backdrop-blur-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {tour.nights && typeof tour.nights === 'object' && Object.keys(tour.nights).length > 0
                            ? `${Object.keys(tour.nights)[0]} Days`
                            : 'Multi-Day'}
                        </span>
                      </motion.div>
                      
                      {/* Duration Info */}
                      {/*tour.nights && typeof tour.nights === 'object' && Object.keys(tour.nights).length > 0 && (
                        <div className="flex items-center mb-3 text-gray-500 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {Object.keys(tour.nights)[0]} Days / {Object.keys(tour.nights)[0]} Nights
                        </div>
                      )*/}
                      <div className="absolute bottom-0 left-0 right-0 h-full bg-black/0 group-hover:bg-black/35 transition-all duration-300 z-[15]"></div>

                      {/* Bottom Overlay Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform transition-all duration-300 hover:scale-105  group-hover:translate-x-4">
                        <motion.h4 
                          className="font-bold text-xl text-white line-clamp-2 mb-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                        >
                          {tour.title}
                        </motion.h4>
                        <motion.p 
                          className="text-gray-200 text-sm flex items-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {tour.country || 'Maldives'}
                        </motion.p>
                      </div>
                    </div>

                    <motion.div 
                      className="p-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {tour.short_description || tour.description || 'Experience the beauty of this amazing destination with our carefully crafted tour package.'}
                      </p>
                      
                      

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex flex-col">
                          <div className="mb-2">
                            <div className="flex items-baseline">
                              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                                {selectedCurrency} {tour.price && !isNaN(tour.price) ? convertPrice(tour.price) : '0.00'}
                              </span>
                              <span className="text-sm text-gray-700 ml-2">/ person</span>
                            </div>
                            {tour.oldPrice && !isNaN(tour.oldPrice) && (
                              <div className="flex items-center mt-1">
                                <span className="text-sm text-black mr-2 relative">
                                  {selectedCurrency} {convertPrice(tour.oldPrice)}
                                  <span className="absolute left-0 top-1/2 w-full h-[1px] bg-red-600 transform -translate-y-1/2"></span>
                                </span>


                                <div className="relative inline-flex items-center px-2 py-1 rounded-full bg-yellow-400/20
                                40 text-black ">
                                  <span className="absolute inset-0 bg-yellow-400/30 blur-[4px] rounded-full"></span>
                                  <svg className="w-3 h-3 mr-1 relative" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                  </svg>
                                  <span className="text-[11px] font-semibold relative">
                                    SAVE {selectedCurrency} {convertPrice(tour.oldPrice - tour.price)}
                                  </span>
                                </div>
                              </div>

                            )}
                          </div>
                          
                        </div>
                        
                        <motion.div 
                          className="bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 rounded-md px-4 py-2 transition-colors duration-300 flex items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className=" font-medium text-sm">View Details</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Tours;
