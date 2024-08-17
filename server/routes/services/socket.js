import Room from "../../models/Rooms.js";
import User from "../../models/User.js";
import Question from "../../models/Question.js";

import { io } from "./io.js";

let rooms = {};

const getRooms = async () => {
  // get user names in created by field
  const rooms = await Room.find();
  const roomPromises = rooms.map(async (room) => {
    const user = await User.findById(room.createdBy);
    return {
      ...room._doc,
      createdBy: user.username,
    };
  });

  return Promise.all(roomPromises);
};


const onConnection = (socket) => {
  socket.on("get_rooms", async () => {
    await getRooms().then((rooms) => {
      socket.emit("room_list", rooms);
    });
  });

  socket.on("create_room", async (data) => {
    const room = new Room({
      name: data.name,
      createdBy: socket.user.id,
      description: data.description,
    });

    room.save();

    await getRooms().then((rooms) => {
      io.emit("room_list", rooms);
    });
  });

  socket.on("delete_room", async (data) => {
    const roomId = data.roomId;

    await Room.findByIdAndDelete(roomId);

    await getRooms().then((rooms) => {
      io.emit("room_list", rooms);
    });
  });

  const getRoomUsersCount = (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (room) {
      const users = Array.from(room).map((id) => {
        return io.sockets.sockets.get(id).user.username;
      });
      return users;
    }
    return 0;
  };

  socket.on("join_room", (data) => {
    const roomId = data.roomId;
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }
    rooms[roomId][socket.id] = {
      username: socket.user.username,
      ready: false,
    };
    io.to(roomId).emit("updatePlayers", rooms[roomId]);
  });

  socket.on("leave_room", (data) => {
    const roomId = data.roomId; // Get the room ID from the data sent by the client
    socket.leave(roomId); // Leave the room
    if (rooms[roomId]) delete rooms[roomId][socket.id];
    io.to(roomId).emit("updatePlayers", rooms[roomId]);
  });

  socket.on("send_message", (data) => {
    const roomId = data.roomId;
    io.to(roomId).emit("receive_message", {
      username: socket.user.username,
      message: data.message,
    });
  });

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

  socket.on("startGame", (room) => {
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

    const playerQuestions = getRandomQuestions();
    const startTime = Date.now();

    io.to(room).emit("game_started", {
      questions: playerQuestions,
      currentQuestion: playerQuestions[0],
      questionIndex: 0,
      startTime: startTime,
      timeLimit: 20, // 20 seconds per question
    });
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      if (rooms[room][socket.id]) {
        delete rooms[room][socket.id];
        io.to(room).emit("updatePlayers", rooms[room]);
      }
    }
  });
};

export default onConnection;
