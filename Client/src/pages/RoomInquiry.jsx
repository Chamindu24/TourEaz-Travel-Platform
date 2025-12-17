import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  IconButton,
  Divider,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

// Country codes for phone number selection
const countryCodes = [
  { code: "+1", label: "🇺🇸" },
  { code: "+44", label: "🇬🇧" },
  { code: "+91", label: "🇮🇳" },
  { code: "+61", label: "🇦🇺" },
  { code: "+49", label: "🇩🇪" },
  { code: "+33", label: "🇫🇷" },
  { code: "+81", label: "🇯🇵" },
  { code: "+86", label: "🇨🇳" },
  { code: "+971", label: "🇦🇪" },
  { code: "+7", label: "🇷🇺" },
  { code: "+55", label: "🇧🇷" },
  { code: "+34", label: "🇪🇸" },
  { code: "+39", label: "🇮🇹" },
  { code: "+82", label: "🇰🇷" },
  { code: "+92", label: "🇵🇰" },
  { code: "+90", label: "🇹🇷" },
  { code: "+27", label: "🇿🇦" },
  { code: "+234", label: "🇳🇬" },
  { code: "+20", label: "🇪🇬" },
  { code: "+351", label: "🇵🇹" },
  { code: "+31", label: "🇳🇱" },
  { code: "+46", label: "🇸🇪" },
  { code: "+41", label: "🇨🇭" },
  { code: "+32", label: "🇧🇪" },
  { code: "+43", label: "🇦🇹" },
  { code: "+47", label: "🇳🇴" },
  { code: "+45", label: "🇩🇰" },
  { code: "+380", label: "🇺🇦" },
  { code: "+66", label: "🇹🇭" },
  { code: "+65", label: "🇸🇬" },
  { code: "+64", label: "🇳🇿" },
  { code: "+63", label: "🇵🇭" },
  { code: "+60", label: "🇲🇾" },
  { code: "+62", label: "🇮🇩" },
  { code: "+58", label: "🇻🇪" },
  { code: "+57", label: "🇨🇴" },
  { code: "+56", label: "🇨🇱" },
  { code: "+52", label: "🇲🇽" },
  { code: "+51", label: "🇵🇪" },
  { code: "+48", label: "🇵🇱" },
  { code: "+40", label: "🇷🇴" },
  { code: "+420", label: "🇨🇿" },
  { code: "+36", label: "🇭🇺" },
  { code: "+98", label: "🇮🇷" },
  { code: "+212", label: "🇲🇦" },
  { code: "+213", label: "🇩🇿" },
  { code: "+216", label: "🇹🇳" },
  { code: "+94", label: "🇱🇰" },
  { code: "+880", label: "🇧🇩" },
  { code: "+972", label: "🇮🇱" },
  { code: "+353", label: "🇮🇪" },
  { code: "+354", label: "🇮🇸" },
  { code: "+505", label: "🇳🇮" },
  { code: "+509", label: "🇭🇹" },
  { code: "+93", label: "🇦🇫" },
  { code: "+995", label: "🇬🇪" },
  { code: "+374", label: "🇦🇲" },
  { code: "+993", label: "🇹🇲" },
  { code: "+998", label: "🇺🇿" },
  { code: "+675", label: "🇵🇬" },
  { code: "+679", label: "🇫🇯" },
  { code: "+676", label: "🇹🇴" },
  { code: "+960", label: "🇲🇻" },
  { code: "+248", label: "🇸🇨" },
  { code: "+267", label: "🇧🇼" },
  { code: "+254", label: "🇰🇪" },
  { code: "+255", label: "🇹🇿" },
  { code: "+256", label: "🇺🇬" },
  { code: "+233", label: "🇬🇭" },
  { code: "+225", label: "🇨🇮" },
  { code: "+221", label: "🇸🇳" },
  { code: "+218", label: "🇱🇾" },
  { code: "+964", label: "🇮🇶" },
  { code: "+967", label: "🇾🇪" },
  { code: "+965", label: "🇰🇼" },
  { code: "+966", label: "🇸🇦" },
  { code: "+973", label: "🇧🇭" },
  { code: "+974", label: "🇶🇦" },
  { code: "+968", label: "🇴🇲" },
  { code: "+961", label: "🇱🇧" },
  { code: "+963", label: "🇸🇾" },
  { code: "+249", label: "🇸🇩" },
  { code: "+211", label: "🇸🇸" },
  { code: "+975", label: "🇧🇹" },
  { code: "+977", label: "🇳🇵" },
  { code: "+856", label: "🇱🇦" },
  { code: "+855", label: "🇰🇭" },
  { code: "+852", label: "🇭🇰" },
  { code: "+853", label: "🇲🇴" },
  { code: "+373", label: "🇲🇩" },
  { code: "+381", label: "🇷🇸" },
  { code: "+382", label: "🇲🇪" },
  { code: "+389", label: "🇲🇰" },
];

const RoomInquiry = () => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log('RoomInquiry loaded');
  console.log('Location state:', location.state);

  // Get data from navigation state
  const {
    roomId,
    hotelId,
    roomName,
    hotelName,
    basePricePerNight,
    mealPlan,
    market,
    checkIn,
    checkOut,
    previousRoute
  } = location.state || {};

  // Local state for the enquiry form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumber1, setPhoneNumber1] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [message, setMessage] = useState('');

  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // If no room data, redirect back
  useEffect(() => {
    if (!roomName || !hotelName) {
      setTimeout(() => {
        navigate(previousRoute || '/search');
      }, 1000);
    }
  }, [roomName, hotelName, navigate, previousRoute]);

  const handleClose = () => {
    navigate(previousRoute || '/search');
  };

  const handleSubmitInquiry = async () => {
    try {
      const payload = {
        name,
        email,
        phone_number: `${phoneNumber} ${phoneNumber1}`,
        guest_count: guestCount,
        message,
        room_id: roomId,
        hotel_id: hotelId,
        room_name: roomName,
        hotel_name: hotelName,
        base_price_per_night: basePricePerNight,
        meal_plan: mealPlan?.planName || 'Not selected',
        market: market,
        check_in: checkIn,
        check_out: checkOut,
        inquiry_type: 'room'
      };

      const response = await axios.post('/inquiries', payload);
      console.log('Room inquiry response:', response);

      // Show success notification
      setSnackbar({
        open: true,
        message: 'Your room inquiry has been submitted successfully! Our team will contact you within 24 hours.',
        severity: 'success'
      });

      // Navigate back after showing the notification
      setTimeout(() => {
        navigate(previousRoute || '/search');
      }, 3000);
    } catch (error) {
      console.error('Error submitting room inquiry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit inquiry. Please try again.',
        severity: 'error'
      });
    }
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = nights * (basePricePerNight || 0);

  if (!roomName || !hotelName) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <IconButton
            onClick={handleClose}
            className="mr-4"
            sx={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              '&:hover': {
                backgroundColor: '#E5E7EB',
              },
            }}
          >
            <ArrowBackIcon sx={{ color: '#4B5563' }} />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#374151',
              letterSpacing: '-0.025em'
            }}
          >
            Room Inquiry
          </Typography>
        </div>

        {/* Room Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-teal-500 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              Room Details
            </h2>
          </div>

          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                  {roomName}
                </Typography>
                <Typography variant="h6" sx={{ color: '#6B7280', mb: 2 }}>
                  {hotelName}
                </Typography>
                {basePricePerNight && (
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography
                      sx={{
                        color: '#005E84',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                      }}
                    >
                      ${basePricePerNight} per night
                    </Typography>
                    {nights > 0 && (
                      <Typography
                        sx={{
                          color: '#6B7280',
                          fontSize: '1rem',
                        }}
                      >
                        (${totalPrice} for {nights} nights)
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 4, borderColor: '#E5E7EB' }} />

            {/* Your Selections */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#374151' }}>
              Your Selections:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Box sx={{
                backgroundColor: '#F9FAFB',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  Check-in
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600 }}>
                  {checkIn ? new Date(checkIn).toLocaleDateString() : 'Not selected'}
                </Typography>
              </Box>
              <Box sx={{
                backgroundColor: '#F9FAFB',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  Check-out
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600 }}>
                  {checkOut ? new Date(checkOut).toLocaleDateString() : 'Not selected'}
                </Typography>
              </Box>
              <Box sx={{
                backgroundColor: '#F9FAFB',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  Nights
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600 }}>
                  {nights || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{
                backgroundColor: '#F9FAFB',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  Meal Plan
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600 }}>
                  {mealPlan?.planName || 'Not selected'}
                </Typography>
              </Box>
              <Box sx={{
                backgroundColor: '#F9FAFB',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                gridColumn: { xs: 'span 1', sm: 'span 2' }
              }}>
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  Market
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600 }}>
                  {market || 'Not selected'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </div>

        {/* Inquiry Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-teal-500 p-6">
            <h2 className="text-2xl font-bold text-white">
              Contact Information
            </h2>
            <p className="text-gray-100 mt-1">Fill in your details to connect with our hotel experts</p>
          </div>

          <Box sx={{ p: 4 }}>
            <TextField
              required
              label="Full Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover fieldset': {
                    borderColor: '#075375',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005E84',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#4B5563',
                  '&.Mui-focused': {
                    color: '#005E84',
                  },
                },
              }}
            />
            <TextField
              required
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover fieldset': {
                    borderColor: '#075375',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005E84',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#4B5563',
                  '&.Mui-focused': {
                    color: '#005E84',
                  },
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: '12px', mt: 3, mb: 1 }}>
              <Autocomplete
                options={countryCodes}
                getOptionLabel={(option) => `${option.label} ${option.code}`}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{option.label}</Typography>
                    <Typography>{option.code}</Typography>
                  </Box>
                )}
                renderInput={(params) => <TextField {...params} label="Country Code" />}
                onChange={(event, newValue) => setPhoneNumber(newValue ? newValue.code : '')}
                sx={{
                  width: '200px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover fieldset': {
                      borderColor: '#075375',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#005E84',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#4B5563',
                    '&.Mui-focused': {
                      color: '#005E84',
                    },
                  },
                }}
              />
              <TextField
                required
                label="Your Phone"
                fullWidth
                type="tel"
                value={phoneNumber1}
                onChange={(e) => setPhoneNumber1(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover fieldset': {
                      borderColor: '#075375',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#005E84',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#4B5563',
                    '&.Mui-focused': {
                      color: '#005E84',
                    },
                  },
                }}
              />
            </Box>
            <TextField
              required
              label="Number of Guests"
              fullWidth
              type="number"
              InputProps={{ inputProps: { min: 1 } }}
              margin="normal"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover fieldset': {
                    borderColor: '#075375',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005E84',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#4B5563',
                  '&.Mui-focused': {
                    color: '#005E84',
                  },
                },
              }}
            />
            <TextField
              label="Message (Optional)"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your specific requirements, preferences, or any questions you have..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover fieldset': {
                    borderColor: '#075375',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005E84',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#4B5563',
                  '&.Mui-focused': {
                    color: '#005E84',
                  },
                },
              }}
            />

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={handleSubmitInquiry}
                sx={{
                  backgroundColor: '#005E84',
                  color: '#FFFFFF',
                  padding: '14px 40px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 94, 132, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#075375',
                    boxShadow: '0 6px 16px rgba(7, 83, 117, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                Submit Room Inquiry
              </Button>
            </Box>
          </Box>
        </div>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RoomInquiry;
