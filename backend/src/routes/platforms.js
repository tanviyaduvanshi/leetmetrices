const express = require('express');
const { fetchPlatformStats } = require('../services/aggregator.service');

const router = express.Router();

/**
 * GET /api/platforms/:platform/:handle
 * Fetch stats for a specific platform handle (public, no auth required)
 * Useful for previewing before adding to profile
 */
router.get('/:platform/:handle', async (req, res) => {
  const { platform, handle } = req.params;
  const supportedPlatforms = ['leetcode', 'codeforces', 'codechef'];

  if (!supportedPlatforms.includes(platform.toLowerCase())) {
    return res.status(400).json({
      error: `Platform "${platform}" not supported. Supported: ${supportedPlatforms.join(', ')}`,
    });
  }

  try {
    const stats = await fetchPlatformStats(platform.toLowerCase(), handle.trim());
    res.json({ stats });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
