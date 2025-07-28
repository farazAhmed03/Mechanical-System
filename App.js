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
const socketHandler = require('./Sockets/SocketHandler');

// Routes and Middleware
const errorHandler = require('./Middleware/errorHandler');
const authRoutes = require('./Routers/AuthRoutes');
const chatRoutes = require('./Routers/ChatRoute');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:3001", "http://127.0.0.1:5500", "http://localhost:5500"],
    credentials: true
  }
});

// Attach io instance to req
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3001", "http://127.0.0.1:5500", "http://localhost:5500"],
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
app.use('/api/v1/chat', chatRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await dbConnect();
});

// Socket Handler
socketHandler(io);

// Optional: Log each socket connection
io.on('connection', (socket) => {
  console.log(' User connected:', socket.id);
});
