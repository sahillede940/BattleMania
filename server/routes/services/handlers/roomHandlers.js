import Room from "../../../models/Room.js";
import User from "../../../models/User.js";
import { io } from "../io.js";
import rooms from "./RoomStore.js";

const getRooms = async () => {
  // get user names in createdBy field
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

//   list all sockets in a room
const handleRooms = (socket) => {
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

    await room.save(); // Ensure room is saved before fetching rooms

    const rooms = await getRooms();
    io.emit("room_list", rooms);
  });

  socket.on("delete_room", async (data) => {
    const roomId = data.roomId;

    await Room.findByIdAndDelete(roomId);

    await getRooms().then((rooms) => {
      io.emit("room_list", rooms);
    });
  });

  socket.on("join_room", (data) => {
    const roomId = data.roomId;
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }
    rooms[roomId][socket.id] = {
      username: socket.user.username,
      userId: socket.user.id,
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
};

export default handleRooms;
