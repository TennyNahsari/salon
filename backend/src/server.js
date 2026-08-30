const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const { autoCancelExpiredBookings } = require('./utils/autoCancel');

const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const staffRoutes = require('./routes/staffRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/configs', configRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/staff', staffRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'Salon & Spa Booking System API',
    version: '1.0.0',
    time: new Date()
  });
});

// Start DB Initialization & Server Listening
db.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`Salon Backend Running on http://localhost:${PORT}`);
    console.log(`=================================`);
    
    // Set periodic sweep for auto-cancelled expired bookings every 2 minutes
    setInterval(async () => {
      await autoCancelExpiredBookings();
    }, 2 * 60 * 1000);
  });
});
