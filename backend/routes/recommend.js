const express = require("express");
const router = express.Router();
const crops = require("../data/crops");
const { calculateYield, scoreCrop } = require("../logic/yieldEngine");

router.post("/", (req, res) => {
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
        crop: crop.name,
        icon: crop.icon,
        suitability: suitScore,
        yield: yieldAmt,
        pricePerTon: crop.price,
        revenue: revenue,
        cost: crop.cost,
        profit: netProfit,
        profitMargin: profitMargin
      };
    });

    recommendations.sort((a, b) => {
      const primaryDiff = b.profit - a.profit;
      if (primaryDiff !== 0) return primaryDiff;
      return b.suitability - a.suitability;
    });

    res.json({
      success: true,
      top3: recommendations.slice(0, 3),
      all: recommendations
    });
  } catch (err) {
    console.error("Recommend error:", err);
    res.status(500).json({ error: "Internal server error during recommendation." });
  }
});

module.exports = router;
