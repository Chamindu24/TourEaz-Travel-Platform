import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import activityBookingsAPI from '../services/activityBookingsAPI';
import bookingsAPI from '../services/bookingsAPI';
import toursAPI from '../services/toursAPI';
import transportationBookingsAPI from '../services/transportationBookingsAPI';
import { useNavigate } from 'react-router-dom';


const Account = () => {
  const { user } = useContext(AuthContext);
  const [activityBookings, setActivityBookings] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [tourBookings, setTourBookings] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [transportationBookings, setTransportationBookings] = useState([]);
  const [loadingTransportation, setLoadingTransportation] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();



  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await activityBookingsAPI.getMy();
        console.log('Activity bookings response:', res);
        if (res.success) {
          console.log('Activity bookings data:', res.data);
          console.log('Number of bookings:', res.data.length);
          
          // Debug each booking
          res.data.forEach((booking, index) => {
            console.log(`Booking ${index + 1}:`, {
              id: booking._id,
              reference: booking.bookingReference,
              hasActivity: !!booking.activity,
              activityTitle: booking.activity?.title,
              activityImage: booking.activity?.image,
              type: booking.type,
              status: booking.status
            });
          });
          
          setActivityBookings(res.data);
        } else {
          console.error('API response not successful:', res);
        }
      } catch (err) {
        console.error('Failed to fetch activity bookings', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
      } finally {
        setLoadingActivity(false);
      }
    };
    
    const fetchHotels = async () => {
      try {
        const res = await bookingsAPI.getMy();
        if (Array.isArray(res)) setHotelBookings(res);
      } catch (err) {
        console.error('Failed to fetch hotel bookings', err);
      } finally {
        setLoadingHotels(false);
      }
    };
    
    const fetchTours = async () => {
      try {
        const res = await toursAPI.getMy();
        if (Array.isArray(res)) setTourBookings(res);
      } catch (err) {
        console.error('Failed to fetch tour bookings', err);
      } finally {
        setLoadingTours(false);
      }
    };
    
    const fetchTransportation = async () => {
      try {
        const res = await transportationBookingsAPI.getMy();
        if (Array.isArray(res)) setTransportationBookings(res);
        else setTransportationBookings(res?.data || []);
      } catch (err) {
        console.error('Failed to fetch transportation bookings', err);
        setTransportationBookings([]);
      } finally {
        setLoadingTransportation(false);
      }
    };
    
    fetchActivities();
    fetchHotels();
    fetchTours();
    fetchTransportation();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your account</h2>
          <a href="/login" className="text-blue-600 hover:text-blue-800">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mt-4 py-10">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white border border-black/10 shadow-md rounded-xl overflow-hidden">
          <header className="px-6 py-8">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              
              <div className="space-y-4">

                <div className="flex items-center gap-5">
                  {/* Abstract Icon Style */}
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 p-[2px]">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-teal-600">
                          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {/* Online Status Indicator */}
                    <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-white"></span>
                  </div>

                  <div>
                    <h1 className="text-3xl font-light text-slate-900">
                      Account <span className="font-semibold">Overview</span>
                    </h1>
                    <p className="text-slate-500 text-sm">Updated 2 minutes ago</p>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex items-center gap-3">
                {user.userType === 'service-provider' && (
                  <button
                    onClick={() => navigate('/service-provider/dashboard')}
                    className="group relative inline-flex items-center gap-2 px-6 py-3 font-semibold text-slate-700 transition-all duration-200 bg-white border border-slate-500 rounded-xl hover:bg-slate-50 hover:border-teal-500/30 hover:shadow-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-teal-500 group-hover:animate-pulse"></span>
                    Manage Services
                  </button>
                )}
              </div>
            </div>
          </header>
          {/* Tabs Navigation */}
          <div className="bg-white backdrop-blur-md sticky top-0 z-10 border-b border-gray-400 px-6">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'profile', label: 'Profile' },
                { id: 'hotels', label: 'Hotels Bookings' },
                { id: 'tours', label: 'Tours Bookings' },
                { id: 'activities', label: 'Activities Bookings' },
                { id: 'transportation', label: 'Travel Bookings' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-6 py-5 text-md font-bold transition-all duration-300 whitespace-nowrap
                      ${isActive 
                        ? 'text-teal-500' 
                        : 'text-gray-500 hover:text-teal-500 hover:bg-gray-50/50'}
                    `}
                  >

                    <span className="tracking-tight  text-md">{tab.label}</span>
                    
                    {/* Professional Active Indicator Line */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full shadow-[0_-4px_12px_rgba(20,184,166,0.4)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-8 py-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
                
                {/* Profile Header Card */}
                <div className="relative overflow-hidden bg-teal-50 rounded-3xl border border-teal-500 shadow-sm p-8">
                  {/* Subtle Background Accent */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50" />
                  
                  <div className="relative flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar with Ring */}
                    <div className="relative group">
                      <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white text-4xl font-bold shadow-xl ring-4 ring-teal-50 transition-transform duration-300 group-hover:scale-105">
                        {user.firstName?.[0] || 'U'}
                      </div>
                      <div className="absolute -bottom-0 -right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm" title="Online"></div>
                    </div>

                    {/* Name & Quick Stats */}
                    <div className="flex-1 text-center md:text-left space-y-3">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                          {user.firstName} {user.lastName}
                        </h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-teal-50 text-teal-500 text-xs font-bold uppercase tracking-wider border border-teal-100">
                            {user.role}
                          </span>
                          <span className="text-gray-600 text-sm font-medium">
                            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Email Address', value: user.email, icon: 'Email', color: 'blue' },
                    { label: 'Location/Country', value: user.country, icon: 'Globe', color: 'purple' },
                    { label: 'Phone Number', value: user.phoneNumber, icon: 'Phone', color: 'teal' },
                    { label: 'Account Security', value: 'Two-Factor Enabled', icon: 'Shield', color: 'green' }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="group bg-white p-6 rounded-2xl border border-teal-500 hover:border-teal-500/30 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                          {/* Note: In a real app, replace these strings with Lucide Icons like <Mail size={20} /> */}
                          <span className="text-xl font-serif">#</span> 
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.15em]">
                            {item.label}
                          </label>
                          <p className="text-gray-900 font-medium text-base truncate">
                            {item.value || <span className="text-gray-300 italic">Not provided</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security Footer Note */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-xs text-amber-800 font-medium">
                    We noticed a recent sign-in to your account. If you don’t recognize this activity, secure your account.
                  </p>
                </div>
              </div>
            )}

            {/* Hotel Bookings Tab */}
            {activeTab === 'hotels' && (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-teal-500 text-white p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75v-1.5A2.25 2.25 0 0110.5 3h3a2.25 2.25 0 012.25 2.25v1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v3.75M3 10.5v7.5A2.25 2.25 0 005.25 20.25h13.5A2.25 2.25 0 0021 18V10.5M3 10.5h18" />
                    </svg>
                  </span>
                  <h3 className="text-lg font-semibold text-[#005E84]">My Hotel/Resort Bookings</h3>
                </div>
                {loadingHotels ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005E84]"></div>
                  </div>
                ) : hotelBookings.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-teal-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75v-1.5A2.25 2.25 0 0110.5 3h3a2.25 2.25 0 012.25 2.25v1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v3.75M3 10.5v7.5A2.25 2.25 0 005.25 20.25h13.5A2.25 2.25 0 0121 18V10.5M3 10.5h18" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">No hotel bookings found.</p>
                    <p className="text-sm text-gray-500 mb-4">Ready to explore? Book your stay today!</p>
                    <a 
                      href="/hotels" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-md font-semibold hover:bg-white hover:text-black border-2 border-teal-500 hover:scale-105 duration-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      Browse Hotels
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotelBookings.map(booking => (
                      <div key={booking._id} className="bg-[#B7C5C7]/60 shadow-sm rounded-lg p-4 border border-[#B7C5C7]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                            <h4 className="text-md font-semibold text-[#005E84]">
                              {booking.hotel?.name || 'Hotel Information'}
                            </h4>
                            <p className="text-sm text-[#075375] mt-1">
                              Room: {booking.room?.roomName || booking.room?.roomType || 'N/A'}
                            </p>
                            <div className="mt-2 text-sm text-[#0A435C] space-y-1">
                              <p>Check-in: {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A'}</p>
                              <p>Check-out: {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A'}</p>
                              <p>Guests: {booking.adults || 0} Adults, {booking.children || 0} Children</p>
                              <p>Nights: {booking.nights || 'N/A'}</p>
                              <p>Status: <span className={`font-medium ${
                                booking.status === 'Confirmed' ? 'text-[#005E84]' :
                                booking.status === 'Pending' ? 'text-[#075375]' :
                                booking.status === 'Cancelled' ? 'text-red-600' : 'text-[#0A435C]'
                              }`} title={
                                booking.status === 'Confirmed' ? 'Your booking is confirmed.' :
                                booking.status === 'Pending' ? 'Your booking is pending confirmation.' :
                                booking.status === 'Cancelled' ? 'Your booking was cancelled.' : 'Status unknown.'
                              }>{booking.status || 'Pending'}</span></p>
                            </div>
                          </div>
                          <div className="text-right min-w-[120px]">
                            <p className="text-xs text-[#8b9482]">Booking Ref</p>
                            <p className="text-sm font-medium text-[#005E84]">{booking.bookingReference}</p>
                            {booking.priceBreakdown?.total && (
                              <p className="text-lg font-bold text-[#005E84] mt-2">
                                ${booking.priceBreakdown.total}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Transportation Bookings Tab */}
            {activeTab === 'transportation' && (
              <div className="mb-4">
                <div className="flex justify-center items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  </span>
                  <h3 className="text-lg font-semibold text-teal-200">My Transportation Bookings</h3>
                </div>
                {loadingTransportation ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                  </div>
                ) : transportationBookings.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-teal-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">No transportation bookings found.</p>
                    <p className="text-sm text-gray-500 mb-4">Ready to explore? Book your ride today!</p>
                    <a 
                      href="/transportations" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-md font-semibold hover:bg-white hover:text-black border-2 border-teal-500 hover:scale-105 duration-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      Browse Transportation
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transportationBookings.map((booking) => (
                      <div 
                        key={booking._id} 
                        className="group relative bg-white border border-gray-200 rounded-2xl p-6 mb-4 hover:border-teal-500/50 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300"
                      >
                        {/* Status Badge - Floating Top Right */}
                        <div className="absolute top-6 right-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase border ${
                            booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            booking.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {booking.status || 'Pending'}
                          </span>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                          
                          {/* 1. Vehicle Icon & Main Info */}
                          <div className="flex items-center gap-5 flex-1">
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                              {/* Replace with a real Lucide Icon if available */}
                              <span className="text-3xl">
                                {booking.vehicle?.type === 'Car' ? '🚗' : '🚐'}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                                {booking.vehicle?.type || 'Vehicle'}
                              </p>
                              <h4 className="text-xl font-bold text-gray-900 leading-none">
                                {booking.vehicle?.name || 'Standard Service'}
                              </h4>
                              <p className="text-sm font-medium text-gray-500">
                                Ref: <span className="text-gray-900">#{booking.bookingReference}</span>
                              </p>
                            </div>
                          </div>

                          {/* 2. Trip Details Grid */}
                          <div className="flex flex-wrap items-center gap-x-12 gap-y-4 border-t border-gray-100 pt-6 lg:border-t-0 lg:pt-0 lg:px-8 lg:border-x lg:border-gray-100">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase text-gray-400">Date</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {booking.tripDetails?.date ? new Date(booking.tripDetails.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase text-gray-400">Duration</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {booking.tripDetails?.days ? `${booking.tripDetails.days} Full Day(s)` : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* 3. Pricing & Actions */}
                          <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center min-w-[120px] gap-2">
                            <div className="text-left lg:text-right">
                              <p className="text-[10px] font-bold uppercase text-gray-400 leading-none mb-1">Total Amount</p>
                              <p className="text-2xl font-black text-gray-900 tracking-tight">
                                ${booking.pricing?.totalPrice?.toLocaleString() || '0'}
                              </p>
                            </div>
                            

                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Tour Bookings Tab */}
            {activeTab === 'tours' && (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-teal-500 text-white p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </span>
                  <h3 className="text-lg font-semibold text-[#075375]">My Tour Bookings</h3>
                </div>
                {loadingTours ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075375]"></div>
                  </div>
                ) : tourBookings.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-teal-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">No tour bookings found.</p>
                    <p className="text-sm text-gray-500 mb-4">Ready to explore? Book your tour today!</p>
                    <a 
                      href="/tours" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-md font-semibold hover:bg-white hover:text-black border-2 border-teal-500 hover:scale-105 duration-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      Browse Tours
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tourBookings.map(booking => (
                      <div key={booking._id} className="bg-[#B7C5C7]/60 shadow-sm rounded-lg p-4 border border-[#B7C5C7]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                            <h4 className="text-md font-semibold text-[#075375]">
                              {booking.tour?.title || booking.tourName || 'Tour Information'}
                            </h4>
                            <div className="mt-2 text-sm text-[#0A435C] space-y-1">
                              <p>Date: {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</p>
                              <p>Participants: {booking.participants || booking.guests || 'N/A'}</p>
                              <p>Status: <span className={`font-medium ${
                                booking.status === 'Confirmed' ? 'text-[#005E84]' :
                                booking.status === 'Pending' ? 'text-[#075375]' :
                                booking.status === 'Cancelled' ? 'text-red-600' : 'text-[#0A435C]'
                              }`} title={
                                booking.status === 'Confirmed' ? 'Your booking is confirmed.' :
                                booking.status === 'Pending' ? 'Your booking is pending confirmation.' :
                                booking.status === 'Cancelled' ? 'Your booking was cancelled.' : 'Status unknown.'
                              }>{booking.status || 'Pending'}</span></p>
                            </div>
                          </div>
                          <div className="text-right min-w-[120px]">
                            {booking.totalPrice && (
                              <p className="text-lg font-bold text-[#075375]">
                                ${booking.totalPrice}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activity Bookings Tab */}
            {activeTab === 'activities' && (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-teal-500 text-white p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </span>
                  <h3 className="text-lg font-semibold text-[#0A435C]">My Activity Bookings</h3>
                </div>
                {loadingActivity ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A435C]"></div>
                  </div>
                ) : activityBookings.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-teal-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">No activity bookings found.</p>
                    <p className="text-sm text-gray-500 mb-4">Ready to explore? Book your activity today!</p>
                    <a 
                      href="/activities" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-md font-semibold hover:bg-white hover:text-black border-2 border-teal-500 hover:scale-105 duration-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      Browse Activities
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityBookings.map((booking) => (
                      <div 
                        key={booking._id} 
                        className="group bg-white border border-gray-100 rounded-3xl overflow-hidden mb-6 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500"
                      >
                        <div className="flex flex-col md:flex-row">
                          
                          {/* 1. High-Quality Image Section */}
                          <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                            {booking.activity?.image ? (
                              <img 
                                src={booking.activity.image} 
                                alt={booking.activity.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-300">
                                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.581-1.581a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                              </div>
                            )}
                            {/* Floating Category Tag */}
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                {booking.activity?.type || 'Adventure'}
                              </span>
                            </div>
                          </div>

                          {/* 2. Content Section */}
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-extrabold text-gray-900 leading-tight group-hover:text-teal-600 transition-colors">
                                  {booking.activity?.title || 'Exclusive Experience'}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter uppercase border ${
                                  booking.status === 'Confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 
                                  'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                  {booking.status || 'Processing'}
                                </span>
                              </div>
                              
                              <p className="flex items-center text-sm text-gray-500 font-medium mb-4">
                                <span className="mr-1">📍</span> {booking.activity?.location || 'Location Pending'}
                              </p>

                              {/* Data Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-50">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Scheduled Date</p>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {booking.bookingDetails?.date ? new Date(booking.bookingDetails.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Group Size</p>
                                  <p className="text-sm font-semibold text-gray-800">{booking.bookingDetails?.guests || '1'} Person(s)</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p>
                                  <p className="text-sm font-semibold text-gray-800">{booking.activity?.duration || '2'} Hours</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Booking ID</p>
                                  <p className="text-sm font-mono font-bold text-teal-600">{booking.bookingReference}</p>
                                </div>
                              </div>
                            </div>

                            {/* 3. Pricing Footer Area */}
                            <div className="mt-6 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                                <span className="text-base">⚡</span> Instant Confirmation
                              </div>
                              
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Paid</p>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-sm font-bold text-gray-900">$</span>
                                  <span className="text-2xl font-black text-gray-900 leading-none">
                                    {booking.pricing?.totalPrice?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;