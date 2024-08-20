import React, { useEffect, useState } from "react";
import "./Dashboard.scss";
import { disconnectSocket, getSocket } from "../../services/socket";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [rooms, setRooms] = useState([]);
  const [createdRoom, setCreatedRoom] = useState("");

  const socket = getSocket();

  const createRoom = () => {
    socket.emit("create_room", {
      name: createdRoom,
      createdBy: socket.user._id,
      description: "This is a test room",
    });
    setCreatedRoom("");
  };

  const navigate = useNavigate();

  const joinRoom = (roomId) => {
    socket.emit("join_room", { roomId });
    navigate(`/dashboard/${roomId}`);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    disconnectSocket();
    window.location.href = "/";
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit("get_rooms");
    socket.on("room_list", (rooms) => {
      setRooms(rooms);
    });
    return () => {
      socket.off("room_list");
    };
  }, [socket]);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message) => {
      console.log(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, messages]);

  return (
    <div className="dashboard-container">
      <div className="container">
        <p>
          User Name:{" "}
          <Link to={`/profile/${user.username}`} className="username">
            {user.username}
          </Link>
        </p>
        <div>
          <button className="btn logout-button" onClick={logout}>
            Logout
          </button>
          <Link to="/leaderboard">
            <button className="btn logout-button">LeaderBoard</button>
          </Link>
        </div>
      </div>

      <div className="create-room-container">
        <input
          type="text"
          value={createdRoom}
          onChange={(e) => setCreatedRoom(e.target.value)}
          className="input-field"
        />
        <button
          className="btn create-room-button"
          onClick={createRoom}
          disabled={!createdRoom}
        >
          Create Room
        </button>
      </div>

      <div className="room-container">
        {rooms.map((room) => (
          <div key={room._id} className="room">
            <p>Name: {room.name}</p>
            <p>Creator: {room.createdBy}</p>
            <button
              className="btn join-room-button"
              onClick={() => joinRoom(room._id)}
            >
              Join
            </button>
            <button
              className="btn delete-room-button"
              onClick={() => socket.emit("delete_room", { roomId: room._id })}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
