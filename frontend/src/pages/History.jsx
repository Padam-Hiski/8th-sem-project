import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

const API_URL = 'https://eightth-sem-project-whe8.onrender.com';

const text = {
  en: {
    back: '← Back to Home',
    title: 'Scan History',
    subtitle: 'Your last 20 crop scans',
    loading: 'Loading history...',
    error: 'Could not load history. Is the backend running?',
    noData: 'No scans yet. Start by analyzing a crop leaf!',
    scan: 'Go to Upload',
    healthy: 'Healthy',
    home: '🏠 Home',
    upload: '🔍 Scan a Crop',
    footer: 'Crop Disease Detector · BCA 8th Semester Final Year Project · Powered by MobileNetV2 + Gemini AI',
    total: 'Total scans shown',
    highConf: 'High confidence',
    modConf: 'Moderate',
    lowConf: 'Low confidence',
  },
  np: {
    back: '← गृहपृष्ठमा फिर्ता',
    title: 'स्क्यान इतिहास',
    subtitle: 'तपाईंका पछिल्ला २० बाली स्क्यानहरू',
    loading: 'इतिहास लोड हुँदैछ...',
    error: 'इतिहास लोड गर्न सकिएन। ब्याकएन्ड चलिरहेको छ?',
    noData: 'अहिलेसम्म कुनै स्क्यान छैन। बालीको पात विश्लेषण गर्न सुरु गर्नुहोस्!',
    scan: 'अपलोडमा जानुहोस्',
    healthy: 'स्वस्थ',
    home: '🏠 गृहपृष्ठ',
    upload: '🔍 बाली स्क्यान गर्नुहोस्',
    footer: 'बाली रोग पहिचानकर्ता · BCA ८औं सेमेस्टर अन्तिम वर्ष परियोजना · MobileNetV2 + Gemini AI',
    total: 'कुल स्क्यानहरू देखाइएको',
    highConf: 'उच्च कन्फिडेन्स',
    modConf: 'मध्यम',
    lowConf: 'कम कन्फिडेन्स',
  },
};

// ─── Helpers ───────────────────────────────────────────────
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

function formatDiseaseName(rawName) {
  return rawName
    .replace(/_/g, ' ')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Returns crop emoji from class name
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
  return '🌿';
};

// CSS spinner — consistent with Dashboard
function Spinner({ dark }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0' }}>
      <div style={{
        width: 36,
        height: 36,
        border: `3px solid ${dark ? '#374151' : '#d1fae5'}`,
        borderTop: `3px solid ${dark ? '#4ade80' : '#16a34a'}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 16,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Confidence bar mini component
function ConfBar({ confidence, dark }) {
  const color = confidence >= 85 ? '#16a34a' : confidence >= 60 ? '#d97706' : '#dc2626';
  return (
    <div style={{
      width: 60,
      height: 4,
      borderRadius: 999,
      backgroundColor: dark ? '#374151' : '#e2e8f0',
      marginTop: 4,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${confidence}%`,
        backgroundColor: color,
        borderRadius: 999,
      }} />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────
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

  const getConfLabel = (conf) => {
    if (conf >= 85) return t.highConf;
    if (conf >= 60) return t.modConf;
    return t.lowConf;
  };

  const getConfColors = (conf) => {
    if (conf >= 85) return 'bg-green-100 text-green-700';
    if (conf >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-600';
  };

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

        {/* Fix — back button now goes to home, not upload */}
        <button
          onClick={() => navigate('/')}
          className={`text-sm mb-6 inline-block ${dark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
        >
          {t.back}
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📋</div>
          <h1 className={`text-3xl font-extrabold mb-1 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.title}</h1>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.subtitle}</p>
        </div>

        {/* Fix — CSS spinner instead of spinning emoji */}
        {loading && <Spinner dark={dark} />}

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
                    className={`rounded-2xl border p-4 shadow-sm transition-colors ${dark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-green-100 hover:border-green-300'}`}
                  >
                    <div className="flex items-center justify-between gap-3">

                      {/* Left — crop emoji + disease info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Polish — crop-specific emoji instead of generic 🦠/✅ */}
                        <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${dark ? 'bg-gray-700' : 'bg-green-50'}`}>
                          {healthy ? '✅' : cropEmoji(item.predicted_class)}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm truncate ${dark ? 'text-green-400' : 'text-green-800'}`}>
                            {formatDiseaseName(item.predicted_class)}
                          </p>
                          <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.crop_type}
                          </p>
                          <p className={`text-xs mt-1 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Right — confidence badge + mini bar */}
                      <div className="flex-shrink-0 text-right">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${getConfColors(item.confidence)}`}>
                          {item.confidence}%
                        </span>
                        {/* Polish — mini confidence bar under badge */}
                        <div className="flex justify-end mt-1">
                          <ConfBar confidence={item.confidence} dark={dark} />
                        </div>
                        <p className={`text-xs mt-1 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                          {getConfLabel(item.confidence)}
                        </p>
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