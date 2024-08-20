import UserStat from "../models/UserStat.js";
import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
    try {
      const userStats = await UserStat.find({}).sort({ totalPoints: -1 });
  
      const leaderboard = await Promise.all(
        userStats.map(async (userStat) => {
          const user = await User.findById(userStat.user);
          return {
            user: user,
            totalPoints: userStat.totalPoints,
            totalWins: userStat.totalWins,
            totalLosses: userStat.totalLosses,
            totalChallenges: userStat.totalChallenges,
          };
        })
      );
  
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };