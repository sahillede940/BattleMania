import { Router } from "express";
import AuthRoutes from "./authRoutes.js";
import validateJWT from "../middlewares/validators.js";
import TempRoutes from "./tempRoutes.js";
import QuestionRoutes from "./questionRoutes.js";
import RoomRoutes from "./roomRoutes.js";
import UserRoutes from "./userRoutes.js";
import StatsRoutes from "./statsRoute.js";


const APIRoutes = Router();

APIRoutes.use("/auth", AuthRoutes);
APIRoutes.use("/temp", TempRoutes);
APIRoutes.use("/question", validateJWT, QuestionRoutes);
APIRoutes.use("/room", RoomRoutes);
APIRoutes.use("/user", UserRoutes);
APIRoutes.use("/stats", StatsRoutes);

APIRoutes.get("*", (req, res) => {
  res.send("API is working");
});

export default APIRoutes;
