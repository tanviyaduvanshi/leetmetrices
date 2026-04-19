const axios = require('axios');

/**
 * Codeforces Stats Fetcher
 * Uses the official Codeforces API (free, no auth required for public data)
 * Docs: https://codeforces.com/apiHelp
 */

const CF_BASE = 'https://codeforces.com/api';

/**
 * Fetch Codeforces user statistics
 * @param {string} handle - Codeforces handle
 * @returns {Object} Normalized stats object
 */
const fetchCodeforcesStats = async (handle) => {
  if (!handle) throw new Error('Codeforces handle is required');

  try {
    // Fetch user info
    const [userRes, submissionsRes, ratingsRes] = await Promise.allSettled([
      axios.get(`${CF_BASE}/user.info?handles=${handle}`, { timeout: 10000 }),
      axios.get(`${CF_BASE}/user.status?handle=${handle}&from=1&count=1000`, { timeout: 15000 }),
      axios.get(`${CF_BASE}/user.rating?handle=${handle}`, { timeout: 10000 }),
    ]);

    // Parse user info
    if (userRes.status === 'rejected' || userRes.value?.data?.status !== 'OK') {
      throw new Error(`Codeforces user "${handle}" not found`);
    }

    const userInfo = userRes.value.data.result[0];

    // Parse submissions
    let totalSolved = 0;
    let totalSubmissions = 0;
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;
    const activityCalendar = {};
    const solvedProblems = new Set();

    if (submissionsRes.status === 'fulfilled' && submissionsRes.value?.data?.status === 'OK') {
      const submissions = submissionsRes.value.data.result;
      totalSubmissions = submissions.length;

      submissions.forEach(sub => {
        // Activity calendar (unix timestamp -> date string)
        const dateKey = Math.floor(sub.creationTimeSeconds / 86400) * 86400;
        activityCalendar[dateKey] = (activityCalendar[dateKey] || 0) + 1;

        if (sub.verdict === 'OK') {
          const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
          if (!solvedProblems.has(problemKey)) {
            solvedProblems.add(problemKey);
            totalSolved++;

            // Map Codeforces rating to difficulty
            const rating = sub.problem.rating || 0;
            if (rating <= 1400) easySolved++;
            else if (rating <= 2100) mediumSolved++;
            else hardSolved++;
          }
        }
      });
    }

    // Parse contest ratings
    let maxRating = userInfo.maxRating || 0;
    let contestsAttended = 0;

    if (ratingsRes.status === 'fulfilled' && ratingsRes.value?.data?.status === 'OK') {
      const ratings = ratingsRes.value.data.result;
      contestsAttended = ratings.length;
    }

    const acceptanceRate = totalSubmissions > 0
      ? Math.round((totalSolved / totalSubmissions) * 100 * 10) / 10
      : 0;

    return {
      platform: 'codeforces',
      handle,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalSubmissions,
      acceptedSubmissions: totalSolved,
      acceptanceRate,
      rating: userInfo.rating || 0,
      maxRating,
      globalRank: userInfo.rank || 'unranked',
      contestsAttended,
      activityCalendar,
      extra: {
        rank: userInfo.rank,
        maxRank: userInfo.maxRank,
        country: userInfo.country,
        city: userInfo.city,
        organization: userInfo.organization,
        avatar: userInfo.avatar,
        friendOfCount: userInfo.friendOfCount,
      },
    };
  } catch (err) {
    if (err.response?.status === 400) {
      throw new Error(`Codeforces user "${handle}" not found`);
    }
    throw new Error(`Codeforces fetch failed: ${err.message}`);
  }
};

module.exports = { fetchCodeforcesStats };
