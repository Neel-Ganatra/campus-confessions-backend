// const axios = require("axios");
// const imageUrl = await generateImageFromConfession(confession);

// /**
//  * Sends confession to Make.com webhook if reactions >= 50
//  * @param {Object} confession - The confession object
//  */

// const generateImageFromConfession = async (confession) => {
//   const response = await axios.post(
//     "http://localhost:3000/api/generate-image", // update port if needed
//     {
//       content: confession.content,
//       college: confession.college,
//     }
//   );

//   return response.data.imageUrl;
// };

// const checkAndPostToInstagram = async (confession) => {
//   const totalReactions =
//     confession.fire + confession.heart + confession.skull + confession.cry;

//   if (totalReactions < 50) {
//     console.log(
//       `⚠️ Confession ${confession.id} has only ${totalReactions} reactions (below 50)`
//     );
//     return {
//       success: false,
//       reason: "Below threshold",
//       totalReactions,
//     };
//   }

//   return await postToInstagramWebhook(confession);
// };

// /**
//  * Sends confession data to Make.com webhook
//  * @param {Object} confession - The confession object
//  */
// const postToInstagramWebhook = async (confession) => {
//   try {
//     const webhookUrl = process.env.INSTAGRAM_WEBHOOK_URL;
//     if (!webhookUrl) {
//       throw new Error("Webhook URL not set in .env");
//     }

//     // 🔥 Step 1: Generate image from confession
//     const imageUrl = await generateImageFromConfession(confession);

//     // 📦 Step 2: Create the payload including the image URL
//     const payload = {
//       id: confession.id,
//       content: confession.content,
//       college: confession.college || "Anonymous",
//       createdAt: confession.createdAt,
//       reactions: {
//         fire: confession.fire,
//         heart: confession.heart,
//         skull: confession.skull,
//         cry: confession.cry,
//         total:
//           confession.fire +
//           confession.heart +
//           confession.skull +
//           confession.cry,
//       },
//       imageUrl: imageUrl || null, // ✅ Add image URL to send to Make.com
//     };

//     // 🚀 Step 3: Send to Make.com webhook
//     const response = await axios.post(webhookUrl, payload, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     console.log(
//       `📤 Confession ${confession.id} posted to Make.com webhook successfully`
//     );

//     return {
//       success: true,
//       method: "webhook",
//       response: response.data || {},
//     };
//   } catch (error) {
//     console.error("❌ Error posting to Make.com webhook:", error.message);
//     return {
//       success: false,
//       method: "webhook",
//       error: error.message,
//     };
//   }
// };

// module.exports = {
//   checkAndPostToInstagram,
// };

import axios from "axios";

/**
 * Generates an image from the confession content.
 */
export const generateImageFromConfession = async (confession) => {
  const response = await axios.post(
    "http://localhost:3001/api/generate-image",
    {
      content: confession.content,
      college: confession.college,
    }
  );
  return response.data.imageUrl;
};

/**
 * Posts the confession to Instagram if reactions >= 50
 */
export const checkAndPostToInstagram = async (confession) => {
  // const anyReactionHas50Plus = Object.values(confession.reactions).some(
  //   (count) => count >= 50
  // );
  // if (!anyReactionHas50Plus) {
  //   console.log(
  //     `⚠️ Confession ${confession.id} has only ${totalReactions} reactions (below 50)`
  //   );
  //   return {
  //     success: false,
  //     reason: "Below threshold",
  //     totalReactions,
  //   };
  // }
  const totalReactions =
    confession.fire + confession.heart + confession.skull + confession.cry;

  if (totalReactions < 50) {
    console.log(
      `⚠️ Confession ${confession.id} has only ${totalReactions} reactions (below 50)`
    );
    return {
      success: false,
      reason: "Below threshold",
      totalReactions,
    };
  }

  return await postToInstagramWebhook(confession);
};

/**
 * Sends the confession (with image) to the Make.com webhook
 */
export const postToInstagramWebhook = async (confession) => {
  try {
    const webhookUrl = process.env.INSTAGRAM_WEBHOOK_URL;
    if (!webhookUrl) throw new Error("Webhook URL not set in .env");

    const imageUrl = await generateImageFromConfession(confession);

    const payload = {
      id: confession.id,
      content: confession.content,
      college: confession.college || "Anonymous",
      createdAt: confession.createdAt,
      reactions: {
        fire: confession.fire,
        heart: confession.heart,
        skull: confession.skull,
        cry: confession.cry,
        total:
          confession.fire +
          confession.heart +
          confession.skull +
          confession.cry,
      },
      imageUrl: imageUrl || null,
    };

    const response = await axios.post(webhookUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log(
      `📤 Confession ${confession.id} posted to Make.com webhook successfully`
    );

    return {
      success: true,
      method: "webhook",
      response: response.data || {},
    };
  } catch (error) {
    console.error("❌ Error posting to Make.com webhook:", error.message);
    return {
      success: false,
      method: "webhook",
      error: error.message,
    };
  }
};
