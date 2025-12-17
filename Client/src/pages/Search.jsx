// src/pages/Search.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useHotelSearch } from '../hooks/useHotelSearch';
import SearchBanner from '../Components/SearchBanner';
import SearchForm from '../Components/SearchForm';
import SearchResultsList from '../Components/SearchResultsList';

const Search = () => {
  const location = useLocation();
  
  const {
    loading,
    searchResults,
    searchParams,
    globalPriceRange,
    hotels,
    dateRange,
    setDateRange,
    datePickerRef,
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
    favorites,
    handleInputChange,
    handleChildrenChange,
    handleChildAgeChange,
    handlePriceRangeChange,
    handleSearch,
    handleReset,
    handlePropertyClick,
    toggleFavorite,
    calculatePriceRangeStyles,
  } = useHotelSearch(location);

 /* if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
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
    );
  }*/

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <SearchBanner />
        <main className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-10 max-w-[1400px] mx-auto">
          {/* Banner */}
          

          {/* Search Form */}
          <SearchForm
            searchParams={searchParams}
            dateRange={dateRange}
            setDateRange={setDateRange}
            datePickerRef={datePickerRef}
            hotels={hotels}
            destinationSearch={destinationSearch}
            setDestinationSearch={setDestinationSearch}
            showDestinationDropdown={showDestinationDropdown}
            setShowDestinationDropdown={setShowDestinationDropdown}
            selectedDestination={selectedDestination}
            setSelectedDestination={setSelectedDestination}
            countrySearch={countrySearch}
            setCountrySearch={setCountrySearch}
            showCountryDropdown={showCountryDropdown}
            setShowCountryDropdown={setShowCountryDropdown}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            globalPriceRange={globalPriceRange}
            handleInputChange={handleInputChange}
            handleChildrenChange={handleChildrenChange}
            handleChildAgeChange={handleChildAgeChange}
            handlePriceRangeChange={handlePriceRangeChange}
            handleSearch={handleSearch}
            handleReset={handleReset}
            calculatePriceRangeStyles={calculatePriceRangeStyles}
          />

          {/* Search Results */}
          <SearchResultsList
            loading={loading}
            searchResults={searchResults}
            handlePropertyClick={handlePropertyClick}
            toggleFavorite={toggleFavorite}
            favorites={favorites}
            setShowFilters={setShowFilters}
          />
        </main>
      </div>
    </div>
  );
};

export default Search;