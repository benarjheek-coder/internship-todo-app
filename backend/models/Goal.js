const mongoose = require('mongoose');

const goalSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    targetCount: { type: Number, default: 5 },
    currentCount: { type: Number, default: 0 },
    deadline: { type: Date, default: null },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
