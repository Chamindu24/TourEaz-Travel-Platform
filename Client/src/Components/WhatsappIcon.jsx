import React, { useState } from "react";

const whatsappNumber = '9607781048';

export default function WhatsappIcon() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-12 right-12 z-[1000] font-sans">
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-end"
      >
        {/* The Technical Data (Top Detail) */}
        <div className={`
          absolute -top-6 right-0 transition-all duration-500 flex items-center space-x-2
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}>
          <span className="text-[8px] font-black text-teal-500 uppercase tracking-[0.3em]">
             Online
          </span>
          <div className="h-[1px] w-8 bg-gray-200" />
        </div>

        {/* The Main Body */}
        <div className={`
          relative flex items-center bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)]
          transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]
          ${isHovered ? 'w-64 h-20 px-6 rounded-sm' : 'w-16 h-16 px-0 justify-center rounded-none'}
        `}>
          
          {/* Section 1: The Icon & Badge */}
          <div className="relative z-10">
            <div className={`
              flex items-center justify-center transition-all duration-500
              ${isHovered ? 'text-teal-500 scale-110' : 'text-black scale-100'}
            `}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
          </div>

          {/* Section 2: The Text Reveal */}
          <div className={`
            flex flex-col ml-6 transition-all duration-500
            ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'}
          `}>

            <span className="text-sm font-black text-[#0A435C] uppercase tracking-tighter">
              TourEaz <span className="text-teal-500">Global</span>
            </span>
          </div>

          {/* Background Highlight (Fills on Hover) */}
          <div className={`
            absolute inset-0 bg-gray-50/50 transition-transform duration-700 origin-right
            ${isHovered ? 'scale-x-100' : 'scale-x-0'}
          `} />
        </div>

        {/* The "Anchor" Detail (A single pixel dot) */}
        <div className="absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-[#0A435C]/50" />
      </a>
    </div>
  );
}