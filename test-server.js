// const express = require("express");
// const { PrismaClient } = require("@prisma/client");
// require("dotenv").config();

// const app = express();
// const prisma = new PrismaClient();
// const PORT = 3001;

// app.use(express.json());

// // Test endpoint
// app.post("/api/confessions", async (req, res) => {
//   try {
//     console.log("Received request:", req.body);

//     const confession = await prisma.confession.create({
//       data: {
//         content: req.body.content || "Test content",
//         college: req.body.college || null,
//       },
//     });

//     console.log("Created confession:", confession);

//     res.status(201).json({
//       message: "Confession created successfully",
//       confession: {
//         id: confession.id,
//         content: confession.content,
//         createdAt: confession.createdAt,
//         college: confession.college,
//         reactions: {
//           fire: confession.fire,
//           heart: confession.heart,
//           skull: confession.skull,
//           cry: confession.cry,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       error: "Failed to create confession",
//       message: error.message,
//     });
//   }
// });

// // Example logic for /api/confessions/:id/react
// app.post("/api/confessions/:id/react", async (req, res) => {
//   const { reactionType, previousReaction } = req.body;

//   try {
//     // Find confession by id
//     const confession = await prisma.confession.findUnique({
//       where: { id: Number(req.params.id) },
//     });

//     if (!confession) {
//       return res.status(404).json({ error: "Confession not found" });
//     }

//     // Ensure reactions object is initialized and has all keys
//     const defaultReactions = { fire: 0, heart: 0, skull: 0, cry: 0 };
//     let reactions = confession.reactions || { ...defaultReactions };
//     // Fill missing keys
//     for (const key of Object.keys(defaultReactions)) {
//       if (typeof reactions[key] !== "number") reactions[key] = 0;
//     }

//     // Remove previous reaction if exists
//     if (
//       previousReaction &&
//       reactions[previousReaction] !== undefined &&
//       reactions[previousReaction] > 0
//     ) {
//       reactions[previousReaction]--;
//     }

//     // Add new reaction
//     if (reactions[reactionType] !== undefined) {
//       reactions[reactionType]++;
//     } else {
//       reactions[reactionType] = 1;
//     }

//     // Save confession
//     await prisma.confession.update({
//       where: { id: confession.id },
//       data: { reactions }, // ✅ Only update reactions!
//     });

//     // Emit socket event... (logic not included)

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       error: "Failed to update reaction",
//       message: error.message,
//     });
//   }
// });

// app.get("/health", (req, res) => {
//   res.json({ status: "OK" });
// });

// app.listen(PORT, () => {
//   console.log(`Test server running on port ${PORT}`);
// });

// testserver.mjs (ESM Version)

import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(express.json());
app.use(cors());

// Test endpoint
app.post("/api/confessions", async (req, res) => {
  try {
    console.log("Received request:", req.body);

    const confession = await prisma.confession.create({
      data: {
        content: req.body.content || "Test content",
        college: req.body.college || null,
      },
    });

    console.log("Created confession:", confession);

    res.status(201).json({
      message: "Confession created successfully",
      confession: {
        id: confession.id,
        content: confession.content,
        createdAt: confession.createdAt,
        college: confession.college,
        reactions: {
          fire: confession.fire,
          heart: confession.heart,
          skull: confession.skull,
          cry: confession.cry,
        },
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to create confession",
      message: error.message,
    });
  }
});

// Example logic for /api/confessions/:id/react
app.post("/api/confessions/:id/react", async (req, res) => {
  const { reactionType, previousReaction } = req.body;

  try {
    const confession = await prisma.confession.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!confession) {
      return res.status(404).json({ error: "Confession not found" });
    }

    const defaultReactions = { fire: 0, heart: 0, skull: 0, cry: 0 };
    let reactions = confession.reactions || { ...defaultReactions };
    for (const key of Object.keys(defaultReactions)) {
      if (typeof reactions[key] !== "number") reactions[key] = 0;
    }

    if (
      previousReaction &&
      reactions[previousReaction] !== undefined &&
      reactions[previousReaction] > 0
    ) {
      reactions[previousReaction]--;
    }

    if (reactions[reactionType] !== undefined) {
      reactions[reactionType]++;
    } else {
      reactions[reactionType] = 1;
    }

    await prisma.confession.update({
      where: { id: confession.id },
      data: { reactions },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to update reaction",
      message: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
