// Components/HotelCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const HotelCard = ({ hotel, onClick, isFavorite, onFavoriteToggle, availbleNoOfRooms }) => (
  <motion.div
    className="group  rounded-lg bg-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer border border-gray-100"
    onClick={onClick}

  >
    <div className="relative h-56 sm:h-64">
      <div className="absolute inset-0 bg-gradient-to-t from-black/70  to-transparent z-10" />
      <motion.img
        src={hotel.gallery[0]}
        alt={hotel.name}
        className="w-full h-full object-cover transition-transform duration-500"
        whileHover={{ scale: 1.05 }}
      />
      {hotel.limited && (
        <motion.div 
          className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#005E84]/90 text-white backdrop-blur-sm">
            Limited
          </span>
        </motion.div>
      )}

        {/* Available Rooms badge */}
        {availbleNoOfRooms !== undefined && (
          <motion.div
            className="absolute top-0 sm:top-0 left-0 sm:left-0 z-20 "
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
          <span className="inline-flex items-center px-2 sm:px-3 py-1 
                            text-xs sm:text-sm font-medium text-white
                            bg-teal-300  shadow-2xl ring-1  
                            shadow-[#005E84]/30 drop-shadow-2xl">
            {availbleNoOfRooms} {availbleNoOfRooms === 1 ? 'Room' : 'Rooms'} Available
          </span>

          </motion.div>
        )}

      <div className="absolute bottom-0 left-0 right-0 h-full bg-black/0 group-hover:bg-black/35 transition-all duration-300 z-[15]"></div>
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 transform transition-all duration-300 hover:scale-105  group-hover:translate-x-4 ">

        <motion.h4 
          className="font-bold text-lg sm:text-xl text-white line-clamp-1 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {hotel.name}
        </motion.h4>
        <motion.p 
          className="text-gray-200 text-xs sm:text-sm flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <svg className="h-3 sm:h-4 w-3 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {hotel.location}
        </motion.p>
      </div>
    </div>
    <motion.div 
      className="p-4 sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      {/* Description */}
      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
        {hotel.description}
      </p>
      

      
      {/* Star Rating and Action */}
      <div className="flex items-center justify-between pt-2 px-2 sm:pt-3 sm:px-3 border-t border-gray-100">
        <div className="flex items-center mb-1">
          {[1, 2, 3, 4, 5].map(star => (
            <svg
              key={star}
              className="h-3 sm:h-4 w-3 sm:w-4 mr-0.5 drop-shadow-[0_0_4px_rgba(255,183,0,0.9)]"
              viewBox="0 0 24 24"
              fill={star <= (hotel.starRating || 0) ? "url(#goldGradient)" : "#E6E6E6"}
            >
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
              </defs>

              <polygon
                points="12,2 15,9 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,9"
                stroke="#B8860B"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          ))}
          <span className="text-xs sm:text-sm text-gray-600 ml-1">
            ({hotel.starRating || 0})
          </span>
        </div>

        
        <motion.div 
          className="bg-teal-500 hover:bg-white border-2 text-white  hover:text-black hover:border-teal-500  rounded-md px-3 sm:px-4 py-2 transition-colors duration-300 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className=" font-medium text-xs sm:text-sm">View Details</span>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
);

export default HotelCard;