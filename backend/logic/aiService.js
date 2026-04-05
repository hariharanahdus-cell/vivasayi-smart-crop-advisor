const Groq = require("groq-sdk");
require("dotenv").config();

// Initialize Groq safety-first
const apiKey = process.env.GROQ_API_KEY;
let groq = null;

if (apiKey && apiKey.startsWith("gsk_")) {
  groq = new Groq({ apiKey });
} else {
  console.warn("⚠️ Valid GROQ_API_KEY (starting with gsk_) not found! Performance will be reduced.");
}

/**
 * AI Service for Crop Prediction and Recommendations
 */
class AIService {
  /**
   * Get crop prediction based on soil and weather data
   */
  async getPrediction(data, lang = "en") {
    if (!groq) return null; // Use local fallback

    const { soilType, soilPH, N, P, K, temperature, rainfall, location, startMonth, endMonth } = data;

    const prompt = `
      As an expert Agricultural Scientist AI, analyze the following crop data:
      Location: ${location || "Unknown"} (Note: If this is a known agricultural region like Thanjavur, consider its traditional crops like Rice).
      Soil Type: ${soilType}
      Soil pH: ${soilPH}
      Nutrients (mg/kg): N: ${N}, P: ${P}, K: ${K}
      Environment: Temp: ${temperature}°C, Monthly Rainfall: ${rainfall}mm
      Growing Period: Month ${startMonth} to ${endMonth}

      Based on this, return a JSON array of the top 3 most suitable crops.
      For each crop, provide:
      - name (must be a common crop name, e.g., 'Rice')
      - yield (estimated tons per hectare, realistic)
      - confidence (0-100 percentage)
      - insight (one sentence on why it fits - IMPORTANT: WRITE THIS IN ${lang === 'ta' ? 'TAMIL' : 'ENGLISH'})
      - risks (one sentence on potential challenges - IMPORTANT: WRITE THIS IN ${lang === 'ta' ? 'TAMIL' : 'ENGLISH'})

      Return ONLY the JSON. No preamble.
    `;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: process.env.GROQ_MODEL || "llama3-70b-8192",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(chatCompletion.choices[0].message.content);
      return response.crops || (Array.isArray(response) ? response : [response]);
    } catch (error) {
      console.error("Groq AI Error:", error.message);
      return null; // Fallback
    }
  }

  /**
   * Get detailed recommendations and best practices
   */
  async getRecommendations(cropName, data, lang = "en") {
    if (!groq) return null;

    const prompt = `
      As an expert Agricultural AI, provide a short, professional recommendation for growing ${cropName} in ${data.location || "this area"}.
      Soil: ${data.soilType}, pH: ${data.soilPH}, NPK: ${data.N}-${data.P}-${data.K}.
      Temp: ${data.temperature}°C, Rainfall: ${data.rainfall}mm.

      IMPORTANT: For the specific values below, provide the advice in ${lang === 'ta' ? 'TAMIL (தமிழ்)' : 'ENGLISH'}.

      Return a JSON object with:
      - soilManagement (one advice)
      - waterManagement (one advice)
      - fertilizerAdvice (specific NPK advice)
      - generalTip (one pro-tip)
    `;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: process.env.GROQ_MODEL || "llama3-70b-8192",
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      return JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
      console.error("Groq AI Rec Error:", error.message);
      return null;
    }
  }
}

module.exports = new AIService();
