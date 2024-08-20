import React, { useEffect, useState, createContext } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../../services/socket";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Room.scss";
import { toast } from "react-toastify";
import Canvas from "./Canvas";
import { RoomContext } from "../../Contexts";
import Messages from "../Messages/Messages.jsx";
import UserStatusDialog from "./UserStatusDialog";
import { Link } from "react-router-dom";

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

      if(messages.length > 5){
        setMessages((prevMessages) => prevMessages.slice(1));
      }

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
    };
  }, [socket, messages]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/room/${roomId}`).then((res) => {
      setRoom(res.data);
    });
  }, [roomId]);

  return (
    <div>
      <RoomContext.Provider
        value={{
          gameStarted,
          setGameStarted,
          roomId,
          message,
          messages,
          setMessage,
          setMessages,
          sendMessage,
        }}
      >
        <div className="room-container">
          <header className="room-header">
            <p className="room-info">
              Room Joined: <b>{room?.name}</b>
              {gameStarted && (
                <span className="game-status">(Game Started)</span>
              )}
            </p>
            <button
              className="btn leave-room-button"
              onClick={() => leaveRoom(roomId)}
            >
              Leave Room
            </button>
          </header>

          <Messages />

          {!gameStarted && (
            <UserStatusDialog room={room} usersJoined={usersJoined} />
          )}

          <Canvas />
        </div>
      </RoomContext.Provider>
    </div>
  );
};

export default Room;
