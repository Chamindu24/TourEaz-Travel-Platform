// Components/ActivityCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ActivityCard = ({ activity, onClick }) => (
  <motion.div
    className="group rounded-md bg-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer border border-gray-100"
    onClick={onClick}
    /*whileHover={{ y: -8 }}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}*/
  >
    <div className="relative h-56 sm:h-64">
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent z-10" />
      <motion.img
        src={activity.image}
        alt={activity.title}
        className="w-full h-full object-cover transition-transform duration-500"
        whileHover={{ scale: 1.05 }}
      />
      
      {/* Featured Badge */}
      {activity.featured && (
        <motion.div 
          className="absolute top-0 sm:top-0 left-0 sm:left-0 z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <span className="inline-flex items-center px-3 py-1  text-sm font-medium bg-teal-500 text-white backdrop-blur-sm">
            Featured
          </span>
        </motion.div>
      )}
      
      {/* Activity Type Badge */}
      {activity.type && (
        <motion.div 
          className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium backdrop-blur-sm
            ${activity.type === 'water-sports' ? 'bg-blue-100/90 text-blue-800 border border-blue-200' : ''}
            ${activity.type === 'cruises' ? 'bg-indigo-100/90 text-indigo-800 border border-indigo-200' : ''}
            ${activity.type === 'island-tours' ? 'bg-green-100/90 text-green-800 border border-green-200' : ''}
            ${activity.type === 'diving' ? 'bg-cyan-100/90 text-cyan-800 border border-cyan-200' : ''}
            ${activity.type === 'cultural' ? 'bg-purple-100/90 text-purple-800 border border-purple-200' : ''}
            ${activity.type === 'adventure' ? 'bg-orange-100/90 text-orange-800 border border-orange-200' : ''}
            ${activity.type === 'wellness' ? 'bg-pink-100/90 text-pink-800 border border-pink-200' : ''}
            ${activity.type === 'renewal-wedding' ? 'bg-rose-100/90 text-rose-800 border border-rose-200' : ''}
            ${activity.type === 'water' ? 'bg-blue-100/90 text-blue-800 border border-blue-200' : ''}
            ${activity.type === 'excursion' ? 'bg-green-100/90 text-green-800 border border-green-200' : ''}
            ${activity.type === 'dining' ? 'bg-purple-100/90 text-purple-800 border border-purple-200' : ''}
            ${!['water-sports', 'cruises', 'island-tours', 'diving', 'cultural', 'adventure', 'wellness', 'renewal-wedding', 'water', 'excursion', 'dining'].includes(activity.type) ? 'bg-gray-100/90 text-gray-800 border border-gray-200' : ''}
          `}>
            {activity.type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </motion.div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-full bg-black/0 group-hover:bg-black/35  transition-all duration-300 z-[15]"></div>

      {/* Bottom Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 transform transition-all duration-300 hover:scale-105  group-hover:translate-x-4">
        <motion.h4 
          className="font-bold text-lg sm:text-xl text-white line-clamp-1 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {activity.title}
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
          {activity.location}
        </motion.p>
      </div>
    </div>
    
    <motion.div 
      className="p-4 sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
    <div className="flex items-start justify-between">
      <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 pr-3">
        {activity.shortDescription || activity.description}
      </p>

      {activity.duration && (
        <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs sm:text-sm whitespace-nowrap">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {activity.duration}
        </span>
      )}
    </div>

      {/* Price and Action */}
      <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-gray-100">
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <span className="text-xl sm:text-2xl font-bold text-black">
              ${activity.price?.toFixed(2) || '0.00'}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 ml-1">/person</span>
          </div>
        </div>
        
        <motion.div 
          className="bg-teal-500 hover:bg-white text-white hover:text-black border-2 hover:border-teal-500 rounded-md px-3 sm:px-4 py-2 transition-colors duration-300 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className=" font-medium text-xs sm:text-sm">View Details</span>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
);

export default ActivityCard;
