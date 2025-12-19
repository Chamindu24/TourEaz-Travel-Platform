import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const ActivityCard = ({ activity, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col bg-slate-50 rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* 1. High-Impact Image Area */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={activity.image}
          alt={activity.title}
          className="w-full h-full object-cover transition-transform duration-[1.5s] cubic-bezier(0.2, 1, 0.3, 1) group-hover:scale-110"
        />
        
        {/* Glassmorphic Badge Layer */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="bg-black/40 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full border border-white/20 uppercase tracking-[0.2em] font-medium">
              {activity.type || 'Experience'}
            </span>
            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
              <svg className="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
          </div>

          {/* Bottom Gradient for Text Legibility */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />
          
          <div className="relative z-10 flex justify-between items-end">
             <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-50 text-xs font-bold uppercase tracking-widest">
                  <span className="w-8 h-[1px] bg-teal-50" />
                  {activity.location}
                </div>
                <h3 className="text-2xl font-serif text-white tracking-tight leading-none">
                  {activity.title}
                </h3>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Detail & Action Section */}
      <div className="p-6 bg-white border-x border-b border-slate-100 rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-4 mb-4 text-slate-500 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock size={14} className="text-teal-500" />
            <span className="text-sm font-medium">{activity.duration} Days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            Instant Confirmation
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">Price per guest</p>
            <p className="text-2xl font-medium text-slate-900">
              ${activity.price} <span className="text-sm text-slate-800 font-normal">USD</span>
            </p>
          </div>
          
          <button className="relative overflow-hidden group/btn px-6 py-3 bg-teal-500 text-white hover:text-black border-2 hover:border-teal-500 rounded-lg transition-all duration-300 hover:shadow-xl active:scale-95">
            <span className="relative z-10 text-xs font-bold uppercase tracking-widest">Reserve</span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;