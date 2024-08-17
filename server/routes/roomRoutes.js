import express from "express";
import { getRoom } from "../controllers/Room.js";

const RoomRoutes = express.Router();

RoomRoutes.get("/:roomId", getRoom);

export default RoomRoutes;
