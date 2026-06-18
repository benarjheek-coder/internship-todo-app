const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');
const User = require('../models/User');

// GET /api/analytics/weekly — tasks completed per day for last 7 days
const getWeeklyAnalytics = async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const end = new Date(d);
      end.setHours(23,59,59,999);
      const count = await Task.countDocuments({
        user: req.user.id,
        status: 'Completed',
        completedAt: { $gte: d, $lte: end },
      });
      const xpSessions = await FocusSession.find({
        user: req.user.id,
        type: 'focus',
        completedAt: { $gte: d, $lte: end },
      });
      const focusMin = xpSessions.reduce((s, sess) => s + (sess.duration || 0), 0);
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toISOString().split('T')[0],
        completed: count,
        focusHours: parseFloat((focusMin / 60).toFixed(1)),
        xp: xpSessions.reduce((s, sess) => s + (sess.xpEarned || 0), 0),
      });
    }
    res.json(days);
  } catch (error) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

// GET /api/analytics/category — tasks grouped by category
const getCategoryAnalytics = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    const catMap = {};
    tasks.forEach(t => {
      const cat = t.category || 'General';
      if (!catMap[cat]) catMap[cat] = { total: 0, completed: 0 };
      catMap[cat].total++;
      if (t.status === 'Completed') catMap[cat].completed++;
    });
    const data = Object.entries(catMap).map(([name, v]) => ({
      name,
      total: v.total,
      completed: v.completed,
      rate: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
    }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

// GET /api/analytics/summary — overall stats
const getSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const tasks = await Task.find({ user: req.user.id });
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);

    const completedToday = await Task.countDocuments({
      user: req.user.id,
      status: 'Completed',
      completedAt: { $gte: today, $lte: todayEnd },
    });

    const overdue = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    ).length;

    const totalFocusMin = (await FocusSession.find({ user: req.user.id, type: 'focus' }))
      .reduce((s, sess) => s + (sess.duration || 0), 0);

    // Productivity score 0-100
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const completionRate = total > 0 ? completed / total : 0;
    const productivityScore = Math.round(
      completionRate * 50 + Math.min(user.streak * 2, 30) + Math.min(user.xp / 20, 20)
    );

    res.json({
      productivityScore: Math.min(productivityScore, 100),
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      tasksCompletedToday: completedToday,
      tasksCompletedTotal: user.tasksCompletedTotal,
      focusHoursTotal: parseFloat((totalFocusMin / 60).toFixed(1)),
      totalTasks: total,
      completedTasks: completed,
      overdueTasks: overdue,
      achievements: user.achievements,
    });
  } catch (error) {
    res.status(500).json({ message: 'Summary error' });
  }
};

module.exports = { getWeeklyAnalytics, getCategoryAnalytics, getSummary };
