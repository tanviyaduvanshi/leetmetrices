const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/leaderboard
 * Get top users by total problems solved
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Fetch only active users who have solved at least one problem
    const users = await User.find({ 
      isActive: true,
      'cachedStats.aggregated.totalSolved': { $gt: 0 } 
    })
      .select('username avatar bio cachedStats streak platforms')
      .lean();

    // Score and sort
    const scored = users
      .map(u => {
        const agg = u.cachedStats?.aggregated || {};
        return {
          username: u.username,
          avatar: u.avatar,
          bio: u.bio,
          totalSolved: agg.totalSolved || 0,
          easySolved: agg.easySolved || 0,
          mediumSolved: agg.mediumSolved || 0,
          hardSolved: agg.hardSolved || 0,
          acceptanceRate: agg.acceptanceRate || 0,
          streak: u.streak?.current || 0,
          longestStreak: u.streak?.longest || 0,
          platforms: Object.fromEntries(
            Object.entries(u.platforms || {}).filter(([, v]) => v)
          ),
          // Score: weighted by difficulty
          score: (agg.easySolved || 0) * 1 + (agg.mediumSolved || 0) * 2 + (agg.hardSolved || 0) * 3,
        };
      })
      .filter(u => u.totalSolved > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map((u, idx) => ({ ...u, rank: idx + 1 }));

    res.json({ leaderboard: scored, total: scored.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
