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
    soil_type_lbl: "Soil Type",
    soil_ph_lbl: "Soil pH",
    nitrogen_lbl: "Nitrogen (N)",
    phosphorus_lbl: "Phosphorus (P)",
    potassium_lbl: "Potassium (K)",
    temp_lbl: "Temperature",
    rainfall_lbl: "Rainfall",
    location_v_lbl: "Location / Village",
    predict_btn: "🔍 Predict Yield & Profit",
    best_crop: "Best Crop",
    predicted_yield: "Predicted Yield",
    net_profit: "Net Profit",
    ai_advice_header: "AI Expert Advice",
    water: "Water Management",
    fertilizer: "NPK Advice",
    pro_tip: "Expert Pro-Tip",
    lang_toggle: "தமிழ்",
    // Soil Types
    soil_sandy: "Sandy Soil",
    soil_clay: "Clay Soil",
    soil_loamy: "Loamy Soil",
    soil_alluvial: "Alluvial Soil",
    soil_red: "Red Soil",
    soil_black: "Black (Cotton) Soil"
  },
  ta: {
    hero_title: "புத்திசாலித்தனமாக வளருங்கள், ஒவ்வொரு பருவத்திலும் அதிக லாபம் ஈட்டுங்கள்",
    hero_desc: "உங்கள் மண் தரவு மற்றும் வானிலை நிலைகளை உள்ளிட்டு, கணிக்கப்பட்ட பயிர் விளைச்சல், மதிப்பிடப்பட்ட லாபம் மற்றும் நிபுணர்களின் பரிந்துரைகளை உடனடியாகப் பெறுங்கள்.",
    predict_start: "🚀 கணிப்பைத் தொடங்கு",
    learn_more: "மேலும் அறிய",
    nav_home: "முகப்பு",
    nav_predict: "பயிரைக் கணிக்க",
    form_title: "உங்கள் பண்ணை விவரங்களை உள்ளிடவும்",
    form_sub: "பயிர் விளைச்சல் மற்றும் லாப மதிப்பீடுகளைப் பெறுவதற்கான விவரங்களைப் பூர்த்தி செய்யவும்.",
    soil_info_h: "🌍 மண் தகவல்",
    nutrients_h: "🧪 முதன்மை ஊட்டச்சத்துக்கள் (kg/ha)",
    weather_loc_h: "🌤️ வானிலை மற்றும் இடம்",
    soil_type_lbl: "மண் வகை",
    soil_ph_lbl: "மண் pH",
    nitrogen_lbl: "நைட்ரஜன் (N)",
    phosphorus_lbl: "பாஸ்பரஸ் (P)",
    potassium_lbl: "பொட்டாசியம் (K)",
    temp_lbl: "வெப்பநிலை",
    rainfall_lbl: "மழைப்பொழிவு",
    location_v_lbl: "இடம் / கிராமம்",
    predict_btn: "🔍 பயிர் மற்றும் லாபத்தைக் கணிப்போம்",
    best_crop: "சிறந்த பயிர்",
    predicted_yield: "எதிர்பார்க்கப்படும் விளைச்சல்",
    net_profit: "நிகர லாபம்",
    ai_advice_header: "AI நிபுணர் ஆலோசனை",
    water: "நீர் மேலாண்மை",
    fertilizer: "உர மேலாண்மை (NPK)",
    pro_tip: "நிபுணர் குறிப்பு",
    lang_toggle: "English",
    // Soil Types
    soil_sandy: "மணல் மண்",
    soil_clay: "களிமண்",
    soil_loamy: "வண்டல் மண்",
    soil_alluvial: "ஆற்று வண்டல் மண்",
    soil_red: "செம்மண்",
    soil_black: "கரிசல் மண்"
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
    // 1. Text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.i18n.t(key);
    });
    // 2. Select placeholders
    document.querySelectorAll('select option[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.i18n.t(key);
    });
  }
};

document.addEventListener('DOMContentLoaded', window.i18n.apply);
