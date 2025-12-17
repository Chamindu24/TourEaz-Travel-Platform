import React from 'react';
import { FaBed, FaShip, FaPlane, FaCar, FaPlaneDeparture } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RoomCard = ({ room, onSelect }) => {
  const {
    _id,
    gallery,
    roomName,
    size,
    bedType,
    maxOccupancy: { adults, children },
    amenities,
    transportations,
    searchDates,
    pricePeriods
  } = room;

  const calculatePrice = () => {
    if (!pricePeriods?.length) return { currentPrice: 0, totalPrice: 0, nights: 0 };

    let nights = 1;
    if (searchDates?.checkIn && searchDates?.checkOut) {
      const checkIn = new Date(searchDates.checkIn);
      const checkOut = new Date(searchDates.checkOut);
      if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && checkIn < checkOut) {
        nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      }
    }

    const checkInDate = searchDates?.checkIn ? new Date(searchDates.checkIn) : new Date();
    const applicablePeriod = pricePeriods
      .filter(period => {
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return start <= checkInDate && end >= checkInDate;
      })
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];

    const currentPrice = applicablePeriod?.price || 0;
    return {
      currentPrice,
      totalPrice: currentPrice * nights,
      nights
    };
  };

  const { currentPrice, totalPrice, nights } = calculatePrice();

  const getTransportIcon = (method) => {
    const lowerMethod = method.toLowerCase();
    if (lowerMethod.includes('boat') || lowerMethod.includes('ship')) return <FaShip className="text-lapis_lazuli" />;
    if (lowerMethod.includes('plane') && !lowerMethod.includes('domestic')) return <FaPlane className="text-lapis_lazuli" />;
    if (lowerMethod.includes('domestic flight')) return <FaPlaneDeparture className="text-lapis_lazuli" />;
    return <FaCar className="text-lapis_lazuli" />;
  };

  const getTransportType = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('arrival') || lowerType.includes('pickup')) return 'Arrival';
    if (lowerType.includes('departure') || lowerType.includes('return')) return 'Departure';
    if (lowerType.includes('domestic')) return 'Domestic';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <motion.div
      className="group rounded-xl bg-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-slate-100 cursor-pointer"
      onClick={() => onSelect(_id)}
      whileHover={{ y: -4 }}
    >
      {/* Image Container */}
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
        <motion.img
          src={gallery?.[0] || "/placeholder.svg"}
          alt={roomName}
          className="w-full h-full object-cover transition-transform duration-500"
          whileHover={{ scale: 1.05 }}
        />
        
        {/* Bed Type Badge */}
        <motion.div 
          className="absolute top-3 right-3 z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-teal-500 text-white backdrop-blur-sm rounded-full">
            {bedType}
          </span>
        </motion.div>

        {/* Bottom Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <motion.h3 
            className="font-bold text-2xl  text-white line-clamp-2 "
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {roomName}
          </motion.h3>
          <motion.p 
            className="text-gray-100 text-sm sm:text-md flex items-center flex-wrap gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <span className="flex items-center">
              <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-2m-9-2l4 2m0-5L9 7m4 0l4 2" />
              </svg>
              {size}m²
            </span>
            <span className="flex items-center">
              <FaBed className="h-3 w-3 mr-1" />
              {adults}A {children}K
            </span>
          </motion.p>
        </div>
      </div>

      {/* Content Section */}
      <motion.div 
        className="p-5 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {/* Occupancy Info Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-slate-100">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">Size</p>
            <p className="font-semibold text-xs">{size}m²</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">Bed</p>
            <p className="font-semibold text-xs">{bedType}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">Adults</p>
            <p className="font-semibold text-xs">{adults}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">Kids</p>
            <p className="font-semibold text-xs">{children}</p>
          </div>
        </div>

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="mb-4 pb-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-gray-600 mb-2">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transportations */}
        {transportations && transportations.length > 0 && (
          <div className="mb-4 pb-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-gray-600 mb-2">Transport Included</p>
            <div className="space-y-1.5">
              {transportations.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-2 py-1.5 rounded-md border border-blue-100">
                  {getTransportIcon(t.method)}
                  <span className="font-medium">
                    {getTransportType(t.type)}: {t.method}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-black">
              ${currentPrice?.toFixed(2) || '0.00'}
            </span>
            <span className="text-xs text-gray-500">/night {nights > 1 ? `(${nights} nights)` : ''}</span>
            {totalPrice > 0 && (
              <span className="text-xs font-semibold text-teal-600 mt-1">
                Total: ${totalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <motion.button
            onClick={() => onSelect(_id)}
            className="bg-teal-500 hover:bg-white text-white hover:text-black border-2 hover:border-teal-500 rounded-lg px-3 sm:px-4 py-2 transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaBed className="w-3.5 h-3.5" />
            <span>Book</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoomCard;