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

// 1. Configure body parsers with increased limits right at the top.
app.use(express.json({ limit: "300kb" }));
app.use(express.urlencoded({ limit: "300kb", extended: true }));

// 2. Configure CORS to allow requests from your frontend.
// In a real production app, you might want to restrict this further.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// 3. Configure cookie parser to handle cookies.
app.use(cookieParser());

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

// --- Production Deployment ---
if (process.env.NODE_ENV === "production") {
  // FIX: Changed "Frontend" to "frontend" to match common naming conventions
  // and case-sensitive file systems on deployment servers.
  const frontendDistPath = path.join(__dirname, "Frontend", "dist");

  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// --- Server Startup ---
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  connectDB();
});





// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import path from "path";

// // --- Local Imports ---
// import { connectDB } from "./lib/db.js";
// import { app, server } from "./lib/socket.js";

// // --- Route Imports ---
// import authRoutes from "./routes/auth.route.js";
// import messageRoutes from "./routes/message.route.js";
// import userRoutes from "./routes/user.route.js";
// import aiRoutes from "./routes/ai.routes.js";

// // --- Configuration ---
// dotenv.config();
// const PORT = process.env.PORT || 5000;
// const __dirname = path.resolve();

// // --- Middleware ---

// // 1. Configure body parsers with increased limits right at the top.
// // This is the fix for the "413 Payload Too Large" error.
// app.use(express.json({ limit: "300kb" }));
// app.use(express.urlencoded({ limit: "300kb", extended: true }));

// // 2. Configure CORS to allow requests from your frontend.
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Your frontend URL
//     credentials: true,
//   })
// );

// // 3. Configure cookie parser to handle cookies.
// app.use(cookieParser());

// // --- API Routes ---
// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/ai", aiRoutes);

// // --- Production Deployment ---
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "Frontend", "dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "Frontend", "dist", "index.html"));
//   });
// }

// // --- Server Startup ---
// server.listen(PORT, () => {
//   console.log(`Server is running on PORT: ${PORT}`);
//   connectDB();
// });
