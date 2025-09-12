const mongoose = require('mongoose');

const checkinConfigSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    interval: { type: String, default: 'daily' }, // e.g., 'daily', 'weekly', 'monthly'
    time: { type: String, default: '09:00' }, // e.g., 'HH:MM'
    remindersEnabled: { type: Boolean, default: true },
    lastCheckin: { type: Date },
    nextCheckin: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CheckinConfig', checkinConfigSchema);