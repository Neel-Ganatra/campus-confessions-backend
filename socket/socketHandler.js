// /**
//  * Socket.IO Connection Handler
//  * Manages real-time communication between clients and server
//  */

// // Store connected clients for analytics
// const connectedClients = new Set();

// /**
//  * Handle new socket connections
//  * @param {Socket} socket - The connected socket instance
//  * @param {Server} io - The Socket.IO server instance
//  */
// const handleSocketConnection = (socket, io) => {
//   // Add client to connected set
//   connectedClients.add(socket.id);

//   console.log(`🔌 Client connected: ${socket.id}`);
//   console.log(`📊 Total connected clients: ${connectedClients.size}`);

//   // Send welcome message to client
//   socket.emit("welcome", {
//     message: "Connected to Campus Confessions",
//     clientId: socket.id,
//     timestamp: new Date().toISOString(),
//   });

//   // Handle client joining a room (for college-specific updates)
//   socket.on("join_room", (roomName) => {
//     socket.join(roomName);
//     console.log(`🏠 Client ${socket.id} joined room: ${roomName}`);

//     socket.emit("room_joined", {
//       room: roomName,
//       message: `Joined ${roomName} room`,
//     });
//   });

//   // Handle client leaving a room
//   socket.on("leave_room", (roomName) => {
//     socket.leave(roomName);
//     console.log(`🚪 Client ${socket.id} left room: ${roomName}`);

//     socket.emit("room_left", {
//       room: roomName,
//       message: `Left ${roomName} room`,
//     });
//   });

//   // Handle client requesting current stats
//   socket.on("get_stats", async () => {
//     try {
//       const { PrismaClient } = require("@prisma/client");
//       const prisma = new PrismaClient();

//       // Get basic stats
//       const [totalConfessions, totalReactions] = await Promise.all([
//         prisma.confession.count({
//           where: { isFlagged: false },
//         }),
//         prisma.confession.aggregate({
//           where: { isFlagged: false },
//           _sum: {
//             fire: true,
//             heart: true,
//             skull: true,
//             cry: true,
//           },
//         }),
//       ]);

//       const totalReactionCount =
//         (totalReactions._sum.fire || 0) +
//         (totalReactions._sum.heart || 0) +
//         (totalReactions._sum.skull || 0) +
//         (totalReactions._sum.cry || 0);

//       socket.emit("stats_update", {
//         totalConfessions,
//         totalReactions: totalReactionCount,
//         connectedClients: connectedClients.size,
//         timestamp: new Date().toISOString(),
//       });

//       await prisma.$disconnect();
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//       socket.emit("error", {
//         message: "Failed to fetch stats",
//         timestamp: new Date().toISOString(),
//       });
//     }
//   });

//   // Handle client requesting recent confessions
//   socket.on("get_recent_confessions", async (data) => {
//     try {
//       const { PrismaClient } = require("@prisma/client");
//       const prisma = new PrismaClient();

//       const { limit = 10, college } = data || {};

//       const whereClause = {
//         isFlagged: false,
//       };

//       if (college && college !== "All") {
//         whereClause.college = college;
//       }

//       const confessions = await prisma.confession.findMany({
//         where: whereClause,
//         orderBy: {
//           createdAt: "desc",
//         },
//         take: parseInt(limit),
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
//       });

//       // Transform to match frontend expectations
//       const transformedConfessions = confessions.map((confession) => ({
//         id: confession.id,
//         text: confession.content,
//         timestamp: confession.createdAt,
//         college: confession.college || "Anonymous",
//         reactions: {
//           fire: confession.fire,
//           heart: confession.heart,
//           skull: confession.skull,
//           cry: confession.cry,
//         },
//       }));

//       socket.emit("recent_confessions", {
//         confessions: transformedConfessions,
//         timestamp: new Date().toISOString(),
//       });

//       await prisma.$disconnect();
//     } catch (error) {
//       console.error("Error fetching recent confessions:", error);
//       socket.emit("error", {
//         message: "Failed to fetch recent confessions",
//         timestamp: new Date().toISOString(),
//       });
//     }
//   });

//   // Handle client requesting trending confessions
//   socket.on("get_trending_confessions", async (data) => {
//     try {
//       const { PrismaClient } = require("@prisma/client");
//       const prisma = new PrismaClient();

//       const { limit = 10, college } = data || {};

//       const whereClause = {
//         isFlagged: false,
//       };

//       if (college && college !== "All") {
//         whereClause.college = college;
//       }

//       // Get confessions with highest total reactions
//       const confessions = await prisma.confession.findMany({
//         where: whereClause,
//         orderBy: [
//           {
//             fire: "desc",
//           },
//           {
//             heart: "desc",
//           },
//           {
//             skull: "desc",
//           },
//           {
//             cry: "desc",
//           },
//         ],
//         take: parseInt(limit),
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
//       });

//       // Transform to match frontend expectations
//       const transformedConfessions = confessions.map((confession) => ({
//         id: confession.id,
//         text: confession.content,
//         timestamp: confession.createdAt,
//         college: confession.college || "Anonymous",
//         reactions: {
//           fire: confession.fire,
//           heart: confession.heart,
//           skull: confession.skull,
//           cry: confession.cry,
//         },
//       }));

//       socket.emit("trending_confessions", {
//         confessions: transformedConfessions,
//         timestamp: new Date().toISOString(),
//       });

//       await prisma.$disconnect();
//     } catch (error) {
//       console.error("Error fetching trending confessions:", error);
//       socket.emit("error", {
//         message: "Failed to fetch trending confessions",
//         timestamp: new Date().toISOString(),
//       });
//     }
//   });

//   // Handle client typing indicator
//   socket.on("typing_start", (data) => {
//     const { room = "general" } = data;
//     socket.to(room).emit("user_typing", {
//       clientId: socket.id,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   socket.on("typing_stop", (data) => {
//     const { room = "general" } = data;
//     socket.to(room).emit("user_stopped_typing", {
//       clientId: socket.id,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   // Handle client requesting online users count
//   socket.on("get_online_users", () => {
//     socket.emit("online_users", {
//       count: connectedClients.size,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   // Handle client ping for connection health check
//   socket.on("ping", () => {
//     socket.emit("pong", {
//       timestamp: new Date().toISOString(),
//     });
//   });

//   // Handle client disconnect
//   socket.on("disconnect", () => {
//     connectedClients.delete(socket.id);
//     console.log(`🔌 Client disconnected: ${socket.id}`);
//     console.log(`📊 Total connected clients: ${connectedClients.size}`);
//   });

//   // Handle errors
//   socket.on("error", (error) => {
//     console.error(`Socket error from ${socket.id}:`, error);
//     socket.emit("error", {
//       message: "An error occurred",
//       timestamp: new Date().toISOString(),
//     });
//   });
// };

// /**
//  * Broadcast a new confession to all connected clients
//  * @param {Object} confession - The confession data to broadcast
//  * @param {Server} io - The Socket.IO server instance
//  */
// // const broadcastNewConfession = (confession, io) => {
// //   const confessionData = {
// //     id: confession.id,
// //     text: confession.content,
// //     timestamp: confession.createdAt,
// //     college: confession.college || 'Anonymous',
// //     reactions: {
// //       fire: confession.fire,
// //       heart: confession.heart,
// //       skull: confession.skull,
// //       cry: confession.cry
// //     }
// //   };

// //   // Broadcast to all clients
// //   io.emit('new_confession', confessionData);

// //   // Also broadcast to college-specific room if applicable
// //   if (confession.college) {
// //     io.to(confession.college).emit('new_confession', confessionData);
// //   }

// //   console.log(`📡 Broadcasted new confession: ${confession.id}`);
// // };
// function broadcastNewConfession(confession, io) {
//   const confessionData = {
//     id: confession.id,
//     text: confession.content,
//     timestamp: confession.createdAt,
//     college: confession.college || "Anonymous",
//     reactions: {
//       fire: confession.fire,
//       heart: confession.heart,
//       skull: confession.skull,
//       cry: confession.cry,
//     },
//   };

//   // Broadcast to all clients
//   io.emit("new_confession", confessionData);

//   // Optional: to specific college room
//   if (confession.college) {
//     io.to(confession.college).emit("new_confession", confessionData);
//   }

//   console.log(`📡 Broadcasted new confession: ${confession.id}`);
// }

// /**
//  * Broadcast updated reaction counts to all connected clients
//  * @param {number} confessionId - The confession ID
//  * @param {Object} reactions - The updated reaction counts
//  * @param {Server} io - The Socket.IO server instance
//  */
// const broadcastReactionUpdate = (confessionId, reactions, io) => {
//   const reactionData = {
//     confessionId,
//     reactions,
//     totalReactions:
//       reactions.fire + reactions.heart + reactions.skull + reactions.cry,
//     timestamp: new Date().toISOString(),
//   };

//   // Broadcast to all clients
//   io.emit("confession_reacted", reactionData);

//   console.log(`🔥 Broadcasted reaction update for confession: ${confessionId}`);
// };

// /**
//  * Get current connection statistics
//  * @returns {Object} Connection stats
//  */
// const getConnectionStats = () => {
//   return {
//     connectedClients: connectedClients.size,
//     timestamp: new Date().toISOString(),
//   };
// };

// module.exports = {
//   handleSocketConnection,
//   broadcastNewConfession,
//   broadcastReactionUpdate,
//   getConnectionStats,
// };

// socketHandler.js (ESM Version)

import { PrismaClient } from "@prisma/client";

// Store connected clients for analytics
const connectedClients = new Set();

export const handleSocketConnection = (socket, io) => {
  connectedClients.add(socket.id);
  console.log(`🔌 Client connected: ${socket.id}`);
  console.log(`📊 Total connected clients: ${connectedClients.size}`);

  socket.emit("welcome", {
    message: "Connected to Campus Confessions",
    clientId: socket.id,
    timestamp: new Date().toISOString(),
  });

  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    console.log(`🏠 Client ${socket.id} joined room: ${roomName}`);

    socket.emit("room_joined", {
      room: roomName,
      message: `Joined ${roomName} room`,
    });
  });

  socket.on("leave_room", (roomName) => {
    socket.leave(roomName);
    console.log(`🚪 Client ${socket.id} left room: ${roomName}`);

    socket.emit("room_left", {
      room: roomName,
      message: `Left ${roomName} room`,
    });
  });

  socket.on("get_stats", async () => {
    try {
      const prisma = new PrismaClient();

      const [totalConfessions, totalReactions] = await Promise.all([
        prisma.confession.count({ where: { isFlagged: false } }),
        prisma.confession.aggregate({
          where: { isFlagged: false },
          _sum: {
            fire: true,
            heart: true,
            skull: true,
            cry: true,
          },
        }),
      ]);

      const totalReactionCount =
        (totalReactions._sum.fire || 0) +
        (totalReactions._sum.heart || 0) +
        (totalReactions._sum.skull || 0) +
        (totalReactions._sum.cry || 0);

      socket.emit("stats_update", {
        totalConfessions,
        totalReactions: totalReactionCount,
        connectedClients: connectedClients.size,
        timestamp: new Date().toISOString(),
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error("Error fetching stats:", error);
      socket.emit("error", {
        message: "Failed to fetch stats",
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on("get_recent_confessions", async (data) => {
    try {
      const prisma = new PrismaClient();
      const { limit = 10, college } = data || {};
      const whereClause = { isFlagged: false };
      if (college && college !== "All") whereClause.college = college;

      const confessions = await prisma.confession.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: parseInt(limit),
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
      });

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

      socket.emit("recent_confessions", {
        confessions: transformed,
        timestamp: new Date().toISOString(),
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error("Error fetching recent confessions:", error);
      socket.emit("error", {
        message: "Failed to fetch recent confessions",
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on("get_trending_confessions", async (data) => {
    try {
      const prisma = new PrismaClient();
      const { limit = 10, college } = data || {};
      const whereClause = { isFlagged: false };
      if (college && college !== "All") whereClause.college = college;

      const confessions = await prisma.confession.findMany({
        where: whereClause,
        orderBy: [
          { fire: "desc" },
          { heart: "desc" },
          { skull: "desc" },
          { cry: "desc" },
        ],
        take: parseInt(limit),
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
      });

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

      socket.emit("trending_confessions", {
        confessions: transformed,
        timestamp: new Date().toISOString(),
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error("Error fetching trending confessions:", error);
      socket.emit("error", {
        message: "Failed to fetch trending confessions",
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on("typing_start", (data) => {
    const { room = "general" } = data;
    socket.to(room).emit("user_typing", {
      clientId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("typing_stop", (data) => {
    const { room = "general" } = data;
    socket.to(room).emit("user_stopped_typing", {
      clientId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("get_online_users", () => {
    socket.emit("online_users", {
      count: connectedClients.size,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("ping", () => {
    socket.emit("pong", {
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    connectedClients.delete(socket.id);
    console.log(`🔌 Client disconnected: ${socket.id}`);
    console.log(`📊 Total connected clients: ${connectedClients.size}`);
  });

  socket.on("error", (error) => {
    console.error(`Socket error from ${socket.id}:`, error);
    socket.emit("error", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  });
};

export const broadcastNewConfession = (confession, io) => {
  const confessionData = {
    id: confession.id,
    text: confession.content,
    timestamp: confession.createdAt,
    college: confession.college || "Anonymous",
    reactions: {
      fire: confession.fire,
      heart: confession.heart,
      skull: confession.skull,
      cry: confession.cry,
    },
  };
  io.emit("new_confession", confessionData);
  if (confession.college) {
    io.to(confession.college).emit("new_confession", confessionData);
  }
  console.log(`📡 Broadcasted new confession: ${confession.id}`);
};

export const broadcastReactionUpdate = (confessionId, reactions, io) => {
  const reactionData = {
    confessionId,
    reactions,
    totalReactions:
      reactions.fire + reactions.heart + reactions.skull + reactions.cry,
    timestamp: new Date().toISOString(),
  };
  io.emit("confession_reacted", reactionData);
  console.log(`🔥 Broadcasted reaction update for confession: ${confessionId}`);
};

export const getConnectionStats = () => {
  return {
    connectedClients: connectedClients.size,
    timestamp: new Date().toISOString(),
  };
};
export default {
  handleSocketConnection,
  broadcastNewConfession,
  broadcastReactionUpdate,
  getConnectionStats,
};
