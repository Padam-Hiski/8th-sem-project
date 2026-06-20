import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import html2canvas from 'html2canvas';

// Fix — use env var, falls back to Railway for Vercel deployment
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const text = {
  en: {
    back: '← Analyze Another',
    noResult: 'No result found',
    noResultSub: 'Please upload a leaf image first.',
    goUpload: 'Go to Upload',
    title: 'Detection Result',
    subtitle: 'Analysis complete',
    detected: 'Detected Disease',
    crop: 'Crop',
    cause: '🧫 Cause',
    confidence: 'Model Confidence',
    highConf: '✅ High confidence result',
    modConf: '⚠️ Moderate confidence — verify manually',
    lowConf: '❌ Low confidence',
    about: '📋 About this Disease',
    symptoms: '🔍 Symptoms',
    treatment: '💊 Recommended Treatment',
    prevention: '🛡️ Prevention',
    severity: 'Severity Level',
    aiEnhanced: '✨ AI Enhanced',
    top3Title: '🔬 Prediction Analysis',
    top3Note: 'Top 3 of 44 disease classes',
    top3TopMatch: 'Top Match',
    disclaimer: '⚠️ This result is AI-generated and should be used as a reference only. Always consult an agricultural expert for final diagnosis.',
    analyzeAnother: '🔄 Analyze Another',
    home: '🏠 Home',
    lowConfTitle: 'Could Not Identify',
    lowConfMsg: "The model's confidence was too low",
    lowConfSub: 'to make a reliable prediction. Please retake the photo with better lighting and focus on the affected leaf area.',
    tipsTitle: '💡 Try these improvements:',
    tips: ['Use natural daylight', 'Get closer to the leaf', 'Make sure the image is not blurry', 'Focus on the most affected part'],
    retake: '📷 Retake Photo',
    tryAnother: '← Try Another Photo',
    feedbackTitle: 'Was this result correct?',
    feedbackYes: '👍 Yes, correct',
    feedbackNo: '👎 No, incorrect',
    feedbackThanks: '✅ Thank you for your feedback!',
    feedbackError: 'Could not submit feedback. Try again.',
    download: '📥 Save as Image',
    downloading: 'Saving...',
  },
  np: {
    back: '← अर्को विश्लेषण गर्नुहोस्',
    noResult: 'कुनै नतिजा फेला परेन',
    noResultSub: 'कृपया पहिले पातको छवि अपलोड गर्नुहोस्।',
    goUpload: 'अपलोडमा जानुहोस्',
    title: 'पहिचान नतिजा',
    subtitle: 'विश्लेषण सम्पन्न',
    detected: 'पत्ता लागेको रोग',
    crop: 'बाली',
    cause: '🧫 कारण',
    confidence: 'मोडल कन्फिडेन्स',
    highConf: '✅ उच्च कन्फिडेन्स नतिजा',
    modConf: '⚠️ मध्यम कन्फिडेन्स — म्यानुअल जाँच गर्नुहोस्',
    lowConf: '❌ कम कन्फिडेन्स',
    about: '📋 यो रोगको बारेमा',
    symptoms: '🔍 लक्षणहरू',
    treatment: '💊 सिफारिश उपचार',
    prevention: '🛡️ रोकथाम',
    severity: 'गम्भीरता स्तर',
    aiEnhanced: '✨ AI उन्नत',
    top3Title: '🔬 अनुमान विश्लेषण',
    top3Note: '४४ रोग वर्गहरूमध्ये शीर्ष ३',
    top3TopMatch: 'शीर्ष मिलान',
    disclaimer: '⚠️ यो नतिजा AI-निर्मित हो र केवल सन्दर्भको रूपमा प्रयोग गर्नुपर्छ। अन्तिम निदानको लागि सधैँ कृषि विशेषज्ञसँग सल्लाह लिनुहोस्।',
    analyzeAnother: '🔄 अर्को विश्लेषण',
    home: '🏠 गृहपृष्ठ',
    lowConfTitle: 'पहिचान गर्न सकिएन',
    lowConfMsg: 'मोडलको कन्फिडेन्स धेरै कम थियो',
    lowConfSub: 'विश्वसनीय अनुमान गर्न। राम्रो प्रकाश र फोकससहित फोटो पुन: खिच्नुहोस्।',
    tipsTitle: '💡 यी सुधारहरू प्रयास गर्नुहोस्:',
    tips: ['प्राकृतिक दिवालोक प्रयोग गर्नुहोस्', 'पातको नजिक जानुहोस्', 'छवि धमिलो नभएको सुनिश्चित गर्नुहोस्', 'सबैभन्दा प्रभावित भागमा फोकस गर्नुहोस्'],
    retake: '📷 फोटो पुन: खिच्नुहोस्',
    tryAnother: '← अर्को फोटो प्रयास गर्नुहोस्',
    feedbackTitle: 'के यो नतिजा सही थियो?',
    feedbackYes: '👍 हो, सही',
    feedbackNo: '👎 होइन, गलत',
    feedbackThanks: '✅ तपाईंको प्रतिक्रियाको लागि धन्यवाद!',
    feedbackError: 'प्रतिक्रिया पठाउन सकिएन। पुन: प्रयास गर्नुहोस्।',
    download: '📥 छवि सेभ गर्नुहोस्',
    downloading: 'सेभ हुँदैछ...',
  },
};

// ─── Helpers ───────────────────────────────────────────────
const cropEmoji = (className) => {
  if (!className) return '🌿';
  if (className.startsWith('Rice'))       return '🌾';
  if (className.startsWith('Tomato'))     return '🍅';
  if (className.startsWith('Potato'))     return '🥔';
  if (className.startsWith('Corn'))       return '🌽';
  if (className.startsWith('Apple'))      return '🍎';
  if (className.startsWith('Grape'))      return '🍇';
  if (className.startsWith('Cherry'))     return '🍒';
  if (className.startsWith('Peach'))      return '🍑';
  if (className.startsWith('Pepper'))     return '🫑';
  if (className.startsWith('Strawberry')) return '🍓';
  if (className.startsWith('Blueberry'))  return '🫐';
  if (className.startsWith('Orange'))     return '🍊';
  if (className.startsWith('Squash'))     return '🎃';
  if (className.startsWith('Soybean'))    return '🫘';
  if (className.startsWith('Raspberry'))  return '🍓';
  return '🌿';
};

const formatDisease = (className) => {
  if (!className) return '';
  const parts = className.split('___');
  return (parts[1] || parts[0]).replace(/_/g, ' ');
};

const formatCrop = (className) => {
  if (!className) return '';
  return className.split('___')[0].replace(/_/g, ' ').replace(/\(.*?\)/g, '').trim();
};

const getBarColor = (confidence, index) => {
  if (index !== 0) return '#94a3b8';
  if (confidence >= 85) return '#16a34a';
  if (confidence >= 60) return '#d97706';
  return '#dc2626';
};

// Fix — severity badge handles all cases including "None" from Gemini
const getSeverityStyle = (severity) => {
  if (!severity || severity === 'None' || severity === 'N/A') {
    return { bg: 'bg-gray-100', text: 'text-gray-500', label: 'N/A — Healthy' };
  }
  if (severity === 'High' || severity === 'Very High') {
    return { bg: 'bg-red-100', text: 'text-red-600', label: severity };
  }
  if (severity === 'Medium') {
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: severity };
  }
  return { bg: 'bg-green-100', text: 'text-green-700', label: severity };
};

// ─── Top3Bars Sub-component ────────────────────────────────
function Top3Bars({ top3, animated, dark, t }) {
  if (!top3 || top3.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {top3.map((item, index) => {
        const isTop    = index === 0;
        const barColor = getBarColor(item.confidence, index);
        const barWidth = animated ? `${item.confidence}%` : '0%';

        return (
          <div key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{cropEmoji(item.class)}</span>
                <div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: isTop ? 700 : 500,
                    color: isTop ? (dark ? '#e2e8f0' : '#0f172a') : '#94a3b8',
                  }}>
                    {formatDisease(item.class)}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>
                    {formatCrop(item.class)}
                  </span>
                </div>
              </div>
              <span style={{
                fontSize: 14,
                fontWeight: isTop ? 700 : 400,
                color: isTop ? barColor : '#94a3b8',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {item.confidence.toFixed(1)}%
              </span>
            </div>

            <div style={{
              height: 8,
              borderRadius: 999,
              backgroundColor: dark ? '#374151' : '#e2e8f0',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                borderRadius: 999,
                width: barWidth,
                backgroundColor: barColor,
                opacity: isTop ? 1 : 0.4,
                transition: `width 0.7s cubic-bezier(0.4,0,0.2,1) ${index * 120}ms`,
              }} />
            </div>

            {isTop && (
              <span style={{
                display: 'inline-block',
                marginTop: 5,
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 11,
                color: '#fff',
                fontWeight: 600,
                backgroundColor: barColor,
              }}>
                {t.top3TopMatch}
              </span>
            )}
          </div>
        );
      })}

      <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', textAlign: 'center' }}>
        {t.top3Note}
      </p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────
function Result() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { darkMode, toggleDark, language, toggleLang } = useApp();
  const t    = text[language];
  const dark = darkMode;

  const { result, preview } = location.state || {};

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError,     setFeedbackError]     = useState(false);
  const [feedbackLoading,   setFeedbackLoading]   = useState(false);
  const [downloading,       setDownloading]       = useState(false);
  const [animated,          setAnimated]          = useState(false);

  const resultCardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(timer);
  }, [result]);

  const submitFeedback = async (feedbackValue) => {
    if (!result?.prediction_id) return;
    setFeedbackLoading(true);
    setFeedbackError(false);
    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prediction_id: result.prediction_id,
          feedback: feedbackValue,
        }),
      });
      if (res.ok) setFeedbackSubmitted(true);
      else        setFeedbackError(true);
    } catch {
      setFeedbackError(true);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resultCardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: dark ? '#111827' : '#f0fdf4',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link        = document.createElement('a');
      const diseaseName = result?.disease?.name || result?.predicted_class || 'result';
      link.download     = `crop-disease-${diseaseName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href         = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const TopBar = () => (
    <div className="flex justify-end gap-2 mb-6">
      <button onClick={toggleLang} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
        {language === 'en' ? '🇳🇵 नेपाली' : 'EN English'}
      </button>
      <button onClick={toggleDark} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );

  // ── No Result ──
  if (!result) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center text-center px-6 ${dark ? 'bg-gray-900 text-white' : ''}`}>
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className={`text-xl font-bold mb-2 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>{t.noResult}</h2>
        <p className={`text-sm mb-6 ${dark ? 'text-gray-400' : 'text-gray-400'}`}>{t.noResultSub}</p>
        <button onClick={() => navigate('/upload')} className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition">
          {t.goUpload}
        </button>
      </div>
    );
  }

  // ── Low Confidence ──
  if (result.status === 'low_confidence') {
    return (
      <div className={`min-h-screen px-6 py-12 transition-colors duration-300 ${dark ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-green-50 to-white'}`}>
        <TopBar />
        <button onClick={() => navigate('/upload')} className={`text-sm mb-8 inline-block ${dark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}>
          {t.tryAnother}
        </button>
        <div className="max-w-xl mx-auto text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className={`text-2xl font-bold mb-3 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>{t.lowConfTitle}</h2>
          <p className={`text-sm mb-6 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.lowConfMsg} ({result.confidence}%) {t.lowConfSub}
          </p>
          {preview && (
            <img src={preview} alt="Uploaded" className="max-h-48 mx-auto rounded-xl mb-6 object-contain" />
          )}
          {result.top3 && result.top3.length > 0 && (
            <div className={`rounded-2xl p-5 mb-6 border text-left ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={`text-sm font-semibold mb-4 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{t.top3Title}</p>
              <Top3Bars top3={result.top3} animated={animated} dark={dark} t={t} />
            </div>
          )}
          <div className={`border rounded-xl px-5 py-4 text-left mb-6 ${dark ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
            <p className={`font-semibold text-sm mb-2 ${dark ? 'text-yellow-300' : 'text-yellow-800'}`}>{t.tipsTitle}</p>
            <ul className={`text-xs space-y-1 list-disc list-inside ${dark ? 'text-yellow-400' : 'text-yellow-700'}`}>
              {t.tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
          <button onClick={() => navigate('/upload')} className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl hover:bg-green-700 transition">
            {t.retake}
          </button>
        </div>
      </div>
    );
  }

  // ── Success ──
  const { predicted_class, confidence, disease, top3 } = result;
  const confidencePercent = parseFloat(confidence).toFixed(1);
  const confidenceRaw     = confidence / 100;
  const mainBarColor      = confidenceRaw >= 0.85 ? '#16a34a' : confidenceRaw >= 0.60 ? '#d97706' : '#dc2626';
  const severityStyle     = getSeverityStyle(disease?.severity);

  // Fix — parse symptoms whether string or array
  const symptomsArray = disease?.symptoms
    ? Array.isArray(disease.symptoms)
      ? disease.symptoms
      : disease.symptoms.split('. ').filter(Boolean).map(s => s.endsWith('.') ? s : `${s}.`)
    : [];

  return (
    <div className={`min-h-screen px-6 py-12 transition-colors duration-300 ${dark ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-green-50 to-white'}`}>
      <TopBar />

      <button onClick={() => navigate('/upload')} className={`text-sm mb-8 inline-block ${dark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}>
        {t.back}
      </button>

      {/* ── CAPTURED AREA ── */}
      <div ref={resultCardRef} className={`max-w-xl mx-auto rounded-3xl p-6 ${dark ? 'bg-gray-900' : 'bg-green-50'}`}>

        <h1 className={`text-3xl font-bold mb-1 text-center ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.title}</h1>
        <p className={`text-sm text-center mb-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.subtitle}</p>

        {preview && (
          <img src={preview} alt="Analyzed leaf" className="w-full max-h-56 object-contain rounded-2xl shadow mb-6" />
        )}

        {/* Disease Name + AI Badge */}
        <div className={`rounded-2xl shadow-sm p-6 mb-4 text-center border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
          <p className={`text-xs uppercase tracking-widest mb-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.detected}</p>
          <h2 className={`text-2xl font-extrabold ${dark ? 'text-green-400' : 'text-green-800'}`}>
            {disease?.name || predicted_class?.replace(/_/g, ' ')}
          </h2>
          {disease?.crop && (
            <p className={`text-sm mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.crop}: {disease.crop}</p>
          )}
          {/* Fix — AI Enhanced badge using disease_source */}
          {result.disease_source === 'gemini' && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              {t.aiEnhanced}
            </span>
          )}
          {/* Cause row — only shown when Gemini provides it */}
          {disease?.cause && (
            <p className={`text-xs mt-3 px-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="font-semibold">{t.cause}:</span> {disease.cause}
            </p>
          )}
        </div>

        {/* Fix — animated confidence bar, consistent with Top3 bars */}
        <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
          <div className="flex justify-between text-sm mb-2">
            <span className={`font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.confidence}</span>
            <span className="font-bold" style={{ color: mainBarColor }}>{confidencePercent}%</span>
          </div>
          <div className={`w-full rounded-full h-3 overflow-hidden ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div style={{
              height: '100%',
              borderRadius: 999,
              width: animated ? `${confidencePercent}%` : '0%',
              backgroundColor: mainBarColor,
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {confidenceRaw >= 0.85 ? t.highConf : confidenceRaw >= 0.60 ? t.modConf : t.lowConf}
          </p>
        </div>

        {/* Top 3 Predictions */}
        {top3 && top3.length > 0 && (
          <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
            <p className={`text-sm font-semibold mb-4 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.top3Title}</p>
            <Top3Bars top3={top3} animated={animated} dark={dark} t={t} />
          </div>
        )}

        {/* Disease Info */}
        {disease && (
          <>
            {/* About */}
            {disease.description && (
              <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
                <h3 className={`font-semibold mb-2 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.about}</h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{disease.description}</p>
              </div>
            )}

            {/* Fix — symptoms handles both string (Gemini) and array (diseases.json) */}
            {symptomsArray.length > 0 && (
              <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
                <h3 className={`font-semibold mb-3 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.symptoms}</h3>
                <ul className="space-y-2">
                  {symptomsArray.map((s, i) => (
                    <li key={i} className={`text-sm flex items-start gap-2 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Treatment */}
            {Array.isArray(disease.treatment) && disease.treatment.length > 0 && (
              <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`font-semibold mb-3 ${dark ? 'text-green-300' : 'text-green-800'}`}>{t.treatment}</h3>
                <ul className="space-y-2">
                  {disease.treatment.map((item, i) => (
                    <li key={i} className={`text-sm flex items-start gap-2 ${dark ? 'text-green-300' : 'text-green-700'}`}>
                      <span className="mt-0.5 flex-shrink-0">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fix — Prevention field from Gemini */}
            {disease.prevention && (
              <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <h3 className={`font-semibold mb-2 ${dark ? 'text-blue-300' : 'text-blue-800'}`}>{t.prevention}</h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-blue-200' : 'text-blue-700'}`}>{disease.prevention}</p>
              </div>
            )}

            {/* Fix — Severity badge handles None/N/A for healthy crops */}
            {disease.severity && (
              <div className={`rounded-2xl shadow-sm p-6 mb-4 border flex items-center justify-between ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
                <span className={`font-medium text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{t.severity}</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${severityStyle.bg} ${severityStyle.text}`}>
                  {severityStyle.label}
                </span>
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className={`border rounded-xl px-5 py-4 mb-3 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-xs text-center ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.disclaimer}</p>
        </div>

        {/* Watermark */}
        <p className={`text-center text-xs ${dark ? 'text-gray-600' : 'text-gray-300'}`}>
          🌿 Crop Disease Detector — BCA 8th Semester Project
        </p>

      </div>
      {/* ── END CAPTURED AREA ── */}

      <div className="max-w-xl mx-auto mt-4">

        {/* Feedback */}
        {result.prediction_id && (
          <div className={`rounded-2xl shadow-sm p-5 mb-4 border text-center ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
            {feedbackSubmitted ? (
              <p className={`text-sm font-semibold ${dark ? 'text-green-400' : 'text-green-700'}`}>{t.feedbackThanks}</p>
            ) : (
              <>
                <p className={`text-sm font-medium mb-3 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{t.feedbackTitle}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => submitFeedback('correct')}
                    disabled={feedbackLoading}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${dark ? 'border-green-600 text-green-400 hover:bg-green-900' : 'border-green-400 text-green-700 hover:bg-green-50'} disabled:opacity-50`}
                  >
                    {t.feedbackYes}
                  </button>
                  <button
                    onClick={() => submitFeedback('incorrect')}
                    disabled={feedbackLoading}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${dark ? 'border-red-700 text-red-400 hover:bg-red-900' : 'border-red-300 text-red-600 hover:bg-red-50'} disabled:opacity-50`}
                  >
                    {t.feedbackNo}
                  </button>
                </div>
                {feedbackError && (
                  <p className={`text-xs mt-2 ${dark ? 'text-red-400' : 'text-red-500'}`}>{t.feedbackError}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`w-full mb-3 border font-medium py-3 rounded-xl transition text-sm ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} disabled:opacity-50`}
        >
          {downloading ? t.downloading : t.download}
        </button>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/upload')}
            className={`flex-1 border font-medium py-3 rounded-xl transition text-sm ${dark ? 'border-green-600 text-green-400 hover:bg-gray-800' : 'border-green-400 text-green-700 hover:bg-green-50'}`}
          >
            {t.analyzeAnother}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition text-sm"
          >
            {t.home}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Result;