// src/components/SearchBanner.jsx
import React from 'react';
import { motion, useScroll, useTransform } from "framer-motion";

const SearchBanner = () => {
  const { scrollY } = useScroll();
  // This creates a subtle parallax effect
  const yRange = useTransform(scrollY, [0, 500], [0, 200]);
  return (
    <header
      className="bg-cover bg-center mt-2 h-32 sm:h-40 lg:h-80 shadow-lg  overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(10,67,92,0.5), rgba(10,67,92,0.6)), url('/travel-services/search.jpg')"
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
          Sri Lanka Luxury Resorts
        </motion.h1>
        <motion.p 
          className="text-xs sm:text-sm md:text-lg lg:text-xl mt-2 drop-shadow-md max-w-lg "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Indulge in world-class luxury resorts offering unparalleled comfort and breathtaking island views
        </motion.p>
      </div>
    </header>
  );
};

export default SearchBanner;
