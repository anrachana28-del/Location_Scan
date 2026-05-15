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

const API_KEY = process.env.GOOGLE_API_KEY;

// 🌍 Google Places API
async function searchPlace(query) {
  try {
    const url = "https://maps.googleapis.com/maps/api/place/textsearch/json";

    const res = await axios.get(url, {
      params: {
        query,
        key: API_KEY
      }
    });

    if (res.data.results.length > 0) {
      let p = res.data.results[0];

      return {
        place: p.name,
        address: p.formatted_address,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng
      };
    }

    return null;

  } catch (e) {
    return null;
  }
}

// 🚀 UPLOAD API (SMART SUPPORT SEARCH)
app.post("/upload", upload.single("image"), (req, res) => {

  const imgPath = path.join(__dirname, req.file.path);

  exec(`python3 ai/detect.py ${imgPath}`, { timeout: 60000 }, async (err, stdout) => {

    if (err) {
      return res.status(500).json({
        error: "Python failed",
        details: err.message
      });
    }

    let ai;

    try {
      ai = JSON.parse(stdout);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid Python output"
      });
    }

    let text = (ai.text || []).join(" ").trim();

    // 🧠 SUPPORT SEARCH MODE
    let query = text;

    if (!query) {
      query = "famous place in Phnom Penh";
    }

    // 🧠 SMART DETECTION RULES
    const lower = query.toLowerCase();

    if (lower.includes("mall")) {
      query = "shopping mall";
    } else if (lower.includes("restaurant")) {
      query = "restaurant";
    } else if (lower.includes("hotel")) {
      query = "hotel";
    }

    let place = await searchPlace(query);

    if (place) {
      return res.json({
        ai_text: ai.text,
        search_query: query,
        place: place.place,
        address: place.address,
        lat: place.lat,
        lng: place.lng
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
