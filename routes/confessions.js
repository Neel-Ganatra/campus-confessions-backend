import express from "express";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";
import {
  broadcastNewConfession,
  broadcastReactionUpdate,
} from "../socket/socketHandler.js";
import { checkAndPostToInstagram } from "../services/instagramService.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

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
      select: {
        id: true,
        fire: true,
        heart: true,
        skull: true,
        cry: true,
        postedToWebhook: true,
        content: true,
        college: true,
        createdAt: true,
      },
    });

    const totalReactions =
      updatedConfession.fire +
      updatedConfession.heart +
      updatedConfession.skull +
      updatedConfession.cry;

    console.log(
      `Total reactions: ${totalReactions}, calling checkAndPostToInstagram...`
    );

    // if (totalReactions >= 50) {
    //   console.log(`Total reactions >= 50, calling checkAndPostToInstagram...`);
    //   await checkAndPostToInstagram(updatedConfession);
    // }
    if (totalReactions >= 50 && !updatedConfession.postedToWebhook) {
      const postResult = await checkAndPostToInstagram(updatedConfession);

      if (postResult.success) {
        await prisma.confession.update({
          where: { id: confessionId },
          data: { postedToWebhook: true },
        });
      }
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
