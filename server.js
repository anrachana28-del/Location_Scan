const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

// 🌍 FREE OpenStreetMap
async function searchPlace(query) {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: query,
        format: "json",
        limit: 1
      },
      headers: {
        "User-Agent": "ai-lens-app"
      }
    });

    if (res.data && res.data.length > 0) {
      const p = res.data[0];

      return {
        place: p.display_name,
        lat: p.lat,
        lng: p.lon
      };
    }

    return null;
  } catch (err) {
    return null;
  }
}

// 🧠 SMART QUERY ENGINE
function smartQuery(text) {
  const t = (text || "").toLowerCase();

  if (t.includes("mall")) return "shopping mall Phnom Penh";
  if (t.includes("restaurant")) return "restaurant Phnom Penh";
  if (t.includes("hotel")) return "hotel Phnom Penh";
  if (t.includes("school")) return "school Phnom Penh";
  if (t.includes("street")) return "famous street Phnom Penh";

  return text || "famous landmark Phnom Penh";
}

// 🚀 UPLOAD API (FIXED + SAFE)
app.post("/upload", upload.single("image"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imgPath = path.join(__dirname, req.file.path);

  const cmd = `python3 ai/detect.py "${imgPath}"`;

  exec(cmd, { timeout: 60000 }, async (err, stdout, stderr) => {

    if (err) {
      return res.status(500).json({
        error: "Python error",
        details: stderr || err.message
      });
    }

    let ai;

    try {
      ai = JSON.parse(stdout);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid Python output",
        raw: stdout
      });
    }

    let text = (ai.text || []).join(" ").trim();

    let query = smartQuery(text);

    let place = await searchPlace(query);

    if (place) {
      return res.json({
        ai_text: ai.text,
        search_query: query,
        place: place.place,
        lat: place.lat,
        lng: place.lng,
        auto_pin: true,
        provider: "OpenStreetMap FREE"
      });
    }

    return res.json({
      ai_text: ai.text,
      search_query: query,
      message: "No location found"
    });
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
