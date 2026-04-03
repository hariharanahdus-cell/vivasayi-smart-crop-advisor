const fs = require('fs');
const crops = require('./data/crops.js');

const globalModifiers = {
  silty: 0.9,
  chalky: 0.6,
  volcanic: 1.0,
  podzol: 0.5,
  mollisol: 1.0,
  aridisol: 0.3,
  oxisol: 0.7,
  gelisol: 0.1,
  sandy_loam: 0.95,
  clay_loam: 0.95,
  silty_clay: 0.85
};

// Add random but sensible variations based on crop type
crops.forEach(crop => {
  crop.soilFactor = crop.soilFactor || {};
  
  for (const [soil, baseMod] of Object.entries(globalModifiers)) {
    let mod = baseMod;
    
    // Adjust logic based on crop
    if (crop.name === "Grapes" && soil === "chalky") mod = 0.9;
    if (crop.name === "Apple" && soil === "chalky") mod = 0.8;
    if (["Rice", "Sugarcane", "Banana"].includes(crop.name) && soil === "clay_loam") mod = 1.0;
    if (["Groundnut", "Carrot", "Potato"].includes(crop.name) && soil === "sandy_loam") mod = 1.0;
    if (["Wheat", "Maize"].includes(crop.name) && soil === "mollisol") mod = 1.0;
    if (soil === "volcanic") mod = 0.95 + (Math.random() * 0.05); // Volcanic is great for everything
    if (soil === "aridisol" && ["Cotton", "Mustard"].includes(crop.name)) mod = 0.5;
    if (soil === "oxisol" && ["Cashew", "Pineapple", "Rubber"].includes(crop.name)) mod = 0.9;
    
    // Smooth to 2 decimal places
    crop.soilFactor[soil] = Math.round(mod * 100) / 100;
  }
});

const content = `/**
 * Extensively expanded crop dataset containing grains, vegetables, and fruits
 * with market prices, cultivation costs, and ideal growing conditions.
 * Includes global soil classifications.
 */
const crops = ${JSON.stringify(crops, null, 2)};

module.exports = crops;
`;

fs.writeFileSync('./data/crops.js', content, 'utf8');
console.log("Updated crops.js successfully!");
