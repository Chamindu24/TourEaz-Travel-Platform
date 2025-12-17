// src/components/SearchForm.jsx
import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { countries } from '../assets/nationalities';
import { motion } from 'framer-motion';
import MagicButton from './ui/MagicButton';

const SearchForm = ({
  searchParams,
  dateRange,
  setDateRange,
  datePickerRef,
  hotels,
  destinationSearch,
  setDestinationSearch,
  showDestinationDropdown,
  setShowDestinationDropdown,
  selectedDestination,
  setSelectedDestination,
  countrySearch,
  setCountrySearch,
  showCountryDropdown,
  setShowCountryDropdown,
  selectedCountry,
  setSelectedCountry,
  showFilters,
  setShowFilters,
  globalPriceRange,
  handleInputChange,
  handleChildrenChange,
  handleChildAgeChange,
  handlePriceRangeChange,
  handleSearch,
  handleReset,
  calculatePriceRangeStyles,
}) => {
  return (
    <motion.div 
      sx={{ 
        mt: { xs: 2, sm: 3, lg: 4 }, // reduced top margin
        mx: 'auto',
        maxWidth: '100%',
        width: '100%'
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      {/* Enhanced Filtering Section */}
      <div className="-mt-5 sm:-mt-16 md:-mt-4 lg:-mt-16 z-10 mb-8 bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden"> {/* reduced vertical margin */}
        {/* Filter Header */}
        <div className="bg-gradient-to-r from-teal-300 to-teal-400 px-6 py-4 rounded-t-2xl rounded-b-none">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Find Your Perfect Hotel or Resort
          </h2>
          <p className="text-gray-100 text-sm mt-1">Search and filter hotels and resorts to match your travel preferences</p>
        </div>
        <Card elevation={0} sx={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          overflow: 'hidden',
          border: 'none',
          backgroundColor: 'transparent',
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Use a consistent spacing for all rows */}
            <Grid container spacing={2}>
            {/* Destination */}
            <Grid item xs={12} md={6} lg={4}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14M16 3v4M8 3v4M3 10h18" />
                  </svg>
                  Hotel / Resort Name
                </span>
              </label>
              <div className="relative destination-dropdown">
                <input
                  type="text"
                  className="w-full h-10 sm:h-12 pl-3 pr-10 text-sm sm:text-base text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                  placeholder="Enter hotel or resort name"
                  value={destinationSearch}
                  onChange={e => {
                    setDestinationSearch(e.target.value);
                    setShowDestinationDropdown(true);
                    handleInputChange('destination', e.target.value);
                  }}
                  onClick={() => setShowDestinationDropdown(true)}
                />
                {/* Clear button */}
                {selectedDestination && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-800"
                    onClick={() => {
                      setSelectedDestination(null);
                      setDestinationSearch('');
                      handleInputChange('destination', '');
                    }}
                  >
                    ×
                  </button>
                )}
                {showDestinationDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {hotels
                      .filter(h =>
                        destinationSearch === ''
                          ? true
                          : (h.name || '').toLowerCase().includes(destinationSearch.toLowerCase())
                      )
                      .map(h => (
                        <div
                          key={h._id}
                          className="px-4 py-2 hover:bg-ash_gray cursor-pointer text-sm sm:text-base"
                          onClick={() => {
                            setSelectedDestination(h);
                            setDestinationSearch(h.name);
                            handleInputChange('destination', h.name);
                            setShowDestinationDropdown(false);
                          }}
                        >
                          {h.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </Grid>

            {/* Check-in */}
            <Grid item xs={12} sm={6} lg={4}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Check-in Date
                </span>
              </label>
              <div className="relative w-full">
                <div
                  className="relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer w-full"
                  onClick={() => datePickerRef.current?.setOpen(true)}
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lapis_lazuli">
                    <svg className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      dateRange[0]
                        ? dateRange[0].toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""
                    }
                    readOnly
                    placeholder="Select check-in date"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 rounded-lg cursor-pointer text-xs sm:text-base"
                  />
                </div>
                <DatePicker
                  selectsRange
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setDateRange([start, end]);
                    handleInputChange('checkIn', start || null);
                    handleInputChange('checkOut', end || null);
                    if (start && end) {
                      setTimeout(() => {
                        datePickerRef.current?.setOpen(false);
                      }, 100);
                    }
                  }}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  popperPlacement="bottom-start"
                  popperModifiers={[
                    { name: "offset", options: { offset: [0, 8] } },
                    { name: "preventOverflow", options: { rootBoundary: "viewport", tether: true, altAxis: true, padding: 8 } },
                    { name: "flip", options: { fallbackPlacements: ["top", "bottom", "left", "right"] } },
                  ]}
                  ref={datePickerRef}
                  className="absolute opacity-0 pointer-events-none"
                  shouldCloseOnSelect={false}
                  selectsStart
                  monthsShown={1}
                />
              </div>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Check-out Date
                </span>
              </label>
              <div className="relative w-full">
                <div
                  className="relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer w-full"
                  onClick={() => datePickerRef.current?.setOpen(true)}
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lapis_lazuli">
                    <svg className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      dateRange[1]
                        ? dateRange[1].toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""
                    }
                    readOnly
                    placeholder="Select check-out date"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 rounded-lg cursor-pointer text-xs sm:text-base"
                  />
                </div>
              </div>
            </Grid>

            {/* Custom calendar style*/}
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
                background-color: #B7C5C7;
                color: #005E84;
              }
              .react-datepicker__day--selected,
              .react-datepicker__day--in-range,
              .react-datepicker__day--in-selecting-range {
                background-color: #B7C5C7;
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
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
                scrollbar-width: none;
              }
            `}</style>

            {/* Nationality */}
            <Grid item xs={12} sm={6} lg={4}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Nationality
                </span>
              </label>
              <div className="relative nationality-dropdown">
                <input
                  type="text"
                  className="w-full h-12 pl-3 pr-10 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                  placeholder="Search country..."
                  value={countrySearch}
                  onChange={e => {
                    setCountrySearch(e.target.value);
                    setShowCountryDropdown(true);
                  }}
                  onClick={() => setShowCountryDropdown(true)}
                />

                {/* Clear button */}
                {selectedCountry && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-800"
                    onClick={() => {
                      setSelectedCountry(null);
                      setCountrySearch('');
                      handleInputChange('nationality', '');
                    }}
                  >
                    ×
                  </button>
                )}

                {showCountryDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {countries
                      .filter(c =>
                        countrySearch === ''
                          ? true
                          : c.name.toLowerCase().includes(countrySearch.toLowerCase())
                      )
                      .map(c => (
                        <div
                          key={c.name}
                          className="px-4 py-2 hover:bg-teal-800/50 cursor-pointer"
                          onClick={() => {
                            setSelectedCountry(c);
                            setCountrySearch(c.flag + ' ' + c.name);
                            handleInputChange('nationality', c.name);
                            setShowCountryDropdown(false);
                          }}
                        >
                          {c.flag} {c.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </Grid>

            {/* Meal Plan */}
            <Grid item xs={12} sm={6} lg={3}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Meal Plan
                </span>
              </label>
              <select
                className="w-full h-10 sm:h-12 pl-3 pr-10 text-sm sm:text-base text-gray-700 bg-gray-50  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                value={searchParams.mealPlan}
                onChange={e => handleInputChange('mealPlan', e.target.value)}
              >
                <option value="" >All Meal Plans</option>
                <option value="Full Board">Full Board</option>
                <option value="Half Board">Half Board</option>
                <option value="All-Inclusive">All-Inclusive</option>
              </select>
            </Grid>

            {/* Rooms */}
            <Grid item xs={6} sm={6} lg={3}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 11h16M4 15h16M4 19h16" />
                  </svg>
                  Rooms
                </span>
              </label>
              <div className="flex items-center h-10 sm:h-12 bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  className="w-8 sm:w-12 h-full flex items-center justify-center text-gray-500 hover:bg-ash_gray"
                  onClick={() => handleInputChange('rooms', Math.max(1, searchParams.rooms - 1))}
                >−</button>
                <div className="flex-1 text-center text-sm sm:text-base font-medium">
                  {searchParams.rooms}
                </div>
                <button
                  className="w-8 sm:w-12 h-full flex items-center justify-center text-gray-500 hover:bg-ash_gray"
                  onClick={() => handleInputChange('rooms', searchParams.rooms + 1)}
                >+</button>
              </div>
            </Grid>

            {/* Adults */}
            <Grid item xs={6} sm={6} lg={3}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C17.16 13.36 20 14.28 20 15.5V19h4v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                  Adults
                </span>
              </label>
              <div className="flex items-center h-10 sm:h-12 bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  className="w-8 sm:w-12 h-full flex items-center justify-center text-gray-500 hover:bg-ash_gray"
                  onClick={() => handleInputChange('adults', Math.max(1, searchParams.adults - 1))}
                >−</button>
                <div className="flex-1 text-center text-sm sm:text-base font-medium">
                  {searchParams.adults}
                </div>
                <button
                  className="w-8 sm:w-12 h-full flex items-center justify-center text-gray-500 hover:bg-ash_gray"
                  onClick={() => handleInputChange('adults', searchParams.adults + 1)}
                >+</button>
              </div>
            </Grid>

            {/* Children */}
            <Grid item xs={6} sm={6} lg={3}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Children
                </span>
              </label>
              <div className="flex items-center h-10 sm:h-12 bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  className="w-8 sm:w-12 h-full flex items-center justify-center text-gray-500 hover:bg-ash_gray"
                  onClick={() => handleChildrenChange(Math.max(0, searchParams.children - 1))}
                >−</button>
                <div className="flex-1 text-center text-sm sm:text-base font-medium">
                  {searchParams.children}
                </div>
                <button
                  className="w-8 sm:w-12 h-full flex items-center justify-center text-gray-500 hover:bg-ash_gray"
                  onClick={() => handleChildrenChange(searchParams.children + 1)}
                >+</button>
              </div>
            </Grid>

            {/* Children Ages */}
            {searchParams.children > 0 && (
              <Grid item xs={12}>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg"> {/* reduced top margin, unified padding */}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      Children Ages
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                    {searchParams.childrenAges.map((age, i) => (
                      <select
                        key={i}
                        className="w-full h-10 sm:h-12 pl-3 pr-10 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                        value={age}
                        onChange={e => handleChildAgeChange(i, e.target.value)}
                      >
                        {[...Array(18).keys()].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'year' : 'years'}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              </Grid>
            )}
          </Grid>

          {/* Buttons */}                    
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            gap: { xs: 2, sm: 0 }, 
            mt: 2, // unified margin top
            mb: 2  // unified margin bottom
          }}>
            <button
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center justify-center sm:justify-start text-lapis_lazuli font-medium text-sm hover:text-indigo_dye transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <div className="flex flex-col sm:flex-row gap-2">

              {/* Search Resorts Button */}
              <MagicButton
                text={
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white hover:text-black " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Search Resorts
                  </span>
                }
                onClick={handleSearch}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm font-medium 
                          bg-teal-500 text-white rounded-md hover:bg-white hover:text-black border-2 hover:border-teal-500 shadow-sm"
              />
              
              <MagicButton
                text="Reset"
                onClick={handleReset}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm font-medium 
                          bg-white text-black border-2 border-teal-500 rounded-lg hover:bg-teal-500 hover:text-white"
              />

              
            </div>
          </Box>

          {/* Advanced Filters */}
          {showFilters && (
            <Box sx={{ 
              mt: 2, // unified margin top
              mb: 2, // unified margin bottom
              pt: 2, // unified padding top
              borderTop: '1px solid #e5e7eb' 
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}>
                Advanced Filters
              </Typography>
              <Grid container spacing={2}>
                {/* Price Range */}
                <Grid item xs={12} md={8}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    Price Range (${searchParams.priceRange[0]} – ${searchParams.priceRange[1]})
                  </label>
                  <div className="h-2 bg-ash_gray rounded-full w-full">
                    <div
                      className="h-2 bg-teal-500 rounded-full"
                      style={calculatePriceRangeStyles()}
                    />
                  </div>
                  <div className="flex gap-3 sm:gap-4 justify-between mt-2 sm:mt-3">
                    <div className="w-full">
                      <input
                        type="number"
                        className="w-full h-10 sm:h-12 px-3 text-sm sm:text-base text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 "
                        value={searchParams.priceRange[0]}
                        onChange={e => {
                          const value = parseInt(e.target.value) || globalPriceRange[0];
                          handlePriceRangeChange(value, searchParams.priceRange[1]);
                        }}
                        min={globalPriceRange[0]}
                        max={searchParams.priceRange[1] - 1}
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Min: ${globalPriceRange[0]}</span>
                    </div>
                    <div className="w-full">
                      <input
                        type="number"
                        className="w-full h-10 sm:h-12 px-3 text-sm sm:text-base text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 "
                        value={searchParams.priceRange[1]}
                        onChange={e => {
                          const value = parseInt(e.target.value) || globalPriceRange[1];
                          handlePriceRangeChange(searchParams.priceRange[0], value);
                        }}
                        min={searchParams.priceRange[0] + 1}
                        max={globalPriceRange[1]}
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Max: ${globalPriceRange[1]}</span>
                    </div>
                  </div>
                </Grid>

                {/* Sort By */}
                <Grid item xs={12} md={4}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    className="w-full h-10 sm:h-12 pl-3 pr-10 text-sm sm:text-base text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    value={searchParams.sortBy}
                    onChange={e => handleInputChange('sortBy', e.target.value)}
                  >
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Highest Rating</option>
                    <option value="popularity">Most Popular</option>
                    <option value="availability">Availability</option>
                  </select>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      </div>
    </motion.div>
  );
};

export default SearchForm;
