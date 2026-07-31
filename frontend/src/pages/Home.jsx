import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import Navbar from './Navbar';

const crops = [
  { emoji: '🍅', name: 'Tomato', nameNp: 'टमाटर' },
  { emoji: '🍎', name: 'Apple', nameNp: 'स्याउ' },
  { emoji: '🍇', name: 'Grape', nameNp: 'अङ्गुर' },
  { emoji: '🌽', name: 'Corn', nameNp: 'मकै' },
  { emoji: '🍒', name: 'Cherry', nameNp: 'चेरी' },
  { emoji: '🍊', name: 'Orange', nameNp: 'सुन्तला' },
  { emoji: '🍑', name: 'Peach', nameNp: 'आरू' },
  { emoji: '🫑', name: 'Bell Pepper', nameNp: 'क्याप्सिकम' },
  { emoji: '🥔', name: 'Potato', nameNp: 'आलु' },
  { emoji: '🍓', name: 'Strawberry', nameNp: 'स्ट्रबेरी' },
  { emoji: '🎃', name: 'Squash', nameNp: 'फर्सी' },
  { emoji: '🌾', name: 'Rice', nameNp: 'धान' },
];

const steps = {
  en: [
    { number: '01', title: 'Upload a Leaf Photo', desc: 'Take a clear photo of the affected leaf and upload it directly from your device.' },
    { number: '02', title: 'AI Analyzes the Image', desc: 'Our MobileNetV2 model scans the leaf and identifies signs of disease within seconds.' },
    { number: '03', title: 'Get Results & Treatment', desc: 'See the detected disease, confidence score, symptoms, and get AI-powered treatment advice and prevention tips.' },
  ],
  np: [
    { number: '01', title: 'पात फोटो अपलोड गर्नुहोस्', desc: 'रोगग्रस्त पातको स्पष्ट फोटो खिचेर आफ्नो उपकरणबाट सिधै अपलोड गर्नुहोस्।' },
    { number: '02', title: 'AI ले छवि विश्लेषण गर्छ', desc: 'हाम्रो MobileNetV2 मोडलले पात स्क्यान गरी केही सेकेन्डमा रोगका संकेत पहिचान गर्छ।' },
    { number: '03', title: 'नतिजा र उपचार पाउनुहोस्', desc: 'पत्ता लागेको रोग, कन्फिडेन्स स्कोर, लक्षण हेर्नुहोस् र AI-संचालित उपचार सल्लाह तथा रोकथाम सुझाव पाउनुहोस्।' },
  ],
};

const text = {
  en: {
    title: 'Crop Disease Detector',
    subtitle: 'An AI-powered tool that detects diseases in crop leaves from a single photo. Built to help farmers and agricultural workers identify problems early and take action fast.',
    stats: 'Trained on 58,134 images · 44 disease classes · 91.83% accuracy',
    cta: '🔍 Detect Disease Now',
    howTitle: 'How It Works',
    cropsTitle: 'Supported Crops',
    cropsSubtitle: 'The model can detect diseases across these 12 crops',
    modelTitle: 'About the Model',
    modelP1: 'This project uses MobileNetV2, a lightweight deep learning architecture optimized for image classification. The model was trained on the PlantVillage dataset, one of the most widely used public datasets for plant disease detection research.',
    modelP2: 'Transfer learning was applied — the base model was pre-trained on ImageNet, then fine-tuned on 58,134 leaf images across 44 disease classes including 6 rice disease classes. Training was done for 12 epochs using TensorFlow on a local machine.',
    modelP3: 'Scope note: The model is trained on controlled lab images from the PlantVillage dataset. Real-field performance may vary based on lighting, image angle, and crop varieties specific to Nepal. This is documented as a known limitation.',
    accuracy: 'Val. Accuracy',
    classes: 'Disease Classes',
    images: 'Training Images',
    ctaBottom: 'Ready to detect a disease?',
    ctaBottomSub: 'Upload a leaf photo and get AI-powered results in seconds.',
    getStarted: 'Get Started →',
    footer: 'Crop Disease Detector · BCA 8th Semester Final Year Project · Powered by MobileNetV2 + Gemini AI',
  },
  np: {
    title: 'बाली रोग पहिचानकर्ता',
    subtitle: 'एउटै फोटोबाट बालीका पातमा रोग पत्ता लगाउने AI-संचालित उपकरण। किसान र कृषि कार्यकर्तालाई समस्या छिटो पहिचान गर्न सहयोग गर्छ।',
    stats: '५८,१३४ छविहरूमा प्रशिक्षित · ४४ रोग वर्गहरू · ९१.८३% सटीकता',
    cta: '🔍 रोग पहिचान गर्नुहोस्',
    howTitle: 'यसले कसरी काम गर्छ',
    cropsTitle: 'समर्थित बालीहरू',
    cropsSubtitle: 'मोडलले यी १२ बालीहरूमा रोग पत्ता लगाउन सक्छ',
    modelTitle: 'मोडलको बारेमा',
    modelP1: 'यो परियोजनाले MobileNetV2 प्रयोग गर्छ, जो छवि वर्गीकरणका लागि अनुकूलित हल्का डीप लर्निङ आर्किटेक्चर हो। मोडललाई PlantVillage डेटासेटमा प्रशिक्षित गरिएको थियो।',
    modelP2: 'ट्रान्सफर लर्निङ प्रयोग गरियो — बेस मोडललाई ImageNet मा प्री-ट्रेन गरेर ४४ रोग वर्गका ५८,१३४ पात छविहरूमा फाइन-ट्यून गरियो, जसमा ६ धानको रोग वर्गहरू समावेश छन्। प्रशिक्षण १२ epoch का लागि TensorFlow प्रयोग गरी गरियो।',
    modelP3: 'दायरा नोट: मोडललाई PlantVillage डेटासेटका नियन्त्रित ल्याब छविहरूमा प्रशिक्षित गरिएको छ। वास्तविक क्षेत्रमा प्रदर्शन भिन्न हुन सक्छ।',
    accuracy: 'भ्याल. सटीकता',
    classes: 'रोग वर्गहरू',
    images: 'प्रशिक्षण छविहरू',
    ctaBottom: 'रोग पहिचान गर्न तयार?',
    ctaBottomSub: 'पातको फोटो अपलोड गर्नुहोस् र AI-संचालित नतिजा पाउनुहोस्।',
    getStarted: 'सुरु गर्नुहोस् →',
    footer: 'बाली रोग पहिचानकर्ता · BCA ८औं सेमेस्टर अन्तिम वर्ष परियोजना · MobileNetV2 + Gemini AI',
  },
};

function Home() {
  const navigate = useNavigate();
  const { darkMode, toggleDark, language, toggleLang } = useApp();
  const t = text[language];
  const currentSteps = steps[language];
  const dark = darkMode;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${dark ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-green-50 to-white text-gray-900'}`}>

      <Navbar darkMode={dark} toggleDark={toggleDark} language={language} toggleLang={toggleLang} />

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-12">
        <div className="text-7xl mb-4">🌿</div>
        <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 ${dark ? 'text-green-400' : 'text-green-800'}`}>
          {t.title}
        </h1>
        <p className={`text-lg md:text-xl max-w-2xl mb-3 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
          {t.subtitle}
        </p>
        <p className={`text-sm mb-8 ${dark ? 'text-gray-400' : 'text-gray-800'}`}>{t.stats}</p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-md transition duration-200"
        >
          {t.cta}
        </button>
      </div>

      {/* How It Works */}
      <div className={`py-16 px-6 ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold text-center mb-8 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.howTitle}</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentSteps.map((step) => (
            <div key={step.number} className={`rounded-2xl p-6 text-center shadow-sm ${dark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className={`text-3xl font-extrabold mb-2 ${dark ? 'text-green-500' : 'text-green-300'}`}>{step.number}</div>
              <h3 className={`text-lg font-semibold mb-2 ${dark ? 'text-green-300' : 'text-green-800'}`}>{step.title}</h3>
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Crops */}
      <div className={`py-16 px-6 ${dark ? 'bg-gray-900' : 'bg-green-50'}`}>
        <h2 className={`text-2xl font-bold text-center mb-2 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.cropsTitle}</h2>
        <p className={`text-center text-sm mb-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.cropsSubtitle}</p>
        <div className="max-w-3xl mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {crops.map((crop) => (
            <div key={crop.name} className={`flex flex-col items-center rounded-xl py-4 px-2 shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
              <span className="text-3xl mb-1">{crop.emoji}</span>
              <span className={`text-xs font-medium ${dark ? 'text-green-400' : 'text-green-700'}`}>
                {language === 'en' ? crop.name : crop.nameNp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* About the Model */}
      <div className={`py-16 px-6 ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`max-w-3xl mx-auto rounded-2xl p-8 shadow-sm ${dark ? 'bg-gray-700' : 'bg-green-50'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.modelTitle}</h2>
          <p className={`text-sm leading-relaxed mb-4 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{t.modelP1}</p>
          <p className={`text-sm leading-relaxed mb-4 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{t.modelP2}</p>
          <p className={`text-sm leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{t.modelP3}</p>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${dark ? 'text-green-400' : 'text-green-700'}`}>91.83%</div>
              <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.accuracy}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${dark ? 'text-green-400' : 'text-green-700'}`}>44</div>
              <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.classes}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${dark ? 'text-green-400' : 'text-green-700'}`}>58,134</div>
              <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.images}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 px-6 text-center bg-green-700">
        <h2 className="text-2xl font-bold text-white mb-3">{t.ctaBottom}</h2>
        <p className="text-green-200 mb-6 text-sm">{t.ctaBottomSub}</p>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="bg-white text-green-700 font-semibold text-lg px-10 py-4 rounded-2xl shadow hover:bg-green-50 transition duration-200 w-64"
          >
            {t.getStarted}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={`text-center py-8 text-xs ${dark ? 'bg-gray-900 text-gray-500' : 'bg-white text-gray-400'}`}>
        {t.footer}
      </div>

    </div>
  );
}

export default Home;