const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.static("public"));

const upload = multer({ dest:"uploads/" });

// 🔑 GOOGLE API KEY (put in env for production)
const API_KEY = process.env.GOOGLE_API_KEY;

// 🌍 Google Places Search
async function searchPlace(query){

  try{

    const url = "https://maps.googleapis.com/maps/api/place/textsearch/json";

    const res = await axios.get(url,{
      params:{
        query,
        key: API_KEY
      }
    });

    if(res.data.results.length > 0){

      let p = res.data.results[0];

      return {
        place: p.name,
        address: p.formatted_address,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng
      };
    }

    return null;

  }catch(e){
    return null;
  }
}

// 🚀 Upload API
app.post("/upload", upload.single("image"), (req,res)=>{

  const imgPath = path.join(__dirname, req.file.path);

  exec(`python ai/detect.py ${imgPath}`, async (err,stdout)=>{

    if(err){
      return res.json({error:err.message});
    }

    let ai = JSON.parse(stdout);

    let query = ai.text.join(" ");

    let place = await searchPlace(query);

    if(place){

      res.json({
        ai_text: ai.text,
        place: place.place,
        address: place.address,
        lat: place.lat,
        lng: place.lng
      });

    }else{

      res.json({
        ai_text: ai.text,
        message:"No location found"
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("Server running on port " + PORT);
});
