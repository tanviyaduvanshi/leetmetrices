const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/goals
 * Get user's goals
 */
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('goals cachedStats');
    const goals = (user.goals || []).map(goal => {
      // Auto-update current from cached stats
      const agg = user.cachedStats?.aggregated || {};
      let current = goal.current;
      if (goal.platform === 'all' || !goal.platform) {
        current = agg.totalSolved || 0;
      }
      return { ...goal.toObject(), current };
    });
    res.json({ goals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

/**
 * POST /api/goals
 * Create a new goal
 */
router.post('/', protect, async (req, res) => {
  const { title, target, platform, difficulty, deadline } = req.body;
  if (!title || !target) return res.status(400).json({ error: 'Title and target are required' });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          goals: { title, target: parseInt(target), platform, difficulty, deadline },
        },
      },
      { new: true }
    );
    res.status(201).json({ message: 'Goal created!', goals: user.goals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

/**
 * PUT /api/goals/:goalId
 * Update a goal
 */
router.put('/:goalId', protect, async (req, res) => {
  const { title, target, completed } = req.body;
  const updates = {};
  if (title) updates['goals.$.title'] = title;
  if (target) updates['goals.$.target'] = parseInt(target);
  if (completed !== undefined) updates['goals.$.completed'] = completed;

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'goals._id': req.params.goalId },
      { $set: updates },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal updated', goals: user.goals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

/**
 * DELETE /api/goals/:goalId
 * Delete a goal
 */
router.delete('/:goalId', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { goals: { _id: req.params.goalId } } },
      { new: true }
    );
    res.json({ message: 'Goal deleted', goals: user.goals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

module.exports = router;
