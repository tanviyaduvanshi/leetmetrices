const mongoose = require('mongoose');

/**
 * Stores a snapshot of fetched stats for a user on a given platform.
 * Historical records allow us to track progress over time.
 */
const statsSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'atcoder'],
      required: true,
    },
    handle: {
      type: String,
      required: true,
    },
    // Core stats
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 }, // percentage
    // Contest data
    rating: { type: Number, default: 0 },
    maxRating: { type: Number, default: 0 },
    globalRank: { type: Number, default: 0 },
    contestsAttended: { type: Number, default: 0 },
    // Activity (submission calendar — date -> count map)
    activityCalendar: {
      type: Map,
      of: Number,
      default: {},
    },
    // Platform-specific extra data
    extra: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
statsSnapshotSchema.index({ userId: 1, platform: 1, fetchedAt: -1 });

module.exports = mongoose.model('StatsSnapshot', statsSnapshotSchema);
