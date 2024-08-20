import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constants";
import { useParams } from "react-router-dom";
import "./Profile.scss";

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState({});
  console.log(user);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(API_URL + "/api/user/" + username);
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>
      <div className="user-info">
        <h2 className="username">{user.user?.username}</h2>
        <p className="email">{user.user?.email}</p>
      </div>
      <div className="stats-container">
        <h4>
          Total Challenges Played: <span>{user.userStat?.totalChallenges}</span>
        </h4>
        <h4>
          Total Challenges Won: <span>{user.userStat?.totalWins}</span>
        </h4>
        <h4>
          Total Challenges Lost: <span>{user.userStat?.totalLosses}</span>
        </h4>
      </div>
      <div className="challenge-history">
        <h3>Challenge History</h3>
        {user.userStat?.challengeHistory.map((challenge) => (
          <div key={challenge._id} className="challenge">
            <h4 className="challenge-result">{challenge.result}</h4>
            <p className="challenge-score">Score: {challenge.score}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
