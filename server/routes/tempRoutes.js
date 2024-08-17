import express from "express";
import Temp from "../controllers/Temp.js";

const TempRoutes = express.Router();

TempRoutes.get("/", Temp);

export default TempRoutes;
