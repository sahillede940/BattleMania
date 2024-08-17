import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    answer: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", QuestionSchema);

export default Question;