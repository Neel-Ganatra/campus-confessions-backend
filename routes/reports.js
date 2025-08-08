// const express = require('express');
// const Joi = require('joi');
// const { PrismaClient } = require('@prisma/client');

// const router = express.Router();
// const prisma = new PrismaClient();

// // Socket.IO instance will be passed from server
// let io = null;

// // Function to set io instance
// const setIO = (ioInstance) => {
//   io = ioInstance;
// };

// // Validation schema for reports
// const reportSchema = Joi.object({
//   reason: Joi.string().min(1).max(500).required().messages({
//     'string.empty': 'Report reason cannot be empty',
//     'string.max': 'Report reason cannot exceed 500 characters',
//     'any.required': 'Report reason is required'
//   })
// });

// /**
//  * POST /api/reports
//  * Report a confession for moderation
//  */
// router.post('/', async (req, res) => {
//   try {
//     const { confessionId, reason } = req.body;

//     // Validate confession ID
//     const confessionIdNum = parseInt(confessionId);
//     if (isNaN(confessionIdNum)) {
//       return res.status(400).json({
//         error: 'Invalid confession ID'
//       });
//     }

//     // Validate request body
//     const { error, value } = reportSchema.validate({ reason });
//     if (error) {
//       return res.status(400).json({
//         error: 'Validation error',
//         details: error.details[0].message
//       });
//     }

//     // Check if confession exists
//     const confession = await prisma.confession.findUnique({
//       where: { id: confessionIdNum }
//     });

//     if (!confession) {
//       return res.status(404).json({
//         error: 'Confession not found'
//       });
//     }

//     // Create report
//     const report = await prisma.report.create({
//       data: {
//         confessionId: confessionIdNum,
//         reason: value.reason.trim()
//       }
//     });

//     // Check if this confession has been reported multiple times
//     const reportCount = await prisma.report.count({
//       where: { confessionId: confessionIdNum }
//     });

//     // If confession has been reported 3 or more times, flag it for moderation
//     if (reportCount >= 3) {
//       await prisma.confession.update({
//         where: { id: confessionIdNum },
//         data: { isFlagged: true }
//       });

//       console.log(`🚩 Confession ${confessionIdNum} flagged for moderation (${reportCount} reports)`);
//     }

//     console.log(`📋 Report created for confession ${confessionIdNum}`);

//     res.status(201).json({
//       message: 'Report submitted successfully',
//       report: {
//         id: report.id,
//         confessionId: report.confessionId,
//         reason: report.reason,
//         reportedAt: report.reportedAt
//       }
//     });

//   } catch (error) {
//     console.error('Error creating report:', error);
//     res.status(500).json({
//       error: 'Failed to submit report',
//       message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/reports
//  * Get all reports (admin/moderator endpoint)
//  */
// router.get('/', async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query;

//     // Validate pagination parameters
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     if (isNaN(pageNum) || pageNum < 1) {
//       return res.status(400).json({
//         error: 'Invalid page number'
//       });
//     }

//     if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
//       return res.status(400).json({
//         error: 'Invalid limit (must be between 1 and 100)'
//       });
//     }

//     const skip = (pageNum - 1) * limitNum;

//     // Get reports with confession details
//     const [reports, totalCount] = await Promise.all([
//       prisma.report.findMany({
//         skip: skip,
//         take: limitNum,
//         orderBy: {
//           reportedAt: 'desc'
//         },
//         include: {
//           confession: {
//             select: {
//               id: true,
//               content: true,
//               createdAt: true,
//               college: true,
//               isFlagged: true
//             }
//           }
//         }
//       }),
//       prisma.report.count()
//     ]);

//     const totalPages = Math.ceil(totalCount / limitNum);

//     res.json({
//       reports: reports,
//       pagination: {
//         currentPage: pageNum,
//         totalPages: totalPages,
//         totalCount: totalCount,
//         hasNextPage: pageNum < totalPages,
//         hasPrevPage: pageNum > 1
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching reports:', error);
//     res.status(500).json({
//       error: 'Failed to fetch reports',
//       message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/reports/confession/:id
//  * Get all reports for a specific confession
//  */
// router.get('/confession/:id', async (req, res) => {
//   try {
//     const confessionId = parseInt(req.params.id);

//     if (isNaN(confessionId)) {
//       return res.status(400).json({
//         error: 'Invalid confession ID'
//       });
//     }

//     // Check if confession exists
//     const confession = await prisma.confession.findUnique({
//       where: { id: confessionId }
//     });

//     if (!confession) {
//       return res.status(404).json({
//         error: 'Confession not found'
//       });
//     }

//     // Get all reports for this confession
//     const reports = await prisma.report.findMany({
//       where: { confessionId: confessionId },
//       orderBy: {
//         reportedAt: 'desc'
//       }
//     });

//     res.json({
//       confession: {
//         id: confession.id,
//         content: confession.content,
//         createdAt: confession.createdAt,
//         college: confession.college,
//         isFlagged: confession.isFlagged
//       },
//       reports: reports
//     });

//   } catch (error) {
//     console.error('Error fetching confession reports:', error);
//     res.status(500).json({
//       error: 'Failed to fetch confession reports',
//       message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// });

// /**
//  * DELETE /api/reports/:id
//  * Delete a report (admin/moderator endpoint)
//  */
// router.delete('/:id', async (req, res) => {
//   try {
//     const reportId = parseInt(req.params.id);

//     if (isNaN(reportId)) {
//       return res.status(400).json({
//         error: 'Invalid report ID'
//       });
//     }

//     // Check if report exists
//     const report = await prisma.report.findUnique({
//       where: { id: reportId }
//     });

//     if (!report) {
//       return res.status(404).json({
//         error: 'Report not found'
//       });
//     }

//     // Delete the report
//     await prisma.report.delete({
//       where: { id: reportId }
//     });

//     console.log(`🗑️ Report ${reportId} deleted`);

//     res.json({
//       message: 'Report deleted successfully'
//     });

//   } catch (error) {
//     console.error('Error deleting report:', error);
//     res.status(500).json({
//       error: 'Failed to delete report',
//       message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// });

// module.exports = { router, setIO };

// report.js (ESM Version)

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
    const { college, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || isNaN(limitNum))
      return res.status(400).json({ error: "Invalid pagination" });

    const whereClause = { isFlagged: false };
    if (college && college !== "All") whereClause.college = college;

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
