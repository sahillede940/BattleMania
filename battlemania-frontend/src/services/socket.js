import io from "socket.io-client";
import { SOCKET_URL } from "../constants";
// service/socket.js

let socket;

export const connectSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");
    console.log("Connecting socket");
    socket = io("http://localhost:5000", {
      query: {
        token: token,
      },
    });
    socket.user = JSON.parse(localStorage.getItem("user"));
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("Socket disconnected");
  }
};

export const getSocket = () => {
  if (!socket) {
    console.log("Socket not connected");
  }
  return socket;
};
