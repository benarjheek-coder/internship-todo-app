const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: [true, 'Please add a task title'] },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'In-Progress', 'Completed'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    category: { type: String, default: 'General' },
    dueDate: { type: Date, default: null },
    estimatedTime: { type: Number, default: 30 }, // minutes
    xpReward: { type: Number, default: 10 },
    tags: { type: [String], default: [] },
    subtasks: {
      type: [{ text: { type: String, required: true }, done: { type: Boolean, default: false } }],
      default: [],
    },
    order: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
