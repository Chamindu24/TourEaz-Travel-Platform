import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MagicButton from "../Components/ui/MagicButton";
import { useNavigate } from 'react-router-dom';


const palette = {
  platinum: "#E7E9E5",
  ash_gray: "#B7C5C7",
  lapis_lazuli: "#005E84",
  indigo_dye: "#075375",
  indigo_dye2: "#0A435C",
};

const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const servicesDropdownTimeout = useRef(null);
  const { user, loading, logout } = useContext(AuthContext);
  const location = useLocation();
  const accountRef = useRef(null);
  const navigate = useNavigate();
  // Close account dropdown on outside click
  useEffect(() => {
    if (!accountDropdown) return;
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountDropdown]);
  const handleSignOut = () => {
    if (logout) {
      logout();
    } else {
      // fallback: reload or redirect
      window.location.href = "/login";
    }
    setAccountDropdown(false);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper to check active tab - now supports nested routes
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Helper to check if we're in resorts/hotels section
  const isInResortsSection = () => {
    return (
      location.pathname.startsWith("/search") ||
      location.pathname.startsWith("/hotels")
    );
  };



  // Helper to check if we're in a services section
  const isInServicesSection = () => {
    return location.pathname.match(
      /\/(travel-services|real-estate|investment-support|brand-representation)/
    );
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-white backdrop-blur-lg shadow-xl "
          : " bg-white backdrop-blur-sm  "
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <Link
            to="/"
            onClick={scrollToTop}
            className="flex items-center space-x-2 group "
          >
            <div 
              className="flex items-center group cursor-pointer select-none" 
              onClick={() => navigate('/')}
            >
              {/* The Mark: The Kinetic Chevron */}
              <div className="relative h-12 w-12 flex items-center justify-center">
                {/* The Geometric 'T' constructed from two paths */}
                <div className="relative flex flex-col items-center">
                  {/* Top Bar of the T */}
                  <div className="h-1.5 w-8 bg-gray-900 group-hover:bg-[#005E84] group-hover:w-10 transition-all duration-500 rounded-full" />
                  {/* Stem of the T */}
                  <div className="h-6 w-1.5 bg-gray-900 group-hover:bg-teal-400 group-hover:h-8 transition-all duration-500 rounded-full mt-0.5" />
                </div>
                
                {/* The "Sonic" Background Ring */}
                <div className="absolute inset-0 border-[1px] border-gray-100 rounded-full scale-50 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
              </div>

              {/* Typography Block */}
              <div className="ml-4 flex flex-col">
                <div className="flex items-center">
                  <h1 className="text-2xl font-light text-gray-900 tracking-tighter uppercase leading-none">
                    Tour<span className="font-black text-[#005E84] group-hover:text-teal-500 transition-colors">Eaz</span>
                  </h1>
                  {/* The Status Indicator */}
                  <div className="ml-3 flex items-center space-x-1">
                    <span className="h-1 w-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 w-0 group-hover:w-full transition-all duration-1000" />
                    </span>
                  </div>
                </div>
                
                {/* Professional Tagline */}
                <div className="mt-1.5 flex items-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 group-hover:text-gray-900 transition-colors">
                    TourEaz <span className="text-teal-500 italic">Travel</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
          {/* Centered nav links for desktop */}
          <div className={`hidden md:flex items-center space-x-1 flex-1 justify-center ${scrolled ? '' : 'text-lg'}`}>
            <Link
              to="/about-us"
              onClick={scrollToTop}
              className="relative overflow-hidden px-4 py-2 font-medium group"
            >
              {/* FIRST TEXT (disappears on hover) */}
              <span
                className={`
                  block transition-all duration-300 
                  ${isActive("/about-us")
                    ? "text-[#005E84]"
                    : "text-[#0A435C] group-hover:-translate-y-full group-hover:opacity-0"
                  }
                `}
              >
                About Us
              </span>

              {/* SECOND TEXT (slides up on hover) */}
              <span
                className="
                  absolute inset-0 flex items-center justify-center 
                  text-[#005E84] translate-y-full opacity-0
                  transition-all duration-300 
                  group-hover:translate-y-0 group-hover:opacity-100
                "
              >
                About Us
              </span>

              {/* ACTIVE UNDERLINE ONLY */}
              {isActive("/about-us") && (
                <span
                  className="
                    absolute bottom-1 left-1/2 transform -translate-x-1/2 
                    h-0.5 w-8 bg-gradient-to-r from-[#005E84] to-[#075375]
                  "
                />
              )}
            </Link>


                <Link
                  to="/search"
                  onClick={scrollToTop}
                  className={`relative overflow-hidden px-4 py-2 font-medium group ${
                  isInResortsSection()
                    ? "text-[#0d9488] font-semibold"
                    : "text-[#0A435C] hover:text-[#0d9488]"
                  }`}
                >
                  <span
                  className={`block transition-all duration-300 ${
                    isInResortsSection()
                    ? "text-[#0d9488]"
                    : "text-[#0A435C] group-hover:-translate-y-full group-hover:opacity-0"
                  }`}
                  >
                  Resorts
                  </span>
                  <span
                  className="absolute inset-0 flex items-center justify-center text-[#0d9488] translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                  Resorts
                  </span>
                  {isInResortsSection() && (
                  <span
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-[#0d9488] to-[#14b8a6]"
                  />
                  )}
                </Link>
                <Link
                  to="/tours"
                  onClick={scrollToTop}
                  className={`relative overflow-hidden px-4 py-2 font-medium group ${
                  isActive("/tours")
                    ? "text-[#0d9488] font-semibold"
                    : "text-[#0A435C] hover:text-[#0d9488]"
                  }`}
                >
                  <span
                  className={`block transition-all duration-300 ${
                    isActive("/tours")
                    ? "text-[#0d9488]"
                    : "text-[#0A435C] group-hover:-translate-y-full group-hover:opacity-0"
                  }`}
                  >
                  Tours
                  </span>
                  <span
                  className="absolute inset-0 flex items-center justify-center text-[#0d9488] translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                  Tours
                  </span>
                  {isActive("/tours") && (
                  <span
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-[#0d9488] to-[#14b8a6]"
                  />
                  )}
                </Link>
                <Link
                  to="/activities"
                  onClick={scrollToTop}
                  className={`relative overflow-hidden px-4 py-2 font-medium group ${
                  isActive("/activities")
                    ? "text-[#0d9488] font-semibold"
                    : "text-[#0A435C] hover:text-[#0d9488]"
                  }`}
                >
                  <span
                  className={`block transition-all duration-300 ${
                    isActive("/activities")
                    ? "text-[#0d9488]"
                    : "text-[#0A435C] group-hover:-translate-y-full group-hover:opacity-0"
                  }`}
                  >
                  Activities
                  </span>
                  <span
                  className="absolute inset-0 flex items-center justify-center text-[#0d9488] translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                  Activities
                  </span>
                  {isActive("/activities") && (
                  <span
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-[#0d9488] to-[#14b8a6]"
                  />
                  )}
                </Link>
                <Link
                  to="/transportations"
                  onClick={scrollToTop}
                  className={`relative overflow-hidden px-4 py-2 font-medium group ${
                  isActive("/transportations")
                    ? "text-[#0d9488] font-semibold"
                    : "text-[#0A435C] hover:text-[#0d9488]"
                  }`}
                >
                  <span
                  className={`block transition-all duration-300 ${
                    isActive("/transportations")
                    ? "text-[#0d9488]"
                    : "text-[#0A435C] group-hover:-translate-y-full group-hover:opacity-0"
                  }`}
                  >
                  Transportations
                  </span>
                  <span
                  className="absolute inset-0 flex items-center justify-center text-[#0d9488] translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                  Transportations
                  </span>
                  {isActive("/transportations") && (
                  <span
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-[#0d9488] to-[#14b8a6]"
                  />
                  )}
                </Link>
                <Link
                  to="/contact"
                  onClick={scrollToTop}
                  className={`relative overflow-hidden px-4 py-2 font-medium group ${
                  isActive("/contact")
                    ? "text-[#0d9488] font-semibold"
                    : "text-[#0A435C] hover:text-[#0d9488]"
                  }`}
                >
                  <span
                  className={`block transition-all duration-300 ${
                    isActive("/contact")
                    ? "text-[#0d9488]"
                    : "text-[#0A435C] group-hover:-translate-y-full group-hover:opacity-0"
                  }`}
                  >
                  Contact
                  </span>
                  <span
                  className="absolute inset-0 flex items-center justify-center text-[#0d9488] translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                  Contact
                  </span>
                  {isActive("/contact") && (
                  <span
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-[#0d9488] to-[#14b8a6]"
                  />
                  )}
                </Link>
                </div>
                {/* Auth area aligned to the right on desktop */}
          <div className="hidden md:flex items-center space-x-3 ml-4">
            {!user ? (
              <>
                <MagicButton
                  text="Login"
                  to="/login"
                  onClick={scrollToTop}
                  className={`${
                    scrolled
                      ? "bg-white ring-1 ring-teal-400 text-black hover:bg-teal-400 hover:text-white hover:ring-1 hover:ring-teal-400"
                      : "bg-teal-400 ring-1 ring-teal-300 text-white hover:bg-white hover:text-black hover:ring-1 hover:ring-teal-400"
                  } ${isActive("/login") ? "ring-2 ring-[#005E84] ring-opacity-50" : ""}`}
                />
                <MagicButton
                  text="Register"
                  to="/register"
                  onClick={scrollToTop}
                  className={` ${
                    scrolled
                      ? "bg-teal-400 text-white hover:bg-white hover:ring-1 hover:ring-teal-400 hover:text-black "
                      : "bg-white text-black ring-1 ring-teal-400 hover:bg-teal-400 hover:text-white hover:ring-1 hover:ring-white "
                  } ${isActive("/register") ? "ring-2 ring-[#005E84] ring-opacity-50" : ""}`}
                />
              </>
            ) : (
            <div className="relative" ref={accountRef}>
              {/* The Trigger Button - Clean & Compact */}
              <button
                onClick={() => setAccountDropdown((v) => !v)}
                className="group flex items-center p-3 rounded-full border border-gray-200 bg-white/10 hover:border-[#005E84]/30 hover:shadow-md transition-all duration-300 active:scale-95"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#005E84] to-[#0A435C] flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <div className="ml-2 mr-1 hidden sm:block text-left pr-2">
                  <p className="text-[10px] uppercase tracking-tighter text-gray-600 font-bold leading-none">Member</p>
                  <p className="text-md font-bold text-gray-700 leading-tight truncate max-w-[80px]">
                    {user?.firstName || 'User'}
                  </p>
                </div>
                <svg 
                  className={`h-4 w-4 mr-2 text-gray-400 transition-transform duration-500 ${accountDropdown ? 'rotate-180' : ''}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* The Dropdown Menu */}
              {accountDropdown && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  
                  {/* 1. Identity Section */}
                  <div className="px-6 py-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#005E84]/10 flex items-center justify-center text-[#005E84] font-bold text-xl">
                        {user?.firstName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-md font-bold text-gray-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-800 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Main Menu Actions */}
                  <div className="p-2">
                    <Link
                      to="/account"
                      className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl hover:bg-[#F8FAFC] hover:text-[#005E84] transition-all group"
                      onClick={() => setAccountDropdown(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#005E84]/10 transition-colors">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span>Profile Settings</span>
                      </div>
                      <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    {user?.userType === 'service-provider' && (
                      <button
                        onClick={() => { navigate('/service-provider/dashboard'); setAccountDropdown(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl hover:bg-[#F8FAFC] hover:text-[#005E84] transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#005E84]/10 transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <span>Manage Services</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* 3. Decorative/Action Footer */}
                  <div className="p-2 pt-0">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-bold text-red-500 bg-red-50/50 hover:bg-red-50 rounded-xl transition-all active:scale-[0.98]"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-6 bg-[#0A435C] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 w-6 bg-[#0A435C] transition-all duration-300 mt-1.5 ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-6 bg-[#0A435C] transition-all duration-300 mt-1.5 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white backdrop-blur-lg border-t border-[#005E84]/20 shadow-xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {/* Mobile menu items */}
            <Link
              to="/"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E1F5FE] hover:to-white hover:shadow-md transform hover:translate-x-1 min-h-[44px] flex items-center ${
                isActive("/")
                  ? "bg-gradient-to-r from-[#E1F5FE] to-white text-[#005E84] font-semibold shadow-md"
                  : "text-[#0A435C] hover:text-[#005E84]"
              }`}
              onClick={() => {
                scrollToTop();
                setIsMenuOpen(false);
              }}
            >
              Home
            </Link>
            <Link
              to="/about-us"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E1F5FE] hover:to-white hover:shadow-md transform hover:translate-x-1 min-h-[44px] flex items-center ${
                isActive("/about-us")
                  ? "bg-gradient-to-r from-[#E1F5FE] to-white text-[#005E84] font-semibold shadow-md"
                  : "text-[#0A435C] hover:text-[#005E84]"
              }`}
              onClick={() => {
                scrollToTop();
                setIsMenuOpen(false);
              }}
            >
              About Us
            </Link>

            <Link
              to="/search"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E1F5FE] hover:to-white hover:shadow-md transform hover:translate-x-1 min-h-[44px] flex items-center ${
                isInResortsSection()
                  ? "bg-gradient-to-r from-[#E1F5FE] to-white text-[#005E84] font-semibold shadow-md"
                  : "text-[#0A435C] hover:text-[#005E84]"
              }`}
              onClick={() => {
                scrollToTop();
                setIsMenuOpen(false);
              }}
            >
              Resorts
            </Link>
            <Link
              to="/tours"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E1F5FE] hover:to-white hover:shadow-md transform hover:translate-x-1 min-h-[44px] flex items-center ${
                isActive("/tours")
                  ? "bg-gradient-to-r from-[#E1F5FE] to-white text-[#005E84] font-semibold shadow-md"
                  : "text-[#0A435C] hover:text-[#005E84]"
              }`}
              onClick={() => {
                scrollToTop();
                setIsMenuOpen(false);
              }}
            >
              Tours
            </Link>
            <Link
              to="/activities"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E1F5FE] hover:to-white hover:shadow-md transform hover:translate-x-1 min-h-[44px] flex items-center ${
                isActive("/activities")
                  ? "bg-gradient-to-r from-[#E1F5FE] to-white text-[#005E84] font-semibold shadow-md"
                  : "text-[#0A435C] hover:text-[#005E84]"
              }`}
              onClick={() => {
                scrollToTop();
                setIsMenuOpen(false);
              }}
            >
              Activities
            </Link>
            <Link
              to="/transportations"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E1F5FE] hover:to-white hover:shadow-md transform hover:translate-x-1 min-h-[44px] flex items-center ${
                isActive("/transportations")
                  ? "bg-gradient-to-r from-[#E1F5FE] to-white text-[#005E84] font-semibold shadow-md"
                  : "text-[#0A435C] hover:text-[#005E84]"
              }`}
              onClick={() => {
                scrollToTop();
                setIsMenuOpen(false);
              }}
            >
              Transportations
            </Link>
            <Link
              to="/contact"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E1F5FE] hover:to-white hover:shadow-md transform hover:translate-x-1 min-h-[44px] flex items-center ${
                isActive("/contact")
                  ? "bg-gradient-to-r from-[#E1F5FE] to-white text-[#005E84] font-semibold shadow-md"
                  : "text-[#0A435C] hover:text-[#005E84]"
              }`}
              onClick={() => {
                scrollToTop();
                setIsMenuOpen(false);
              }}
            >
              Contact
            </Link>
            {/* Auth links for mobile */}
            {!user ? (
              <div>
                <Link
                  to="/login"
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E1F5FE] hover:to-white hover:shadow-md transform hover:translate-x-1 min-h-[44px] flex items-center mt-2 ${
                    isActive("/login")
                      ? "bg-gradient-to-r from-[#E1F5FE] to-white text-[#005E84] font-semibold shadow-md"
                      : "text-[#005E84] hover:text-[#075375]"
                  }`}
                  onClick={() => {
                    scrollToTop();
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg mt-4 min-h-[44px] flex items-center justify-center bg-gradient-to-r from-[#005E84] to-[#075375] hover:from-[#075375] hover:to-[#0A435C] text-white shadow-lg ${
                    isActive("/register")
                      ? "ring-2 ring-[#005E84] ring-opacity-50"
                      : ""
                  }`}
                  onClick={() => {
                    scrollToTop();
                    setIsMenuOpen(false);
                  }}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative mt-2" ref={accountRef}>
                <button
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 hover:shadow-lg w-full min-h-[44px] ${
                    isActive("/account")
                      ? "ring-2 ring-[#005E84] ring-opacity-50"
                      : ""
                  }`}
                  onClick={() => setAccountDropdown((v) => !v)}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#005E84] to-[#075375] flex items-center justify-center text-white font-semibold shadow-md">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <span className="text-[#0A435C] flex-1 text-left">
                    {user
                      ? `${user.firstName || ""} ${
                          user.lastName || ""
                        }`.trim() || user.email
                      : "Account"}
                  </span>
                  <svg
                    className={`h-4 w-4 text-[#0A435C] transition-transform duration-300 ${accountDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {accountDropdown && (
                  <div className="mt-3 w-full bg-gradient-to-br from-[#E7E9E5]/95 via-white/95 to-[#B7C5C7]/95 backdrop-blur-lg rounded-xl shadow-xl border border-[#005E84]/20 overflow-hidden animate-slideUp">
                    <div className="py-2">
                      <Link
                        to="/account"
                        className="flex items-center space-x-3 px-4 py-3 text-sm font-medium hover:bg-gradient-to-r hover:from-[#E1F5FE] hover:to-white hover:text-[#005E84] transition-all duration-200 transform hover:translate-x-1 min-h-[44px]"
                        onClick={() => {
                          setAccountDropdown(false);
                          scrollToTop();
                          setIsMenuOpen(false);
                        }}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Account</span>
                      </Link>
                      <button
                        className="flex items-center space-x-3 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:translate-x-1 min-h-[44px]"
                        onClick={handleSignOut}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingHeader;
