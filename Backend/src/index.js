import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

// --- Local Imports ---
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

// --- Route Imports ---
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.route.js";
import aiRoutes from "./routes/ai.routes.js";

// --- Configuration ---
dotenv.config();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// --- Middleware ---
app.use(express.json()); // To parse JSON payloads
app.use(cookieParser()); // To parse cookies
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
  })
);

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

// --- Production Deployment ---
if (process.env.NODE_ENV === "production") {
  // Corrected path to go up one level from /Backend to the root, then into the /client/dist folder
  const clientDistPath = path.join(__dirname, "..", "Frontend", "dist");

  app.use(express.static(clientDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// --- Server Startup ---
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  connectDB();
});
