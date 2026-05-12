import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

const API_URL = 'http://localhost:5000';

const text = {
  en: {
    back: '← Back',
    title: 'Scan History',
    subtitle: 'Your last 20 crop scans',
    loading: 'Loading history...',
    error: 'Could not load history. Is the backend running?',
    noData: 'No scans yet. Start by analyzing a crop leaf!',
    scan: 'Go to Upload',
    disease: 'Disease',
    crop: 'Crop',
    confidence: 'Confidence',
    date: 'Date',
    healthy: 'Healthy',
    home: '🏠 Home',
    upload: '🔍 Scan a Crop',
    footer: 'Crop Disease Detector · BCA 8th Semester Final Year Project · Powered by MobileNetV2',
    total: 'Total scans shown',
  },
  np: {
    back: '← फिर्ता',
    title: 'स्क्यान इतिहास',
    subtitle: 'तपाईंका पछिल्ला २० बाली स्क्यानहरू',
    loading: 'इतिहास लोड हुँदैछ...',
    error: 'इतिहास लोड गर्न सकिएन। ब्याकएन्ड चलिरहेको छ?',
    noData: 'अहिलेसम्म कुनै स्क्यान छैन। बालीको पात विश्लेषण गर्न सुरु गर्नुहोस्!',
    scan: 'अपलोडमा जानुहोस्',
    disease: 'रोग',
    crop: 'बाली',
    confidence: 'कन्फिडेन्स',
    date: 'मिति',
    healthy: 'स्वस्थ',
    home: '🏠 गृहपृष्ठ',
    upload: '🔍 बाली स्क्यान गर्नुहोस्',
    footer: 'बाली रोग पहिचानकर्ता · BCA ८औं सेमेस्टर अन्तिम वर्ष परियोजना · MobileNetV2 द्वारा संचालित',
    total: 'कुल स्क्यानहरू देखाइएको',
  },
};

// Format ISO timestamp to readable date
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Shorten class name for display
function formatDiseaseName(rawName) {
  return rawName
    .replace(/_/g, ' ')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function History() {
  const navigate = useNavigate();
  const { darkMode, toggleDark, language, toggleLang } = useApp();
  const t = text[language];
  const dark = darkMode;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/history?limit=20`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const isHealthy = (name) => name.toLowerCase().includes('healthy');

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${dark ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-green-50 to-white text-gray-900'}`}>

      {/* Top Bar */}
      <div className={`flex justify-end gap-2 px-6 py-3 border-b ${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
        <button
          onClick={toggleLang}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
        >
          {language === 'en' ? '🇳🇵 नेपाली' : 'EN English'}
        </button>
        <button
          onClick={toggleDark}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
        >
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <button
          onClick={() => navigate('/upload')}
          className={`text-sm mb-6 inline-block ${dark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
        >
          {t.back}
        </button>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📋</div>
          <h1 className={`text-3xl font-extrabold mb-1 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.title}</h1>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.subtitle}</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 animate-spin">🌿</div>
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.loading}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={`rounded-2xl border p-8 text-center ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100'}`}>
            <div className="text-4xl mb-3">⚠️</div>
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.error}</p>
          </div>
        )}

        {/* No data */}
        {!loading && !error && history.length === 0 && (
          <div className={`rounded-2xl border p-8 text-center ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
            <div className="text-4xl mb-3">🌱</div>
            <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.noData}</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-green-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition"
            >
              {t.scan}
            </button>
          </div>
        )}

        {/* History List */}
        {!loading && !error && history.length > 0 && (
          <>
            <p className={`text-xs mb-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t.total}: {history.length}
            </p>

            <div className="space-y-3">
              {history.map((item) => {
                const healthy = isHealthy(item.predicted_class);
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 shadow-sm ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      {/* Left — disease info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-2xl mt-0.5">
                          {healthy ? '✅' : '🦠'}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm truncate ${dark ? 'text-green-400' : 'text-green-800'}`}>
                            {formatDiseaseName(item.predicted_class)}
                          </p>
                          <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.crop_type}
                          </p>
                          <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Right — confidence badge */}
                      <div className="flex-shrink-0 text-right">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                          item.confidence >= 85
                            ? 'bg-green-100 text-green-700'
                            : item.confidence >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {item.confidence}%
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate('/')}
                className={`flex-1 border font-medium py-3 rounded-xl transition text-sm ${dark ? 'border-green-600 text-green-400 hover:bg-gray-800' : 'border-green-400 text-green-700 hover:bg-green-50'}`}
              >
                {t.home}
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="flex-1 bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition text-sm"
              >
                {t.upload}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className={`text-center py-8 text-xs ${dark ? 'bg-gray-900 text-gray-500' : 'bg-white text-gray-400'}`}>
        {t.footer}
      </div>

    </div>
  );
}

export default History;