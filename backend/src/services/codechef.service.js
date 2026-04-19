const axios = require('axios');

/**
 * CodeChef Stats Fetcher
 * Uses the CodeChef public API endpoint
 */

const CODECHEF_BASE = 'https://www.codechef.com';

/**
 * Parse CodeChef rating to difficulty bucket
 */
const ratingToDifficulty = (stars) => {
  if (stars <= 2) return 'easy';
  if (stars <= 4) return 'medium';
  return 'hard';
};

/**
 * Fetch CodeChef user statistics
 * @param {string} username - CodeChef username
 * @returns {Object} Normalized stats object
 */
const fetchCodeChefStats = async (username) => {
  if (!username) throw new Error('CodeChef username is required');

  try {
    // CodeChef has a public user API
    const response = await axios.get(
      `${CODECHEF_BASE}/users/${username}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/html',
        },
        timeout: 12000,
      }
    );

    // Try the CodeChef unofficial JSON API
    const apiResponse = await axios.get(
      `https://codechef-api.vercel.app/handle/${username}`,
      { timeout: 12000 }
    ).catch(() => null);

    if (apiResponse?.data?.success) {
      const d = apiResponse.data;
      const totalSolved = d.totalProblems || 0;
      
      return {
        platform: 'codechef',
        handle: username,
        totalSolved,
        easySolved: Math.round(totalSolved * 0.5),   // Approximate split
        mediumSolved: Math.round(totalSolved * 0.35),
        hardSolved: Math.round(totalSolved * 0.15),
        totalSubmissions: totalSolved,
        acceptedSubmissions: totalSolved,
        acceptanceRate: 100,
        rating: d.currentRating || 0,
        maxRating: d.highestRating || 0,
        globalRank: d.globalRank || 0,
        contestsAttended: d.totalContests || 0,
        activityCalendar: {},
        extra: {
          stars: d.stars,
          countryRank: d.countryRank,
          institution: d.institution,
        },
      };
    }

    // Fallback: return minimal data indicating the user exists
    return {
      platform: 'codechef',
      handle: username,
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      acceptanceRate: 0,
      rating: 0,
      maxRating: 0,
      globalRank: 0,
      contestsAttended: 0,
      activityCalendar: {},
      extra: { note: 'Limited data available for CodeChef' },
    };
  } catch (err) {
    throw new Error(`CodeChef fetch failed: ${err.message}`);
  }
};

module.exports = { fetchCodeChefStats };
