const express = require("express");
const router = express.Router();
const crops = require("../data/crops");
const { calculateYield, scoreCrop } = require("../logic/yieldEngine");
const aiService = require("../logic/aiService");

/**
 * POST /recommend
 * Analyzes soil and weather to provide the most profitable and suitable crops.
 * Enhances the top 3 with AI-powered agricultural advice.
 */
router.post("/", async (req, res) => {
  try {
    const { soilType, soilPH, N, P, K, Ca, Mg, S, temperature, rainfall, startMonth, endMonth } = req.body;

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
      startMonth: parseInt(startMonth),
      endMonth: parseInt(endMonth)
    };

    const recommendations = crops.map((crop) => {
      const yieldAmt = calculateYield(crop, input);
      const suitScore = scoreCrop(crop, input);
      
      const revenue = yieldAmt * crop.price;
      const netProfit = revenue - crop.cost;
      const profitMargin = revenue > 0 ? (netProfit / crop.cost) * 100 : -100;

      return {
        crop: crop.name, // Restored 'crop' for frontend compatibility
        icon: crop.icon,
        suitability: suitScore,
        yield: yieldAmt,
        pricePerTon: crop.price,
        revenue: parseFloat(revenue.toFixed(2)),
        cost: crop.cost,
        profit: parseFloat(netProfit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(1))
      };
    });

    recommendations.sort((a, b) => b.profit - a.profit || b.suitability - a.suitability);

    const top3 = recommendations.slice(0, 3);

    // ── AI Advice for Top 3 ───────────────────────
    try {
      for (const rec of top3) {
        const aiAdvice = await aiService.getRecommendations(rec.name, input);
        if (aiAdvice) {
          rec.aiAdvice = aiAdvice;
        }
      }
    } catch (aiError) {
      console.warn("AI Recommendation failed:", aiError.message);
    }

    res.json({
      success: true,
      top3,
      all: recommendations
    });
  } catch (err) {
    console.error("Recommend error:", err);
    res.status(500).json({ error: "Internal server error during recommendation." });
  }
});

module.exports = router;
