require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin during development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // In production, you can add specific domains here
    // For now, allowing all localhost ports for development
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-initial-auth-check']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Configure file upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 20 * 1024 * 1024 // 20MB max file size
  },
  abortOnLimit: true,
  responseOnLimit: "File size limit has been reached",
  uploadTimeout: 0
}));

// DB connect — only once, no reconnections
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI,{
  dbName: 'toureaz',
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));



// // Example route
app.get("/api/test", (req, res) => {
  res.json({ msg: "🔥 Express backend live on Vercel!" });
});


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/agency', require('./routes/agencyRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/discounts', require('./routes/discountRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/tours', require('./routes/tourRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/activities', require('./routes/activity.routes'));
app.use('/api/activity-bookings', require('./routes/activityBookingRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/tour-bookings', require('./routes/tourBookingRoutes'));
app.use('/api/service-providers', require('./routes/serviceProviderRoutes'));
app.use('/api/category-approvals', require('./routes/categoryApprovalRoutes'));
app.use('/api/transportations', require('./routes/transportationRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server running on port ${process.env.PORT || 5001}`);
});

module.exports = app;
