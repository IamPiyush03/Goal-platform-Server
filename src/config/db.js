const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wellfound';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000, // Increased timeout for cloud DB
    bufferCommands: false, // Disable mongoose buffering
  });
  console.log('Connected to MongoDB');
};

module.exports = { connectDB };
