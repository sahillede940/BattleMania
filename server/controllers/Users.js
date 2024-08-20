import User from "../models/User.js";
import UserStat from "../models/UserStat.js";

export const getUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({
      username: username,
    });
    if (!user) {
      return res.status(404).json("User not found");
    }

    // get user stats
    const userStat = await UserStat.findOne({
      user: user._id,
    });

    user.password = undefined;
    user.userStat = userStat;

    res.status(200).json({ user, userStat });
  } catch (error) {
    res.status(500).json(error);
  }
};

