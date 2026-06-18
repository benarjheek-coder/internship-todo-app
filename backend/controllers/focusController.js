const FocusSession = require('../models/FocusSession');
const User = require('../models/User');

// POST /api/focus/session — save completed Pomodoro session
const saveSession = async (req, res) => {
  const { duration, type, taskId } = req.body;
  try {
    let xpEarned = 0;
    if (type === 'focus') {
      xpEarned = Math.round((duration / 25) * 15); // 15 XP per 25min
      const user = await User.findById(req.user.id);
      user.focusHoursTotal = (user.focusHoursTotal || 0) + duration / 60;
      await user.awardXP(xpEarned, 'Focus session');
      await user.save();
    }
    const session = await FocusSession.create({
      user: req.user.id,
      taskId: taskId || null,
      duration,
      type: type || 'focus',
      xpEarned,
    });
    res.status(201).json({ session, xpEarned });
  } catch (error) {
    res.status(500).json({ message: 'Error saving focus session' });
  }
};

// GET /api/focus/sessions — recent focus sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await FocusSession.find({ user: req.user.id })
      .sort({ completedAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};

module.exports = { saveSession, getSessions };
