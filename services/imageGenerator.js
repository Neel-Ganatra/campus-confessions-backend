import express from "express";
import { createCanvas, registerFont } from "canvas";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register font
registerFont(path.join(__dirname, "../public/fonts/OpenSans-Bold.ttf"), {
  family: "Open Sans",
});

router.post("/generate-image", async (req, res) => {
  try {
    const { content, college } = req.body;

    const width = 1080;
    const height = 1080;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 🌌 Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1a1a2e"); // Deep black-blue
    gradient.addColorStop(1, "#16213e"); // Purple hint
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 🖋️ Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px 'Open Sans'";
    ctx.fillText("Anonymous Confession", 60, 100);

    // ✍️ Confession Content
    ctx.font = "30px 'Open Sans'";
    ctx.fillStyle = "#f1f1f1";
    wrapText(ctx, content, 60, 180, width - 120, 50);

    // 📍 College tag
    if (college) {
      ctx.fillStyle = "#bbbbbb";
      ctx.font = "italic 26px 'Open Sans'";
      ctx.fillText(`📍 ${college}`, 60, height - 60);
    }

    // Save
    const buffer = canvas.toBuffer("image/png");
    const filename = `confession_${Date.now()}.png`;
    const filePath = path.join(__dirname, "../public/images", filename);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `${req.protocol}://${req.get("host")}/images/${filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: "Image generation failed" });
  }
});

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

export default router;
