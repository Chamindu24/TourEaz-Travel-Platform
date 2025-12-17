import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingForm = ({ activity }) => {
    const navigate = useNavigate();
    const { requireAuthForBooking } = useAuthCheck();
    const [selectedDate, setSelectedDate] = useState('');    const [guests, setGuests] = useState(2);
    const [totalPrice, setTotalPrice] = useState(activity.price * 2);
    // Use maxParticipants from the database or fallback to 10
    const maxGuests = activity.maxParticipants || 10;
    
    // Update total price when guests or activity changes
    useEffect(() => {
        setTotalPrice(activity.price * guests);
    }, [guests, activity]);
    
    const handleSubmit = (e, bookingType = 'inquiry') => {
        e.preventDefault();
        
        if (!selectedDate) { 
            alert('Please select a date');
            return;
        }

        // Format date to avoid timezone issues
        const formatDateToString = (date) => {
            if (!date) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Prepare booking data
        const bookingData = {
            activityId: activity._id || activity.id,
            selectedDate: formatDateToString(selectedDate),
            guests,
            activityTitle: activity.title,
            bookingType
        };

        // Only check authentication for booking, not for inquiries
        if (bookingType === 'booking') {
            if (!requireAuthForBooking('activity', bookingData)) {
                return; // User will be redirected to login
            }
        }

        // Proceed to booking/inquiry page
        navigate(`/activities/${activity._id || activity.id}/booking`, {
            state: {
                selectedDate: formatDateToString(selectedDate),
                guests,
                bookingType
            }
        });
    };
    
    // Generate array of numbers for guest dropdown
    const guestOptions = Array.from({ length: maxGuests }, (_, i) => i + 1);
    
    // Calculate dates for the next 30 days (excluding today)
    const generateDateOptions = () => {
        const dates = [];
        const today = new Date();
        
        for (let i = 1; i <= 30; i++) { 
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        
        return dates;
    };
    
    const availableDates = generateDateOptions();

    return (
        <div className="bg-white/50 rounded-md shadow-md overflow-hidden sticky top-24">
            <div className="bg-teal-500 flex  items-baseline gap-2 text-white p-4 rounded-t-lg shadow-md">
            <div className="text-3xl tracking-wider font-bold">${activity.price}</div>
            <div className="text-sm opacity-90">per person</div>
            </div>

            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Date Picker (react-datepicker) */}
                <div>
                    <label htmlFor="date" className="block text-lapis_lazuli-500 font-medium mb-2">Select Date</label>
                    <DatePicker
                        id="date"
                        selected={selectedDate}
                        onChange={date => setSelectedDate(date)}
                        minDate={(() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 1);
                            return d;
                        })()}
                        maxDate={(() => {
                            const d = new Date();
                            d.setFullYear(d.getFullYear() + 1);
                            return d;
                        })()}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Choose a date"
                        className="w-full px-3 py-2 border border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                
                {/* Number of Guests */}
                <div>
                    <label htmlFor="guests" className="block text-lapis_lazuli-500 font-medium mb-2">Number of Guests</label>
                    <select
                        id="guests"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        {guestOptions.map((num) => (
                            <option key={num} value={num}>
                                {num} {num === 1 ? 'guest' : 'guests'}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Price Calculation */}
                <div className="border-t border-b border-ash_gray-200 py-4 mt-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-lapis_lazuli-500">${activity.price} × {guests} guests</span>
                        <span className="font-medium">${activity.price * guests}</span>
                    </div>
                    <div className="flex justify-between text-indigo_dye-500 font-bold">
                        <span>Total</span>
                        <span>${totalPrice}</span>
                    </div>
                </div>
                
                {/* Submit Buttons */}
                <div className="space-y-3">
                    <button 
                        type="button"
                        onClick={(e) => handleSubmit(e, 'inquiry')}
                        className="w-full py-3 px-4 bg-white text-black border-2 border-teal-500 rounded-md font-medium hover:bg-teal-500 hover:text-white transition-colors focus:outline-none focus:ring-2 duration-300 focus:ring-teal-500 focus:ring-offset-2"
                    >
                        Send Inquiry
                    </button>
                    
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'booking')}
                        className="w-full bg-teal-500 text-white border-2  hover:bg-white duration-300 hover:text-black hover:border-teal-500 font-semibold py-4 px-6 rounded-md transition-all  flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                        Book Now
                    </button>
                </div>
                
                <p className="text-gray-600 text-sm mt-4">
                    <strong>Send Inquiry:</strong> Request information and pricing details<br/>
                    <strong>Book Now:</strong> Reserve your activity (payment details will be provided separately)
                </p>
            </form>
        </div>
    );
};

export default BookingForm;
