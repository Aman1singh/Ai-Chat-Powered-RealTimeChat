import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}
const socketGroupMap = {}; // {socketId: [groupId]}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- Group Room Logic ---
  socket.on("join-group", (groupId) => {
    const roomName = `group_${groupId}`;
    socket.join(roomName);
    if (!socketGroupMap[socket.id]) socketGroupMap[socket.id] = [];
    if (!socketGroupMap[socket.id].includes(groupId)) {
      socketGroupMap[socket.id].push(groupId);
    }
    socket.to(roomName).emit("memberJoined", { groupId, userId });
  });

  socket.on("leave-group", (groupId) => {
    const roomName = `group_${groupId}`;
    socket.leave(roomName);
    if (socketGroupMap[socket.id]) {
      socketGroupMap[socket.id] = socketGroupMap[socket.id].filter((id) => id !== groupId);
    }
    socket.to(roomName).emit("memberLeft", { groupId, userId });
  });

  // Real-time code collaboration
  socket.on("code-change", ({ groupId, codeContent, cursorPosition }) => {
    const roomName = `group_${groupId}`;
    socket.to(roomName).emit("code-change", { groupId, codeContent, cursorPosition, userId });
  });

  // Cursor position tracking
  socket.on("cursor-move", ({ groupId, cursorPosition, username, color }) => {
    const roomName = `group_${groupId}`;
    socket.to(roomName).emit("cursor-move", { groupId, cursorPosition, username, color, userId });
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle group cleanup on disconnect
    const joinedGroups = socketGroupMap[socket.id] || [];
    for (const groupId of joinedGroups) {
      const roomName = `group_${groupId}`;
      io.to(roomName).emit("memberLeft", { groupId, userId });

      // Check if room is empty after a short delay to allow reconnection
      setTimeout(async () => {
        const room = io.sockets.adapter.rooms.get(roomName);
        const activeMembers = room ? room.size : 0;
        if (activeMembers === 0) {
          const group = await Group.findById(groupId);
          if (group) {
            // Remove disconnected user from DB members if still there
            group.members = group.members.filter((m) => m.toString() !== userId.toString());
            await group.save();

            const updatedGroup = await Group.findById(groupId);
            if (!updatedGroup || updatedGroup.members.length === 0) {
              await GroupMessage.deleteMany({ groupId });
              await Group.findByIdAndDelete(groupId);
              io.emit("groupDeleted", groupId);
            }
          }
        }
      }, 2000);
    }
    delete socketGroupMap[socket.id];
  });
});

export { io, app, server };
