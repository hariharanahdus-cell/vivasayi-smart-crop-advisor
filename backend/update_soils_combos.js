const fs = require('fs');
const crops = require('./data/crops.js');

const comboModifiers = {
  red_loamy: 0.95,
  red_clay: 0.85,
  red_sandy: 0.80,
  black_clay: 0.95,
  black_loamy: 1.0,
  alluvial_loam: 1.0,
  alluvial_clay: 0.95,
  lateritic_gravel: 0.65,
  calcareous_clay: 0.70,
  silty_sand: 0.85
};

crops.forEach(crop => {
  crop.soilFactor = crop.soilFactor || {};
  
  for (const [soil, baseMod] of Object.entries(comboModifiers)) {
    let mod = baseMod;
    
    // Custom logic overrides for certain crops
    if (soil === "red_loamy" && ["Maize", "Groundnut", "Brinjal", "Tomato", "Mango"].includes(crop.name)) mod = 1.0;
    if (soil === "red_clay" && ["Cotton", "Sugarcane"].includes(crop.name)) mod = 0.95;
    if (soil === "black_clay" && ["Cotton", "Soybean", "Rice"].includes(crop.name)) mod = 1.0;
    if (soil === "black_loamy" && ["Wheat", "Coriander", "Onion"].includes(crop.name)) mod = 1.0;
    if (soil === "alluvial_loam" && ["Rice", "Wheat", "Sugarcane", "Potato", "Banana"].includes(crop.name)) mod = 1.0;
    if (soil === "lateritic_gravel" && ["Cashew", "Pineapple"].includes(crop.name)) mod = 0.95;
    if (soil === "calcareous_clay" && ["Grapes", "Cabbage"].includes(crop.name)) mod = 0.85;

    // Smooth to 2 decimal places
    crop.soilFactor[soil] = Math.round(mod * 100) / 100;
  }
});

const content = `/**
 * Extensively expanded crop dataset containing grains, vegetables, and fruits
 * with market prices, cultivation costs, and ideal growing conditions.
 * Includes global soil classifications and mixed combinations.
 */
const crops = ${JSON.stringify(crops, null, 2)};

module.exports = crops;
`;

fs.writeFileSync('./data/crops.js', content, 'utf8');
console.log("Updated crops.js successfully with combination soils!");
