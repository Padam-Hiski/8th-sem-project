import React from 'react';
import { useNavigate } from 'react-router-dom';

const crops = [
  { emoji: '🍅', name: 'Tomato' },
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🍇', name: 'Grape' },
  { emoji: '🌽', name: 'Corn' },
  { emoji: '🍒', name: 'Cherry' },
  { emoji: '🍊', name: 'Orange' },
  { emoji: '🍑', name: 'Peach' },
  { emoji: '🫑', name: 'Bell Pepper' },
  { emoji: '🥔', name: 'Potato' },
  { emoji: '🍓', name: 'Strawberry' },
  { emoji: '🎃', name: 'Squash' },
];

const steps = [
  {
    number: '01',
    title: 'Upload a Leaf Photo',
    desc: 'Take a clear photo of the affected leaf and upload it directly from your device.',
  },
  {
    number: '02',
    title: 'AI Analyzes the Image',
    desc: 'Our MobileNetV2 model scans the leaf and identifies signs of disease within seconds.',
  },
  {
    number: '03',
    title: 'Get Results & Treatment',
    desc: 'See the detected disease, confidence score, symptoms, and recommended treatment steps.',
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white font-sans">

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-12">
        <div className="text-7xl mb-4">🌿</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-4">
          Crop Disease Detector
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-3">
          An AI-powered tool that detects diseases in crop leaves from a single photo.
          Built to help farmers and agricultural workers identify problems early and take action fast.
        </p>
        <p className="text-sm text-gray-800 mb-8">
          Trained on 54,305 images · 38 disease classes · 94.22% accuracy
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-md transition duration-200"
        >
          🔍 Detect Disease Now
        </button>
      </div>

      {/* How It Works */}
      <div className="bg-white py-12 px-6">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-8">How It Works</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="bg-green-50 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl font-extrabold text-green-300 mb-2">{step.number}</div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Crops */}
      <div className="py-12 px-6 bg-green-50">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-2">Supported Crops</h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          The model can detect diseases across these 11 crops
        </p>
        <div className="max-w-3xl mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {crops.map((crop) => (
            <div
              key={crop.name}
              className="flex flex-col items-center bg-white rounded-xl py-4 px-2 shadow-sm"
            >
              <span className="text-3xl mb-1">{crop.emoji}</span>
              <span className="text-xs font-medium text-green-700">{crop.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* About the Model */}
      <div className="py-12 px-6 bg-white">
        <div className="max-w-3xl mx-auto bg-green-50 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-green-800 mb-4">About the Model</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            This project uses <strong>MobileNetV2</strong>, a lightweight deep learning architecture
            optimized for image classification. The model was trained on the <strong>PlantVillage dataset</strong>,
            one of the most widely used public datasets for plant disease detection research.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Transfer learning was applied — the base model was pre-trained on ImageNet, then fine-tuned
            on 54,305 leaf images across 38 disease classes. Training was done for 10 epochs using
            TensorFlow on a local machine.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            <strong>Scope note:</strong> The model is trained on controlled lab images from the PlantVillage
            dataset. Real-field performance may vary based on lighting, image angle, and crop varieties
            specific to Nepal. This is documented as a known limitation.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-700">94.22%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">38</div>
              <div className="text-xs text-gray-500">Disease Classes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">54,305</div>
              <div className="text-xs text-gray-500">Training Images</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-12 px-6 text-center bg-green-700">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to detect a disease?</h2>
        <p className="text-green-200 mb-6 text-sm">Upload a leaf photo and get results in seconds.</p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-white text-green-700 font-semibold text-lg px-10 py-4 rounded-2xl shadow hover:bg-green-50 transition duration-200"
        >
          Get Started →
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs text-gray-400 bg-white">
        Crop Disease Detector · BCA 8th Semester Final Year Project · Powered by MobileNetV2
      </div>

    </div>
  );
}

export default Home;