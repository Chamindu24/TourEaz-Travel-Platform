import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import activityBookingsAPI from '../services/activityBookingsAPI';
import bookingsAPI from '../services/bookingsAPI';
import toursAPI from '../services/toursAPI';

const Account = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activityBookings, setActivityBookings] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [tourBookings, setTourBookings] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

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
    
    fetchActivities();
    fetchHotels();
    fetchTours();
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
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white/10 shadow-xl rounded-md overflow-hidden">
          <div className="px-8 py-6 border-b border-[#B7C5C7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#B7C5C7] text-[#005E84] text-2xl font-bold mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5" />
                </svg>
              </span>
              <h1 className="text-3xl font-extrabold text-[#005E84] tracking-tight">My Account</h1>
            </div>

            {/* Service Provider Dashboard Button */}
            {user?.userType === 'service-provider' && (
              <button
                onClick={() => navigate('/service-provider/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-white hover:text-black border-2 hover:border-teal-500 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <span className="font-semibold">Manage Services</span>
              </button>
            )}
          </div>
          {/* Tabs Navigation */}
          <div className="px-8 pt-4 pb-0 border-b border-[#E7E9E5] bg-[#B7C5C7] flex flex-wrap gap-2">
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'profile' ? 'bg-[#E7E9E5] text-[#005E84] border-b-2 border-[#005E84]' : 'text-[#075375] hover:text-[#005E84]'}`}>Profile</button>
            <button onClick={() => setActiveTab('hotels')} className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'hotels' ? 'bg-[#E7E9E5] text-[#005E84] border-b-2 border-[#005E84]' : 'text-[#075375] hover:text-[#005E84]'}`}>Hotel Bookings</button>
            <button onClick={() => setActiveTab('tours')} className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'tours' ? 'bg-[#E7E9E5] text-[#005E84] border-b-2 border-[#005E84]' : 'text-[#075375] hover:text-[#005E84]'}`}>Tour Bookings</button>
            <button onClick={() => setActiveTab('activities')} className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'activities' ? 'bg-[#E7E9E5] text-[#005E84] border-b-2 border-[#005E84]' : 'text-[#075375] hover:text-[#005E84]'}`}>Activity Bookings</button>
          </div>
          <div className="px-8 py-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">First Name</label>
                  <p className="mt-1 text-base text-gray-900 font-medium">{user.firstName}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Last Name</label>
                  <p className="mt-1 text-base text-gray-900 font-medium">{user.lastName}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <p className="mt-1 text-base text-gray-900 font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Country</label>
                  <p className="mt-1 text-base text-gray-900 font-medium">{user.country}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
                  <p className="mt-1 text-base text-gray-900 font-medium">{user.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Account Type</label>
                  <p className="mt-1 text-base text-gray-900 font-medium capitalize">{user.role}</p>
                </div>
              </div>
            )}

            {/* Hotel Bookings Tab */}
            {activeTab === 'hotels' && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#B7C5C7] text-[#005E84]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
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
                  <p className="text-sm text-[#8b9482]">No hotel bookings found.</p>
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

            {/* Tour Bookings Tab */}
            {activeTab === 'tours' && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#E7E9E5] text-[#075375]">
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
                  <p className="text-sm text-[#8b9482]">No tour bookings found.</p>
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
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#E7E9E5] text-[#0A435C]">
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
                  <div className="text-center py-8">
                    <div className="text-sm text-[#8b9482] mb-4">No activity bookings found.</div>
                    <div className="text-xs text-gray-500 mb-4">
                      <a href="/activities" className="text-[#005E84] hover:text-[#0A435C] underline">
                        Browse activities and make your first booking!
                      </a>
                    </div>
                    {import.meta.env.DEV && (
                      <button
                        onClick={async () => {
                          try {
                            console.log('Creating test booking...');
                            const result = await activityBookingsAPI.createTest();
                            console.log('Test booking created:', result);
                            // Refresh the bookings
                            const res = await activityBookingsAPI.getMy();
                            if (res.success) {
                              setActivityBookings(res.data);
                            }
                          } catch (error) {
                            console.error('Failed to create test booking:', error);
                            alert('Failed to create test booking: ' + (error.response?.data?.error || error.message));
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        Create Test Booking (Dev)
                      </button>
                    )}
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