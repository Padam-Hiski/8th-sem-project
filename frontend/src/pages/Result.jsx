import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, preview } = location.state || {};

  // If someone visits /result directly without data
  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">No result found</h2>
        <p className="text-gray-400 text-sm mb-6">Please upload a leaf image first.</p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const { predicted_class, confidence, disease: disease_info, low_confidence } = result;
  const isLowConfidence = result.status === 'low_confidence';
  const confidencePercent = (confidence * 100).toFixed(1);

  // Confidence bar color
  const barColor =
    confidence >= 0.85 ? 'bg-green-500' :
    confidence >= 0.60 ? 'bg-yellow-400' :
    'bg-red-400';

  // If low confidence
  if (low_confidence) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-12">
        <button
          onClick={() => navigate('/upload')}
          className="text-green-600 hover:text-green-800 text-sm mb-8 inline-block"
        >
          ← Try Another Photo
        </button>
        <div className="max-w-xl mx-auto text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-3">Could Not Identify</h2>
          <p className="text-gray-500 text-sm mb-6">
            The model's confidence was too low ({confidencePercent}%) to make a reliable prediction.
            Please retake the photo with better lighting and focus on the affected leaf area.
          </p>
          {preview && (
            <img src={preview} alt="Uploaded" className="max-h-48 mx-auto rounded-xl mb-6 object-contain" />
          )}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 text-left mb-6">
            <p className="text-yellow-800 font-semibold text-sm mb-2">💡 Try these improvements:</p>
            <ul className="text-yellow-700 text-xs space-y-1 list-disc list-inside">
              <li>Use natural daylight</li>
              <li>Get closer to the leaf</li>
              <li>Make sure the image is not blurry</li>
              <li>Focus on the most affected part</li>
            </ul>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl hover:bg-green-700 transition"
          >
            📷 Retake Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-12">

      {/* Back button */}
      <button
        onClick={() => navigate('/upload')}
        className="text-green-600 hover:text-green-800 text-sm mb-8 inline-block"
      >
        ← Analyze Another
      </button>

      <div className="max-w-xl mx-auto">

        <h1 className="text-3xl font-bold text-green-800 mb-1 text-center">Detection Result</h1>
        <p className="text-gray-400 text-sm text-center mb-8">Analysis complete</p>

        {/* Uploaded Image */}
        {preview && (
          <img
            src={preview}
            alt="Analyzed leaf"
            className="w-full max-h-56 object-contain rounded-2xl shadow mb-6"
          />
        )}

        {/* Disease Name */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 text-center border border-green-100">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Detected Disease</p>
          <h2 className="text-2xl font-extrabold text-green-800">
            {disease_info?.name || predicted_class}
          </h2>
          {disease_info?.crop && (
            <p className="text-gray-500 text-sm mt-1">Crop: {disease_info.crop}</p>
          )}
        </div>

        {/* Confidence Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-green-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 font-medium">Model Confidence</span>
            <span className="font-bold text-green-700">{confidencePercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`${barColor} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {confidence >= 0.85 ? '✅ High confidence result' :
             confidence >= 0.60 ? '⚠️ Moderate confidence — verify manually' :
             '❌ Low confidence'}
          </p>
        </div>

        {/* Disease Info */}
        {disease_info && (
          <>
            {/* Description */}
            {disease_info.description && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-green-100">
                <h3 className="text-green-800 font-semibold mb-2">📋 About this Disease</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{disease_info.description}</p>
              </div>
            )}

            {/* Symptoms */}
            {disease_info.symptoms && disease_info.symptoms.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-green-100">
                <h3 className="text-green-800 font-semibold mb-3">🔍 Symptoms</h3>
                <ul className="space-y-1">
                  {disease_info.symptoms.map((s, i) => (
                    <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Treatment */}
            {disease_info.treatment && disease_info.treatment.length > 0 && (
              <div className="bg-green-50 rounded-2xl shadow-sm p-6 mb-4 border border-green-200">
                <h3 className="text-green-800 font-semibold mb-3">💊 Recommended Treatment</h3>
                <ul className="space-y-1">
                  {disease_info.treatment.map((t, i) => (
                    <li key={i} className="text-green-700 text-sm flex items-start gap-2">
                      <span className="mt-0.5">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Severity */}
            {disease_info.severity && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-green-100 flex items-center justify-between">
                <span className="text-gray-600 font-medium text-sm">Severity Level</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  disease_info.severity === 'High' ? 'bg-red-100 text-red-600' :
                  disease_info.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {disease_info.severity}
                </span>
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-6">
          <p className="text-gray-400 text-xs text-center">
            ⚠️ This result is AI-generated and should be used as a reference only.
            Always consult an agricultural expert for final diagnosis.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex-1 border border-green-400 text-green-700 font-medium py-3 rounded-xl hover:bg-green-50 transition text-sm"
          >
            🔄 Analyze Another
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition text-sm"
          >
            🏠 Home
          </button>
        </div>

      </div>
    </div>
  );
}

export default Result;