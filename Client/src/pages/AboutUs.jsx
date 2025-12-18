import React from "react";
import { HoverEffect } from "../Components/ui/card-hover-effect";
import MagicButton from "../Components/ui/MagicButton";
import { Timeline } from "../Components/ui/timeline";

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

const team = [
  {
    name: "Mr. Jaadhulla Jameel",
    role: "Founder & CEO",
    img: "/ceo.jpeg",
  },
  {
    name: "Ms. Maryam Niuma",
    role: "Investment Specialist",
    img: "/investmentspec.jpeg",
  },
  {
    name: "Ms. Mina Pham",
    role: "Brand Partnerships",
    img: "/brandps.jpeg", // avatar image
  },
  {
    name: "Mr. Mohamed Navy",
    role: "Real Estate",
    img: "/avatar.webp", // avatar image
  },
];

const journey = [
  {
    year: "2015",
    title: "Foundation",
    event:
      "Company founded with a vision to bridge travel and investment in the Maldives, starting with boutique travel experiences.",
  },
  {
    year: "2017",
    title: "Expansion",
    event:
      "Expanded into real estate consultation and foreign investment support, establishing key partnerships with local developers.",
  },
  {
    year: "2020",
    title: "Innovation",
    event:
      "Launched international brand representation services and digital transformation initiatives during global challenges.",
  },
  {
    year: "2023",
    title: "Recognition",
    event:
      "Recognized as a leading multi-service consultancy in the Maldives, serving over 500 international clients.",
  },
];



const values = [
  {
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
    title: "Local Expertise",
    description:
      "Deep understanding of Maldivian culture, regulations, and opportunities.",
  },
  {
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
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: "Trust & Integrity",
    description:
      "Building lasting relationships through transparent and ethical practices.",
  },
  {
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
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
    title: "Excellence",
    description:
      "Delivering exceptional service that exceeds expectations every time.",
  },
  {
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
    title: "Innovation",
    description:
      "Embracing new technologies and approaches to better serve our clients.",
  },
];

const AboutUs = () => (
  <div 
    className="min-h-screen bg-gradient-to-br from-[#E7E9E5] via-[#B7C5C7] to-[#E7E9E5]"

  >
    <style>{animationStyles}</style>

    {/* Modern Hero Section */}
    <section 
      className="relative py-24 mt-4 bg-gradient-to-br from-[#005E84] via-[#075375] to-[#0A435C] overflow-hidden animate-gradient-flow"
          style={{
          backgroundImage: "url('/travel-services/brand.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      <div className="absolute inset-0 bg-black/15"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#005E84]/50 to-[#0A435C]/50"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 border-4 border-white/50 rounded-full animate-float animate-glow"></div>
      <div className="absolute bottom-20 left-20 w-20 h-20 border-2 border-white/30 rounded-full animate-pulse-slow animate-glow"></div>
      <div
        className="absolute top-1/2 left-1/4 w-6 h-6 bg-white/40 rounded-full animate-float animate-glow"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Animated particles */}
      <div
        className="absolute top-40 right-40 w-16 h-16 bg-white/20 rounded-full animate-float"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute bottom-40 left-1/3 w-20 h-20 bg-white/15 rounded-full animate-float"
        style={{ animationDelay: "1.2s" }}
      ></div>
      <div
        className="absolute top-1/3 right-1/4 w-12 h-12 bg-white/25 rounded-full animate-float"
        style={{ animationDelay: "1.8s" }}
      ></div>

      {/* Shimmering overlay */}
      <div className="absolute inset-0 animate-shimmer opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-[#B7C5C7]/30 animate-fade-in-up animate-glow">
          <span className="w-2 h-2 bg-[#70716f] rounded-full mr-2 animate-pulse-slow"></span>
          About Us
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-tight animate-fade-in-up animate-delay-1">
          About IsleKey{" "}
          <span className="relative inline-block text-yellow-300 blur-[0.6px] drop-shadow-[0_0_10px_rgba(253,224,71,0.3)] ">
            Holidays
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-4xl mx-auto font-light animate-fade-in-up animate-delay-2">
          Your trusted gateway to the Maldives. We bridge travel, investment,
          and opportunity in paradise, creating unforgettable experiences and
          lasting partnerships.
        </p>
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animate-delay-3">
          <span className="px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full text-sm font-medium border border-[#B7C5C7]/30 hover:bg-[#B7C5C7]/30 transition-all shine-effect animate-glow">
            Resorts
          </span>
          <span className="px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full text-sm font-medium border border-[#B7C5C7]/30 hover:bg-[#B7C5C7]/30 transition-all shine-effect animate-glow">
            Tours
          </span>
          <span className="px-6 py-3 bg-white/50   backdrop-blur-sm rounded-full text-sm font-medium border border-[#B7C5C7]/30 hover:bg-[#B7C5C7]/30 transition-all shine-effect animate-glow">
            Activities
          </span>
          <span className="px-6 py-3 bg-white/55 backdrop-blur-sm rounded-full text-sm font-medium border border-[#B7C5C7]/30 hover:bg-[#B7C5C7]/30 transition-all shine-effect animate-glow">
            Transportaions
          </span>
        </div>
      </div>
    </section>

    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" className="text-teal-900"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Column: Text Content */}
          <div className="space-y-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A435C]/5 text-[#0A435C] text-xs font-bold tracking-[0.2em] uppercase mb-6 border border-[#0A435C]/10">
                <span className="w-1.5 h-1.5 bg-[#0A435C] rounded-full animate-pulse" />
                Our Mission
              </span>
              <h2 className="text-4xl lg:text-6xl font-serif font-medium text-slate-900 leading-[1.1]">
                To be the premier <br />
                <span className="text-[#0A435C] italic">international bridge</span>
              </h2>
            </div>

            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Connecting global opportunities with Sri Lankan excellence. We deliver 
              unrivaled expertise in real estate and investment through a lens of 
              <span className="text-slate-900 font-medium"> absolute integrity.</span>
            </p>

            {/* Stats Grid: Minimalist Style */}
            <div className="grid grid-cols-2 gap-12 pt-4 border-t border-slate-200">
              <div>
                <div className="text-4xl font-light text-[#0A435C] mb-1">500<span className="text-xl text-slate-400">+</span></div>
                <div className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Global Clients</div>
              </div>
              <div>
                <div className="text-4xl font-light text-[#0A435C] mb-1">08<span className="text-xl text-slate-400">+</span></div>
                <div className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Years of Trust</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="relative group">
            {/* Main Image Container */}
            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl">
              <img
                src="/travel-services/activity2.jpg"
                alt="Luxury Maldives"
                className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              {/* Subtle Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0A435C]/20 to-transparent mix-blend-multiply" />
            </div>

            {/* The "Floating" Element - High End Detail */}
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-xl z-20 hidden md:block border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-900 font-bold leading-none">Verified Expertise</p>
                  <p className="text-slate-500 text-sm mt-1">Sri lankan Licensed</p>
                </div>
              </div>
            </div>

            {/* Abstract Background Shapes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#0A435C]/5 rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </div>
    </section>

    {/* Values Section */}
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        
        {/* Refined Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A435C]/5 text-[#0A435C] text-xs font-bold tracking-[0.2em] uppercase mb-6 border border-[#0A435C]/10">
            <span className="w-1.5 h-1.5 bg-[#0A435C] rounded-full animate-pulse" />
            Our Values
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 mb-6 leading-tight">
            Principles that <span className="text-[#0A435C] italic">guide us</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            The foundation of our commitment to delivering excellence across the Maldivian archipelago.
          </p>
        </div>

        {/* The Modern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="group relative h-full"
            >
              {/* Subtle Outer Glow (Visible on Hover) */}
              <div className="absolute -inset-2 bg-gradient-to-b from-teal-500/50 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              
              <div className="relative h-full bg-white rounded-[2rem] border border-slate-400 p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50">
                
                {/* Top Row: Icon & Number */}
                <div className="flex items-start justify-between mb-10">
                  <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-[#0A435C] transition-all duration-500 group-hover:bg-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                    {value.icon}
                  </div>
                  <span className="text-4xl font-black text-slate-400 transition-colors duration-500 group-hover:text-teal-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {value.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>

                {/* Bottom Interactive Element */}
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#0A435C] transition-colors">
                    Core Pillar
                  </span>
                  <div className="w-2 h-2 rounded-full bg-slate-100 group-hover:bg-teal-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>



    {/* Journey Timeline Section - Enhanced Design */}
      <section className="py-16 bg-white relative">
        <div className="max-w-5xl mx-auto px-6">
          {/* Section Header */}
          <div className="relative text-center mb-12 group">
            {/* 1. THE BACKGROUND WATERMARK (The "History" Layer) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
              <span className="text-[10rem] md:text-[15rem] font-black text-teal-900 tracking-[0.2em] uppercase opacity-60">
                {new Date().getFullYear()}
              </span>
            </div>

            <div className="relative z-10">
              {/* 2. REFINED SUBTITLE BADGE */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <span className="h-[1px] w-8 bg-teal-500"></span>
                <span className="text-md font-black tracking-[0.5em] text-[#0A435C] uppercase">
                  Established 2015
                </span>
                <span className="h-[1px] w-8 bg-teal-500"></span>
              </div>

              {/* 3. EDITORIAL TYPOGRAPHY */}
              <h2 className="text-6xl md:text-8xl font-serif text-slate-900 tracking-tighter leading-none mb-10">
                Our <span className="italic font-light text-[#0A435C] relative">
                  Evolution
                  {/* Subtle decorative "ink bleed" underline */}
                  <svg className="absolute -bottom-4 left-0 w-full h-2 text-teal-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 0, 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </span>
              </h2>

              {/* 4. THE "CHRONICLE" PROGRESS BAR (Professional Standard) */}
              <div className="relative max-w-xs mx-auto mt-16">
                <p className="text-md font-bold text-slate-500 uppercase tracking-widest mb-6">
                  A Decade of Excellence
                </p>
                
                {/* The Track */}
                <div className="relative h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
                  {/* The Animated Flow */}
                  <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-[#0A435C] to-transparent animate-infinite-scroll" />
                </div>

                {/* Pulsing Anchor Point */}
                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#0A435C] rounded-full shadow-lg">
                  <span className="absolute inset-0 rounded-full bg-[#0A435C] animate-ping opacity-20"></span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            {/* Central Line - Refined to a soft dash or solid slate */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-teal-500 -translate-x-1/2 hidden md:block" />

            {journey.map((item, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row items-center mb-24 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* 1. Year Indicator (The Node) */}
                <div className="absolute left-0 md:left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full border-4 border-white bg-teal-500 shadow-sm group-hover:scale-125 transition-transform" />
                  <span className="mt-2 text-xl font-bold text-[#0A435C] bg-teal-50 px-2 py-1 rounded">
                    {item.year}
                  </span>
                </div>

                {/* 2. Content Card */}
                <div className="w-full md:w-[45%] ml-8 md:ml-0 group">
                  <div className="relative p-8 rounded-3xl border border-slate-300 bg-white transition-all duration-500 hover:border-teal-500/20 hover:shadow-[0_20px_50px_rgba(13,148,136,0.05)]">
                    
                    {/* Decorative Index */}
                    <span className="absolute -top-4 right-8 text-5xl font-black text-slate-400 group-hover:text-teal-600 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">
                      {item.title}
                    </h3>
                    
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base relative z-10">
                      {item.event}
                    </p>

                    {/* Sophisticated "End-of-Card" Accent */}
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-teal-600/80">
                      <div className="h-px w-8 bg-teal-600/20" />
                      Milestone Reached
                    </div>
                  </div>
                </div>
                
                {/* Spacer for the other side of the timeline */}
                <div className="hidden md:block md:w-[45%]" />
              </div>
            ))}
          </div>
        </div>
      </section>



    {/* Statistics Section - Modern Design */}
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          {/* The Premium Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-200 mb-8 hover:bg-white hover:border-[#0A435C]/30 transition-all duration-300 group cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A435C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0A435C]"></span>
            </span>
            <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase text-slate-500 group-hover:text-[#0A435C] transition-colors">
              Our Impact
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-serif font-medium text-slate-900 mb-6 tracking-tight">
            Numbers That <span className="text-[#0A435C] italic">Matter</span>
          </h2>

          {/* Refined Subtext */}
          <div className="flex justify-center">
            <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
              A reflection of our commitment to excellence and our 
              <span className="text-slate-900 font-semibold"> proven track record</span> in the 
              Maldivian luxury market.
            </p>
          </div>

          {/* Subtle Decorative Underline */}
          <div className="mt-8 flex justify-center gap-1">
            <div className="h-1 w-12 rounded-full bg-[#0A435C]"></div>
            <div className="h-1 w-2 rounded-full bg-teal-400"></div>
            <div className="h-1 w-1 rounded-full bg-teal-200"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              number: "500+",
              label: "Happy Clients",
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              ),
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              number: "8+",
              label: "Years Experience",
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              gradient: "from-green-500 to-emerald-500",
            },
            {
              number: "100+",
              label: "Properties Managed",
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
              gradient: "from-purple-500 to-pink-500",
            },
            {
              number: "25+",
              label: "Brand Partners",
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              ),
              gradient: "from-orange-500 to-red-500",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-slate-300 bg-white p-8 
                        shadow-sm hover:shadow-xl hover:-translate-y-2 
                        transition-all duration-300 ease-out overflow-hidden"
            >
              {/* Subtle Background Accent */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-teal-800 transition-transform group-hover:scale-150 duration-700" />

              <div className="relative z-10">
                {/* Icon Container */}
                <div className="w-14 h-14 mb-6 bg-teal-600 rounded-xl flex items-center justify-center 
                                text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                  {stat.icon}
                </div>

                {/* Text Content */}
                <div className="space-y-1">
                  <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                    {stat.number}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>

          ))}
        </div>
      </div>
    </section>

    {/* Call to Action Section */}
    <section className="relative py-32 lg:py-48 bg-white overflow-hidden">
      {/* 1. BACKGROUND GHOST TEXT (The Signature of Premium Design) */}
      <div className="absolute top-10 left-0 w-full flex justify-center select-none pointer-events-none z-0">
        <h1 className="text-[18rem] font-black text-teal-900 leading-none tracking-tighter">
          TOUREAZ
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* 2. IMAGE COMPOSITION (LEFT) - The "Layered" Look */}
          <div className="lg:col-span-5 relative group">
            {/* Main Image */}
            {/* 1. The Container: Handles the 3D lift */}
            <div className="relative z-20 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl 
                            perspective-1000 group cursor-pointer transition-all duration-700 
                            hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-4">
              
              {/* 2. The Image: Handles the "Depth" zoom */}
              <img 
                src="/travel-services/brand.jpg" 
                className="w-full h-full object-cover grayscale-[30%] brightness-90
                          transition-all duration-[1.5s] ease-out
                          group-hover:scale-125 group-hover:grayscale-0 group-hover:brightness-110" 
                alt="Luxury"
              />

              {/* 3. The Depth Overlay: Adds a subtle "passing through clouds/mist" feel */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            </div>
            
            {/* Secondary Overlapping Image (The "Pro" Touch) */}
            <div className="absolute -bottom-12 -right-12 z-30 w-1/2 aspect-square rounded-2xl overflow-hidden shadow-2xl border-8 border-white hidden md:block transform transition-transform duration-1000 group-hover:translate-x-4">
              <img 
                src="/travel-services/travel2.jpg" 
                className="w-full h-full object-cover" 
                alt="Detail"
              />
            </div>
          </div>

          {/* 3. CONTENT (RIGHT) */}
          <div className="lg:col-span-6 lg:col-start-8 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-900"></span>
                <p className="text-sm font-bold tracking-[0.5em] text-slate-400 uppercase">Since 2010</p>
              </div>
              
              <h2 className="text-6xl lg:text-8xl font-light text-slate-900 leading-[0.85] tracking-tighter">
                Where <span className="font-serif italic text-teal-300">Legacy</span> <br /> 
                Meets the <span className="font-black">Deep.</span>
              </h2>

              <p className="text-xl text-slate-600 font-mono leading-relaxed">
                We curate the <span className="text-slate-900 font-semibold underline decoration-teal-300 decoration-2 underline-offset-4">unobtainable</span>. Every itinerary is a bespoke masterpiece, hand-drawn by our local concierges.
              </p>
            </div>

            {/* 4. THE INTERACTIVE FEATURE LIST */}
            <ul className="space-y-6">
              {['Private Atolls', 'Deep Sea Exploration', 'Aerial Transfers'].map((item, idx) => (
                <li key={idx} className="group cursor-pointer flex items-center justify-between border-b border-slate-200 pb-4 hover:border-slate-900 transition-colors duration-500">
                  <span className="text-slate-400 text-xl font-bold mr-6">0{idx + 1}</span>
                  <span className="text-xl font-bold text-slate-800 group-hover:translate-x-2 transition-transform duration-300">{item}</span>
                  <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-slate-900 group-hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </li>
              ))}
            </ul>

            {/* 5. THE CTA */}
            <div className="pt-6">
              <button className="relative group overflow-hidden bg-teal-500 hover:text-black border-2 hover:border-teal-500  text-white px-12 py-5 rounded-full font-bold transition-all">
                <div className="absolute inset-0 w-0 bg-white transition-all duration-[400ms] group-hover:w-full"></div>
                <span className="relative z-10 flex items-center gap-3">
                  BEGIN YOUR JOURNEY
                  <span className="text-lg">→</span>
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
);

export default AboutUs;