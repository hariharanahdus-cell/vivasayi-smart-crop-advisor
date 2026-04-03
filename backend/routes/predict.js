const express = require("express");
const router = express.Router();
const crops = require("../data/crops");
const { calculateYield } = require("../logic/yieldEngine");

router.post("/", (req, res) => {
  try {
    const { soilType, soilPH, N, P, K, Ca, Mg, S, temperature, rainfall, location, startMonth, endMonth } = req.body;

    if (!soilType || soilPH === undefined || N === undefined || P === undefined || K === undefined || temperature === undefined || rainfall === undefined || startMonth === undefined || endMonth === undefined) {
      return res.status(400).json({ error: "Missing required input fields." });
    }

    const input = {
      soilType: String(soilType).toLowerCase(),
      soilPH: parseFloat(soilPH),
      N: parseFloat(N),
      P: parseFloat(P),
      K: parseFloat(K),
      Ca: parseFloat(Ca || 0),
      Mg: parseFloat(Mg || 0),
      S: parseFloat(S || 0),
      temperature: parseFloat(temperature),
      rainfall: parseFloat(rainfall),
      location: location || "Unknown",
      startMonth: parseInt(startMonth),
      endMonth: parseInt(endMonth)
    };

    const yieldResults = crops.map((crop) => ({
      crop: crop.name,
      icon: crop.icon,
      yield: calculateYield(crop, input)
    }));

    yieldResults.sort((a, b) => b.yield - a.yield);

    res.json({
      success: true,
      location: input.location,
      yields: yieldResults
    });
  } catch (err) {
    console.error("Predict error:", err);
    res.status(500).json({ error: "Internal server error during prediction." });
  }
});

module.exports = router;
