require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const healthRouter = require('./routes/health.routes');
const authRouter = require('./routes/auth.routes');
const goalsRouter = require('./routes/goals.routes');
const chatRouter = require('./routes/chat.routes');
const progressRouter = require('./routes/progress.routes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:8080', // Vite dev server
    'http://localhost:3000'  // Common React dev server
  ],
  credentials: true
}));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/goals', goalsRouter);
app.use('/chat', chatRouter);
app.use('/progress', progressRouter);

const PORT = process.env.PORT || 4000;

// Start server regardless of DB status
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Attempt DB connection in background
connectDB().catch((err) => {
  console.error('Failed to connect to DB', err.message || err);
});
