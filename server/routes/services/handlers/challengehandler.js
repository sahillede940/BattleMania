import { io } from "../io.js";
import Challenge from "../../../models/Challenge.js";
import ChallengeTracker from "../../../models/ChallengeTracker.js";
import rooms from "./RoomStore.js";
import Question from "../../../models/Question.js";
import User from "../../../models/User.js";
import UserStat from "../../../models/UserStat.js";

async function getRandomQuestions(count = 10) {
  return await Question.aggregate([{ $sample: { size: count } }]);
}

async function declareWinner(challengeId, room) {
  const challengeTracker = await ChallengeTracker.findOne({
    challengeId: challengeId,
  });

  const challenge = await Challenge.findById(challengeId);
  const timeLimit = challengeTracker.timeLimit;

  let scores = await Promise.all(
    challengeTracker.usersStatus.map(async (user) => {
      try {
        const score = await user.questionStatus.reduce(
          async (accPromise, question) => {
            const acc = await accPromise; // Await the accumulator promise
            const getquestion = await Question.findById(question.questionId);

            if (!getquestion) {
              console.error(
                `Question with ID ${question.questionId} not found.`
              );
              return acc;
            }

            if (
              typeof question.timeTaken !== "number" ||
              typeof timeLimit !== "number"
            ) {
              console.error(
                "Invalid timeTaken or timeLimit:",
                question.timeTaken,
                timeLimit
              );
              return acc;
            }

            if (getquestion.answer === question.answerMarked) {
              return (
                acc + ((timeLimit - question.timeTaken) / timeLimit) * 100 + 20
              );
            } else if (getquestion.answer === null) {
              return acc - 20;
            } else {
              return acc;
            }
          },
          Promise.resolve(0)
        );
        return { user: user.user, score: score };
      } catch (error) {
        return { user: user.user, score: NaN }; // Return NaN in case of error
      }
    })
  );

  // get id of the user with the highest score
  let winner = scores.reduce((acc, score) => {
    if (score.score > acc.score) {
      return score;
    }
    return acc;
  });

  challenge.scores = scores;
  challenge.winner = winner.user;
  await challenge.save();

  // add winner name in scores
  for (const score of scores) {
    const user = await User.findById(score.user);
    score.username = user.username;
  }

  const winnerUser = await User.findById(winner.user);
  winner.username = winnerUser.username;

  io.to(room).emit("game_over", {
    scores: scores,
    winner: winner,
  });

  // update user stats
  for (const score of scores) {
    const userStat = await UserStat.findOne({ user: score.user });
    if (!userStat) {
      console.error(`UserStat not found for user ${score.user}`);
      continue;
    }

    if (score.user === winner.user) {
      userStat.totalWins += 1;
      userStat.totalPoints += score.score;
      userStat.totalChallenges += 1;
      userStat.challengeHistory.push({
        challengeId: challengeId,
        result: "win",
        score: score.score,
      });
    } else {
      userStat.totalLosses += 1;
      userStat.totalPoints += score.score;
      userStat.totalChallenges += 1;
      userStat.challengeHistory.push({
        challengeId: challengeId,
        result: "loss",
        score: score.score,
      });
    }
    await userStat.save();
  }

  // MAKE all player not ready
  for (let player in rooms[room]) {
    rooms[room][player].ready = false;
  }
  io.to(room).emit("updatePlayers", rooms[room]);
}

const handleChallenges = (socket) => {
  socket.on("playerReady", (room) => {
    if (rooms[room]) {
      rooms[room][socket.id].ready = true;
      io.to(room).emit("updatePlayers", rooms[room]);
    }
  });

  socket.on("playerNotReady", (room) => {
    if (rooms[room]) {
      rooms[room][socket.id].ready = false;
      io.to(room).emit("updatePlayers", rooms[room]);
    }
  });

  socket.on("startGame", async (room) => {
    const players = rooms[room];
    let allReady = true;
    for (let player in rooms[room]) {
      if (!players[player].ready) {
        allReady = false;
        break;
      }
    }
    if (!allReady) {
      io.to(room).emit("notAllReady");
      return;
    }
    const questionCount = 10;
    const timeLimit = 20;

    const challenge = new Challenge({
      users: Object.values(players).map((player) => player.userId),
      roomId: room,
      scores: Object.values(players).map((player) => ({
        user: player.userId,
        score: 0,
      })),
      winner: null,
    });

    await challenge.save();

    const challengeTracker = new ChallengeTracker({
      usersStatus: Object.values(players).map((player) => ({
        user: player.userId,
        username: player.username,
        status: "in-progress",
        questionStatus: [],
        currentQuestion: 0,
      })),
      challengeId: challenge._id,
      TotalQuestions: questionCount,
      roomId: room,
      timeLimit: timeLimit,
    });

    await challengeTracker.save();

    const playerQuestions = await getRandomQuestions(questionCount);
    const startTime = Date.now();

    io.to(room).emit("game_started", {
      questions: playerQuestions,
      currentQuestion: 0,
      questionIndex: 0,
      startTime: startTime,
      timeLimit: timeLimit,
      count: questionCount,
      challengeId: challenge._id,
    });
    io.to(room).emit("usersStatus", challengeTracker.usersStatus);
  });

  socket.on("submitAnswer", async (data) => {
    const { room, answer, questionId, userId, challengeId, timeTaken } = data;
    const challengeTracker = await ChallengeTracker.findOne({
      challengeId: challengeId,
    });

    if (!challengeTracker) return;

    // store the answer for the user in the challenge tracker
    const userIndex = challengeTracker?.usersStatus.findIndex(
      (user) => user.user.toString() === userId
    );

    // check if same question is being answered again
    const questionIndex = challengeTracker.usersStatus[
      userIndex
    ].questionStatus.findIndex(
      (question) => question.questionId.toString() === questionId
    );

    if (questionIndex !== -1) {
      return;
    }

    challengeTracker.usersStatus[userIndex].currentQuestion += 1;
    challengeTracker.usersStatus[userIndex].questionStatus.push({
      questionId,
      answerMarked: answer,
      timeTaken: timeTaken,
    });
    if (
      challengeTracker.usersStatus[userIndex].currentQuestion ===
      challengeTracker.TotalQuestions
    ) {
      challengeTracker.usersStatus[userIndex].status = "completed";
    }

    await challengeTracker.save();

    // check if all users have completed the challenge
    const allCompleted = challengeTracker.usersStatus.every(
      (user) => user.status === "completed"
    );

    io.to(room).emit("usersStatus", challengeTracker.usersStatus);

    if (allCompleted) {
      await declareWinner(challengeId, room);
    }
  });
};

export default handleChallenges;
