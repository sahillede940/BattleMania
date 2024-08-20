import express from "express";
import { getUser } from "../controllers/Users.js";

const UserRoutes = express.Router();

UserRoutes.get("/:username", getUser);

export default UserRoutes;
