import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star } from 'lucide-react'; // Suggested: lucide-react for cleaner icons

const HotelCard = ({ hotel, onClick, isFavorite, onFavoriteToggle, availbleNoOfRooms }) => {
  return (
    <motion.div
      layout
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-xl cursor-pointer"
      onClick={onClick}
    >
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={hotel.gallery[0]}
          alt={hotel.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hotel.limited && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-md shadow-lg">
              Limited
            </span>
          )}
          {availbleNoOfRooms !== undefined && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 rounded-md shadow-sm">
              {availbleNoOfRooms} {availbleNoOfRooms === 1 ? 'Room' : 'Rooms'} left
            </span>
          )}
        </div>

        {/* Favorite Button (Professional Standard) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white transition-colors group/heart"
        >
          <Heart 
            size={18} 
            className={`${isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-white group-hover/heart:stroke-gray-600'}`} 
          />
        </button>

        {/* Location Overlay (Bottom of Image) */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1 text-white/90 text-md font-medium mb-1">
            <MapPin size={16} />
            <span>{hotel.location}</span>
          </div>
          <h3 className="text-white font-bold text-xl leading-tight line-clamp-1">
            {hotel.name}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={14}
                className={
                  index < Math.round(hotel.starRating)
                    ? "fill-amber-400 stroke-amber-400"
                    : "fill-transparent stroke-slate-300"
                }
              />
            ))}

            <span className="ml-1 text-sm font-semibold text-slate-800">
              ({hotel.starRating || 0})
            </span>

            <span className="text-xs text-slate-400 font-medium">
              (120+ reviews)
            </span>
          </div>

        </div>

        <p className="text-slate-700 text-sm leading-relaxed line-clamp-2 mb-4">
          {hotel.description}
        </p>

        {/* Footer: Price and CTA */}
        <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-tighter">Starting at</span>
            <span className="text-sm font-bold text-slate-900">
              Exclusive rates
            </span>

          </div>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-teal-500 text-white text-xs font-bold rounded-xl hover:bg-white hover:text-black border-2 hover:border-teal-500 duration-300 transition-colors shadow-md shadow-slate-200"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default HotelCard;