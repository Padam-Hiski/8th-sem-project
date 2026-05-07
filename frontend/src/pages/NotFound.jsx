import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

const text = {
  en: {
    code: '404',
    title: 'Page Not Found',
    subtitle: 'The page you are looking for does not exist.',
    button: '🏠 Go Home',
  },
  np: {
    code: '404',
    title: 'पृष्ठ फेला परेन',
    subtitle: 'तपाईंले खोज्नुभएको पृष्ठ अवस्थित छैन।',
    button: '🏠 गृहपृष्ठमा जानुहोस्',
  },
};

function NotFound() {
  const navigate = useNavigate();
  const { darkMode, language } = useApp();
  const t = text[language];
  const dark = darkMode;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 transition-colors duration-300 ${dark ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-green-50 to-white'}`}>
      <div className={`text-8xl font-bold mb-4 ${dark ? 'text-green-400' : 'text-green-700'}`}>
        {t.code}
      </div>
      <h1 className={`text-2xl font-semibold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>
        {t.title}
      </h1>
      <p className={`text-sm mb-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
        {t.subtitle}
      </p>
      <button
        onClick={() => navigate('/')}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-2xl shadow transition duration-200"
      >
        {t.button}
      </button>
    </div>
  );
}

export default NotFound;