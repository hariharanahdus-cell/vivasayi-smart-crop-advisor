const aiService = require("./backend/logic/aiService");
require("dotenv").config({ path: "./backend/.env" });

const testInput = {
    soilType: "alluvial",
    soilPH: 6.5,
    N: 100,
    P: 50,
    K: 50,
    temperature: 25,
    rainfall: 200,
    location: "Tamil Nadu",
    startMonth: 6,
    endMonth: 10
};

console.log("Testing Groq AI Service...");
aiService.getPrediction(testInput)
    .then(res => {
        console.log("Response:", JSON.stringify(res, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error("Test failed:", err);
        process.exit(1);
    });
