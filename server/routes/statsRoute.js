import express from "express";
import { getLeaderboard } from "../controllers/Stats.js";

const StatsRoutes = express.Router();

StatsRoutes.get("/leaderboard", getLeaderboard);

export default StatsRoutes;
