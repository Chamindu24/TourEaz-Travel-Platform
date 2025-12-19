import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from '../Components/Footer';
import MagicButton from '../Components/ui/MagicButton';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState({
    header: false,
    contactForm: false,
    contactInfo: false,
    faq: false
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = {
        header: document.getElementById('contact-header'),
        contactForm: document.getElementById('contact-form'),
        contactInfo: document.getElementById('contact-info'),
        faq: document.getElementById('contact-faq')
      };

      for (const [key, section] of Object.entries(sections)) {
        if (section) {
          const rect = section.getBoundingClientRect();
          const isInViewport = rect.top <= window.innerHeight * 0.75;

          // only ever set visibility to true once (don't hide again)
          setIsVisible(prev => ({
            ...prev,
            [key]: prev[key] || isInViewport
          }));
        }
      }
    };

    // On mount, show header and both contact panels immediately (no scroll required)
    setTimeout(() => {
      setIsVisible(prev => ({
        ...prev,
        header: true,
        contactForm: true,
        contactInfo: true
      }));
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[- ]/g, ''))) {
      newErrors.phone = 'Phone number is invalid (10 digits required)';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      // 🚀 Send to backend
      await axios.post(
        '/contacts',
        { ...formData },
        { withCredentials: true }
      );

      // success!
      setSubmitted(true);
      setFormData({ name:'', email:'', phone:'', subject:'', message:'' });

      // auto‑hide the thank‑you banner
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Submit error:', err.response || err);
      setErrors({ form: err.response?.data?.msg || 'Failed to send. Try again 😢' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <motion.header
              id="contact-header"
                className={`bg-cover bg-center mt-2 h-32 sm:h-40 lg:h-80 shadow-lg   overflow-hidden ${
                  isVisible.header ? 'opacity-100' : 'opacity-0'
                }`}
              style={{
                backgroundImage:
                  "linear-gradient(to bottom, rgba(10, 67, 92, 0.5), rgba(10, 67, 92, 0.5)), url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920')",
              }}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
            <div className="flex flex-col items-start justify-center h-full text-white  pl-10 sm:pl-10 lg:pl-28">
              <div className="lg:w-2/3">
                <motion.h1 
                  className="text-lg sm:text-xl md:text-3xl lg:text-5xl font-extrabold drop-shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                    Get Started with TourEaz Today!
                </motion.h1>
                <motion.p
                  className="text-xs sm:text-sm md:text-lg lg:text-xl mt-2 drop-shadow-md max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}

                >
                    Fill out the form below to connect directly with our dedicated team, or explore our contact channels.
                </motion.p>
            </div>
            </div>
          </motion.header>
      <main className="px-4 md:px-8 py-6 md:py-10 max-w-3xl -mt-12 sm:-mt-16 md:-mt-24 lg:-mt-36 z-10 md:max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-10 mt-4 md:mt-10">
          {/* Contact Form */}
            <div 
              id="contact-form" 
              className={`lg:w-2/3 transform transition-all duration-1000 ${
                isVisible.contactForm ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
              }`}
            >
              <div className="relative group">
                
                {/* Decorative Accent */}
                <div className="absolute -top-16 -left-16 w-40 h-40 bg-[#005E84]/5 rounded-full blur-2xl"></div>

                {/* Main Premium Form Card */}
                <div className="relative z-10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] rounded-3xl p-10 border border-gray-50 overflow-hidden">
                  
                  {/* Header */}
                  <header className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                      Send Us <br />
                      <span className="font-serif italic font-light text-[#005E84]">
                        A Message
                      </span>
                    </h2>
                  </header>

                  {/* Success Message */}
                  {submitted && (
                    <div className="mb-10 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm">
                      <strong className="font-semibold">Thank you!</strong>
                      <span className="block mt-1">
                        Your message has been sent successfully. We'll get back to you soon.
                      </span>
                    </div>
                  )}

                  {/* FORM */}
                  <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-md font-medium uppercase tracking-[0.2em] text-gray-900 mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className={`w-full bg-transparent border-b-2 pb-2 text-gray-900 text-sm focus:outline-none transition-all ${
                            errors.name ? 'border-red-500' : 'border-gray-200 focus:border-[#005E84]'
                          }`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-2">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-md font-medium uppercase tracking-[0.2em] text-gray-900 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className={`w-full bg-transparent border-b-2 pb-2 text-gray-900 text-sm focus:outline-none transition-all ${
                            errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#005E84]'
                          }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-md font-medium uppercase tracking-[0.2em] text-gray-900 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          className={`w-full bg-transparent border-b-2 pb-2 text-gray-900 text-sm focus:outline-none transition-all ${
                            errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-[#005E84]'
                          }`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-2">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-md font-medium uppercase tracking-[0.2em] text-gray-900 mb-2">
                          Subject
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={`w-full bg-transparent border-b-2 pb-2 text-gray-900 text-sm focus:outline-none transition-all ${
                            errors.subject ? 'border-red-500' : 'border-gray-200 focus:border-[#005E84]'
                          }`}
                        >
                          <option value="">Select a subject</option>
                          <option>Account Issues</option>
                          <option>Payment Questions</option>
                          <option>Profile Verification</option>
                          <option>Success Story</option>
                          <option>Feature Suggestion</option>
                          <option>Other</option>
                        </select>
                        {errors.subject && <p className="text-red-500 text-xs mt-2">{errors.subject}</p>}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-md font-medium uppercase tracking-[0.2em] text-gray-900 mb-2">
                        Your Message
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        className={`w-full bg-transparent border-b-2 pb-2 text-gray-900 text-sm focus:outline-none transition-all ${
                          errors.message ? 'border-red-500' : 'border-gray-200 focus:border-[#005E84]'
                        }`}
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-2">{errors.message}</p>}
                    </div>

                    {/* CTA */}
                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold tracking-widest uppercase text-[10px] transition-all hover:bg-teal-500 hover:shadow-xl hover:shadow-[#005E84]/20 active:scale-95 disabled:opacity-60"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </div>
            {/* Contact Form and Info */}
              <div 
                id="contact-info" 
                className={`lg:w-1/3 transform transition-all duration-1000 ${
                  isVisible.contactInfo ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
                }`}
              >
                <div className="relative group">
                  {/* The Main High-End Card */}
                  <div className="relative z-10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-3xl p-10 border border-gray-50 overflow-hidden">
                    
                    {/* Background Decorative Pattern (Subtle) */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#005E84]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

                    <header className="mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Let’s Start <br />
                        <span className="font-serif italic font-light text-[#005E84]">Your Story</span>
                      </h2>
                    </header>

                    <div className="space-y-8">
                      {/* Contact Block: Digital */}
                      <div className="relative pb-8 border-b border-gray-100 group/item">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Electronic Mail</p>
                        <a href="mailto:concierge@toureaz.com" className="text-xl font-medium text-gray-900 hover:text-[#005E84] transition-colors duration-300 flex justify-between items-center">
                          concierge@toureaz.com
                          <span className="opacity-0 group-hover/item:opacity-100 transition-opacity transform translate-x-2 group-hover/item:translate-x-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                          </span>
                        </a>
                      </div>

                      {/* Contact Block: Direct Line */}
                      <div className="relative pb-8 border-b border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Private Line</p>
                        <p className="text-xl font-medium text-gray-900">+1 (888) 456-7890</p>
                        <span className="absolute right-0 bottom-8 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                          Online Now
                        </span>
                      </div>

                      {/* Contact Block: Presence */}
                      <div className="relative">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Our Presence</p>
                        <p className="text-xl font-medium text-gray-900 leading-tight">
                          The Executive Suite, 123 <br />
                          Luxe Way, London
                        </p>
                      </div>
                    </div>

                    {/* Modern Interaction: Floating "Message Me" Button */}
                    <div className="mt-12">
                      <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold tracking-widest uppercase text-[10px] transition-all hover:bg-teal-500 hover:shadow-xl hover:shadow-[#005E84]/20 active:scale-95">
                        Send a Direct Message
                      </button>
                    </div>
                  </div>

                  {/* Floating "Experience" Tag (Offset behind card) */}
                  <div className="absolute -bottom-6 -left-6 z-20 bg-teal-300 text-white p-6 rounded-2xl shadow-2xl hidden lg:block transform group-hover:-rotate-3 transition-transform duration-500">
                    <div className="text-2xl font-bold leading-none">99%</div>
                    <p className="text-[8px] uppercase tracking-widest mt-1 opacity-80">Guest Satisfaction</p>
                  </div>
                </div>
              </div>
          </div>
        </main>
    </div>
  );
};

export default Contact;