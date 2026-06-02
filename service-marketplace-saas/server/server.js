require("dotenv").config();



const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

/* ================= CONFIG ================= */

const connectDB = require("./config/db");
const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorMiddleware");

/* ================= ROUTES ================= */

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const providerRoutes = require("./routes/providerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const searchRoutes = require("./routes/searchRoutes");
const userRoutes = require("./routes/userRoutes");
const avatarUpload = require("./routes/avatarUpload");
const aiRoutes = require("./routes/aiRoutes");

/* ================= APP INIT ================= */

const app = express();
const server = http.createServer(app);

/* ================= DATABASE ================= */

connectDB()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* ================= MIDDLEWARE ================= */

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

/* ================= RATE LIMIT ================= */

app.use(rateLimiter);

/* ================= STATIC FILES ================= */

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 QuickService API running"
  });
});

/* ================= API ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/avatar", avatarUpload);
app.use("/api/user", userRoutes);

/* 🔥 AI ROUTE (IMPORTANT) */
app.use("/api/ai", aiRoutes);

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

/* ================= SOCKET.IO ================= */

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

/* ================= GLOBAL FUNCTIONS ================= */

global.sendNotification = (userId, payload) => {
  if (!userId) return;

  io.to(userId.toString()).emit("notification", {
    ...payload,
    createdAt: new Date()
  });
};

global.sendMessageToUser = (userId, event, data) => {
  if (!userId) return;

  io.to(userId.toString()).emit(event, data);
};

/* ================= SOCKET EVENTS ================= */

io.on("connection", (socket) => {

  console.log("🟢 User connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId.toString());
    }
  });

  socket.on("sendMessage", (msg) => {
    if (msg.receiver) {
      io.to(msg.receiver.toString()).emit("newMessage", msg);
    }
  });

  socket.on("typing", (data) => {
    if (data.receiver) {
      io.to(data.receiver.toString()).emit("typing", data);
    }
  });

  socket.on("stopTyping", (data) => {
    if (data.receiver) {
      io.to(data.receiver.toString()).emit("stopTyping", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });

});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

/* ================= ERROR SAFETY ================= */

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise:", err.message);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

/* ================= EXPORT ================= */

module.exports = app;