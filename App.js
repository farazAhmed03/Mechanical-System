const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');

// Load environment variables
dotenv.config();

// Custom Imports
const dbConnect = require('./Config/database');
const PORT = process.env.PORT || 5000;

// Routes and Middleware
const errorHandler = require('./Middleware/errorHandler');
const authRoutes = require('./Routes/AuthRoutes');
const mechanicRoutes = require('./Routes/MechanicRoute');
const { initializeAdminUser } = require('./Controllers/AuthController');
initializeAdminUser().catch((err) => {
  console.error('Admin initialization failed:', err);
});




// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3001",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ],
  credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));
// app.use(generalLimiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/mechanic', mechanicRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Error Handler
app.use(errorHandler);


// Server listening
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await dbConnect();
});