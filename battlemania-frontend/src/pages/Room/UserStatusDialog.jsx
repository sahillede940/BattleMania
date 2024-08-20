import React from "react";
import { RoomContext } from "../../Contexts";
import { getSocket } from "../../services/socket";
import "./UserStatusDialog.scss";
const UserStatusDialog = ({ room, usersJoined }) => {
  const socket = getSocket();

  return (
    <div className="game-dialog">
      <div className="players-list-container">
        <p className="players-title">Players</p>
        <ul className="players-list">
          {Object.keys(usersJoined).map((userId, index) => (
            <li key={index} className="player-item">
              {usersJoined[userId].username} -{" "}
              <span
                className={
                  usersJoined[userId].ready
                    ? "status ready"
                    : "status not-ready"
                }
              >
                {usersJoined[userId].ready ? "Ready" : "Not Ready"}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="game-buttons-container">
        <button
          className="btn"
          onClick={() => socket.emit("playerReady", room._id)}
        >
          Ready
        </button>
        <button
          className="btn"
          onClick={() => socket.emit("playerNotReady", room._id)}
        >
          Not Ready
        </button>
        <button
          className="btn start-game-button"
          onClick={() => socket.emit("startGame", room._id)}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default UserStatusDialog;
