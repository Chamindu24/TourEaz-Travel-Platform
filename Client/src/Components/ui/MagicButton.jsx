import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MagicButton = ({ text, to, onClick, className = "" }) => {
  const ButtonContent = (
    <motion.button
      className={`relative font-bold py-1 px-6 rounded-sm shadow-sm overflow-hidden ${className}`}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={onClick}
    >


      {/* Main text */}
      <motion.span
        className="relative  z-10 "
        variants={{
          rest: { opacity: 1 },
          hover: { opacity: 0 },
        }}
        transition={{ duration: 0, delay: 0.3 }}
      >
        {text}
      </motion.span>

      {/* Hover text */}
      <motion.span
        className="absolute inset-0 flex items-center  justify-center z-10 "
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {text}
      </motion.span>

      {/* Sliding overlay */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-white/20 z-10"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: "bottom left",
          width: "200%",
          height: "200%",
        }}
        variants={{
          rest: { x: "-105%", opacity: 1 },
          hover: { x: "100%", opacity: 1 },
        }}
        transition={{ duration: 0.9 }}
      />
    </motion.button>
  );

  if (to) {
    return <Link to={to}>{ButtonContent}</Link>;
  }

  return ButtonContent;
};

export default MagicButton;
