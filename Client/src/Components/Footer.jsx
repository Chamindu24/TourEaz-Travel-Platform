import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-900 pt-20 pb-8 border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section 1: The Massive Brand Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end pb-24 border-b border-slate-100">
          <div className="lg:col-span-8">
            <h2 className="text-[12vw] lg:text-[10rem] font-bold leading-[0.8] tracking-[-0.04em] text-slate-950">
              TourEaz<span className="text-teal-500">.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <p className="text-xl text-slate-700 font-light leading-snug">
              Redefining the standard of global travel through curated technology and human connection.
            </p>
            <div className="flex gap-4 text-slate-800">
               <SocialLink label="Instagram" Icon={Instagram} />
               <SocialLink label="Twitter" Icon={Twitter} />
               <SocialLink label="LinkedIn" Icon={Linkedin} />
            </div>
          </div>
        </div>

        {/* Section 2: The Structured Site Map */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-16 gap-x-8 py-24">
          
          <FooterColumn title="Platform">
            <ArchitectLink label="Direct Booking" />
            <ArchitectLink label="Tour Dashboard" />
            <ArchitectLink label="Mobile App" />
            <ArchitectLink label="Travel APIs" />
          </FooterColumn>

          <FooterColumn title="Experiences">
            <ArchitectLink label="Luxury Stays" />
            <ArchitectLink label="Adventure" />
            <ArchitectLink label="Hidden Gems" />
            <ArchitectLink label="Eco-Tourism" />
          </FooterColumn>

          <FooterColumn title="Resources">
            <ArchitectLink label="Travel Blog" />
            <ArchitectLink label="Help Center" />
            <ArchitectLink label="Safety Guides" />
            <ArchitectLink label="Documentation" />
          </FooterColumn>

          <FooterColumn title="About">
            <ArchitectLink label="Our Mission" />
            <ArchitectLink label="Sustainability" />
            <ArchitectLink label="Press" />
            <ArchitectLink label="Partners" />
          </FooterColumn>

          {/* Newsletter / Contact in a distinct style */}
          <div className="col-span-2 lg:col-span-1 space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Stay Informed</h4>
              <div className="flex border-b border-slate-500 focus-within:border-teal-500 transition-all py-2">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="bg-transparent w-full outline-none text-sm placeholder:text-slate-500"
                />
                <button className="text-slate-500 hover:text-teal-500 transition-colors">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Fine Print & Meta */}
        <div className="pt-12 border-t border-slate-300 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-10 items-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              © {currentYear} TourEaz Inc.
            </p>
            <div className="hidden md:flex gap-6">
              <Link to="/privacy" className="text-sm font-bold text-slate-400 hover:text-teal-300 uppercase tracking-widest transition-colors">Privacy</Link>
              <Link to="/terms" className="text-sm font-bold text-slate-400 hover:text-teal-300 uppercase tracking-widest transition-colors">Terms</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest group-hover:text-teal-300 transition-colors">
              Crafted by LushWare
            </span>
            <div className="w-8 h-[2px] bg-slate-200 group-hover:bg-teal-300 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Architectural Components ---

const FooterColumn = ({ title, children }) => (
  <div className="space-y-8">
    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{title}</h4>
    <ul className="space-y-4">{children}</ul>
  </div>
);

const ArchitectLink = ({ label }) => (
  <li>
    <Link 
      to="#" 
      className="text-slate-600 hover:text-teal-500 text-lg font-medium tracking-tight flex items-center justify-between group transition-all duration-300"
    >
      {label}
      <ArrowUpRight 
        size={16} 
        className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" 
      />
    </Link>
  </li>
);

const SocialLink = ({ label, Icon }) => (
  <a 
    href="#" 
    aria-label={label}
    className="w-10 h-10 border border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white  transition-all duration-500"
  >
    <Icon size={18} />
  </a>
);

export default Footer;