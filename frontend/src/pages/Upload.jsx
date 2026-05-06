import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../AppContext';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const text = {
  en: {
    back: '← Back to Home',
    title: 'Upload Leaf Photo',
    subtitle: 'Upload an existing photo or take one using your camera for instant analysis.',
    dropText: 'Click or drag & drop an image here',
    dropSub: 'Supports JPG, PNG · Max size: 5MB',
    gallery: '🖼️ Choose from Gallery',
    camera: '📸 Take a Photo',
    changePhoto: 'Choose a different photo',
    tipsTitle: '📌 Tips for best results:',
    tips: ['Use natural daylight, avoid shadows', 'Focus on the affected area of the leaf', 'Keep the camera steady and close', 'Avoid blurry or dark images', 'Maximum photo size: 5MB'],
    analyze: '🔍 Analyze Leaf',
    analyzing: '🔄 Analyzing...',
    errorNoImage: 'Please select an image first.',
    errorInvalid: 'Please upload a valid image file (JPG or PNG).',
    errorSize: `Image is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`,
    errorBackend: 'Something went wrong. Make sure the backend is running.',
  },
  np: {
    back: '← गृहपृष्ठमा फर्कनुहोस्',
    title: 'पातको फोटो अपलोड गर्नुहोस्',
    subtitle: 'तत्काल विश्लेषणको लागि फोटो अपलोड गर्नुहोस् वा क्यामेराबाट खिच्नुहोस्।',
    dropText: 'यहाँ क्लिक गर्नुहोस् वा छवि ड्र्याग & ड्रप गर्नुहोस्',
    dropSub: 'JPG, PNG समर्थित · अधिकतम साइज: ५MB',
    gallery: '🖼️ ग्यालेरीबाट छान्नुहोस्',
    camera: '📸 फोटो खिच्नुहोस्',
    changePhoto: 'अर्को फोटो छान्नुहोस्',
    tipsTitle: '📌 राम्रो नतिजाको लागि सुझावहरू:',
    tips: ['प्राकृतिक दिवालोक प्रयोग गर्नुहोस्', 'पातको प्रभावित क्षेत्रमा ध्यान दिनुहोस्', 'क्यामेरा स्थिर राख्नुहोस्', 'धमिलो वा अँध्यारो छवि नबनाउनुहोस्', 'अधिकतम फोटो साइज: ५MB'],
    analyze: '🔍 पात विश्लेषण गर्नुहोस्',
    analyzing: '🔄 विश्लेषण हुँदैछ...',
    errorNoImage: 'कृपया पहिले छवि छान्नुहोस्।',
    errorInvalid: 'कृपया मान्य छवि फाइल (JPG वा PNG) अपलोड गर्नुहोस्।',
    errorSize: `छवि धेरै ठूलो छ। अधिकतम अनुमति ${MAX_SIZE_MB}MB छ।`,
    errorBackend: 'केही गडबड भयो। ब्याकएन्ड चलिरहेको छ कि नाई जाँच गर्नुहोस्।',
  },
};

function Upload() {
  const navigate = useNavigate();
  const { darkMode, toggleDark, language, toggleLang } = useApp();
  const t = text[language];
  const dark = darkMode;

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError(t.errorInvalid); return; }
    if (file.size > MAX_SIZE_BYTES) { setError(t.errorSize); return; }
    setImage(file);
    const reader = new FileReader();
reader.onloadend = () => {
  setPreview(reader.result); // base64 string — survives navigation
};
reader.readAsDataURL(file);
    setError(null);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); processFile(e.dataTransfer.files[0]); };

  const handleSubmit = async () => {
    if (!image) { setError(t.errorNoImage); return; }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', image);
    try {
      const response = await axios.post('https://eightth-sem-project-whe8.onrender.com/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/result', { state: { result: response.data, preview } });
    } catch {
      setError(t.errorBackend);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen px-6 py-12 transition-colors duration-300 ${dark ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-green-50 to-white'}`}>

      {/* Top Bar */}
      <div className="flex justify-end gap-2 mb-6">
        <button onClick={toggleLang} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
          {language === 'en' ? '🇳🇵 नेपाली' : 'EN English'}
        </button>
        <button onClick={toggleDark} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <button onClick={() => navigate('/')} className={`text-sm mb-8 inline-block ${dark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}>
        {t.back}
      </button>

      <div className="max-w-xl mx-auto">
        <h1 className={`text-3xl font-bold mb-2 text-center ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.title}</h1>
        <p className={`text-center text-sm mb-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.subtitle}</p>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition duration-200 ${dark ? 'border-green-600 hover:bg-gray-800' : 'border-green-400 hover:bg-green-50'}`}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-contain" />
          ) : (
            <>
              <div className="text-5xl mb-3">📷</div>
              <p className={`font-medium ${dark ? 'text-green-400' : 'text-green-700'}`}>{t.dropText}</p>
              <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.dropSub}</p>
            </>
          )}
        </div>

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />

        <div className="flex gap-3 mt-4">
          <button onClick={() => fileInputRef.current.click()} className={`flex-1 border font-medium py-3 rounded-xl transition text-sm ${dark ? 'border-green-600 text-green-400 hover:bg-gray-800' : 'border-green-400 text-green-700 hover:bg-green-50'}`}>
            {t.gallery}
          </button>
          <button onClick={() => cameraInputRef.current.click()} className={`flex-1 border font-medium py-3 rounded-xl transition text-sm ${dark ? 'border-green-600 text-green-400 hover:bg-gray-800' : 'border-green-400 text-green-700 hover:bg-green-50'}`}>
            {t.camera}
          </button>
        </div>

        {preview && (
          <p onClick={() => fileInputRef.current.click()} className={`text-center text-sm mt-3 cursor-pointer hover:underline ${dark ? 'text-green-500' : 'text-green-500'}`}>
            {t.changePhoto}
          </p>
        )}

        {error && (
          <div className={`mt-4 border text-sm rounded-xl px-4 py-3 ${dark ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {error}
          </div>
        )}

        {/* Tips */}
        <div className={`mt-6 border rounded-xl px-5 py-4 ${dark ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`font-semibold text-sm mb-2 ${dark ? 'text-yellow-300' : 'text-yellow-800'}`}>{t.tipsTitle}</p>
          <ul className={`text-xs space-y-1 list-disc list-inside ${dark ? 'text-yellow-400' : 'text-yellow-700'}`}>
            {t.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!image || loading}
          className="mt-8 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:text-green-600 text-white text-lg font-semibold py-4 rounded-2xl shadow transition duration-200"
        >
          {loading ? t.analyzing : t.analyze}
        </button>
      </div>
    </div>
  );
}

export default Upload;