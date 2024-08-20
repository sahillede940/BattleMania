import { io } from "../io.js";

const handleMessages = (socket) => {
  socket.on("send_message", (data) => {
    const roomId = data.roomId;
    io.to(roomId).emit("receive_message", {
      username: socket.user.username,
      message: data.message,
    });
  });
};

export default handleMessages;
