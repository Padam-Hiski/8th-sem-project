import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../logo/nav logo.png';

const navText = {
  en: { history: 'History', dashboard: 'Dashboard', back: 'Back' },
  np: { history: 'इतिहास', dashboard: 'ड्यासबोर्ड', back: 'फर्कनुहोस्' },
};

/**
 * Shared navbar used on every page. Clicking the logo/name always
 * goes home, so there's no need for a separate floating
 * "Back to Home" link — one less inconsistent element per page.
 * A contextual "Back" button appears on any non-home page.
 */
function Navbar({ darkMode, toggleDark, language, toggleLang }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dark = darkMode;
  const isHome = location.pathname === '/';
  const t = navText[language];

  return (
    <div
      className={`flex items-center justify-between px-6 h-14 border-b sticky top-0 z-20 ${
        dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
      }`}
    >
      {/* Left — Logo (always links home) */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
        <img src={logo} alt="CropGuard logo" className="w-8 h-8 rounded-lg object-contain" />
        <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>
          CropGuard
        </span>
      </button>

      {/* Right — Nav + Toggles */}
      <div className="flex items-center gap-1">
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
              dark
                ? 'text-gray-400 hover:text-green-400 hover:bg-gray-800'
                : 'text-gray-500 hover:text-green-700 hover:bg-green-50'
            }`}
          >
            ← {t.back}
          </button>
        )}
        <button
          onClick={() => navigate('/history')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
            dark
              ? 'text-gray-400 hover:text-green-400 hover:bg-gray-800'
              : 'text-gray-500 hover:text-green-700 hover:bg-green-50'
          }`}
        >
          📋 {t.history}
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
            dark
              ? 'text-gray-400 hover:text-green-400 hover:bg-gray-800'
              : 'text-gray-500 hover:text-green-700 hover:bg-green-50'
          }`}
        >
          📊 {t.dashboard}
        </button>
        <div className={`w-px h-5 mx-1 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        <button
          onClick={toggleLang}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
            dark
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {language === 'en' ? '🇳🇵 नेपाली' : 'EN English'}
        </button>
        <button
          onClick={toggleDark}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
            dark
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </div>
  );
}

export default Navbar;