const mongoose = require('mongoose');

const focusSessionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    duration: { type: Number, default: 25 }, // minutes
    type: { type: String, enum: ['focus', 'break'], default: 'focus' },
    xpEarned: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FocusSession', focusSessionSchema);
