const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const LEVEL_THRESHOLDS = {
  Rookie: 0,
  Explorer: 100,
  Warrior: 300,
  Master: 600,
  Legend: 900,
};

const computeLevel = (xp) => {
  if (xp >= 900) return 'Legend';
  if (xp >= 600) return 'Master';
  if (xp >= 300) return 'Warrior';
  if (xp >= 100) return 'Explorer';
  return 'Rookie';
};

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please add a name'] },
    email: { type: String, required: [true, 'Please add an email'], unique: true },
    password: { type: String, required: [true, 'Please add a password'] },
    // Gamification
    xp: { type: Number, default: 0 },
    level: { type: String, default: 'Rookie', enum: ['Rookie', 'Explorer', 'Warrior', 'Master', 'Legend'] },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    achievements: { type: [String], default: [] },
    focusHoursTotal: { type: Number, default: 0 },
    tasksCompletedTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.awardXP = async function (amount, reason) {
  this.xp += amount;
  this.level = computeLevel(this.xp);

  // Update streak
  const today = new Date();
  const todayStr = today.toDateString();
  const lastStr = this.lastActiveDate ? new Date(this.lastActiveDate).toDateString() : null;
  const yesterdayStr = new Date(today - 86400000).toDateString();

  if (lastStr !== todayStr) {
    if (lastStr === yesterdayStr) {
      this.streak += 1;
    } else if (lastStr !== null) {
      this.streak = 1;
    } else {
      this.streak = 1;
    }
    this.lastActiveDate = today;
  }

  await this.save();
  return this;
};

userSchema.methods.checkAchievements = async function () {
  const newAchievements = [];
  const has = (badge) => this.achievements.includes(badge);

  if (this.tasksCompletedTotal >= 1 && !has('First Task')) {
    this.achievements.push('First Task');
    newAchievements.push('First Task');
  }
  if (this.streak >= 7 && !has('7 Day Streak')) {
    this.achievements.push('7 Day Streak');
    newAchievements.push('7 Day Streak');
  }
  if (this.streak >= 30 && !has('30 Day Streak')) {
    this.achievements.push('30 Day Streak');
    newAchievements.push('30 Day Streak');
  }
  if (this.tasksCompletedTotal >= 50 && !has('Goal Crusher')) {
    this.achievements.push('Goal Crusher');
    newAchievements.push('Goal Crusher');
  }
  if (this.xp >= 500 && !has('Productivity Master')) {
    this.achievements.push('Productivity Master');
    newAchievements.push('Productivity Master');
  }
  if (this.streak >= 14 && !has('Consistency King')) {
    this.achievements.push('Consistency King');
    newAchievements.push('Consistency King');
  }
  if (newAchievements.length > 0) await this.save();
  return newAchievements;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
