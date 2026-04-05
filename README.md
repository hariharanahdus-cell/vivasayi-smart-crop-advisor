# 🌱 Smart Crop Advisor

> An AI-powered full-stack web application that helps farmers predict crop yield, estimate profit, and get intelligent crop recommendations based on soil data, weather conditions, and market prices.

---

## 📸 Features

| Feature | Description |
|---|---|
| 🌾 Yield Prediction | Rule-based engine calculates expected yield (tons/hectare) for 8+ crops |
| 💰 Profit Estimation | Estimates revenue and net profit using current market prices |
| 🏆 Crop Recommendation | Ranks all crops by suitability + profit and shows Top 3 |
| 📊 Visual Charts | Interactive bar charts comparing crops by profit, yield, or suitability |
| 💾 Prediction History | Recent predictions saved in browser localStorage |
| 📍 Geolocation | Auto-detect your location with one click |
| 📱 Responsive Design | Works perfectly on mobile and desktop |

---

## 📁 Folder Structure

```
Vivasayi/
├── backend/
│   ├── data/
│   │   └── crops.js          # Crop dataset (8 crops with prices, costs, conditions)
│   ├── logic/
│   │   └── yieldEngine.js    # Rule-based yield & suitability engine
│   ├── routes/
│   │   ├── predict.js        # POST /predict
│   │   ├── profit.js         # POST /profit
│   │   └── recommend.js      # POST /recommend
│   ├── server.js             # Express entry point
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css         # Dark glassmorphism design system
│   ├── js/
│   │   └── app.js            # All frontend logic
│   ├── index.html            # Home page
│   ├── form.html             # Input form page
│   └── results.html          # Results & charts page
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

### Local Setup

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Start the Application**
   ```bash
   npm start
   ```
   The app will be available at **http://localhost:3000**

---

## ☁️ Deployment

### Deploy to Render (Server-based)
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Use the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd backend && npm install`
   - **Start Command**: `npm start`
4. Add any environment variables defined in your `.env` file.

### Deploy to Vercel (Serverless)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Vercel will automatically detect the `vercel.json` configuration and deploy:
   - **Frontend**: Served from `/frontend`
   - **Backend API**: Served from `/api/index.js` (Express bridged)

---

## 📡 API Endpoints

### `POST /predict`
Predicts crop yield for all crops based on soil and weather data.

**Request Body:**
```json
{
  "soilType": "loamy",
  "soilPH": 6.5,
  "N": 80,
  "P": 40,
  "K": 40,
  "temperature": 28,
  "rainfall": 120,
  "location": "Nashik",
  "season": "kharif"
}
```

**Response:**
```json
{
  "success": true,
  "yields": [
    { "crop": "Rice", "icon": "🌾", "yield": 4.2 },
    ...
  ]
}
```

---

### `POST /profit`
Calculates estimated profit for a specific crop and yield.

**Request Body:**
```json
{
  "cropName": "Rice",
  "yieldTons": 4.2
}
```

**Response:**
```json
{
  "success": true,
  "crop": "Rice",
  "yield": 4.2,
  "pricePerTon": 2000,
  "revenue": 8400,
  "costOfCultivation": 10000,
  "profit": -1600,
  "profitMargin": -19.0
}
```

---

### `POST /recommend`
Returns all crops ranked by suitability-weighted profit + top 3.

**Request Body:** *(same as `/predict`)*

**Response:**
```json
{
  "success": true,
  "top3": [ ... ],
  "recommendations": [ ... ]
}
```

---

## 🧠 Yield Formula

```
yield = (N + P + K) × rainfall × soilFactor × seasonModifier × yieldFactor / 1000
```

Final yield is further multiplied by environmental suitability scores for temperature, rainfall range, and soil pH.

**Profit:**
```
profit = yield × marketPrice - cultivationCost
```

---

## 🌾 Crop Dataset

| Crop | Price (₹/ton) | Cost (₹/ha) | Ideal Season |
|---|---|---|---|
| Rice | 2,000 | 10,000 | Kharif |
| Wheat | 1,800 | 8,000 | Rabi |
| Cotton | 5,000 | 20,000 | Kharif |
| Maize | 1,600 | 7,000 | Kharif / Zaid |
| Sugarcane | 3,500 | 25,000 | Annual |
| Soybean | 3,200 | 12,000 | Kharif |
| Mustard | 4,500 | 9,000 | Rabi |
| Groundnut | 4,000 | 14,000 | Kharif / Zaid |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (Glassmorphism), Vanilla JavaScript |
| Charts | Chart.js v4 (CDN) |
| Backend | Node.js + Express.js |
| Fonts | Google Fonts (Outfit + Inter) |
| Storage | Browser localStorage |
| Geolocation | Nominatim (OpenStreetMap) reverse geocoding |

---

## 📄 License

MIT — Free to use, modify, and distribute.
