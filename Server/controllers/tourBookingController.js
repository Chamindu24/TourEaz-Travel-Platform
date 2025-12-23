const TourBooking = require('../models/TourBooking');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'shaliniavindya@gmail.com',
    pass: 'yznmifeajrkjkfxk',
  }
});

// Function to send admin email notification
const sendAdminBookingEmail = async (bookingData) => {
  const htmlContent = `
    <h2>New Tour Booking Received</h2>
    <p><strong>Booking Reference:</strong> ${bookingData.bookingReference}</p>
    <p><strong>Customer Name:</strong> ${bookingData.clientName}</p>
    <p><strong>Email:</strong> ${bookingData.clientEmail}</p>
    <p><strong>Phone:</strong> ${bookingData.phoneCountryCode} ${bookingData.clientPhone}</p>
    <p><strong>Nationality:</strong> ${bookingData.nationality}</p>
    <p><strong>Tour:</strong> ${bookingData.tourTitle}</p>
    <p><strong>Travel Date:</strong> ${new Date(bookingData.travelDate).toLocaleDateString()}</p>
    <p><strong>Travellers:</strong> ${bookingData.travellerCount}</p>
    <p><strong>Duration:</strong> ${bookingData.selectedNightsKey} Nights</p>
    <p><strong>Package:</strong> ${bookingData.selectedNightsOption}</p>
    <p><strong>Meal Plan:</strong> ${bookingData.selectedFoodCategory}</p>
    <p><strong>Total Price:</strong> ${bookingData.currency} ${bookingData.finalPrice.toLocaleString()}</p>
    <p><strong>Payment Method:</strong> ${bookingData.paymentMethod}</p>
    ${bookingData.specialRequests ? `<p><strong>Special Requests:</strong> ${bookingData.specialRequests}</p>` : ''}
    ${bookingData.emergencyContact ? `<p><strong>Emergency Contact:</strong> ${bookingData.emergencyContact}</p>` : ''}
  `;

  const mailOptions = {
    from: 'shaliniavindya@gmail.com',
    to: 'shaliniavindya@gmail.com',
    subject: `New Tour Booking: ${bookingData.bookingReference} - ${bookingData.clientName}`,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send customer confirmation email
const sendCustomerConfirmationEmail = async (bookingData) => {
  const htmlContent = `
    <h2>Tour Booking Confirmation</h2>
    <p>Dear ${bookingData.clientName},</p>
    <p>Thank you for booking with IsleKey Holidays! Your tour booking has been received successfully.</p>

    <h3>Booking Details:</h3>
    <p><strong>Booking Reference:</strong> ${bookingData.bookingReference}</p>
    <p><strong>Tour:</strong> ${bookingData.tourTitle}</p>
    <p><strong>Travel Date:</strong> ${new Date(bookingData.travelDate).toLocaleDateString()}</p>
    <p><strong>Travellers:</strong> ${bookingData.travellerCount}</p>
    <p><strong>Duration:</strong> ${bookingData.selectedNightsKey} Nights</p>
    <p><strong>Package:</strong> ${bookingData.selectedNightsOption}</p>
    <p><strong>Meal Plan:</strong> ${bookingData.selectedFoodCategory}</p>
    <p><strong>Total Price:</strong> ${bookingData.currency} ${bookingData.finalPrice.toLocaleString()}</p>

    <h3>Next Steps:</h3>
    <ul>
      <li>Our team will review your booking and contact you within 24 hours</li>
      <li>You will receive a confirmation email once your booking is confirmed</li>
      <li>Please keep your booking reference number for future correspondence</li>
    </ul>

    <p>We look forward to making your Maldives experience unforgettable!</p>
    <p>Best regards,<br>IsleKey Holidays Team</p>
  `;

  const mailOptions = {
    from: 'shaliniavindya@gmail.com',
    to: bookingData.clientEmail,
    subject: `Tour Booking Confirmation - ${bookingData.bookingReference}`,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};

// Create a new tour booking
exports.createTourBooking = async (req, res) => {
  try {
    const bookingData = {
      user: req.user?.userId, // Add user if authenticated
      clientName: req.body.clientName,
      clientEmail: req.body.clientEmail,
      clientPhone: req.body.clientPhone,
      phoneCountryCode: req.body.phoneCountryCode,
      nationality: req.body.nationality,
      emergencyContact: req.body.emergencyContact,
      travelDate: req.body.travelDate,
      travellerCount: req.body.travellerCount,
      tourId: req.body.tourId,
      tourTitle: req.body.tourTitle,
      selectedNightsKey: req.body.selectedNightsKey,
      selectedNightsOption: req.body.selectedNightsOption,
      selectedFoodCategory: req.body.selectedFoodCategory,
      finalPrice: req.body.finalPrice,
      finalOldPrice: req.body.finalOldPrice,
      currency: req.body.currency,
      specialRequests: req.body.specialRequests,
      paymentMethod: req.body.paymentMethod,
      tourImage: req.body.tourImage,
      tourSummary: req.body.tourSummary,
      personCount: req.body.personCount,
      country: req.body.country,
      validFrom: req.body.validFrom,
      validTo: req.body.validTo,
    };

    const newBooking = new TourBooking(bookingData);
    await newBooking.save();

    // Send email notifications
    try {
      await Promise.all([
        sendAdminBookingEmail(newBooking),
        sendCustomerConfirmationEmail(newBooking)
      ]);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the booking if emails fail
    }

    res.status(201).json({
      message: 'Tour booking created successfully!',
      booking: newBooking
    });
  } catch (error) {
    console.error('Error creating tour booking:', error);
    res.status(500).json({
      message: 'Error creating tour booking',
      error: error.message
    });
  }
};

// Get all tour bookings
exports.getAllTourBookings = async (req, res) => {
  try {
    const bookings = await TourBooking.find({})
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching tour bookings:', error);
    res.status(500).json({
      message: 'Error fetching tour bookings',
      error: error.message
    });
  }
};

// Get a single tour booking by ID
exports.getTourBookingById = async (req, res) => {
  try {
    const booking = await TourBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Tour booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching tour booking:', error);
    res.status(500).json({
      message: 'Error fetching tour booking',
      error: error.message
    });
  }
};

// Update tour booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await TourBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Tour booking not found' });
    }

    res.status(200).json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// Delete a tour booking
exports.deleteTourBooking = async (req, res) => {
  try {
    const booking = await TourBooking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Tour booking not found' });
    }

    res.status(200).json({
      message: 'Tour booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tour booking:', error);
    res.status(500).json({
      message: 'Error deleting tour booking',
      error: error.message
    });
  }
};

// Get tour bookings by status
exports.getBookingsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const bookings = await TourBooking.find({ status })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings by status:', error);
    res.status(500).json({
      message: 'Error fetching bookings by status',
      error: error.message
    });
  }
};

// Get current user's tour bookings
exports.getMyTourBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookings = await TourBooking.find({ user: userId })
      .sort({ createdAt: -1 });


    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user tour bookings:', error);
    res.status(500).json({
      message: 'Error fetching tour bookings',
      error: error.message
    });
  }
};
