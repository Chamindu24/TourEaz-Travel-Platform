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

    {/* Mission Section */}
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in-left">
            <div className="inline-flex items-center px-4 py-1.5 bg-white text-[#005E84] rounded-full text-sm font-semibold tracking-widest uppercase mb-1 border-2 border-[#0A435C] relative overflow-hidden group cursor-pointer">
              <span className="w-2 h-2 bg-[#0A435C] rounded-full mr-2 "></span>
              Our Mission
              <span className="absolute top-0 left-0 w-full h-full border-1 border-[#0A435C] rounded-full "></span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#075375]">
              To be the premier <span className="text-[#0A435C]">bridge</span>
            </h2>
            <p className="text-xl text-[#075375] leading-relaxed">
              Between international opportunities and the Maldivian paradise,
              delivering exceptional service in travel, real estate, investment,
              and brand partnerships while maintaining the highest standards of
              integrity and local expertise.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-teal-500/10 to-teal-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 duration-500 shine-effect">
                <div className="text-3xl font-bold text-teal-200 mb-2">
                  500+
                </div>
                <div className="text-teal-300">Happy Clients</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-teal-500/10 to-teal-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 duration-500 shine-effect">
                <div className="text-3xl font-bold text-teal-300 mb-2">8+</div>
                <div className="text-teal-400">Years Experience</div>
              </div>
            </div>
          </div>
          <div className="relative animate-fade-in-right animate-delay-2">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-700 shine-effect">
              <div className="absolute inset-0 bg-gradient-to-r from-[#005E84]/10 via-transparent to-[#005E84]/10 animate-shimmer"></div>
              <img
                src="/travel-services/mike-swigunski-k9Zeq6EH_bk-unsplash.jpg"
                alt="Luxury Maldives Resort"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#005E84] to-[#0A435C] rounded-2xl shadow-lg animate-pulse-slow animate-glow"></div>
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-[#0A435C] to-[#005E84] rounded-full opacity-70 animate-bounce-slow"></div>
          </div>
        </div>
      </div>
    </section>

    {/* Values Section */}
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10">
        <div className="inline-flex items-center px-4 py-1.5 bg-white text-[#005E84] rounded-full text-sm font-semibold tracking-widest uppercase mb-5 border-2 border-[#0A435C] relative overflow-hidden group cursor-pointer">
          <span className="w-2 h-2 bg-[#0A435C] rounded-full mr-2 "></span>
          Our Values
          <span className="absolute top-0 left-0 w-full h-full border-1 border-[#0A435C] rounded-full "></span>
        </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Our Core <span className="text-teal-500">Values</span>
          </h2>
          <p className="text-lg md:text-xl text-teal-200 max-w-3xl mx-auto animate-fade-in-up animate-delay-2">
            The principles that guide everything we do
          </p>
        </div>

        <HoverEffect items={values} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
          key={index}
          className="group relative bg-white rounded-xl shadow-lg transition-all duration-500 border border-slate-100 hover:shadow-2xl hover:shadow-orange-100/50 flex flex-col h-full cursor-pointer overflow-hidden"
        >
          
          <div className="relative bg-gradient-to-r from-teal-600 to-teal-800 p-6 py-4 flex justify-between items-start">
            {/* Sequential Number (Large, Muted) */}
            <div className="text-4xl md:text-5xl font-bold text-white/90 transition-colors duration-300 group-hover:text-white/95 tracking-tighter">
              {String(index + 1).padStart(2, '0')}
            </div>
            
            {/* Icon (Foreground) */}
            <div className="rounded-full p-3 w-12 h-12 flex items-center justify-center bg-teal-600 text-white   transition-transform duration-300 transform group-hover:scale-110">
              {value.icon} 
            </div>
          </div>
          
          {/* Bottom Block: Text Content */}
          <div className="p-6 md:p-8 flex flex-col h-full flex-grow">
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-600 mb-3 group-hover:text-teal-400 transition-colors">
              {value.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed flex-grow">
              {value.description}
            </p>


          </div>
        </div>
          ))}
        </HoverEffect>
      </div>
    </section>



    {/* Journey Timeline Section - Enhanced Design */}
    <section className="py-16 px-6 bg-[#E7E9E5]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#075375] mb-12 text-center">
          Our Journey
        </h2>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#005E84] to-[#0A435C] animate-pulse-slow"></div>

          {journey.map((item, index) => (
            <div
              key={index}
              className="relative flex items-start mb-12 group animate-fade-in-left"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#005E84] to-[#0A435C] rounded-full flex items-center justify-center text-[#E7E9E5] font-bold text-sm shadow-md group-hover:scale-110 transition-transform duration-300 relative z-10 animate-glow">
                {item.year}
              </div>
              <div className="ml-8 flex-1">
                <div className="bg-gradient-to-br from-[#B7C5C7] to-[#E7E9E5] rounded-lg p-6 hover:shadow-xl transform group-hover:-translate-y-1 transition-all duration-300 shine-effect">
                  <h3 className="text-xl font-bold text-[#075375] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#0A435C] leading-relaxed">{item.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>



    {/* Statistics Section - Modern Design */}
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-1.5 bg-white text-[#005E84] rounded-full text-sm font-semibold tracking-widest uppercase mb-5 border-2 border-[#0A435C] relative overflow-hidden group cursor-pointer">
            <span className="w-2 h-2 bg-[#0A435C] rounded-full mr-2 "></span>
              Our Impact
            <span className="absolute top-0 left-0 w-full h-full border-1 border-[#0A435C] rounded-full "></span>
        </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
           Numbers That <span className="text-teal-500">Matter</span>
          </h2>
          <p className="text-lg md:text-xl text-teal-200 max-w-3xl mx-auto animate-fade-in-up animate-delay-2">
            TOur achievements and impact in the Maldives market
          </p>
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
              className="group rounded-lg border-2 border-teal-200 bg-gradient-to-r from-white to-teal-900/30 p-8 
                        shadow-[4px_4px_0px_#0A435C]  
                        hover:shadow-[6px_6px_0px_#005E84] hover:-translate-y-3 
                        transition-all duration-500"
            >
              <div className="w-16 h-16 mb-4 bg-teal-200 rounded-xl flex items-center justify-center 
                              text-white group-hover:bg-teal-300 transition">
                {stat.icon}
              </div>

              <h3 className="text-4xl font-black text-teal-200 group-hover:text-teal-300 transition">
                {stat.number}
              </h3>
              <p className="text-teal-300 text-lg font-semibold">{stat.label}</p>
            </div>

          ))}
        </div>
      </div>
    </section>

    {/* Call to Action Section */}
  <section 
      className="py-24  relative overflow-hidden"
      style={{
          backgroundImage: "url('/travel-services/brand.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
    >
              <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#005E84]/40 to-[#0A435C]/35"></div>

        {/* Animated particles */}
        <div
          className="absolute top-20 left-20 w-32 h-32 bg-white/15 rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-40 right-40 w-20 h-20 bg-white/15 rounded-full animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-24 h-24 bg-white/15 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/15 rounded-full animate-float"
          style={{ animationDelay: "1.5s" }}
        ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-flex items-center px-4 py-1.5 bg-white text-[#005E84] rounded-full text-sm font-semibold tracking-widest uppercase mb-5 border-2 border-[#0A435C] relative overflow-hidden group cursor-pointer">
            <span className="w-2 h-2 bg-[#0A435C] rounded-full mr-2 "></span>
              Get Started
            <span className="absolute top-0 left-0 w-full h-full border-1 border-[#0A435C] rounded-full "></span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up animate-delay-1">
          Ready to Start Your <span className="text-yellow-300">Journey?</span>
        </h2>
        <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto animate-fade-in-up animate-delay-2">
          Let us help you discover the endless possibilities that await in the
          Maldives. Contact us today to begin your adventure.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center ">
          <MagicButton text="Contact Us Today" className="px-4 md:px-10 py-2 md:py-3 bg-teal-400 text-white hover:bg-white hover:ring-1 hover:ring-teal-400 hover:text-black shadow-md transition-all transform hover:scale-105 duration-300 ">
            <span className="flex items-center">
              Contact Us Today
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
          </MagicButton>
          <MagicButton text="View Our Services" className="px-4 md:px-10 py-2 md:py-3 hover:bg-teal-400 text-black bg-white ring-1 ring-teal-400 hover:text-white shadow-md transition-all transform hover:scale-105 duration-300 shine-effect">
            View Our Services
          </MagicButton>
        </div>
      </div>
    </section>
  </div>
);

export default AboutUs;