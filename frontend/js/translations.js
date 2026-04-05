/**
 * Translation Dictionary for Smart Crop Advisor (EN / TA)
 */
const translations = {
  en: {
    hero_title: "Grow Smarter, Profit More Every Season",
    hero_desc: "Enter your soil data and weather conditions to instantly receive predicted crop yields, estimated profits, and expert recommendations.",
    predict_start: "🚀 Start Prediction",
    learn_more: "Learn More",
    nav_home: "Home",
    nav_predict: "Get Prediction",
    form_title: "Enter Your Field Details",
    form_sub: "Fill in the form below to get crop yield prediction and profit estimates.",
    soil_info_h: "🌍 Soil Information",
    nutrients_h: "🧪 Primary Nutrients (kg/ha)",
    weather_loc_h: "🌤️ Weather & Location",
    soil_type: "Soil Type",
    soil_ph: "Soil pH",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    temp: "Temperature",
    rainfall: "Rainfall",
    location_v: "Location / Village",
    predict_btn: "🔍 Predict Yield & Profit",
    best_crop: "Best Crop",
    predicted_yield: "Predicted Yield",
    net_profit: "Net Profit",
    ai_advice_header: "AI Expert Advice",
    water: "Water Management",
    fertilizer: "NPK Advice",
    pro_tip: "Expert Pro-Tip",
    lang_toggle: "தமிழ்"
  },
  ta: {
    hero_title: "புத்திசாலித்தனமாக வளருங்கள், ஒவ்வொரு பருவத்திலும் அதிக லாபம் ஈட்டுங்கள்",
    hero_desc: "உங்கள் மண் தரவு மற்றும் வானிலை நிலைகளை உள்ளிட்டு, கணிக்கப்பட்ட பயிர் விளைச்சல், மதிப்பிடப்பட்ட லாபம் மற்றும் நிபுணர்களின் பரிந்துரைகளை உடனடியாகப் பெறுங்கள்.",
    predict_start: "🚀 கணிப்பைப் தொடங்கவும்",
    learn_more: "மேலும் அறிய",
    nav_home: "முகப்பு",
    nav_predict: "பயிரைக் கணிக்க",
    form_title: "உங்கள் பண்ணை விவரங்களை உள்ளிடவும்",
    form_sub: "பயிர் விளைச்சல் மற்றும் லாப மதிப்பீடுகளைப் பெறுவதற்கான விவரங்களைப் பூர்த்தி செய்யவும்.",
    soil_info_h: "🌍 மண் தகவல்",
    nutrients_h: "🧪 முதன்மை ஊட்டச்சத்துக்கள் (kg/ha)",
    weather_loc_h: "🌤️ வானிலை மற்றும் இடம்",
    soil_type: "மண் வகை",
    soil_ph: "மண் pH",
    nitrogen: "நைட்ரஜன் (N)",
    phosphorus: "பாஸ்பரஸ் (P)",
    potassium: "பொட்டாசியம் (K)",
    temp: "வெப்பநிலை",
    rainfall: "மழைப்பொழிவு",
    location_v: "இடம் / கிராமம்",
    predict_btn: "🔍 பயிர் மற்றும் லாபத்தைக் கணிப்போம்",
    best_crop: "சிறந்த பயிர்",
    predicted_yield: "எதிர்பார்க்கப்படும் விளைச்சல்",
    net_profit: "நிகர லாபம்",
    ai_advice_header: "AI நிபுணர் ஆலோசனை",
    water: "தீர் மேலாண்மை",
    fertilizer: "உர மேலாண்மை (NPK)",
    pro_tip: "முக்கிய நிபுணர் குறிப்பு",
    lang_toggle: "English"
  }
};

window.i18n = {
  getLang: () => localStorage.getItem('sca_lang') || 'en',
  setLang: (lang) => {
    localStorage.setItem('sca_lang', lang);
    location.reload();
  },
  t: (key) => translations[window.i18n.getLang()][key] || key,
  apply: () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.i18n.t(key);
    });
  }
};

// Auto-apply on load
document.addEventListener('DOMContentLoaded', window.i18n.apply);
