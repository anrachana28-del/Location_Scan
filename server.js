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

// 🌍 OpenStreetMap (FREE)
async function searchPlace(query) {
  try {
    const url = "https://nominatim.openstreetmap.org/search";

    const res = await axios.get(url, {
      params: {
        q: query,
        format: "json",
        limit: 1
      }
    });

    if (res.data && res.data.length > 0) {
      let p = res.data[0];

      return {
        name: p.display_name,
        lat: p.lat,
        lng: p.lon
      };
    }

    return null;

  } catch (e) {
    return null;
  }
}

// 🧠 SMART QUERY ENGINE
function smartQuery(text) {
  const t = text.toLowerCase();

  if (t.includes("mall")) return "shopping mall Phnom Penh";
  if (t.includes("restaurant")) return "restaurant Phnom Penh";
  if (t.includes("hotel")) return "hotel Phnom Penh";
  if (t.includes("street")) return "famous street Phnom Penh";

  return text || "famous landmark Phnom Penh";
}

// 🚀 UPLOAD + AUTO PIN
app.post("/upload", upload.single("image"), (req, res) => {

  const imgPath = path.join(__dirname, req.file.path);

  exec(`python3 ai/detect.py ${imgPath}`, { timeout: 60000 }, async (err, stdout) => {

    if (err) {
      return res.json({ error: err.message });
    }

    let ai = JSON.parse(stdout);

    let text = (ai.text || []).join(" ").trim();

    let query = smartQuery(text);

    let place = await searchPlace(query);

    if (place) {
      return res.json({
        ai_text: ai.text,
        search_query: query,
        place: place.name,
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
