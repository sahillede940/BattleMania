import mongoose from "mongoose";
import User from "./User.js";
import Room from "./Room.js";

const ChallengeSchema = new mongoose.Schema(
  {
    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    scores: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          score: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// validate the players
ChallengeSchema.pre("validate", async function (next) {
  const users = this.users;
  const roomId = this.roomId;
  const room = await Room.findById(roomId);
  if (!room) {
    return next(new Error("Room not found"));
  }
  const playerPromises = users.map(async (player) => {
    const user = await User.findById(player);
    if (!user) {
      return next(new Error("Player not found"));
    }
  });

  Promise.all(playerPromises).then(() => {
    next();
  });
});

const Challenge = mongoose.model("Challenge", ChallengeSchema);

export default Challenge;
