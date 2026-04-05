/**
 * Translation Dictionary for Smart Crop Advisor (EN / TA)
 */
const translations = {
  en: {
    nav_home: "Home",
    nav_predict: "Get Prediction",
    hero_title: "Enter Your Field Details",
    hero_sub: "Fill in the form below to get crop yield prediction and profit estimates.",
    soil_info: "🌍 Soil Information",
    nutrients: "🧪 Primary Nutrients (kg/ha)",
    weather_loc: "🌤️ Weather & Location",
    predict_btn: "🔍 Predict Yield & Profit",
    best_crop: "Best Crop",
    predicted_yield: "Predicted Yield",
    net_profit: "Net Profit",
    ai_advice_header: "🤖 AI Expert Advice",
    water: "Water",
    fertilizer: "NPK Advice",
    pro_tip: "Pro-Tip",
    lang_toggle: "தமிழ்"
  },
  ta: {
    nav_home: "முகப்பு",
    nav_predict: "பயிரைக் கணிக்க",
    hero_title: "உங்கள் பண்ணை விவரங்களை உள்ளிடவும்",
    hero_sub: "பயிர் விளைச்சல் மற்றும் லாப மதிப்பீடுகளைப் பெறுவதற்கான விவரங்களைப் பூர்த்தி செய்யவும்.",
    soil_info: "🌍 மண் தகவல்",
    nutrients: "🧪 முதன்மை ஊட்டச்சத்துக்கள் (kg/ha)",
    weather_loc: "🌤️ வானிலை மற்றும் இடம்",
    predict_btn: "🔍 பயிர் மற்றும் லாபத்தைக் கணிப்போம்",
    best_crop: "சிறந்த பயிர்",
    predicted_yield: "எதிர்பார்க்கப்படும் விளைச்சல்",
    net_profit: "நிகர லாபம்",
    ai_advice_header: "🤖 AI நிபுணர் ஆலோசனை",
    water: "தண்ணீர் மேலாண்மை",
    fertilizer: "உர மேலாண்மை (NPK)",
    pro_tip: "சிறப்பு அறிவுரை",
    lang_toggle: "English"
  }
};

window.i18n = {
  getLang: () => localStorage.getItem('sca_lang') || 'en',
  setLang: (lang) => {
    localStorage.setItem('sca_lang', lang);
    location.reload();
  },
  t: (key) => translations[window.i18n.getLang()][key] || key
};
