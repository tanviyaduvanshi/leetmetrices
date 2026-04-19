const express = require('express');
const User = require('../models/User');
const StatsSnapshot = require('../models/StatsSnapshot');
const { protect } = require('../middleware/auth');
const { fetchAllStats, generateInsights } = require('../services/aggregator.service');

const router = express.Router();

/**
 * GET /api/stats/me
 * Get aggregated stats for the authenticated user
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const forceRefresh = req.query.refresh === 'true';
    const stats = await fetchAllStats(user, forceRefresh);
    const insights = generateInsights(stats);

    res.json({ stats, insights, lastFetched: user.lastFetched });
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

/**
 * GET /api/stats/history
 * Get historical stats snapshots for trend analysis
 */
router.get('/history', protect, async (req, res) => {
  try {
    const { platform, days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const query = {
      userId: req.user._id,
      fetchedAt: { $gte: since },
    };
    if (platform) query.platform = platform;

    const snapshots = await StatsSnapshot.find(query)
      .sort({ fetchedAt: 1 })
      .select('platform totalSolved easySolved mediumSolved hardSolved rating fetchedAt');

    res.json({ snapshots });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * GET /api/stats/compare/:username1/:username2
 * Compare stats between two users
 */
router.get('/compare/:username1/:username2', async (req, res) => {
  try {
    const { username1, username2 } = req.params;
    const [user1, user2] = await Promise.all([
      User.findOne({ username: username1 }),
      User.findOne({ username: username2 }),
    ]);

    if (!user1) return res.status(404).json({ error: `User "${username1}" not found` });
    if (!user2) return res.status(404).json({ error: `User "${username2}" not found` });

    // Use cached stats for comparison
    const stats1 = user1.cachedStats?.aggregated || {};
    const stats2 = user2.cachedStats?.aggregated || {};

    res.json({
      user1: {
        username: user1.username,
        avatar: user1.avatar,
        stats: stats1,
        platforms: user1.platforms,
        platformStats: {
          leetcode: user1.cachedStats?.leetcode,
          codeforces: user1.cachedStats?.codeforces,
          codechef: user1.cachedStats?.codechef,
        },
      },
      user2: {
        username: user2.username,
        avatar: user2.avatar,
        stats: stats2,
        platforms: user2.platforms,
        platformStats: {
          leetcode: user2.cachedStats?.leetcode,
          codeforces: user2.cachedStats?.codeforces,
          codechef: user2.cachedStats?.codechef,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Comparison failed' });
  }
});

/**
 * POST /api/stats/refresh
 * Force refresh stats for current user
 */
router.post('/refresh', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const stats = await fetchAllStats(user, true);
    const insights = generateInsights(stats);
    res.json({ message: 'Stats refreshed!', stats, insights });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Refresh failed' });
  }
});

module.exports = router;
