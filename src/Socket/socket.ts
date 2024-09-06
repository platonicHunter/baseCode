import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
let io = new Server(server, {
  cors: {
    origin: ["http://localhost:5000"],
    methods: ["GET", "POST"],
  },
});

// Define the userSocketMap with explicit types
const userSocketMap: Record<string, string> = {};

export const getReceiverSocketId = (receiverId: string): string | undefined => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId as string | undefined;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
