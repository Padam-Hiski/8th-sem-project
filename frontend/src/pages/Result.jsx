import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import html2canvas from 'html2canvas';

const API_URL = 'http://localhost:5000';

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
    confidence: 'Model Confidence',
    highConf: '✅ High confidence result',
    modConf: '⚠️ Moderate confidence — verify manually',
    lowConf: '❌ Low confidence',
    about: '📋 About this Disease',
    symptoms: '🔍 Symptoms',
    treatment: '💊 Recommended Treatment',
    severity: 'Severity Level',
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
    confidence: 'मोडल कन्फिडेन्स',
    highConf: '✅ उच्च कन्फिडेन्स नतिजा',
    modConf: '⚠️ मध्यम कन्फिडेन्स — म्यानुअल जाँच गर्नुहोस्',
    lowConf: '❌ कम कन्फिडेन्स',
    about: '📋 यो रोगको बारेमा',
    symptoms: '🔍 लक्षणहरू',
    treatment: '💊 सिफारिश उपचार',
    severity: 'गम्भीरता स्तर',
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

function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDark, language, toggleLang } = useApp();
  const t = text[language];
  const dark = darkMode;

  const { result, preview } = location.state || {};

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const resultCardRef = useRef(null);

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
      if (res.ok) {
        setFeedbackSubmitted(true);
      } else {
        setFeedbackError(true);
      }
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
      const link = document.createElement('a');
      const diseaseName = result?.disease?.name || result?.predicted_class || 'result';
      link.download = `crop-disease-${diseaseName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
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
          {preview && <img src={preview} alt="Uploaded" className="max-h-48 mx-auto rounded-xl mb-6 object-contain" />}
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

  // SUCCESS
  const { predicted_class, confidence, disease } = result;
  const confidencePercent = parseFloat(confidence).toFixed(1);
  const confidenceRaw = confidence / 100;
  const barColor = confidenceRaw >= 0.85 ? 'bg-green-500' : confidenceRaw >= 0.60 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className={`min-h-screen px-6 py-12 transition-colors duration-300 ${dark ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-green-50 to-white'}`}>
      <TopBar />

      <button onClick={() => navigate('/upload')} className={`text-sm mb-8 inline-block ${dark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}>
        {t.back}
      </button>

      {/* ---- CAPTURED AREA ---- */}
      <div ref={resultCardRef} className={`max-w-xl mx-auto rounded-3xl p-6 ${dark ? 'bg-gray-900' : 'bg-green-50'}`}>

        <h1 className={`text-3xl font-bold mb-1 text-center ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.title}</h1>
        <p className={`text-sm text-center mb-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.subtitle}</p>

        {preview && <img src={preview} alt="Analyzed leaf" className="w-full max-h-56 object-contain rounded-2xl shadow mb-6" />}

        {/* Disease Name */}
        <div className={`rounded-2xl shadow-sm p-6 mb-4 text-center border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
          <p className={`text-xs uppercase tracking-widest mb-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.detected}</p>
          <h2 className={`text-2xl font-extrabold ${dark ? 'text-green-400' : 'text-green-800'}`}>
            {disease?.name || predicted_class?.replace(/_/g, ' ')}
          </h2>
          {disease?.crop && <p className={`text-sm mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.crop}: {disease.crop}</p>}
        </div>

        {/* Confidence Bar */}
        <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
          <div className="flex justify-between text-sm mb-2">
            <span className={`font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.confidence}</span>
            <span className={`font-bold ${dark ? 'text-green-400' : 'text-green-700'}`}>{confidencePercent}%</span>
          </div>
          <div className={`w-full rounded-full h-3 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className={`${barColor} h-3 rounded-full`} style={{ width: `${confidencePercent}%` }} />
          </div>
          <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {confidenceRaw >= 0.85 ? t.highConf : confidenceRaw >= 0.60 ? t.modConf : t.lowConf}
          </p>
        </div>

        {/* Disease Info */}
        {disease && (
          <>
            {disease.description && (
              <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
                <h3 className={`font-semibold mb-2 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.about}</h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{disease.description}</p>
              </div>
            )}
            {Array.isArray(disease.symptoms) && disease.symptoms.length > 0 && (
              <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
                <h3 className={`font-semibold mb-3 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.symptoms}</h3>
                <ul className="space-y-1">
                  {disease.symptoms.map((s, i) => (
                    <li key={i} className={`text-sm flex items-start gap-2 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-green-400 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(disease.treatment) && disease.treatment.length > 0 && (
              <div className={`rounded-2xl shadow-sm p-6 mb-4 border ${dark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`font-semibold mb-3 ${dark ? 'text-green-300' : 'text-green-800'}`}>{t.treatment}</h3>
                <ul className="space-y-1">
                  {disease.treatment.map((t_item, i) => (
                    <li key={i} className={`text-sm flex items-start gap-2 ${dark ? 'text-green-300' : 'text-green-700'}`}>
                      <span className="mt-0.5">✓</span> {t_item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {disease.severity && (
              <div className={`rounded-2xl shadow-sm p-6 mb-4 border flex items-center justify-between ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
                <span className={`font-medium text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{t.severity}</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  disease.severity === 'High' || disease.severity === 'Very High' ? 'bg-red-100 text-red-600' :
                  disease.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {disease.severity}
                </span>
              </div>
            )}
          </>
        )}

        {/* Disclaimer inside capture */}
        <div className={`border rounded-xl px-5 py-4 mb-3 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-xs text-center ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.disclaimer}</p>
        </div>

        {/* Watermark */}
        <p className={`text-center text-xs ${dark ? 'text-gray-600' : 'text-gray-300'}`}>
          🌿 Crop Disease Detector — BCA 8th Semester Project
        </p>

      </div>
      {/* ---- END CAPTURED AREA ---- */}

      <div className="max-w-xl mx-auto mt-4">

        {/* Feedback Card */}
        {result.prediction_id && (
          <div className={`rounded-2xl shadow-sm p-5 mb-4 border text-center ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
            {feedbackSubmitted ? (
              <p className={`text-sm font-semibold ${dark ? 'text-green-400' : 'text-green-700'}`}>
                {t.feedbackThanks}
              </p>
            ) : (
              <>
                <p className={`text-sm font-medium mb-3 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t.feedbackTitle}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => submitFeedback('correct')}
                    disabled={feedbackLoading}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${
                      dark ? 'border-green-600 text-green-400 hover:bg-green-900' : 'border-green-400 text-green-700 hover:bg-green-50'
                    } disabled:opacity-50`}
                  >
                    {t.feedbackYes}
                  </button>
                  <button
                    onClick={() => submitFeedback('incorrect')}
                    disabled={feedbackLoading}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${
                      dark ? 'border-red-700 text-red-400 hover:bg-red-900' : 'border-red-300 text-red-600 hover:bg-red-50'
                    } disabled:opacity-50`}
                  >
                    {t.feedbackNo}
                  </button>
                </div>
                {feedbackError && (
                  <p className={`text-xs mt-2 ${dark ? 'text-red-400' : 'text-red-500'}`}>
                    {t.feedbackError}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`w-full mb-3 border font-medium py-3 rounded-xl transition text-sm ${
            dark ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          } disabled:opacity-50`}
        >
          {downloading ? t.downloading : t.download}
        </button>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={() => navigate('/upload')} className={`flex-1 border font-medium py-3 rounded-xl transition text-sm ${dark ? 'border-green-600 text-green-400 hover:bg-gray-800' : 'border-green-400 text-green-700 hover:bg-green-50'}`}>
            {t.analyzeAnother}
          </button>
          <button onClick={() => navigate('/')} className="flex-1 bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition text-sm">
            {t.home}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Result;