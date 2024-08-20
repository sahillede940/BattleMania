import React, { useState, useEffect, useContext } from "react";
import { getSocket } from "../../services/socket";
import { RoomContext } from "../../Contexts";
import "./Canvas.scss";

const Canvas = () => {
  const socket = getSocket();
  const { roomId, gameStarted, setGameStarted } = useContext(RoomContext);
  const [gameOver, setGameOver] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState(0);
  const [challengeId, setChallengeId] = useState(0);
  const [usersStatus, setUsersStatus] = useState([]);

  const moveToNextQuestion = () => {
    setAnswers((prevAnswers) => [
      ...prevAnswers,
      {
        question: questions[currentQuestion]?._id,
        answer: selectedOption,
        timeTaken: timeLimit - timer,
      },
    ]);

    socket.emit("submitAnswer", {
      room: roomId,
      answer: selectedOption,
      questionId: questions[currentQuestion]?._id,
      userId: socket?.user?._id,
      challengeId: challengeId,
      timeTaken: timeLimit - timer,
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimer(timeLimit);
      setSelectedOption(null);
    } else {
      setGameOver(1);
      setGameStarted(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("game_started", (data) => {
      console.log(data);
      setGameOver(0);
      setGameStarted(true);
      setQuestions(data.questions);
      setTimeLimit(data.timeLimit);
      setTimer(data.timeLimit);
      setCurrentQuestion(0);
      setAnswers([]);
      setChallengeId(data.challengeId);
    });

    socket.on("game_over", (data) => {
      setGameOver(2);
      setGameStarted(false);
      setWinner(data.winner);
      setScores(data.scores);
      // after 10 seconds make gameover to 0
      setTimeout(() => setGameOver(0), 20000);
    });

    socket.on("usersStatus", (data) => {
      setUsersStatus(data);
    });

    return () => {
      socket.off("game_started");
      socket.off("game_over");
    };
  }, [socket]);

  useEffect(() => {
    if (timer > 0) {
      const timerr = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerr);
    } else if (gameStarted && questions.length > 0) {
      moveToNextQuestion();
    }
  }, [timer]);

  return (
    <div className="game-container">
      {gameStarted ? (
        <div className="canvas">
          <header className="game-header">
            <h4>
              Total Questions: {questions.length}
              <span className="timer">
                Time:{" "}
                <span style={{ color: timer > 5 ? "green" : "red" }}>
                  {timer}
                </span>
              </span>
            </h4>
            <p className="current-question">
              Question {currentQuestion + 1}:{" "}
              {questions[currentQuestion]?.question}
            </p>
          </header>

          <section className="user-status-section">
            {usersStatus.map((user, index) => {
              // do not show current user
              if (user.user === socket?.user?._id) return null;

              return (
                <p key={index} className="user-status">
                  {user.username}: {user.currentQuestion + 1}/{questions.length}
                </p>
              );
            })}
          </section>

          <section className="question-options">
            {questions[currentQuestion]?.options.map((option) => (
              <div key={option.id} className="option-item">
                <input
                  type="radio"
                  id={`option-${option.id}`}
                  name="option"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                />
                <label htmlFor={`option-${option.id}`}>{option.value}</label>
              </div>
            ))}
          </section>

          <button className="next-question-button" onClick={moveToNextQuestion}>
            Next
          </button>
          {selectedOption !== null && (
            // unselct option
            <button
              className="next-question-button"
              onClick={() => setSelectedOption(null)}
            >
              Unselect
            </button>
          )}
        </div>
      ) : (
        <div className="game-status">
          {gameOver === 0 && <p>Waiting For Other Players to Ready</p>}
          {gameOver === 1 && <p>Waiting For Other Player</p>}
          {gameOver === 2 && (
            <div className="game-over">
              <p>Game Over</p>
              <p>
                Winner: {winner.username}, Total Score: {winner.score}
              </p>
              {scores.map((score, index) => (
                <p key={index}>
                  {score.username}: {score.score}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Canvas;
