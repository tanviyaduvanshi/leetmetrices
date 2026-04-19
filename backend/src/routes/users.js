const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's full profile
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile (bio, avatar)
 */
router.put('/profile', protect, [
  body('bio').optional().isLength({ max: 200 }),
  body('username').optional().trim().isLength({ min: 3, max: 30 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { bio, avatar, username } = req.body;
  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (avatar !== undefined) updates.avatar = avatar;
  if (username) {
    const exists = await User.findOne({ username, _id: { $ne: req.user._id } });
    if (exists) return res.status(400).json({ error: 'Username already taken' });
    updates.username = username;
  }

  try {
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ message: 'Profile updated', user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * PUT /api/users/platforms
 * Update platform handles
 */
router.put('/platforms', protect, async (req, res) => {
  const { leetcode, codeforces, codechef, hackerrank, atcoder } = req.body;
  const platforms = {};
  if (leetcode !== undefined) platforms['platforms.leetcode'] = leetcode;
  if (codeforces !== undefined) platforms['platforms.codeforces'] = codeforces;
  if (codechef !== undefined) platforms['platforms.codechef'] = codechef;
  if (hackerrank !== undefined) platforms['platforms.hackerrank'] = hackerrank;
  if (atcoder !== undefined) platforms['platforms.atcoder'] = atcoder;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { ...platforms, lastFetched: null } }, // Reset cache TTL
      { new: true, runValidators: true }
    );
    res.json({ message: 'Platforms updated!', user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update platforms' });
  }
});

/**
 * GET /api/users/:username
 * Get public profile of another user
 */
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Public fields only
    const publicProfile = {
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      platforms: user.platforms,
      cachedStats: user.cachedStats,
      streak: user.streak,
      createdAt: user.createdAt,
    };
    res.json({ user: publicProfile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /api/users/bookmarks
 * Add a bookmark
 */
router.post('/bookmarks', protect, async (req, res) => {
  const { platform, problemId, title, difficulty, url, tags } = req.body;
  if (!platform || !title) return res.status(400).json({ error: 'Platform and title required' });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          bookmarks: { platform, problemId, title, difficulty, url, tags: tags || [] },
        },
      },
      { new: true }
    );
    res.json({ message: 'Bookmark added', bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

/**
 * DELETE /api/users/bookmarks/:bookmarkId
 * Remove a bookmark
 */
router.delete('/bookmarks/:bookmarkId', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { bookmarks: { _id: req.params.bookmarkId } } },
      { new: true }
    );
    res.json({ message: 'Bookmark removed', bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

module.exports = router;
