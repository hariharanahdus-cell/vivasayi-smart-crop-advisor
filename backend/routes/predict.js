const express = require("express");
const router = express.Router();
const crops = require("../data/crops");
const { calculateYield } = require("../logic/yieldEngine");
const aiService = require("../logic/aiService");

/**
 * POST /predict
 * Analyzes soil data and returns crop yields.
 * Uses Groq (Llama 3) for real AI predictions with a local heuristic fallback.
 */
router.post("/", async (req, res) => {
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

    // ── AI Prediction (Primary) ───────────────────
    let yieldResults = [];
    let isAIPowered = false;

    try {
      const aiResults = await aiService.getPrediction(input);
      if (aiResults && Array.isArray(aiResults)) {
        yieldResults = aiResults.map(res => {
          const matchingCrop = crops.find(c => c.name.toLowerCase() === res.name.toLowerCase());
          return {
            crop: res.name,
            icon: matchingCrop ? matchingCrop.icon : "🌱",
            yield: res.yield,
            confidence: res.confidence || 85,
            insight: res.insight || "Optimized based on soil composition.",
            risks: res.risks || "Standard seasonal variation."
          };
        });
        isAIPowered = true;
      }
    } catch (aiError) {
      console.warn("AI Prediction failed, falling back to local formula:", aiError.message);
    }

    // ── Local Fallback (Secondary) ────────────────
    if (!isAIPowered) {
      yieldResults = crops.map((crop) => ({
        crop: crop.name,
        icon: crop.icon,
        yield: calculateYield(crop, input),
        confidence: 65,
        insight: "Calculated via local heuristic model.",
        risks: "May not account for all regional climate variations."
      }));
    }

    yieldResults.sort((a, b) => b.yield - a.yield);

    res.json({
      success: true,
      location: input.location,
      isAIPowered,
      yields: yieldResults
    });
  } catch (err) {
    console.error("Predict error:", err);
    res.status(500).json({ error: "Internal server error during prediction." });
  }
});

module.exports = router;
