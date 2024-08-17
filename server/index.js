import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import APIRoutes from "./routes/index.js";
import http from "http";
import { Server } from "socket.io";
import onConnection from "./routes/services/socket.js";
import { io, server, app } from "./routes/services/io.js";
import validateJWT from "./middlewares/validators.js";
import jwt from "jsonwebtoken";

dotenv.config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

io.use((socket, next) => {
  const token = socket.handshake.query?.token;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded.user;
    next();
  });
}).on("connection", onConnection);

app.use("/api", APIRoutes);

app.get("*", (req, res) => {
  res.json({ message: "Welcome to Battlemania API" });
});

server.listen(5000, () => {
  console.log(`Server is running on PORT ${5000}`);
});

mongoose
  .connect(process.env.MONGODB_URL, {})
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log("Error:", error.message);
  });
