const { fetchLeetCodeStats } = require('./leetcode.service');
const { fetchCodeforcesStats } = require('./codeforces.service');
const { fetchCodeChefStats } = require('./codechef.service');
const StatsSnapshot = require('../models/StatsSnapshot');
const User = require('../models/User');

/**
 * Aggregator service — fetches stats from all platforms a user has configured,
 * saves snapshots, updates the user's cached stats.
 */

const FETCHERS = {
  leetcode: fetchLeetCodeStats,
  codeforces: fetchCodeforcesStats,
  codechef: fetchCodeChefStats,
};

/**
 * Fetch stats for a single platform
 */
const fetchPlatformStats = async (platform, handle) => {
  const fetcher = FETCHERS[platform];
  if (!fetcher) throw new Error(`Unsupported platform: ${platform}`);
  return fetcher(handle);
};

/**
 * Fetch all stats for a user and persist snapshots
 * @param {Object} user - Mongoose User document
 * @param {boolean} forceRefresh - Skip cache and re-fetch
 * @returns {Object} Aggregated stats
 */
const fetchAllStats = async (user, forceRefresh = false) => {
  const CACHE_TTL_MINUTES = 30;
  const now = new Date();

  // Check cache
  if (!forceRefresh && user.lastFetched) {
    const diffMs = now - new Date(user.lastFetched);
    if (diffMs < CACHE_TTL_MINUTES * 60 * 1000) {
      return user.cachedStats;
    }
  }

  const results = {};
  const errors = {};

  const platforms = user.platforms || {};
  const fetchPromises = Object.entries(platforms)
    .filter(([, handle]) => handle && handle.trim())
    .map(async ([platform, handle]) => {
      try {
        const stats = await fetchPlatformStats(platform, handle.trim());

        // Save snapshot
        await StatsSnapshot.create({
          userId: user._id,
          platform,
          handle: handle.trim(),
          totalSolved: stats.totalSolved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          totalSubmissions: stats.totalSubmissions,
          acceptedSubmissions: stats.acceptedSubmissions,
          acceptanceRate: stats.acceptanceRate,
          rating: stats.rating,
          maxRating: stats.maxRating || 0,
          globalRank: typeof stats.globalRank === 'number' ? stats.globalRank : 0,
          contestsAttended: stats.contestsAttended,
          activityCalendar: stats.activityCalendar,
          extra: stats.extra,
        });

        results[platform] = stats;
      } catch (err) {
        console.error(`Error fetching ${platform} stats for ${handle}:`, err.message);
        errors[platform] = err.message;
        // Use last successful snapshot if available
        const lastSnapshot = await StatsSnapshot.findOne(
          { userId: user._id, platform },
          {},
          { sort: { fetchedAt: -1 } }
        );
        if (lastSnapshot) {
          results[platform] = lastSnapshot.toObject();
        }
      }
    });

  await Promise.all(fetchPromises);

  // Build aggregated stats
  const aggregated = aggregateStats(results);

  // Update user cache
  await User.findByIdAndUpdate(user._id, {
    cachedStats: { ...results, aggregated },
    lastFetched: now,
  });

  return { ...results, aggregated, errors };
};

/**
 * Aggregate stats across all platforms
 */
const aggregateStats = (platformStats) => {
  let totalSolved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0;
  let totalSubmissions = 0, acceptedSubmissions = 0;
  const mergedCalendar = {};

  Object.values(platformStats).forEach(stats => {
    if (!stats) return;
    totalSolved += stats.totalSolved || 0;
    easySolved += stats.easySolved || 0;
    mediumSolved += stats.mediumSolved || 0;
    hardSolved += stats.hardSolved || 0;
    totalSubmissions += stats.totalSubmissions || 0;
    acceptedSubmissions += stats.acceptedSubmissions || 0;

    // Merge calendars
    const cal = stats.activityCalendar || {};
    Object.entries(cal).forEach(([date, count]) => {
      mergedCalendar[date] = (mergedCalendar[date] || 0) + count;
    });
  });

  const acceptanceRate = totalSubmissions > 0
    ? Math.round((acceptedSubmissions / totalSubmissions) * 100 * 10) / 10
    : 0;

  return {
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    totalSubmissions,
    acceptedSubmissions,
    acceptanceRate,
    activityCalendar: mergedCalendar,
  };
};

/**
 * Generate AI-like insights based on stats
 */
const generateInsights = (stats) => {
  const insights = [];
  const suggestions = [];
  const strengths = [];
  const weaknesses = [];

  const { aggregated } = stats;
  if (!aggregated) return { insights, suggestions, strengths, weaknesses };

  const { easySolved, mediumSolved, hardSolved, totalSolved, acceptanceRate } = aggregated;

  // Strength analysis
  if (totalSolved > 0) {
    const easyPct = (easySolved / totalSolved) * 100;
    const mediumPct = (mediumSolved / totalSolved) * 100;
    const hardPct = (hardSolved / totalSolved) * 100;

    if (mediumPct > 40) strengths.push('Strong in Medium problems — great for interviews!');
    if (hardPct > 20) strengths.push('Impressive Hard problem solve rate — you\'re tackling tough challenges!');
    if (easyPct > 60) weaknesses.push('Heavy focus on Easy problems — challenge yourself with Medium/Hard!');
    if (hardPct < 5 && totalSolved > 50) {
      weaknesses.push('Low Hard problem count — start attempting Hard problems to level up');
      suggestions.push('Attempt 1-2 Hard problems per week to build problem-solving depth');
    }
    if (acceptanceRate < 40) {
      weaknesses.push('Low acceptance rate — focus on understanding before submitting');
      suggestions.push('Review problem statements carefully and trace through examples before coding');
    }
    if (acceptanceRate > 70) {
      strengths.push('High acceptance rate — excellent code quality and testing habits!');
    }
    if (totalSolved < 50) {
      suggestions.push('Build consistency by solving at least 1 problem daily');
    } else if (totalSolved < 150) {
      suggestions.push('You\'re building momentum! Focus on topic-wise practice now');
    } else {
      strengths.push(`Solved ${totalSolved}+ problems — excellent dedication!`);
    }
  }

  // Platform-specific insights
  if (stats.leetcode) {
    insights.push(`LeetCode: ${stats.leetcode.totalSolved} solved, rating ${stats.leetcode.rating || 'N/A'}`);
  }
  if (stats.codeforces) {
    const cfRating = stats.codeforces.rating;
    insights.push(`Codeforces: Rating ${cfRating || 'Unrated'} (${stats.codeforces.rank || 'newbie'})`);
    if (cfRating > 1600) strengths.push('Codeforces Expert+ — strong competitive programming skills!');
  }

  // Daily problem suggestion
  if (mediumSolved < easySolved * 0.5) {
    suggestions.push('Suggested daily: 2 Easy + 1 Medium problem for balanced growth');
  } else {
    suggestions.push('Suggested daily: 1 Medium + 1 Hard problem to maximize growth');
  }

  return { insights, suggestions, strengths, weaknesses };
};

module.exports = { fetchAllStats, fetchPlatformStats, aggregateStats, generateInsights };
