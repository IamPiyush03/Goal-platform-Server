const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    week: { type: Number, required: true },
    objective: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: false }
);

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    timeline: { type: String, required: true },
    milestones: { type: [milestoneSchema], default: [] },
    progress: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completedMilestones: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
