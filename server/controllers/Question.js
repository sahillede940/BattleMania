import Question from "../models/Question.js";

export const CreateQuestion = async (req, res) => {
  const { questions } = req.body;

  questions.forEach(async (que) => {

    let { question, options, answer, difficulty } = que;
    const createdBy = req.user.id;

    if (!question || !options || !answer || !difficulty || !createdBy) {
      return;
    }

    difficulty = difficulty.toLowerCase();

    if (options.length !== 4) {
      return;
    }

    if (answer < 0 || answer > options.length) {
      return;
    }

    if (
      difficulty !== "easy" &&
      difficulty !== "medium" &&
      difficulty !== "hard"
    ) {
      return;
    }

    const newQuestion = new Question({
      question,
      options,
      answer,
      difficulty,
      createdBy,
    });

    await newQuestion.save();
  });

  res.status(201).json({ message: "Questions added successfully" });
};

function getRandomQuestions(count = 10) {
  return Question.aggregate([{ $sample: { size: count } }]);
}

export const GetQuestions = async (req, res) => {
  const { difficulty } = req.query;
  let questions;

  if (difficulty) {
    questions = await Question.find({ difficulty });
  } else {
    questions = await getRandomQuestions();
    for (let i = 0; i < questions.length; i++) {
      questions[i].answer = undefined;
    }
  }
  res.status(200).json({ questions });
}


export const DeleteQuestion = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    await Question.deleteMany();
    return res.status(200).json({ message: "All questions deleted successfully" });
  }

  await Question.findByIdAndDelete(id);

  res.status(200).json({ message: "Question deleted successfully" });
}