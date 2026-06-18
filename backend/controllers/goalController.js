const Goal = require('../models/Goal');

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (e) { res.status(500).json({ message: 'Error fetching goals' }); }
};

const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, user: req.user.id });
    res.status(201).json(goal);
  } catch (e) { res.status(500).json({ message: 'Error creating goal' }); }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (e) { res.status(500).json({ message: 'Error updating goal' }); }
};

const deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ id: req.params.id });
  } catch (e) { res.status(500).json({ message: 'Error deleting goal' }); }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
