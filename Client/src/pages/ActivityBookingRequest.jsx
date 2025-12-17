
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// If you have a ConfirmationModal component, import it. Otherwise, use a simple modal inline.
// import ConfirmationModal from '../components/booking/ConfirmationModal';

const ActivityBookingRequest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [bookingType, setBookingType] = useState('inquiry'); // 'inquiry' or 'booking'
    const [formData, setFormData] = useState({
        date: '',
        guests: 2,
        fullName: '',
        email: '',
        phone: '',
        specialRequests: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingReference, setBookingReference] = useState('');
    const [bookingId, setBookingId] = useState('');

    // Get pre-selected data from state if available (from the activity detail page)
    useEffect(() => {
        if (location.state?.selectedDate) {
            setFormData(prev => ({
                ...prev,
                date: location.state.selectedDate,
                guests: location.state.guests || 2
            }));
        }
        if (location.state?.bookingType) {
            setBookingType(location.state.bookingType);
        }
    }, [location.state]);

    // Fetch activity data
    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                // Get the activity by its ID using the API
                const response = await axios.get(`/activities/${id}`);
                const foundActivity = response.data.data || response.data;
                if (foundActivity) {
                    setActivity(foundActivity);
                }
            } catch (error) {
                setError('Failed to load activity details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchActivity();
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        
        try {
            const bookingData = {
                activityId: id,
                type: bookingType, // Add booking type
                customerDetails: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone
                },
                bookingDetails: {
                    date: formData.date,
                    guests: parseInt(formData.guests),
                    specialRequests: formData.specialRequests
                },
                pricing: {
                    pricePerPerson: activity.price
                }
            };
            
            const response = await axios.post('/activity-bookings', bookingData, {
                withCredentials: true // Always send credentials if available
            });
            if (response.data.success) {
                setBookingReference(response.data.data.bookingReference);
                setBookingId(response.data.data._id);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Booking error:', error);
            setError(error.response?.data?.error || 'Failed to create booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        navigate('/');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-lapis_lazuli-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 lg:px-6">

                <div className="bg-platinum-500 border border-lapis_lazuli-400 text-lapis_lazuli-500 px-4 py-3 rounded">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-lapis_lazuli-500 text-white px-4 py-2 rounded hover:bg-lapis_lazuli-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-platinum-500 border border-lapis_lazuli-400 text-lapis_lazuli-500 px-4 py-3 rounded">
                    <h2 className="text-xl font-bold mb-2">Activity Not Found</h2>
                    <p>Sorry, we couldn't find the activity you're looking for.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">

                <div className="max-w-6xl mx-auto ">
                  <div className='text-center'>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 font-display">
                        {bookingType === 'inquiry' ? 'Send Activity Inquiry' : 'Complete Your Booking'}
                    </h1>
                    <p className="text-gray-600 mb-8">
                        {bookingType === 'inquiry' 
                            ? 'Please fill in your details to send an inquiry about this activity.' 
                            : 'Please review the details and fill in your information to complete your booking request.'
                        }
                    </p>
                </div>
                    <div className='flex flex-row gap-6'>
                        {/* Activity Summary - Sticky Vertical Card */}
                        <div className=" flex-shrink-0">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                                <div className="flex flex-col">
                                    <div className="mb-4">
                                        <img 
                                            src={activity.image} 
                                            alt={activity.title} 
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-teal-200 mb-3">{activity.title}</h2>
                                        <div className="flex items-center mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="ml-1 text-sm text-gray-600">{activity.rating} ({activity.reviewCount} reviews)</span>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="text-gray-600">
                                                <span className="font-medium">Location:</span> {activity.location}
                                            </div>
                                            <div className="text-gray-600">
                                                <span className="font-medium">Duration:</span> {activity.duration} hour{activity.duration !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className="border-t pt-4">
                                            <div className="text-teal-200 font-bold text-2xl">
                                                ${activity.price} <span className="text-sm font-normal text-gray-600">per person</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Booking Form */}
                        <div className="flex-1">
                            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Date Selection */}
                                <div>
                                    <label htmlFor="date" className="block text-teal-200 font-medium mb-2">Date *</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-ash_gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                        min={(() => {
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            return tomorrow.toISOString().split('T')[0];
                                        })()}
                                    />
                                </div>
                                {/* Number of Guests */}
                                <div>
                                    <label htmlFor="guests" className="block text-teal-200 font-medium mb-2">Number of Guests *</label>
                                    <select
                                        id="guests"
                                        name="guests"
                                        value={formData.guests}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-ash_gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                    >
                                        {Array.from({ length: activity.maxParticipants || 10 }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Full Name */}
                                <div>
                                    <label htmlFor="fullName" className="block text-teal-200 font-medium mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-ash_gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-teal-200 font-medium mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-ash_gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-teal-200 font-medium mb-2">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-ash_gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                            </div>
                            {/* Special Requests */}
                            <div className="mb-6">
                                <label htmlFor="specialRequests" className="block text-teal-200 font-medium mb-2">Special Requests (Optional)</label>
                                <textarea
                                    id="specialRequests"
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-ash_gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 h-32"
                                    placeholder="Any specific dietary requirements, accessibility needs, or other requests..."
                                ></textarea>
                            </div>
                            {/* Price Calculation */}
                            <div className="border-t border-b border-ash_gray-200 py-4 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-teal-200">${activity.price} × {formData.guests} guests</span>
                                    <span className="font-medium">${activity.price * formData.guests}</span>
                                </div>
                                <div className="flex justify-between text-teal-200 font-bold">
                                    <span>Total</span>
                                    <span>${activity.price * formData.guests}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/activities/${id}`)}
                                    className="px-6 py-3 font-semibold border-teal-500 text-black rounded-md hover:bg-teal-500 hover:text-white border-2 duration-300 hover:scale-105"
                                    disabled={submitting}
                                >
                                    Back to Activity
                                </button>
                                <button
                                    type="submit"
                                    className={`px-6 py-3 bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 font-medium rounded-lg ${
                                        submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-600'
                                    } transition-colors`}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Processing...' : (bookingType === 'inquiry' ? 'Send Inquiry' : 'Send Booking Request')}
                                </button>
                            </div>
                            {error && (
                                <div className="mt-4 p-3 bg-platinum-50 text-lapis_lazuli-500 rounded-md">
                                    {error}
                                </div>
                            )}
                        </form>
                        </div>
                    </div>
                </div>
            </div>
            {/* Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-teal-300 mb-4">
                            {bookingType === 'inquiry' ? 'Inquiry Sent!' : 'Booking Request Confirmed!'}
                        </h2>
                        <p className="mb-2">Your reference is <span className="font-mono font-bold">{bookingReference}</span>.</p>
                        <p className="mb-2">
                            {bookingType === 'inquiry' 
                                ? `Thank you for your inquiry about ${activity.title}. We will get back to you soon with availability and pricing details.`
                                : `Thank you for booking ${activity.title} on ${formData.date} for ${formData.guests} guest(s).`
                            }
                        </p>
                        {bookingType === 'booking' && (
                            <p className="mb-4">Total Price: <span className="font-bold">${activity.price * formData.guests}</span></p>
                        )}
                        {bookingType === 'inquiry' && (
                            <p className="mb-4 text-ash_gray-400">We will contact you within 24 hours with detailed information.</p>
                        )}
                        <button
                            onClick={handleModalClose}
                            className="w-full py-3 px-4 bg-teal-500 text-white rounded-md font-medium hover:bg-white hover:text-black border-2 hover:border-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityBookingRequest;
