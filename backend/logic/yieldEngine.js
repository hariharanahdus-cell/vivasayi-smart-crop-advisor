/**
 * Rule-based yield and scoring engine.
 * Calculates crop yield and suitability scores natively.
 */

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function rangeScore(value, min, max) {
  if (value < min || value > max) {
    const distance = value < min ? min - value : value - max;
    const tolerance = (max - min) * 0.3 || 5;
    return clamp(1 - distance / tolerance, 0, 1);
  }
  return 1.0;
}

function getSeasonMatch(startMonth, endMonth, idealSeasons) {
  const seasonMap = {
    kharif: [6, 7, 8, 9, 10],
    rabi: [11, 12, 1, 2, 3],
    zaid: [3, 4, 5, 6],
    annual: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  };

  let valid = new Set();
  (idealSeasons || []).forEach(s => {
    (seasonMap[s] || []).forEach(m => valid.add(m));
  });

  let user = [];
  let s = parseInt(startMonth) || 1;
  let e = parseInt(endMonth) || 12;
  if (s <= e) {
    for (let i = s; i <= e; i++) user.push(i);
  } else {
    for (let i = s; i <= 12; i++) user.push(i);
    for (let i = 1; i <= e; i++) user.push(i);
  }

  let overlap = 0;
  user.forEach(m => { if (valid.has(m)) overlap++; });
  const ratio = user.length > 0 ? overlap / user.length : 0;
  return ratio > 0.6 ? 1.0 : (ratio > 0.2 ? 0.75 : 0.5);
}

function calculateYield(crop, input) {
  const { N, P, K, Ca, Mg, S, rainfall, temperature, soilType, startMonth, endMonth, soilPH } = input;

  const soilFactor = crop.soilFactor[soilType] || 0.7;
  const seasonMod = getSeasonMatch(startMonth, endMonth, crop.idealSeason);
  const tempScore = rangeScore(temperature, crop.minTemp, crop.maxTemp);
  const phScore = rangeScore(soilPH, crop.minPH, crop.maxPH);
  const rainScore = rangeScore(rainfall, crop.minRainfall, crop.maxRainfall);

  const nutrients = clamp(N, 0, 1500) + clamp(P, 0, 1500) + clamp(K, 0, 1500) +
                    clamp(Ca || 0, 0, 1500) + clamp(Mg || 0, 0, 1500) + clamp(S || 0, 0, 1500);

  // Base yield formula
  const baseYield = (nutrients * Math.min(rainfall, 300) * soilFactor * seasonMod * crop.yieldFactor) / 12000;
  
  // Apply environmental suitability multipliers
  const environmentScore = tempScore * rainScore * phScore;
  const finalYield = baseYield * environmentScore;

  return Math.max(0.1, parseFloat(finalYield.toFixed(2)));
}

function scoreCrop(crop, input) {
  const { temperature, rainfall, soilType, startMonth, endMonth, soilPH } = input;

  const soilFactor = crop.soilFactor[soilType] || 0.7;
  const seasonMatch = getSeasonMatch(startMonth, endMonth, crop.idealSeason);
  const tempScore = rangeScore(temperature, crop.minTemp, crop.maxTemp);
  const phScore = rangeScore(soilPH, crop.minPH, crop.maxPH);
  const rainScore = rangeScore(rainfall, crop.minRainfall, crop.maxRainfall);
  
  const soilScore = crop.idealSoil.includes(soilType) ? 1.0 : 0.7;

  const raw = (soilFactor * 0.2 + seasonMatch * 0.2 + tempScore * 0.2 + rainScore * 0.2 + phScore * 0.1 + soilScore * 0.1) * 100;
  return parseFloat(raw.toFixed(1));
}

module.exports = { calculateYield, scoreCrop };
