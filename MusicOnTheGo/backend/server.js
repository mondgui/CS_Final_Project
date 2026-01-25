// Express + Socket.io Server with PostgreSQL/Prisma
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import prisma from './utils/prisma.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'MusicOnTheGo API', status: 'running' });
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || 
                  socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = decoded.id || decoded.sub;
    socket.data.userRole = decoded.role;

    // Join user's personal room
    await socket.join(`user:${socket.data.userId}`);

    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Socket.io connection handlers (chat uses Supabase Realtime; join-chat/leave-chat removed)
io.on('connection', (socket) => {
  // User automatically joined to user:${userId} room in auth middleware

  // Join teacher bookings room
  socket.on('join-teacher-bookings', async () => {
    const userId = socket.data.userId;
    if (userId) {
      await socket.join(`teacher-bookings:${userId}`);
    }
  });

  // Join student bookings room
  socket.on('join-student-bookings', async () => {
    const userId = socket.data.userId;
    if (userId) {
      await socket.join(`student-bookings:${userId}`);
    }
  });

  // Join teacher availability room (for teachers viewing their own Times tab)
  socket.on('join-teacher-availability', async () => {
    const userId = socket.data.userId;
    if (userId) {
      await socket.join(`teacher-availability:${userId}`);
    }
  });

  // Join availability-for-teacher (for students viewing a specific teacher's profile)
  socket.on('join-availability-for-teacher', async (teacherId) => {
    if (teacherId && typeof teacherId === 'string') {
      await socket.join(`availability-for-teacher:${teacherId}`);
    }
  });

  socket.on('leave-availability-for-teacher', async (teacherId) => {
    if (teacherId && typeof teacherId === 'string') {
      await socket.leave(`availability-for-teacher:${teacherId}`);
    }
  });

  socket.on('disconnect', () => {
    // Socket disconnected (logging disabled for cleaner output)
  });
});

// Import all routes (converted to use Prisma)
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';

import communityRoutes from './routes/communityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Set Socket.io for routes that need it (messages use Supabase Realtime)
console.log("[Server] Setting up Socket.io for routes...");
console.log("[Server] io instance:", io ? 'EXISTS' : 'NULL');
console.log("[Server] bookingRoutes.setSocketIO exists:", typeof bookingRoutes.setSocketIO);

if (bookingRoutes.setSocketIO) {
  bookingRoutes.setSocketIO(io);
  console.log("[Server] ✅ Socket.io instance set for bookingRoutes");
} else {
  console.error("[Server] ❌ bookingRoutes.setSocketIO is not a function!");
}

if (availabilityRoutes.setSocketIO) {
  availabilityRoutes.setSocketIO(io);
  console.log("[Server] ✅ Socket.io instance set for availabilityRoutes");
} else {
  console.error("[Server] ❌ availabilityRoutes.setSocketIO is not a function!");
}

if (inquiryRoutes.setSocketIO) {
  inquiryRoutes.setSocketIO(io);
  console.log("[Server] ✅ Socket.io instance set for inquiryRoutes");
}

// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/practice', practiceRoutes);

app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
});

// Start server
const PORT = process.env.PORT || 5050;
httpServer.listen(PORT, '0.0.0.0', async () => {
  // Test Prisma connection
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    process.exit(1);
  }

  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Network access: http://YOUR_IP:${PORT}/api`);
});
