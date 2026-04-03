const express = require("express");
const router = express.Router();
const crops = require("../data/crops");

/**
 * POST /profit
 * Input: { cropName, yield (tons/hectare) }
 * Output: market price, cost, profit, and profit margin
 */
router.post("/", (req, res) => {
  try {
    const { cropName, yieldTons } = req.body;

    if (!cropName || yieldTons === undefined) {
      return res.status(400).json({ error: "cropName and yieldTons are required." });
    }

    const crop = crops.find(
      (c) => c.name.toLowerCase() === String(cropName).toLowerCase()
    );

    if (!crop) {
      return res.status(404).json({ error: `Crop "${cropName}" not found.` });
    }

    const yield_ = parseFloat(yieldTons);
    const revenue = yield_ * crop.price;
    const profit = revenue - crop.cost;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      crop: crop.name,
      icon: crop.icon,
      yield: yield_,
      pricePerTon: crop.price,
      revenue: parseFloat(revenue.toFixed(2)),
      costOfCultivation: crop.cost,
      profit: parseFloat(profit.toFixed(2)),
      profitMargin: parseFloat(profitMargin)
    });
  } catch (err) {
    console.error("Profit error:", err);
    res.status(500).json({ error: "Internal server error during profit calculation." });
  }
});

module.exports = router;
