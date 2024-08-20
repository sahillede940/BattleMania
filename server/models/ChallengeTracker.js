import mongoose from "mongoose";

const ChallengeTrackerSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    TotalQuestions: {
      type: Number,
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    usersStatus: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          required: true,
          enum: ["in-progress", "completed"],
          default: "in-progress",
        },
        questionStatus: [
          {
            questionId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Question",
              required: true,
            },
            answerMarked: {
              type: Number,
            },
            timeTaken: {
              type: Number,
            },
          },
        ],
        currentQuestion: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

const ChallengeTracker = mongoose.model(
  "ChallengeTracker",
  ChallengeTrackerSchema
);
export default ChallengeTracker;
