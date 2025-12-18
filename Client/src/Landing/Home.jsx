import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LandingHeader from "./LandingHeader";
import { HoverEffect } from "../Components/ui/card-hover-effect";

// Add custom CSS animations
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3);
    }
    50% {
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.5);
    }
  }
  
  @keyframes rotate3d {
    0% {
      transform: perspective(1000px) rotateY(0deg);
    }
    100% {
      transform: perspective(1000px) rotateY(360deg);
    }
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }
  
  @keyframes gradientFlow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* --- 1. Keyframes: Transition for the full width of the original content --- */
  @keyframes marquee {
      /* Starts at the beginning of the first content set (0) */
      0% { transform: translateX(0); }
      /* Moves exactly to the start of the duplicated content, covering 50% of the track */
      100% { transform: translateX(-50%); } 
  }

  /* --- 2. Container and Clean Overlays --- */
    /* Marquee layout is handled via Tailwind utility classes on the elements.
     Keep only keyframes and a simple hover rule to pause the animation. */

    .marquee-track:hover {
    animation-play-state: paused;
    }

  /* Responsive adjustments: make each marquee item behave like a full-width slide on small screens */
  @media (max-width: 1024px) {
    .marquee-track {
      gap: 1rem;
      padding: 1.5rem 0;
      animation: marquee 26s linear infinite;
    }
    .marquee-item {
      width: 22rem;
      min-width: 220px;
    }
  }

  @media (max-width: 768px) {
    .marquee-container {
      /* keep a small internal padding so overlay doesn't cover clickable area */
      padding-left: 1rem;
      padding-right: 1rem;
    }
    .marquee-track {
      gap: 0.75rem;
      padding: 1rem 0;
      /* faster animation since items are narrower on mobile */
      animation: marquee 18s linear infinite;
    }
    .marquee-item {
      /* nearly full viewport card on mobile */
      width: calc(100% - 10rem);
      min-width: unset;
    }
    .marquee-overlay {
      /* increase relative coverage using viewport width so edges blend better */
      width: 28vw;
      filter: blur(14px);
    }
  }

  @media (max-width: 420px) {
    .marquee-track {
      gap: 0.5rem;
      padding: 0.75rem 0;
      animation: marquee 14s linear infinite;
    }
    .marquee-item {
      width: calc(100% - 5rem);
    }
    .marquee-overlay {
      width: 36vw;
      filter: blur(12px);
    }
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-fade-in-left {
    animation: fadeInLeft 0.8s ease-out forwards;
  }

  .animate-fade-in-right {
    animation: fadeInRight 0.8s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.8s ease-out forwards;
  }

  .animate-slide-up {
    animation: slideUp 0.8s ease-out forwards;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }

  .animate-delay-1 {
    animation-delay: 0.2s;
  }

  .animate-delay-2 {
    animation-delay: 0.4s;
  }

  .animate-delay-3 {
    animation-delay: 0.6s;
  }

  .animate-delay-4 {
    animation-delay: 0.8s;
  }

  .animate-delay-5 {
    animation-delay: 1s;
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
  
  .animate-glow {
    animation: glow 3s infinite;
  }
  
  .animate-rotate-3d {
    animation: rotate3d 8s infinite linear;
    transform-style: preserve-3d;
  }
  
  .animate-bounce-slow {
    animation: bounce 3s ease-in-out infinite;
  }
  
  .animate-gradient-flow {
    background: linear-gradient(-45deg, #075375, #0A435C, #005E84, #B7C5C7);
    background-size: 400% 400%;
    animation: gradientFlow 8s ease infinite;
  }
  
  .shine-effect {
    position: relative;
    overflow: hidden;
  }
  
  .shine-effect::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(30deg);
    transition: transform 1.5s ease;
  }
  
  .shine-effect:hover::after {
    transform: rotate(30deg) translateY(100%);
  }

  .opacity-0 {
    opacity: 0;
  }

  .opacity-0.animate-fade-in-up,
  .opacity-0.animate-fade-in-left,
  .opacity-0.animate-fade-in-right,
  .opacity-0.animate-scale-in,
  .opacity-0.animate-slide-up {
    opacity: 1;
  }
`;

// Helper function to style the last word
const renderTitleWithStyledLastWord = (title) => {
  const words = title.trim().split(' ');
  if (words.length <= 1) return title;
  
  const lastWord = words.pop();
  const restOfTitle = words.join(' ');
  
  return (
    <>
      {restOfTitle}{' '}
      <span className="relative inline-block text-yellow-300 blur-[0.6px] drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]">
        {lastWord}
      </span>
    </>
  );
};

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStartX = React.useRef(null);
  const touchDeltaX = React.useRef(0);
  // autoplay for mobile carousel
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    let interval = null;
    if (mq.matches && !isPaused) {
      interval = setInterval(() => {
        setMobileIndex((prev) => (prev + 1) % servicesData.length);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused]);

  // Modern hero slides with better imagery
  const heroSlides = [
    {
      image: "/travel-services/srilanka1.jpg",
      title: "Experience Paradise",
      subtitle: "Where luxury meets nature in perfect harmony",
      badge: "Premium Resorts",
    },
    {
      image: "/travel-services/srilanka3.jpg",
      title: "Your Dream Escape",
      subtitle: "Curated experiences for every traveler",
      badge: "Exclusive Villas",
    },
    {
      image: "/travel-services/srilanka6.jpg",
      title: "Discover the Srilanka",
      subtitle: "Unforgettable moments await",
      badge: "Island Adventures",
    },
    {
      image: "/travel-services/srilanka7.jpg", // new image path
      title: "Adventure Awaits",
      subtitle: "Explore hidden gems and local treasures",
      badge: "Guided Tours",
    },
  ];

const servicesData = [
      {
        title: "Tour Packages",
        subtitle: "Curated Experiences",
        description:
          "Discover the best tour packages tailored to your preferences with expert guides and unforgettable adventures",
        icon: (
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        ),
        gradient: "from-[#005E84] via-[#075375] to-[#0A435C]",
        link: "/tours",
        features: [
          "Custom Itineraries",
          "Expert Guides",
          "All-Inclusive Options",
        ],
      },
      {
        title: "Hotels & Resorts",
        subtitle: "Luxury Accommodations",
        description:
          "Premium hotels and resorts offering world-class comfort and exceptional hospitality for your perfect stay",
        icon: (
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        ),
        gradient: "from-purple-500 via-pink-500 to-rose-500",
        link: "/search",
        features: [
          "Luxury Resorts",
          "Beachfront Villas",
          "Budget-Friendly Options",
        ],
      },
      {
        title: "Activities",
        subtitle: "Adventure Awaits",
        description:
          "Exciting water sports, diving, island tours and cultural experiences to make your vacation unforgettable",
        icon: (
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        gradient: "from-green-500 via-emerald-500 to-teal-500",
        link: "/activities",
        features: [
          "Water Sports",
          "Diving & Snorkeling",
          "Island Excursions",
        ],
      },
      {
        title: "Transportation",
        subtitle: "Seamless Travel",
        description:
          "Reliable and comfortable transportation services including airport transfers and island-hopping",
        icon: (
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        ),
        gradient: "from-orange-500 via-red-500 to-pink-500",
        link: "/transportations",
        features: [
          "Airport Transfers",
          "Private Charters",
          "Inter-Island Travel",
        ],
      },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white landing-hero-content">
      <style>{animationStyles}</style>
      <LandingHeader />

      {/* Modern Hero Section */}
      <div className="relative h-screen overflow-hidden -mt-20">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <img
              src={slide.image}
              alt={`Maldives resort ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <div className="max-w-4xl mx-auto">
                <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20 animate-fade-in-up animate-delay-1 animate-glow">
                  <span className="text-black/80 font-medium text-sm blur-[0.6px] drop-shadow-[0_0_10px_rgba(253,224,71,0.2)]">
                    {slide.badge}
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-tight animate-fade-in-up animate-delay-2">
                  {renderTitleWithStyledLastWord(slide.title)}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-light animate-fade-in-up animate-delay-3">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-4">
                  <Link
                    to="/explore"
                    className="group bg-[#E7E9E5] text-[#075375] font-bold py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:bg-[#B7C5C7] shine-effect"
                    onClick={scrollToTop}
                  >
                    <span className="flex items-center">
                      Start Your Journey
                      <svg
                        className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    to="/travel-services"
                    className="group border-2 border-[#E7E9E5] text-[#E7E9E5] font-bold py-4 px-8 rounded-xl hover:bg-[#E7E9E5] hover:text-[#075375] transition-all transform hover:scale-105 animate-glow shine-effect"
                    onClick={scrollToTop}
                  >
                    Explore Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Modern Navigation Dots */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-4 animate-bounce-slow">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125 shadow-lg animate-glow"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

    <section className="relative py-32 bg-white overflow-hidden">
        {/* BACKGROUND TEXT DECOR (THE "ELITE" TOUCH) */}
        <div className="absolute top-20 left-10 select-none pointer-events-none">
          <h1 className="text-[15rem] font-black text-teal-900 leading-none tracking-tighter">
            ESCAPE
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            
            {/* IMAGE COMPOSITION (LEFT SIDE) */}
            <div className="w-full lg:w-1/2 relative">
              {/* The Main Frame */}
              <div className="relative z-20 rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] max-w-md mx-auto lg:ml-0">
                <img 
                  src="/travel-services/travel5.jpg" 
                  alt="Luxury Resort" 
                  className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#005E84]/40 to-transparent"></div>
              </div>

              {/* Floating Info Card (Glassmorphism) */}
              <div className="absolute -bottom-10 -right-6 lg:right-0 z-30 p-8 backdrop-blur-2xl bg-white/90 border border-white rounded-3xl shadow-2xl max-w-[280px]">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#005E84] rounded-full flex items-center justify-center text-white font-bold italic">S</div>
                    <div>
                      <h4 className="font-bold text-slate-900">Sri Lanka</h4>
                      <p className="text-xs text-slate-700 uppercase tracking-widest">Top Destination</p>
                    </div>

                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "The most secluded luxury villas we have ever experienced."
                </p>
              </div>

              {/* Decorative Geometric Element */}
              <div className="absolute top-10 -left-10 w-32 h-32 border-[16px] border-teal-50 rounded-full -z-10"></div>
            </div>

            {/* CONTENT (RIGHT SIDE) */}
            <div className="w-full lg:w-1/2 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-[1px] w-12 bg-teal-500"></div>
                  <span className="text-sm font-bold tracking-[0.3em] text-teal-600 uppercase">Est. 2010</span>
                </div>
                
                <h2 className="text-6xl font-bold text-slate-900 leading-[0.95] tracking-tighter">
                  Crafting <span className="italic font-light">Infinite</span> <br />
                  <span className="text-[#005E84]">Moments.</span>
                </h2>
                
                <p className="text-lg text-slate-700 max-w-md leading-relaxed">
                  We don't just book trips; we architect memories. Our portfolio of 
                  private islands represents the pinnacle of global hospitality.
                </p>
              </div>

              {/* HIGH-END FEATURE LIST */}
              <div className="space-y-8">
                <div className="flex items-start space-x-6 group">
                  <div className="text-3xl font-light text-teal-200 group-hover:text-teal-500 transition-colors">01</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Private Aviation</h5>
                    <p className="text-slate-600 text-sm">Seamless transit from doorstep to dock.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 group border-t border-slate-100 pt-8">
                  <div className="text-3xl font-light text-teal-200 group-hover:text-teal-500 transition-colors">02</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Vetted Resorts</h5>
                    <p className="text-slate-600 text-sm">Only the top 1% of Maldivian properties.</p>
                  </div>
                </div>
              </div>

              {/* CTA BUTTON */}
              <div className="pt-6">
                <a href="#contact" className="inline-block group relative">
                  <span className="relative z-10 px-10 py-5 bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 duration-500 rounded-full font-bold overflow-hidden flex items-center gap-3 transition-transform group-hover:-translate-y-1">
                    Plan Your Escape
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </span>
                  <div className="absolute inset-0 bg-teal-400 rounded-full translate-y-2 blur-lg opacity-30 group-hover:opacity-60 transition-opacity"></div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-14 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="relative text-center mb-24 overflow-visible">
            
            {/* 1. ARCHITECTURAL BACKGROUND TEXT (The "Elite" Touch) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0">
              <span className="text-[8rem] md:text-[12rem] font-black text-teal-900 tracking-tighter opacity-80 uppercase leading-none">
                Reside
              </span>
            </div>

            <div className="relative z-10">
              {/* 2. REFINED BADGE COMPONENT */}
              <div className="inline-flex items-center space-x-3 px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-400 mb-8 hover:border-teal-200 transition-colors duration-500 group cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
                  Curation Portfolio
                </span>
              </div>

              {/* 3. TYPOGRAPHY WITH PURPOSEFUL SPACING */}
              <h2 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight">
                Choose Your <br className="hidden md:block" />
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#005E84] to-teal-500">
                    Perfect Stay
                  </span>
                  {/* Subtle decorative underline */}
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-teal-100/50 -z-10 rotate-1"></span>
                </span>
              </h2>

              {/* 4. THE DESCRIPTIVE BLOCK */}
              <div className="flex flex-col items-center">
                <div className="h-12 w-[1px] bg-gradient-to-b from-teal-500 to-transparent mb-6"></div>
                <p className="text-xl md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-light">
                  Discover a handpicked collection of the Maldives’ most <span className="text-slate-900 font-semibold">prestigious dwellings</span>. 
                  From architectural marvels over the ocean to secluded jungle sanctuaries.
                </p>
              </div>
            </div>
          </div>

          <HoverEffect className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Overwater Villas",
                description:
                  "Luxurious accommodations suspended over crystal-clear waters",
                icon: (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                features: ["Private deck", "Glass floor", "Ocean views"],
              },
              {
                title: "Beachfront Resorts",
                description:
                  "Direct access to pristine beaches and turquoise waters",
                icon: (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                ),
                features: ["Beach access", "Water sports", "Spa facilities"],
              },
              {
                title: "Island Retreats",
                description: "Exclusive private islands for ultimate seclusion",
                icon: (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
                features: [
                  "Private island",
                  "Butler service",
                  "Helicopter transfer",
                ],
              },
            ].map((property, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-3xl border border-teal-400/40 hover:border-teal-400 hover:bg-white/10 hover:shadow-[0_0_18px_rgba(20,184,166,0.7)] transition-all duration-300 hover:animate-pulse shadow-xl hover:-translate-y-2"
                style={{ animationDelay: `${(index + 3) * 0.2}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#005E84]/5 to-[#0A435C]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="bg-teal-500 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-glow">
                    {property.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-teal-200 transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-[#0A435C] leading-relaxed mb-6">
                    {property.description}
                  </p>
                  <ul className="space-y-2">
                    {property.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-[#0A435C] transform transition-transform group-hover:translate-x-1"
                      >
                        <div className="w-2 h-2 bg-gradient-to-br from-[#005E84] to-[#0A435C] rounded-full mr-3 animate-pulse"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </HoverEffect>
        </div>
      </section>

      {/* Services Navigation Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
            <div className="relative mb-24">
              {/* 1. SECTION LABEL - ULTRA REFINED */}
              <div className="flex items-center space-x-4 mb-10 group">
                <div className="h-[1px] w-12 bg-[#005E84] transition-all duration-500 group-hover:w-20"></div>
                <span className="text-lg font-black tracking-[0.4em] text-teal-500 uppercase">
                  Our Expertise
                </span>
              </div>

              {/* 2. SPLIT COMPOSITION */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-20">
                
                {/* Left Side: Bold Typography */}
                <div className="max-w-2xl">
                  <h2 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tighter leading-[0.9]">
                    Bespoke <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005E84] to-teal-400">
                      Solutions.
                    </span>
                  </h2>
                </div>

                {/* Right Side: Refined Description & Vertical Accent */}
                <div className="lg:max-w-md relative pl-10 border-l border-slate-100">
                  {/* Decorative floating dot */}
                  <div className="absolute top-0 -left-[5px] w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.6)]"></div>
                  
                  <p className="text-lg text-slate-600 leading-relaxed font-medium italic">
                    "Beyond booking, we curate. Every service is a thread in the tapestry of your 
                    perfect Maldivian escape, woven with <span className="text-slate-900 font-bold not-italic">precision and local soul.</span>"
                  </p>
                  
                  <div className="mt-6 flex items-center space-x-6">
                    <div className="flex -space-x-3">
                        {[1,2,3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
                        ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trusted by 500+</span>
                  </div>
                </div>
              </div>

              {/* 3. BACKGROUND ACCENT */}
              <div className="absolute -top-10 -right-20 w-64 h-64 bg-teal-500 rounded-full blur-[100px] -z-10 opacity-100"></div>
            </div>

          <div className="mt-6 relative overflow-hidden">
            {/* Desktop / Tablet marquee: hidden on small screens */}
            <div className="hidden md:block">
              <div
                className="relative overflow-hidden"
                style={{ width: "100vw", left: "50%", marginLeft: "-50vw" }}
              >
                {/* Left / right overlays (Tailwind utilities) */}
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-[20vw] max-w-[420px] min-w-[96px] pointer-events-none z-30 opacity-95 blur-2xl bg-gradient-to-r from-white to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 w-[20vw] max-w-[420px] min-w-[96px] pointer-events-none z-30 opacity-95 blur-2xl bg-gradient-to-l from-white to-transparent"
                />

                <div
                  className="marquee-track flex gap-5 py-8 items-stretch flex-nowrap whitespace-nowrap"
                  style={{ animation: "marquee 30s linear infinite", animationPlayState: isPaused ? "paused" : "running" }}
                >
                  {servicesData.concat(servicesData).map((service, index) => (
                    <div
                      key={index}
                      className="inline-flex flex-none w-[calc(100%-3rem)] sm:w-[14rem] md:w-[20rem] lg:w-[28rem] min-w-0 sm:min-w-[140px] md:min-w-[200px] lg:min-w-[280px]"
                    >
                      <Link
                        to={service.link}
                        className="group relative w-full h-full bg-gradient-to-br from-white to-white/20 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 border border-[#B7C5C7]/30 overflow-hidden animate-fade-in-up shine-effect"
                        style={{ animationDelay: `${(index % servicesData.length + 3) * 0.2}s` }}
                        onClick={scrollToTop}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onFocus={() => setIsPaused(true)}
                        onBlur={() => setIsPaused(false)}
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                        ></div>
                        <div className="relative">
                          <div className="flex items-start justify-between mb-6">
                            <div
                              className={`bg-gradient-to-br ${service.gradient} rounded-2xl p-3 w-16 h-16 md:p-4 md:w-20 md:h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-glow`}
                            >
                              {service.icon}
                            </div>
                            <div className="text-right">
                              <div className="items-center px-3 py-1 bg-white text-black ring-1 ring-teal-400 hover:bg-teal-500 hover:text-white rounded-full text-xs font-medium transition-all duration-300 hidden md:inline-flex">
                                {service.subtitle}
                              </div>
                            </div>
                          </div>

                          <h3 className="text-xl md:text-2xl font-bold text-teal-200 mb-4 group-hover:text-[#005E84] transition-colors">
                            {service.title}
                          </h3>

                          <p className="text-sm md:text-base text-[#0A435C] leading-relaxed mb-6 group-hover:text-[#005E84] transition-colors break-words whitespace-normal">
                            {service.description}
                          </p>

                          <div className="space-y-2 mb-6">
                            {service.features.map((feature, idx) => (
                              <div
                                key={idx}
                                className="flex items-center text-sm text-[#075375] transform transition-transform group-hover:translate-x-1"
                                style={{ transitionDelay: `${idx * 50}ms` }}
                              >
                                <div className="w-1.5 h-1.5 bg-[#005E84] rounded-full mr-3 animate-pulse-slow"></div>
                                {feature}
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-center items-center text-[#005E84] font-semibold group-hover:translate-x-2 transition-transform">
                            Explore Service
                            <svg
                              className="w-4 h-4 ml-2 group-hover:animate-bounce-slow"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile carousel: show one card per screen, allow swipe and arrow controls */}
            <div className="block md:hidden">
              <div className="relative">
                <div
                  className="overflow-hidden"
                  onTouchStart={(e) => {
                    touchStartX.current = e.touches[0].clientX;
                    touchDeltaX.current = 0;
                  }}
                  onTouchMove={(e) => {
                    if (touchStartX.current == null) return;
                    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
                  }}
                  onTouchEnd={() => {
                    const threshold = 40; // px
                    if (touchDeltaX.current > threshold) {
                      setMobileIndex((prev) => Math.max(prev - 1, 0));
                    } else if (touchDeltaX.current < -threshold) {
                      setMobileIndex((prev) => Math.min(prev + 1, servicesData.length - 1));
                    }
                    touchStartX.current = null;
                    touchDeltaX.current = 0;
                  }}
                >
                  <div
                    className="flex transition-transform duration-500"
                    style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
                  >
                      {servicesData.map((service, index) => (
                        <div key={index} className="flex-none w-full px-4">
                          <div className="w-full">
                            <Link
                              to={service.link}
                              className="group flex items-center justify-center mb-6 relative w-full h-full bg-gradient-to-br from-white to-white/20 rounded-3xl p-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-[#B7C5C7]/30 overflow-hidden"
                              onClick={scrollToTop}
                              onFocus={() => setIsPaused(true)}
                              onBlur={() => setIsPaused(false)}
                              onTouchStart={() => setIsPaused(true)}
                              onTouchEnd={() => setIsPaused(false)}
                            >
                              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                              <div className="relative w-full h-full aspect-square flex flex-col overflow-hidden">
                                <div className="p-3 sm:p-4 flex-1 overflow-auto">
                                  <div className="flex justify-center mb-3">
                                    <div className={`bg-gradient-to-br ${service.gradient} rounded-2xl p-3 w-16 h-16 flex items-center justify-center`}>{service.icon}</div>
                                  </div>
                                  <h3 className="text-lg font-bold text-teal-200 mb-4 flex items-center justify-center ">{service.title}</h3>
                                  <p className="text-sm text-[#0A435C] mb-2">{service.description}</p>
                                  <ul className="space-y-2 mb-2">
                                    {service.features.map((feature, idx) => (
                                      <li key={idx} className="flex items-center text-sm text-[#075375]"><div className="w-1.5 h-1.5 bg-[#005E84] rounded-full mr-3"></div>{feature}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className=" pb-8 border-t border-white/10 bg-white/5">
                                  <div className="flex justify-center items-center text-[#005E84] font-semibold">Explore Service</div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>

                {/* Prev / Next buttons */}
                <button
                  aria-label="Previous"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-black rounded-full w-9 h-9 flex items-center justify-center shadow-lg"
                  onClick={() => setMobileIndex((i) => Math.max(i - 1, 0))}
                >
                  ‹
                </button>
                <button
                  aria-label="Next"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-black rounded-full w-9 h-9 flex items-center justify-center shadow-lg"
                  onClick={() => setMobileIndex((i) => Math.min(i + 1, servicesData.length - 1))}
                >
                  ›
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                  {servicesData.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMobileIndex(idx)}
                      className={`w-2 h-2 rounded-full ${idx === mobileIndex ? 'bg-[#075375]' : 'bg-white/60'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-32 lg:py-28 overflow-hidden group">
        {/* 1. CINEMATIC BACKGROUND */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/travel-services/travel2.jpg" 
            className="w-full h-full object-cover scale-110 transition-transform duration-[10s] group-hover:scale-100" 
            alt="Paradise"
          />
          {/* High-end gradient overlay: Darker at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/80"></div>
          <div className="absolute inset-0 bg-[#005E84]/20 mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            
            {/* 2. REFINED FLOATING BADGE */}
            <div className="inline-flex items-center px-4 py-1.5 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full text-xs font-bold tracking-[0.3em] uppercase mb-10 transition-all hover:bg-white/20 cursor-default">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-3 animate-pulse"></span>
              Final Boarding Call
            </div>

            {/* 3. MASSIVE IMPACT TYPOGRAPHY */}
            <h2 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none">
              Ready to <span className="italic font-light">Experience</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
                Paradise?
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-slate-100/80 mb-14 max-w-2xl mx-auto font-light leading-relaxed">
              Join the <span className="text-white font-medium border-b border-yellow-400/50">exclusive circle</span> of travelers who have discovered the true soul of Sri Lanka.
            </p>

            {/* 4. LUXURY BUTTONS (Glassmorphism) */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/travel-services"
                className="relative px-12 py-5 bg-white text-slate-900 font-black rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.2)] group/btn"
              >
                <span className="relative z-10 flex items-center">
                  START PLANNING
                  <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/btn:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>

              <Link
                to="/contact"
                className="px-12 py-5 backdrop-blur-md bg-white/5 border border-white/30 text-white font-bold rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white"
              >
                CONTACT CONCIERGE
              </Link>
            </div>
          </div>
        </div>

        {/* 5. VIGNETTE EFFECT (Adds "Huge Site" Polishing) */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.5)]"></div>
      </section>
    </div>
  );
};

export default Home;
