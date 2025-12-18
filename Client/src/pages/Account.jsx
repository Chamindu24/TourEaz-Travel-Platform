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
        <div className="bg-white border border-black/10 shadow-xl rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-[#B7C5C7] flex items-center gap-3">
            <span className="inline-flex border border-teal-500 items-center justify-center h-12 w-12 rounded-full bg-teal-50 text-teal-500 text-2xl font-bold mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5" />
              </svg>
            </span>
            <h1 className="text-3xl font-extrabold text-teal-500 tracking-tight">My Account</h1>

            <div className="md:ml-auto">
            {user.userType === 'service-provider' && (
              <button
                onClick={() => navigate('/service-provider/dashboard')}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-white border-2 hover:border-teal-500 hover:text-black hover:scale-105 duration-300  transition-colors"
              >
                Manage Services
              </button>
            )}
          </div>
          </div>
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
                    {transportationBookings.map(booking => (
                      <div key={booking._id} className="bg-gradient-to-br from-white to-teal-50 shadow-md rounded-lg p-6 border border-teal-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-teal-700">
                              {booking.vehicle?.name || 'Transportation Service'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Type: {booking.vehicle?.type || 'N/A'}
                            </p>
                            <div className="mt-3 text-sm text-gray-700 space-y-1">
                              <p>📅 Date: {booking.tripDetails?.date ? new Date(booking.tripDetails.date).toLocaleDateString() : 'N/A'}</p>
                              <p>⏰ Duration: {booking.tripDetails?.days ? `${booking.tripDetails.days} day(s)` : 'N/A'}</p>
                              <p>Status: <span className={`font-semibold ${
                                booking.status === 'Confirmed' ? 'text-green-600' :
                                booking.status === 'Pending' ? 'text-yellow-600' :
                                booking.status === 'Cancelled' ? 'text-red-600' : 'text-gray-600'
                              }`}>{booking.status || 'Pending'}</span></p>
                            </div>
                          </div>
                          <div className="text-right min-w-[140px]">
                            <p className="text-xs text-gray-500">Booking Ref</p>
                            <p className="text-sm font-bold text-teal-600">{booking.bookingReference}</p>
                            {booking.pricing?.totalPrice && (
                              <p className="text-2xl font-bold text-teal-700 mt-2">
                                ${booking.pricing.totalPrice}
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
                    {activityBookings.map(booking => (
                      <div key={booking._id} className="bg-[#B7C5C7]/60 shadow-sm rounded-lg p-4 border border-[#B7C5C7]">
                        <div className="flex flex-col md:flex-row gap-4 md:h-32">
                          {/* Activity Image */}
                          <div className="md:w-48 flex-shrink-0 h-32 md:h-full flex items-stretch">
                            {booking.activity?.image ? (
                              <img 
                                src={booking.activity.image} 
                                alt={booking.activity.title || 'Activity'} 
                                className="w-full h-full object-cover rounded" 
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Activity Details */}
                          <div className="flex-1 flex flex-col md:flex-row justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-[#0A435C] mb-2">
                                {booking.activity?.title || booking.customerDetails?.fullName || 'Activity Booking'}
                              </h4>
                              
                              {booking.activity?.location && (
                                <p className="text-sm text-[#075375] mb-2">
                                  📍 {booking.activity.location}
                                </p>
                              )}
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#075375]">
                                <div>
                                  <span className="font-medium">Date:</span> {booking.bookingDetails?.date ? new Date(booking.bookingDetails.date).toLocaleDateString() : 'N/A'}
                                </div>
                                <div>
                                  <span className="font-medium">Guests:</span> {booking.bookingDetails?.guests || 'N/A'}
                                </div>
                                {booking.activity?.duration && (
                                  <div>
                                    <span className="font-medium">Duration:</span> {booking.activity.duration} hours
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Status:</span> 
                                  <span className={`ml-1 font-medium ${
                                    booking.status === 'Confirmed' ? 'text-green-600' :
                                    booking.status === 'Pending' ? 'text-yellow-600' :
                                    booking.status === 'Cancelled' ? 'text-red-600' : 'text-[#0A435C]'
                                  }`}>
                                    {booking.status || 'Pending'}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Type:</span> {booking.type || 'inquiry'}
                                </div>
                                {booking.activity?.type && (
                                  <div>
                                    <span className="font-medium">Category:</span> {booking.activity.type}
                                  </div>
                                )}
                              </div>
                              
                              {booking.bookingDetails?.specialRequests && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-[#075375]">Special Requests:</span>
                                  <p className="text-sm text-[#0A435C] mt-1">{booking.bookingDetails.specialRequests}</p>
                                </div>
                              )}
                              
                              {!booking.activity && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                                  ⚠️ Activity details not available. This booking might be for a deleted activity.
                                </div>
                              )}
                            </div>
                            
                            {/* Price and Booking Reference */}
                            <div className="text-right min-w-[140px] mt-4 md:mt-0">
                              <div className="text-xs text-[#8b9482] mb-1">Booking Ref</div>
                              <div className="text-sm font-medium text-[#005E84] mb-2">{booking.bookingReference}</div>
                              
                              {booking.pricing?.totalPrice && (
                                <div className="text-2xl font-bold text-[#0A435C]">
                                  ${booking.pricing.totalPrice}
                                </div>
                              )}
                              
                              {booking.pricing?.pricePerPerson && (
                                <div className="text-xs text-[#8b9482] mt-1">
                                  ${booking.pricing.pricePerPerson} per person
                                </div>
                              )}
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