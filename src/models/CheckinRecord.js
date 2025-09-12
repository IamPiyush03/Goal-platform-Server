const mongoose = require('mongoose');

const checkinRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
    checkinDate: { type: Date, required: true, default: Date.now },
    mood: { type: String }, // e.g., 'great', 'good', 'neutral', 'bad', 'terrible'
    notes: { type: String },
    progressUpdate: { type: Number, default: 0 }, // Percentage of progress made since last check-in or overall
  },
  { timestamps: true }
);

module.exports = mongoose.model('CheckinRecord', checkinRecordSchema);