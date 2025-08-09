// const express = require('express');
// const { createServer } = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// require('dotenv').config();

// // Import routes and socket handlers
// const confessionRoutes = require('./routes/confessions');
// const reportRoutes = require('./routes/reports');
// const { handleSocketConnection } = require('./socket/socketHandler');

// // Import Instagram service for posting
// const { checkAndPostToInstagram } = require('./services/instagramService');

// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: process.env.NODE_ENV === 'production'
//       ? ["https://your-frontend-domain.com"]
//       : ["http://localhost:3000", "http://localhost:5173"],
//     methods: ["GET", "POST"]
//   }
// });

// // Set io instance for routes immediately after creation
// // confessionRoutes.setIO(io);
// // reportRoutes.setIO(io);

// const PORT = process.env.PORT || 3001;

// // Security middleware
// app.use(helmet());

// // CORS configuration
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? ["https://your-frontend-domain.com"]
//     : ["http://localhost:3000", "http://localhost:5173"],
//   credentials: true
// }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // API Routes
// app.use('/api/confessions', confessionRoutes.router);
// app.use('/api/reports', reportRoutes.router);

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // Handle socket events
//   handleSocketConnection(socket, io);

//   socket.on('disconnect', () => {
//     console.log(`User disconnected: ${socket.id}`);
//   });
// });

// // Global error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);

//   // Don't leak error details in production
//   const errorMessage = process.env.NODE_ENV === 'production'
//     ? 'Internal server error'
//     : err.message;

//   res.status(err.status || 500).json({
//     error: errorMessage,
//     timestamp: new Date().toISOString()
//   });
// });

// // 404 handler for undefined routes
// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Route not found',
//     path: req.originalUrl,
//     timestamp: new Date().toISOString()
//   });
// });

// // Start server
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📡 Socket.IO server ready for connections`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`🔗 Health check: http://localhost:${PORT}/health`);
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received, shutting down gracefully');
//   server.close(() => {
//     console.log('Process terminated');
//   });
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT received, shutting down gracefully');
//   server.close(() => {
//     console.log('Process terminated');
//   });
// });

// module.exports = { app, server, io };

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import { createCanvas, registerFont } from "canvas";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

// Load env variables
dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes and socket handlers
import confessionRoutes from "./routes/confessions.js";
import reportRoutes from "./routes/reports.js";
import { handleSocketConnection } from "./socket/socketHandler.js";
import { checkAndPostToInstagram } from "./services/instagramService.js";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"]
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://campus-confessions.vercel.app",
          ],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
registerFont(path.join(__dirname, "public/fonts/OpenSans-Regular.ttf"), {
  family: "Open Sans",
  weight: "normal",
});

registerFont(path.join(__dirname, "public/fonts/OpenSans-Bold.ttf"), {
  family: "Open Sans",
  weight: "bold",
});

registerFont(path.join(__dirname, "public/fonts/OpenSans-Italic.ttf"), {
  family: "Open Sans",
  style: "italic",
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/api/confessions", confessionRoutes);
app.use("/api/reports", reportRoutes);
// Serve generated images
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Register custom font
const fontPath = path.join(__dirname, "public/fonts/OpenSans-Regular.ttf");
if (fs.existsSync(fontPath)) {
  registerFont(fontPath, { family: "Open Sans" });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
// Image generation endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { content, college } = req.body;
    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#6a0572");
    gradient.addColorStop(1, "#ff4e50");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Card
    const cardX = 60;
    const cardY = 60;
    const cardWidth = width - 120;
    const cardHeight = height - 120;
    const radius = 40;

    ctx.save();
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, radius);
    ctx.clip();

    const cardGradient = ctx.createLinearGradient(
      0,
      cardY,
      0,
      cardY + cardHeight
    );
    cardGradient.addColorStop(0, "rgba(255,255,255,0.25)");
    cardGradient.addColorStop(1, "rgba(255,255,255,0.15)");
    ctx.fillStyle = cardGradient;
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
    ctx.restore();

    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;

    const textX = cardX + 40;
    let textY = cardY + 80;

    ctx.fillStyle = "#000";
    ctx.font = 'bold 42px "Open Sans"';
    ctx.fillText("🕵️ Anonymous Confession", textX, textY);

    textY += 60;
    ctx.font = '28px "Open Sans"';
    ctx.fillStyle = "#333";
    wrapText(ctx, content, textX, textY, cardWidth - 80, 40);

    if (college) {
      ctx.font = 'italic 24px "Open Sans"';
      ctx.fillStyle = "#555";
      ctx.fillText(`📍 ${college}`, textX, cardY + cardHeight - 40);
    }

    // Save to temporary file
    const buffer = canvas.toBuffer("image/png");
    const tempPath = `./temp_confession_${Date.now()}.png`;
    fs.writeFileSync(tempPath, buffer);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(tempPath, {
      folder: "confessions",
    });

    // Delete local temp file
    fs.unlinkSync(tempPath);

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Image generation failed:", error);
    res.status(500).json({ error: "Image generation failed" });
  }
});

// Text wrapping function
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// Socket.IO
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  handleSocketConnection(socket, io);
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Global error handling
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  const errorMessage =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(err.status || 500).json({
    error: errorMessage,
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

export { app, server, io };
