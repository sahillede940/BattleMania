import User from "./User.js";
import mongoose from "mongoose";
import Challenge from "./Challenge.js";

const UserStatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalChallenges: {
      type: Number,
      default: 0,
    },
    totalWins: {
      type: Number,
      default: 0,
    },
    totalLosses: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    challengeHistory: {
      type: [
        {
          challengeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Challenge",
          },
          result: {
            type: String,
            enum: ["win", "loss"],
          },
          score: {
            type: Number,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

UserStatSchema.pre("validate", async function (next) {
  const user = User.findById(this.user);
  if (!user) {
    return next(new Error("User not found"));
  }
  next();
});

UserStatSchema.pre("save", async function (next) {
  const challengeHistory = this.challengeHistory;
  const lastChallenge = challengeHistory[challengeHistory.length - 1];
  if (lastChallenge) {
    const challengeId = lastChallenge.challengeId;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return next(new Error("Challenge not found"));
    }
  }
  next();
});

const UserStat = mongoose.model("UserStat", UserStatSchema);

export default UserStat;
