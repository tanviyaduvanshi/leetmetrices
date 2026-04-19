const axios = require('axios');

/**
 * LeetCode Stats Fetcher
 * Uses the unofficial LeetCode GraphQL API (public endpoint, no auth required for basic stats)
 */

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

const STATS_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      profile {
        ranking
        reputation
        starRating
      }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
  }
`;

const CALENDAR_QUERY = `
  query userProfileCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

/**
 * Fetch LeetCode user statistics
 * @param {string} username - LeetCode username
 * @returns {Object} Normalized stats object
 */
const fetchLeetCodeStats = async (username) => {
  if (!username) throw new Error('LeetCode username is required');

  try {
    // Fetch main stats
    const statsResponse = await axios.post(
      LEETCODE_GRAPHQL,
      { query: STATS_QUERY, variables: { username } },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (compatible; LeetMetrices/1.0)',
        },
        timeout: 10000,
      }
    );

    const data = statsResponse.data?.data;
    if (!data?.matchedUser) {
      throw new Error(`LeetCode user "${username}" not found`);
    }

    const user = data.matchedUser;
    const contestRanking = data.userContestRanking;
    const acStats = user.submitStats?.acSubmissionNum || [];

    // Parse difficulty breakdown
    let easySolved = 0, mediumSolved = 0, hardSolved = 0, totalSolved = 0;
    let totalSubmissions = 0, acceptedSubmissions = 0;

    acStats.forEach(stat => {
      if (stat.difficulty === 'Easy') {
        easySolved = stat.count;
        acceptedSubmissions += stat.count;
        totalSubmissions += stat.submissions;
      } else if (stat.difficulty === 'Medium') {
        mediumSolved = stat.count;
        acceptedSubmissions += stat.count;
        totalSubmissions += stat.submissions;
      } else if (stat.difficulty === 'Hard') {
        hardSolved = stat.count;
        acceptedSubmissions += stat.count;
        totalSubmissions += stat.submissions;
      } else if (stat.difficulty === 'All') {
        totalSolved = stat.count;
        totalSubmissions = stat.submissions;
        acceptedSubmissions = stat.count;
      }
    });

    // Fetch activity calendar for current year
    let activityCalendar = {};
    try {
      const calResponse = await axios.post(
        LEETCODE_GRAPHQL,
        { query: CALENDAR_QUERY, variables: { username, year: new Date().getFullYear() } },
        {
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
          },
          timeout: 10000,
        }
      );
      const calData = calResponse.data?.data?.matchedUser?.userCalendar;
      if (calData?.submissionCalendar) {
        activityCalendar = JSON.parse(calData.submissionCalendar);
      }
    } catch (calErr) {
      console.warn('LeetCode calendar fetch failed:', calErr.message);
    }

    const acceptanceRate = totalSubmissions > 0
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100 * 10) / 10
      : 0;

    return {
      platform: 'leetcode',
      handle: username,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
      rating: contestRanking?.rating ? Math.round(contestRanking.rating) : 0,
      globalRank: contestRanking?.globalRanking || 0,
      contestsAttended: contestRanking?.attendedContestsCount || 0,
      topPercentage: contestRanking?.topPercentage || null,
      activityCalendar,
      extra: {
        ranking: user.profile?.ranking || 0,
        reputation: user.profile?.reputation || 0,
      },
    };
  } catch (err) {
    if (err.response?.status === 429) {
      throw new Error('LeetCode rate limit hit. Please try again later.');
    }
    throw new Error(`LeetCode fetch failed: ${err.message}`);
  }
};

module.exports = { fetchLeetCodeStats };
