import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constants";
import "./LeaderBoard.scss";

const LeaderBoard = () => {
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderBoard = async () => {
      try {
        const response = await axios.get(API_URL + "/api/stats/leaderboard");
        setLeaderBoard(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLeaderBoard();
  }, []);

  return (
    <div className="leaderboard-container">
      <h1>LeaderBoard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
              <th>Total Losses</th>
              <th>Total Wins</th>
              <th>Total Challenges</th>
            </tr>
          </thead>
          <tbody>
            {leaderBoard.map((user, index) => (
              <tr key={user.user}>
                <td>{index + 1}</td>
                <td>{user.user.username}</td>
                <td>{user.totalPoints}</td>
                <td>{user.totalLosses}</td>
                <td>{user.totalWins}</td>
                <td>{user.totalChallenges}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaderBoard;
