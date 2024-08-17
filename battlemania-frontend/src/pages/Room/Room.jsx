import React, { useEffect, useState, createContext } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../../services/socket";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Room.scss";
import { toast } from "react-toastify";
import Canvas from "./Canvas";

const RoomContext = createContext();

const Room = () => {
  const { roomId } = useParams();
  const socket = getSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersJoined, setUsersJoined] = useState({});
  const [room, setRoom] = useState({});
  const [gameStarted, setGameStarted] = useState(false);

  const navigate = useNavigate();
  const leaveRoom = (roomId) => {
    socket.emit("leave_room", { roomId });
    navigate("/dashboard");
  };

  const sendMessage = (roomId) => {
    if (!message) return;
    socket.emit("send_message", {
      roomId,
      message,
      userId: socket.user._id,
    });
    setMessage("");
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: message.message,
          username: message.username,
        },
      ]);
    });

    socket.on("updatePlayers", (users) => {
      setUsersJoined(users);
    });

    socket.on("notAllReady", () => {
      toast.warn("Not all players are ready");
    });

    return () => {
      socket.off("receive_message");
      socket.off("joined_users");
      socket.off("notAllReady");
      socket.off("game_started");
    };
  }, [socket, messages]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/room/${roomId}`).then((res) => {
      setRoom(res.data);
    });
  }, [roomId]);

  return (
    <div>
      <p>
        Room Joined: <b>{room?.name}</b>
      </p>
      <button onClick={() => leaveRoom(roomId)}>Leave Room</button>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={() => sendMessage(roomId)}>Send Message </button>
      </div>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            {msg.username} : {msg.message}
          </p>
        ))}
      </div>

      {/* Ready or Not ready option */}

      {!gameStarted && (
        <div className="game_dialog">
          <div>
            <p>Players</p>
            <ul>
              {Object.keys(usersJoined).map((userId, index) => (
                <li key={index}>
                  {usersJoined[userId].username} -{" "}
                  {usersJoined[userId].ready ? "Ready" : "Not Ready"}
                </li>
              ))}
            </ul>
          </div>

          <button onClick={() => socket.emit("playerReady", room._id)}>
            Ready
          </button>
          <button onClick={() => socket.emit("playerNotReady", room._id)}>
            Not Ready
          </button>

          {/* Start Game button */}

          <button onClick={() => socket.emit("startGame", room._id)}>
            Start Game
          </button>
        </div>
      )}

      <RoomContext.Provider value={{ gameStarted, setGameStarted }}>
        <Canvas />
      </RoomContext.Provider>
    </div>
  );
};

export default Room;
