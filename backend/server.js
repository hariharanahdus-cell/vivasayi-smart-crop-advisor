require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const predictRouter = require("./routes/predict");
const profitRouter = require("./routes/profit");
const recommendRouter = require("./routes/recommend");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// ── API Routes ─────────────────────────────────────────────
app.use("/predict", predictRouter);
app.use("/profit", profitRouter);
app.use("/recommend", recommendRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-all: serve frontend index
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ── Export/Start ───────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🌱 Smart Crop Advisor backend running at http://localhost:${PORT}`);
  });
}

module.exports = app;
