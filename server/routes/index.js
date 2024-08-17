import { Router } from "express";
import AuthRoutes from "./authRoutes.js";
import validateJWT from "../middlewares/validators.js";
import TempRoutes from "./tempRoutes.js";
import QuestionRoutes from "./questionRoutes.js";
import RoomRoutes from "./roomRoutes.js";

const APIRoutes = Router();

APIRoutes.use("/auth", AuthRoutes);
APIRoutes.use("/temp", TempRoutes);
APIRoutes.use("/question", validateJWT, QuestionRoutes);
APIRoutes.use("/room", RoomRoutes);

APIRoutes.get("*", (req, res) => {
  res.send("API is working");
});

export default APIRoutes;
