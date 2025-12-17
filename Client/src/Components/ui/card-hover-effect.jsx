import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// HoverEffect: wraps each child with a hoverable anchor so callers can pass
// multiple card elements as children without also mapping an `items` array.
// This prevents double-mapping situations (e.g. passing `items` and also
// mapping `items` inside children) which caused duplicated cards.
export const HoverEffect = ({ items, className, children }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const childArray = React.Children.toArray(children);

  return (
    <div className={cn("grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 py-4", className)}>
      {childArray.map((child, idx) => (
        <a
          href={items && items[idx] ? items[idx]?.link : undefined}
          key={items && items[idx] ? items[idx]?.link ?? idx : idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full  w-full bg-emerald-200/30  block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>
          {child}
        </a>
      ))}
    </div>
  );
};

