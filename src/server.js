require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const healthRouter = require('./routes/health.routes');
const authRouter = require('./routes/auth.routes');
const goalsRouter = require('./routes/goals.routes');
const chatRouter = require('./routes/chat.routes');
const progressRouter = require('./routes/progress.routes');
const checkinRouter = require('./routes/checkin.routes');
const notificationsRouter = require('./routes/notifications.routes');
const { errorHandler } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://goal-platform-client-t6ix.vercel.app',
    'https://goal-platform-client-t6ix-n8szcupf7-piyushs-projects-815384e6.vercel.app',
    'https://goal-platform-client-t6ix-7veln9xfi-piyushs-projects-815384e6.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Enable CORS pre-flight
app.use(cors(corsOptions));

// Enhanced request logging
app.use(logger.request);

app.use(express.json());

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/goals', goalsRouter);
app.use('/chat', chatRouter);
app.use('/progress', progressRouter);
app.use('/checkin', checkinRouter);
app.use('/notifications', notificationsRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Start server regardless of DB status
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Attempt DB connection in background
connectDB().catch((err) => {
  logger.error('Failed to connect to database', { error: err.message || err });
});
