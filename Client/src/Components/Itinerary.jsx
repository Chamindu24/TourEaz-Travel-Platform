import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Divider } from "@mui/material";

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

const Itinerary = ({selectedNightsKey}) => {
  const { tourId } = useParams();
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [imageIndices, setImageIndices] = useState([]);

  const { isMobile } = useDeviceType();

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/tours/${tourId}`);
        setTourData(response.data);
      } catch (err) {
        console.error("Error fetching tour data:", err);
        setError("Failed to fetch tour details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTourData();
  }, [tourId]);

  const nights = parseInt(selectedNightsKey, 10)
  const totalDays = nights + 1; // Days = nights + 1
  const middleDaysNeeded = totalDays - 2;

  // Build a unified itinerary array
  const itineraryDays = [];
  if (tourData && tourData.itinerary) {
    // 1) First Day
    if (tourData.itinerary.first_day) {
      itineraryDays.push({
        day: 1,
        title: tourData.itinerary_titles?.first_day || "Arrival Day",
        // CHANGED: If details is a string, split it into an array; otherwise use it as-is.
        details: typeof tourData.itinerary.first_day === "string"
          ? tourData.itinerary.first_day.split("\n")
          : tourData.itinerary.first_day || [],
        images: tourData.itinerary_images?.first_day || [],
      });
    }

    // 2) Middle Days (sort by the numeric part of "day_2", "day_3", etc.)
    if (tourData.itinerary.middle_days) {
      // Get all middle day keys (e.g., "day_2", "day_3", ...)
      let middleKeys = Object.keys(tourData.itinerary.middle_days);
      // Sort keys based on the numeric part (e.g., 2, 3, 4, 5)
      middleKeys.sort((a, b) => {
        const numA = parseInt(a.split("_")[1], 10);
        const numB = parseInt(b.split("_")[1], 10);
        return numA - numB;
      });
      // Slice the keys to get only the number needed (e.g., 3 for a 4-night tour)
      middleKeys = middleKeys.slice(0, middleDaysNeeded);
      middleKeys.forEach((key) => {
        const dayNumber = itineraryDays.length + 1;
        itineraryDays.push({
          day: dayNumber,
          title: tourData.itinerary_titles?.middle_days?.[key] || `Day ${dayNumber}`,
          details: typeof tourData.itinerary.middle_days[key] === "string"
            ? tourData.itinerary.middle_days[key].split("\n")
            : tourData.itinerary.middle_days[key] || [],
          images: tourData.itinerary_images?.middle_days?.[key] || [],
        });
      });
    }

    // 3) Last Day
    if (tourData.itinerary.last_day) {
      const dayNumber = itineraryDays.length + 1;
      itineraryDays.push({
        day: dayNumber,
        title: tourData.itinerary_titles?.last_day || "Departure Day",
        details: typeof tourData.itinerary.last_day === "string"
          ? tourData.itinerary.last_day.split("\n")
          : tourData.itinerary.last_day || [],
        images: tourData.itinerary_images?.last_day || [],
      });
    }
  }

  // Initialize image indices (one per day)
  useEffect(() => {
    if (itineraryDays.length > 0) {
      setImageIndices(Array(itineraryDays.length).fill(0));
    }
  }, [itineraryDays.length]);

  useEffect(() => {
    if (!tourData || !tourData.itinerary_images) return;

    const interval = setInterval(() => {
      setImageIndices((prevIndices) =>
        prevIndices.map((currentIndex, i) => {
          const { images } = itineraryDays[i];
          if (images && images.length > 0) {
            return (currentIndex + 1) % images.length;
          }
          return currentIndex;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [tourData, itineraryDays]);

  if (loading) {
    return <div>Loading tour details...</div>;
  }

  if (error || !tourData) {
    return <div>{error || "Tour not found."}</div>;
  }

  return (
    <div className="itinerary-wrap flex flex-col w-full bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
  {/* Elegant header section removed as requested */}

      {/* Premium tab navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="tabs flex gap-1 py-4">
            {["itinerary", "fineprint"].map((tab) => (
              <div
                key={tab}
                className={`tab relative flex items-center justify-center px-8 py-3 text-base md:text-lg font-semibold 
                  transition-all duration-500 ease-out rounded-full cursor-pointer flex-1 group overflow-hidden
                  ${
                    activeTab === tab
                      ? "bg-teal-300 text-white shadow-lg shadow-[#005E84]/25 transform scale-[1.02]"
                      : "bg-white text-gray-600 hover:text-[#005E84] hover:bg-gray-50 border border-gray-200 hover:border-[#005E84]/30 hover:shadow-md"
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {/* Background glow effect for active tab */}
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#005E84]/20 to-[#0A435C]/20 blur-xl"></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === "itinerary" && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  )}
                  {tab === "fineprint" && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  )}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tab-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "itinerary" && (
          <div className="space-y-8">
            {/* Timeline indicator */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-teal-500 hidden lg:block"></div>
              
              {itineraryDays.map((dayItem, index) => (
                <div
                  key={index}
                  className="itinerary-item group relative mb-12 last:mb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 w-4 h-4 bg-gradient-to-r from-[#005E84] to-[#0A435C] rounded-full border-4 border-white shadow-lg z-10 hidden lg:block group-hover:scale-125 transition-transform duration-300"></div>
                  
                  {/* Card container with hover effects */}
                  <div className="lg:ml-16 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1 overflow-hidden border border-gray-100 relative">
                    {/* Background Image - Full Card */}
                    {dayItem.images && dayItem.images.length > 0 && (
                      <div className="absolute inset-0 h-full w-full">
                        <img
                          src={dayItem.images[imageIndices[index]]}
                          alt={`Day ${dayItem.day} background`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          className="transition-all duration-1000 ease-in-out group-hover:scale-105"
                        />
                        {/* Gradient overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
                      </div>
                    )}

                    {/* Content overlay on top of image */}
                    <div className={`relative z-10 flex flex-col ${dayItem.images && dayItem.images.length > 0 ? 'min-h-96 justify-between' : ''}`}>
                      {/* Card header with gradient */}
                      <div className="bg-emerald-500 text-white p-6">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                            <span className="font-bold text-lg md:text-xl">Day {dayItem.day}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl md:text-2xl font-bold truncate">{dayItem.title}</h3>
                          </div>
                        </div>
                      </div>

                      {/* Content section */}
                      <div className="p-6 lg:p-8 flex-1">
                        <div className="itinerary-desc">
                          {dayItem.details.length > 0 ? (
                            <div className="space-y-4">
                              {dayItem.details.map((detail, idx) => (
                                <div key={idx} className="flex items-start gap-3 group/item">
                                  <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-[#005E84] to-[#0A435C] rounded-full mt-2 group-hover/item:scale-150 transition-transform duration-200"></div>
                                  <p className="text-white text-base md:text-lg leading-relaxed group-hover/item:text-gray-100 transition-colors duration-200">
                                    {detail}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <p className="text-white/70 text-lg">No activities available for this day.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image controls - Bottom of card */}
                      {dayItem.images && dayItem.images.length > 0 && (
                        <div className="px-6 pb-6 flex items-center justify-between">
                          {/* Navigation arrows */}
                          <div className="flex gap-2">
                            <button
                              className="w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                              onClick={() =>
                                setImageIndices((prev) => {
                                  const newIndices = [...prev];
                                  newIndices[index] =
                                    (newIndices[index] - 1 + dayItem.images.length) %
                                    dayItem.images.length;
                                  return newIndices;
                                })
                              }
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              className="w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                              onClick={() =>
                                setImageIndices((prev) => {
                                  const newIndices = [...prev];
                                  newIndices[index] = (newIndices[index] + 1) % dayItem.images.length;
                                  return newIndices;
                                })
                              }
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>

                          {/* Image indicator dots */}
                          {dayItem.images.length > 1 && (
                            <div className="flex gap-2">
                              {dayItem.images.map((_, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    imgIdx === imageIndices[index]
                                      ? 'bg-white scale-125'
                                      : 'bg-white/50 hover:bg-white/75'
                                  }`}
                                ></div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "fineprint" && (
          <div className="space-y-12">
            {/* Hero summary section */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative min-h-96">
              {/* Background Image */}
              {tourData.tour_image && (
                <div className="absolute inset-0 h-full w-full">
                  <img
                    src={tourData.tour_image}
                    alt="Tour Summary"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
                </div>
              )}
              
              {/* Content overlay on top of image */}
              <div className="relative z-10 p-8 lg:p-12">
                <div className="mb-8">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                    Tour Summary
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#005E84] to-[#0A435C] rounded-full"></div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-white text-lg leading-relaxed">
                    {tourData.tour_summary || "No summary available."}
                  </p>
                </div>
              </div>
            </div>

            {/* Package contents section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold bg-teal-200 bg-clip-text text-transparent mb-4">
                What&apos;s Inside the Package?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover everything that&apos;s included and excluded in your amazing journey
              </p>
              <div className="w-32 h-1 bg-teal-300 rounded-full mx-auto mt-6"></div>
            </div>

            {/* Inclusions and Exclusions */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Inclusions */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Inclusions</h3>
                </div>
                <Divider className="mb-6" />
                {Array.isArray(tourData.inclusions) && tourData.inclusions.length > 0 ? (
                  <div className="space-y-4">
                    {tourData.inclusions.map((inc, index) => (
                      <div key={index} className="flex items-start gap-4 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform duration-200">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed group-hover/item:text-gray-900 transition-colors duration-200">
                          {inc}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No inclusions available.</p>
                  </div>
                )}
              </div>

              {/* Exclusions */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-8 border border-red-100 hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Exclusions</h3>
                </div>
                <Divider className="mb-6" />
                {Array.isArray(tourData.exclusions) && tourData.exclusions.length > 0 ? (
                  <div className="space-y-4">
                    {tourData.exclusions.map((exc, index) => (
                      <div key={index} className="flex items-start gap-4 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform duration-200">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed group-hover/item:text-gray-900 transition-colors duration-200">
                          {exc}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No exclusions available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Policies section */}
            <div className="space-y-8">
              {[
                {
                  title: "Refund Policies",
                  icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  ),
                  description: "Refund policies are designed to uphold fairness and transparency, ensuring peace of mind for our valued travelers.",
                  points: [
                    "Refunds are applicable under specific terms and conditions.",
                    "Review the cancellation policy before booking.",
                    "Refunds will be processed within 7–10 business days after confirmation."
                  ]
                },
                {
                  title: "Payment Methods",
                  icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  ),
                  description: "We provide a variety of secure and convenient payment options.",
                  points: [
                    "Credit cards and debit cards are accepted.",
                    "Secure online payment gateways available.",
                    "Bank transfers can be arranged for large amounts."
                  ]
                },
                {
                  title: "Payment Policies",
                  icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd" />
                    </svg>
                  ),
                  description: "To secure your booking, we require either full payment or a partial deposit.",
                  points: [
                    "Full payment is required at the time of booking or as per the terms.",
                    "Deposits may be required for certain trips or packages.",
                    "Payments must be made according to the specified deadlines."
                  ]
                }
              ].map((policy, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      {policy.icon}
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">{policy.title}</h3>
                  </div>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    {policy.description}
                  </p>
                  <div className="space-y-3">
                    {policy.points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-[#005E84] to-[#0A435C] rounded-full mt-3 group-hover/item:scale-150 transition-transform duration-200"></div>
                        <p className="text-gray-700 text-lg leading-relaxed group-hover/item:text-gray-900 transition-colors duration-200">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Itinerary;