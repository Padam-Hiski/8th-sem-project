import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG or PNG).');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`Image is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    processFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/result', { state: { result: response.data, preview } });
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-12">

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="text-green-600 hover:text-green-800 text-sm mb-8 inline-block"
      >
        ← Back to Home
      </button>

      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">Upload Leaf Photo</h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          Upload an existing photo or take one using your camera for instant analysis.
        </p>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
          className="border-2 border-dashed border-green-400 rounded-2xl p-10 text-center cursor-pointer hover:bg-green-50 transition duration-200"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-xl object-contain"
            />
          ) : (
            <>
              <div className="text-5xl mb-3">📷</div>
              <p className="text-green-700 font-medium">Click or drag & drop an image here</p>
              <p className="text-gray-400 text-xs mt-1">Supports JPG, PNG · Max size: 5MB</p>
            </>
          )}
        </div>

        {/* Hidden inputs */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload / Camera buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex-1 border border-green-400 text-green-700 font-medium py-3 rounded-xl hover:bg-green-50 transition text-sm"
          >
            🖼️ Choose from Gallery
          </button>
          <button
            onClick={() => cameraInputRef.current.click()}
            className="flex-1 border border-green-400 text-green-700 font-medium py-3 rounded-xl hover:bg-green-50 transition text-sm"
          >
            📸 Take a Photo
          </button>
        </div>

        {/* Change photo link */}
        {preview && (
          <p
            onClick={() => fileInputRef.current.click()}
            className="text-center text-green-500 text-sm mt-3 cursor-pointer hover:underline"
          >
            Choose a different photo
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
          <p className="text-yellow-800 font-semibold text-sm mb-2">📌 Tips for best results:</p>
          <ul className="text-yellow-700 text-xs space-y-1 list-disc list-inside">
            <li>Use natural daylight, avoid shadows</li>
            <li>Focus on the affected area of the leaf</li>
            <li>Keep the camera steady and close</li>
            <li>Avoid blurry or dark images</li>
            <li>Maximum photo size: 5MB</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!image || loading}
          className="mt-8 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-lg font-semibold py-4 rounded-2xl shadow transition duration-200"
        >
          {loading ? '🔄 Analyzing...' : '🔍 Analyze Leaf'}
        </button>
      </div>
    </div>
  );
}

export default Upload;