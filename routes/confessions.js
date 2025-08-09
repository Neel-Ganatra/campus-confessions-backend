// // const express = require('express');
// // const Joi = require('joi');
// // const { PrismaClient } = require('@prisma/client');

// // const router = express.Router();
// // const prisma = new PrismaClient();

// // // Socket.IO instance will be passed from server
// // let io = null;

// // // Function to set io instance
// // const setIO = (ioInstance) => {
// //   io = ioInstance;
// // };

// // // Validation schemas
// // const confessionSchema = Joi.object({
// //   content: Joi.string().min(1).max(500).required().messages({
// //     'string.empty': 'Confession content cannot be empty',
// //     'string.max': 'Confession content cannot exceed 500 characters',
// //     'any.required': 'Confession content is required'
// //   }),
// //   college: Joi.string().max(100).optional().allow('', null)
// // });

// // const reactionSchema = Joi.object({
// //   reactionType: Joi.string().valid('fire', 'heart', 'skull', 'cry').required().messages({
// //     'any.only': 'Reaction type must be one of: fire, heart, skull, cry',
// //     'any.required': 'Reaction type is required'
// //   })
// // });

// // /**
// //  * POST /api/confessions
// //  * Create a new anonymous confession
// //  */
// // router.post('/', async (req, res) => {
// //   try {
// //     // Validate request body
// //     const { error, value } = confessionSchema.validate(req.body);
// //     if (error) {
// //       return res.status(400).json({
// //         error: 'Validation error',
// //         details: error.details[0].message
// //       });
// //     }

// //     const { content, college } = value;

// //     // Create confession in database
// //     const confession = await prisma.confession.create({
// //       data: {
// //         content: content.trim(),
// //         college: college ? college.trim() : null
// //       }
// //     });

// //     // Broadcast new confession to all connected clients
// //     // if (io) {
// //     //   io.emit('new_confession', {
// //     //     id: confession.id,
// //     //     content: confession.content,
// //     //     createdAt: confession.createdAt,
// //     //     college: confession.college,
// //     //     reactions: {
// //     //       fire: confession.fire,
// //     //       heart: confession.heart,
// //     //       skull: confession.skull,
// //     //       cry: confession.cry
// //     //     }
// //     //   });
// //     // }

// //     console.log(`📝 New confession created: ID ${confession.id}`);

// //     res.status(201).json({
// //       message: 'Confession created successfully',
// //       confession: {
// //         id: confession.id,
// //         content: confession.content,
// //         createdAt: confession.createdAt,
// //         college: confession.college,
// //         reactions: {
// //           fire: confession.fire,
// //           heart: confession.heart,
// //           skull: confession.skull,
// //           cry: confession.cry
// //         }
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Error creating confession:', error);
// //     res.status(500).json({
// //       error: 'Failed to create confession',
// //       message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
// //     });
// //   }
// // });

// // /**
// //  * GET /api/confessions
// //  * Fetch latest confessions with optional college filter
// //  */
// // router.get('/', async (req, res) => {
// //   try {
// //     const { college, page = 1, limit = 20 } = req.query;

// //     // Validate pagination parameters
// //     const pageNum = parseInt(page);
// //     const limitNum = parseInt(limit);

// //     if (isNaN(pageNum) || pageNum < 1) {
// //       return res.status(400).json({
// //         error: 'Invalid page number'
// //       });
// //     }

// //     if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
// //       return res.status(400).json({
// //         error: 'Invalid limit (must be between 1 and 100)'
// //       });
// //     }

// //     const skip = (pageNum - 1) * limitNum;

// //     // Build where clause for filtering
// //     const whereClause = {
// //       isFlagged: false // Only show non-flagged confessions
// //     };

// //     if (college && college !== 'All') {
// //       whereClause.college = college;
// //     }

// //     // Get confessions with pagination
// //     const [confessions, totalCount] = await Promise.all([
// //       prisma.confession.findMany({
// //         where: whereClause,
// //         orderBy: {
// //           createdAt: 'desc'
// //         },
// //         skip: skip,
// //         take: limitNum,
// //         select: {
// //           id: true,
// //           content: true,
// //           createdAt: true,
// //           college: true,
// //           fire: true,
// //           heart: true,
// //           skull: true,
// //           cry: true
// //         }
// //       }),
// //       prisma.confession.count({
// //         where: whereClause
// //       })
// //     ]);

// //     // Transform data to match frontend expectations
// //     const transformedConfessions = confessions.map(confession => ({
// //       id: confession.id,
// //       text: confession.content, // Map content to text for frontend compatibility
// //       timestamp: confession.createdAt,
// //       college: confession.college || 'Anonymous',
// //       reactions: {
// //         fire: confession.fire,
// //         heart: confession.heart,
// //         skull: confession.skull,
// //         cry: confession.cry
// //       }
// //     }));

// //     const totalPages = Math.ceil(totalCount / limitNum);

// //     res.json({
// //       confessions: transformedConfessions,
// //       pagination: {
// //         currentPage: pageNum,
// //         totalPages: totalPages,
// //         totalCount: totalCount,
// //         hasNextPage: pageNum < totalPages,
// //         hasPrevPage: pageNum > 1
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Error fetching confessions:', error);
// //     res.status(500).json({
// //       error: 'Failed to fetch confessions',
// //       message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
// //     });
// //   }
// // });

// // /**
// //  * POST /api/confessions/:id/react
// //  * React to a confession with one of the available reactions
// //  */
// // router.post('/:id/react', async (req, res) => {
// //   try {
// //     const confessionId = parseInt(req.params.id);

// //     if (isNaN(confessionId)) {
// //       return res.status(400).json({
// //         error: 'Invalid confession ID'
// //       });
// //     }

// //     // Validate request body
// //     const { error, value } = reactionSchema.validate(req.body);
// //     if (error) {
// //       return res.status(400).json({
// //         error: 'Validation error',
// //         details: error.details[0].message
// //       });
// //     }

// //     const { reactionType } = value;

// //     // Check if confession exists
// //     const existingConfession = await prisma.confession.findUnique({
// //       where: { id: confessionId }
// //     });

// //     if (!existingConfession) {
// //       return res.status(404).json({
// //         error: 'Confession not found'
// //       });
// //     }

// //     // Increment the reaction count
// //     const updatedConfession = await prisma.confession.update({
// //       where: { id: confessionId },
// //       data: {
// //         [reactionType]: {
// //           increment: 1
// //         }
// //       }
// //     });

// //     // Check if total reactions reached 50+ for Instagram posting
// //     const totalReactions = updatedConfession.fire + updatedConfession.heart +
// //                           updatedConfession.skull + updatedConfession.cry;

// //     if (totalReactions >= 50) {
// //       // Import and call Instagram service
// //       const { checkAndPostToInstagram } = require('../services/instagramService');
// //       await checkAndPostToInstagram(updatedConfession);
// //     }

// //     // Broadcast updated reaction counts to all clients
// //     // if (io) {
// //     //   io.emit('confession_reacted', {
// //     //     confessionId: confessionId,
// //     //     reactions: {
// //     //       fire: updatedConfession.fire,
// //     //       heart: updatedConfession.heart,
// //     //       skull: updatedConfession.skull,
// //     //       cry: updatedConfession.cry
// //     //     },
// //     //     totalReactions: totalReactions
// //     //   });
// //     // }

// //     console.log(`🔥 Reaction added to confession ${confessionId}: ${reactionType}`);

// //     res.json({
// //       message: 'Reaction added successfully',
// //       confession: {
// //         id: updatedConfession.id,
// //         reactions: {
// //           fire: updatedConfession.fire,
// //           heart: updatedConfession.heart,
// //           skull: updatedConfession.skull,
// //           cry: updatedConfession.cry
// //         }
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Error adding reaction:', error);
// //     res.status(500).json({
// //       error: 'Failed to add reaction',
// //       message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
// //     });
// //   }
// // });

// // /**
// //  * GET /api/confessions/:id
// //  * Get a specific confession by ID
// //  */
// // router.get('/:id', async (req, res) => {
// //   try {
// //     const confessionId = parseInt(req.params.id);

// //     if (isNaN(confessionId)) {
// //       return res.status(400).json({
// //         error: 'Invalid confession ID'
// //       });
// //     }

// //     const confession = await prisma.confession.findUnique({
// //       where: { id: confessionId },
// //       select: {
// //         id: true,
// //         content: true,
// //         createdAt: true,
// //         college: true,
// //         fire: true,
// //         heart: true,
// //         skull: true,
// //         cry: true
// //       }
// //     });

// //     if (!confession) {
// //       return res.status(404).json({
// //         error: 'Confession not found'
// //       });
// //     }

// //     // Transform to match frontend expectations
// //     const transformedConfession = {
// //       id: confession.id,
// //       text: confession.content,
// //       timestamp: confession.createdAt,
// //       college: confession.college || 'Anonymous',
// //       reactions: {
// //         fire: confession.fire,
// //         heart: confession.heart,
// //         skull: confession.skull,
// //         cry: confession.cry
// //       }
// //     };

// //     res.json({
// //       confession: transformedConfession
// //     });

// //   } catch (error) {
// //     console.error('Error fetching confession:', error);
// //     res.status(500).json({
// //       error: 'Failed to fetch confession',
// //       message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
// //     });
// //   }
// // });

// // module.exports = { router, setIO };

// const express = require("express");
// const Joi = require("joi");
// const { PrismaClient } = require("@prisma/client");
// const {
//   broadcastNewConfession,
//   broadcastReactionUpdate,
// } = require("../socket/socketHandler");

// const router = express.Router();
// const prisma = new PrismaClient();

// // Socket.IO instance (to be set in server.js)
// let io = null;

// // Function to set io instance
// const setIO = (ioInstance) => {
//   io = ioInstance;
// };
// const { checkAndPostToInstagram } = require("../instagramService");

// // Validation schemas
// const confessionSchema = Joi.object({
//   content: Joi.string().min(1).max(500).required().messages({
//     "string.empty": "Confession content cannot be empty",
//     "string.max": "Confession content cannot exceed 500 characters",
//     "any.required": "Confession content is required",
//   }),
//   college: Joi.string().max(100).optional().allow("", null),
// });

// const reactionSchema = Joi.object({
//   reactionType: Joi.string()
//     .valid("fire", "heart", "skull", "cry")
//     .required()
//     .messages({
//       "any.only": "Reaction type must be one of: fire, heart, skull, cry",
//       "any.required": "Reaction type is required",
//     }),
//   previousReaction: Joi.string()
//     .valid("fire", "heart", "skull", "cry")
//     .allow(null)
//     .optional(), // ✅ ALLOW THIS
// });

// // <-- allow extra fields

// /**
//  * POST /api/confessions
//  * Create a new anonymous confession
//  */
// router.post("/", async (req, res) => {
//   try {
//     const { error, value } = confessionSchema.validate(req.body);
//     if (error) {
//       return res
//         .status(400)
//         .json({ error: "Validation error", details: error.details[0].message });
//     }

//     const { content, college } = value;

//     const confession = await prisma.confession.create({
//       data: {
//         content: content.trim(),
//         college: college ? college.trim() : null,
//       },
//     });

//     // Emit to all clients
//     if (io) {
//       io.emit("new_confession", {
//         id: confession.id,
//         content: confession.content,
//         createdAt: confession.createdAt,
//         college: confession.college,
//         fire: confession.fire || 0,
//         heart: confession.heart || 0,
//         skull: confession.skull || 0,
//         cry: confession.cry || 0,
//       });
//     }

//     console.log(`📝 New confession created: ID ${confession.id}`);

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
//     console.error("Error creating confession:", error);
//     res.status(500).json({
//       error: "Failed to create confession",
//       message:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : "Internal server error",
//     });
//   }
// });

// /**
//  * GET /api/confessions
//  * Fetch latest confessions with optional college filter
//  */
// router.get("/", async (req, res) => {
//   try {
//     const { college, page = 1, limit = 20 } = req.query;
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     if (isNaN(pageNum) || isNaN(limitNum)) {
//       return res.status(400).json({ error: "Invalid pagination parameters" });
//     }

//     const whereClause = { isFlagged: false };
//     if (college && college !== "All") {
//       whereClause.college = college;
//     }

//     const [confessions, totalCount] = await Promise.all([
//       prisma.confession.findMany({
//         where: whereClause,
//         orderBy: { createdAt: "desc" },
//         skip,
//         take: limitNum,
//         select: {
//           id: true,
//           content: true,
//           createdAt: true,
//           college: true,
//           fire: true,
//           heart: true,
//           skull: true,
//           cry: true,
//         },
//       }),
//       prisma.confession.count({ where: whereClause }),
//     ]);

//     const transformed = confessions.map((c) => ({
//       id: c.id,
//       text: c.content,
//       timestamp: c.createdAt,
//       college: c.college || "Anonymous",
//       reactions: {
//         fire: c.fire,
//         heart: c.heart,
//         skull: c.skull,
//         cry: c.cry,
//       },
//     }));

//     const totalPages = Math.ceil(totalCount / limitNum);

//     res.json({
//       confessions: transformed,
//       pagination: {
//         currentPage: pageNum,
//         totalPages,
//         totalCount,
//         hasNextPage: pageNum < totalPages,
//         hasPrevPage: pageNum > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching confessions:", error);
//     res.status(500).json({
//       error: "Failed to fetch confessions",
//       message:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : "Internal server error",
//     });
//   }
// });

// /**
//  * POST /api/confessions/:id/react
//  * React to a confession
//  */
// router.post("/:id/react", async (req, res) => {
//   try {
//     const confessionId = parseInt(req.params.id);
//     if (isNaN(confessionId)) {
//       return res.status(400).json({ error: "Invalid confession ID" });
//     }

//     const { error, value } = reactionSchema.validate(req.body);
//     if (error) {
//       return res
//         .status(400)
//         .json({ error: "Validation error", details: error.details[0].message });
//     }

//     const { reactionType, previousReaction } = value;

//     const confession = await prisma.confession.findUnique({
//       where: { id: confessionId },
//     });

//     if (!confession) {
//       return res.status(404).json({ error: "Confession not found" });
//     }

//     // Decrement previous reaction if it exists
//     if (previousReaction) {
//       await prisma.confession.update({
//         where: { id: confessionId },
//         data: {
//           [previousReaction]: { decrement: 1 },
//         },
//       });
//     }

//     const updatedConfession = await prisma.confession.update({
//       where: { id: confessionId },
//       data: {
//         [reactionType]: { increment: 1 },
//       },
//     });

//     const totalReactions =
//       updatedConfession.fire +
//       updatedConfession.heart +
//       updatedConfession.skull +
//       updatedConfession.cry;

//     // Trigger Instagram posting if 50+
//     if (totalReactions >= 50) {
//       const {
//         checkAndPostToInstagram,
//       } = require("../services/instagramService");
//       await checkAndPostToInstagram(updatedConfession);
//     }

//     // Emit via socket
//     if (io) {
//       broadcastReactionUpdate(
//         confessionId,
//         {
//           fire: updatedConfession.fire,
//           heart: updatedConfession.heart,
//           skull: updatedConfession.skull,
//           cry: updatedConfession.cry,
//         },
//         io
//       );
//     }

//     console.log(
//       `🔥 Reaction added to confession ${confessionId}: ${reactionType}`
//     );

//     res.json({
//       message: "Reaction added successfully",
//       confession: {
//         id: updatedConfession.id,
//         reactions: {
//           fire: updatedConfession.fire,
//           heart: updatedConfession.heart,
//           skull: updatedConfession.skull,
//           cry: updatedConfession.cry,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error adding reaction:", error);
//     res.status(500).json({
//       error: "Failed to add reaction",
//       message:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : "Internal server error",
//     });
//   }
// });

// module.exports = { router, setIO };

// confessions.js (Full Code with Instagram Trigger Integration)

// const express = require("express");
// const Joi = require("joi");
// const { PrismaClient } = require("@prisma/client");
// const {
//   broadcastNewConfession,
//   broadcastReactionUpdate,
// } = require("../socket/socketHandler");
// const { checkAndPostToInstagram } = require("../services/instagramService");

// const router = express.Router();
// const prisma = new PrismaClient();

// let io = null;
// const setIO = (ioInstance) => {
//   io = ioInstance;
// };

// // Validation Schemas
// const confessionSchema = Joi.object({
//   content: Joi.string().min(1).max(500).required(),
//   college: Joi.string().max(100).optional().allow("", null),
// });

// const reactionSchema = Joi.object({
//   reactionType: Joi.string().valid("fire", "heart", "skull", "cry").required(),
//   previousReaction: Joi.string()
//     .valid("fire", "heart", "skull", "cry")
//     .allow(null)
//     .optional(),
// });

// // Create a new confession
// router.post("/", async (req, res) => {
//   try {
//     const { error, value } = confessionSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const { content, college } = value;

//     const confession = await prisma.confession.create({
//       data: {
//         content: content.trim(),
//         college: college ? college.trim() : null,
//       },
//     });

//     if (io) {
//       broadcastNewConfession(confession, io);
//     }

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
//   } catch (err) {
//     console.error("Error creating confession:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Fetch confessions
// router.get("/", async (req, res) => {
//   try {
//     const { college, page = 1, limit = 20 } = req.query;
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     if (isNaN(pageNum) || isNaN(limitNum))
//       return res.status(400).json({ error: "Invalid pagination" });

//     const whereClause = { isFlagged: false };
//     if (college && college !== "All") whereClause.college = college;

//     const [confessions, totalCount] = await Promise.all([
//       prisma.confession.findMany({
//         where: whereClause,
//         orderBy: { createdAt: "desc" },
//         skip: (pageNum - 1) * limitNum,
//         take: limitNum,
//         select: {
//           id: true,
//           content: true,
//           createdAt: true,
//           college: true,
//           fire: true,
//           heart: true,
//           skull: true,
//           cry: true,
//         },
//       }),
//       prisma.confession.count({ where: whereClause }),
//     ]);

//     const transformed = confessions.map((c) => ({
//       id: c.id,
//       text: c.content,
//       timestamp: c.createdAt,
//       college: c.college || "Anonymous",
//       reactions: {
//         fire: c.fire,
//         heart: c.heart,
//         skull: c.skull,
//         cry: c.cry,
//       },
//     }));

//     res.json({
//       confessions: transformed,
//       pagination: {
//         currentPage: pageNum,
//         totalPages: Math.ceil(totalCount / limitNum),
//         totalCount,
//         hasNextPage: pageNum * limitNum < totalCount,
//         hasPrevPage: pageNum > 1,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching confessions:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // React to a confession
// router.post("/:id/react", async (req, res) => {
//   try {
//     const confessionId = parseInt(req.params.id);
//     if (isNaN(confessionId))
//       return res.status(400).json({ error: "Invalid confession ID" });

//     const { error, value } = reactionSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const { reactionType, previousReaction } = value;

//     // Adjust reaction counts
//     if (previousReaction && previousReaction !== reactionType) {
//       await prisma.confession.update({
//         where: { id: confessionId },
//         data: { [previousReaction]: { decrement: 1 } },
//       });
//     }

//     const updatedConfession = await prisma.confession.update({
//       where: { id: confessionId },
//       data: { [reactionType]: { increment: 1 } },
//     });

//     const totalReactions =
//       updatedConfession.fire +
//       updatedConfession.heart +
//       updatedConfession.skull +
//       updatedConfession.cry;

//     if (totalReactions >= 50) {
//       await checkAndPostToInstagram(updatedConfession);
//     }

//     if (io) {
//       broadcastReactionUpdate(
//         confessionId,
//         {
//           fire: updatedConfession.fire,
//           heart: updatedConfession.heart,
//           skull: updatedConfession.skull,
//           cry: updatedConfession.cry,
//         },
//         io
//       );
//     }

//     res.json({
//       message: "Reaction added",
//       confession: {
//         id: updatedConfession.id,
//         reactions: {
//           fire: updatedConfession.fire,
//           heart: updatedConfession.heart,
//           skull: updatedConfession.skull,
//           cry: updatedConfession.cry,
//         },
//       },
//     });
//   } catch (err) {
//     console.error("Error reacting to confession:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// module.exports = { router, setIO };

// confession.js (ESM Version)

import express from "express";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";
import {
  broadcastNewConfession,
  broadcastReactionUpdate,
} from "../socket/socketHandler.js";
import { checkAndPostToInstagram } from "../services/instagramService.js";

const router = express.Router();
const prisma = new PrismaClient();

let io = null;
export const setIO = (ioInstance) => {
  io = ioInstance;
};

// Validation Schemas
const confessionSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
  college: Joi.string().max(100).optional().allow("", null),
});

const reactionSchema = Joi.object({
  reactionType: Joi.string().valid("fire", "heart", "skull", "cry").required(),
  previousReaction: Joi.string()
    .valid("fire", "heart", "skull", "cry")
    .allow(null)
    .optional(),
});

// Create a new confession
router.post("/", async (req, res) => {
  try {
    const { error, value } = confessionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { content, college } = value;

    const confession = await prisma.confession.create({
      data: {
        content: content.trim(),
        college: college ? college.trim() : null,
      },
    });

    if (io) {
      broadcastNewConfession(confession, io);
    }

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
  } catch (err) {
    console.error("Error creating confession:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch confessions
router.get("/", async (req, res) => {
  try {
    const { college, page = 1 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = 20; // Enforce 20 posts per page as requested

    if (isNaN(pageNum))
      return res.status(400).json({ error: "Invalid pagination" });

    const whereClause = { isFlagged: false };
    if (college && college !== "All") {
      // Treat Anonymous as null in DB
      if (college === "Anonymous") {
        whereClause.college = null;
      } else {
        whereClause.college = college;
      }
    }

    const [confessions, totalCount] = await Promise.all([
      prisma.confession.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          content: true,
          createdAt: true,
          college: true,
          fire: true,
          heart: true,
          skull: true,
          cry: true,
          _count: { select: { comments: true } },
        },
      }),
      prisma.confession.count({ where: whereClause }),
    ]);

    const transformed = confessions.map((c) => ({
      id: c.id,
      text: c.content,
      timestamp: c.createdAt,
      college: c.college || "Anonymous",
      reactions: {
        fire: c.fire,
        heart: c.heart,
        skull: c.skull,
        cry: c.cry,
      },
      commentsCount: c._count?.comments || 0,
    }));

    res.json({
      confessions: transformed,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNextPage: pageNum * limitNum < totalCount,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching confessions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// React to a confession
router.post("/:id/react", async (req, res) => {
  try {
    const confessionId = parseInt(req.params.id);
    if (isNaN(confessionId))
      return res.status(400).json({ error: "Invalid confession ID" });

    const { error, value } = reactionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { reactionType, previousReaction } = value;

    if (previousReaction && previousReaction !== reactionType) {
      await prisma.confession.update({
        where: { id: confessionId },
        data: { [previousReaction]: { decrement: 1 } },
      });
    }

    const updatedConfession = await prisma.confession.update({
      where: { id: confessionId },
      data: { [reactionType]: { increment: 1 } },
    });

    const totalReactions =
      updatedConfession.fire +
      updatedConfession.heart +
      updatedConfession.skull +
      updatedConfession.cry;

    if (totalReactions >= 50) {
      await checkAndPostToInstagram(updatedConfession);
    }

    if (io) {
      broadcastReactionUpdate(
        confessionId,
        {
          fire: updatedConfession.fire,
          heart: updatedConfession.heart,
          skull: updatedConfession.skull,
          cry: updatedConfession.cry,
        },
        io
      );
    }

    res.json({
      message: "Reaction added",
      confession: {
        id: updatedConfession.id,
        reactions: {
          fire: updatedConfession.fire,
          heart: updatedConfession.heart,
          skull: updatedConfession.skull,
          cry: updatedConfession.cry,
        },
      },
    });
  } catch (err) {
    console.error("Error reacting to confession:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
// Comments endpoints
router.get("/:id/comments", async (req, res) => {
  try {
    const confessionId = parseInt(req.params.id);
    const page = parseInt(req.query.page || "1");
    const limit = Math.min(parseInt(req.query.limit || "20"), 50);
    if (isNaN(confessionId) || isNaN(page) || isNaN(limit)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { confessionId },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          content: true,
          createdAt: true,
          parentId: true, // ✅ add this
        },
      }),
      prisma.comment.count({ where: { confessionId } }),
    ]);

    res.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const confessionId = parseInt(req.params.id);
    const { content, parentId } = req.body || {}; // ✅ added parentId here

    if (isNaN(confessionId) || !content || !content.trim()) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const confession = await prisma.confession.findUnique({
      where: { id: confessionId },
      select: { id: true },
    });
    if (!confession) {
      return res.status(404).json({ error: "Confession not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        confessionId,
        content: content.trim(),
        parentId: parentId || null, // ✅ now works
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        confessionId: true,
        parentId: true, // ✅ include parentId in response
      },
    });

    if (io) {
      io.emit("comment_created", {
        confessionId,
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          parentId: comment.parentId,
        },
      });
    }

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
