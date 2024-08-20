import Room from "../models/Room.js";

export const getRoom = async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId);
  res.json(room);
};
