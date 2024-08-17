import Room from "../models/Rooms.js";

export const getRoom = async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId);
  res.json(room);
};
