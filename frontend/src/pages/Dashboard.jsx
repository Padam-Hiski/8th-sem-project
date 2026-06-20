import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// Fix 1 — correct Railway URL, works both locally and on Vercel
const API_URL = process.env.REACT_APP_API_URL ||  'http://127.0.0.1:5000';

const text = {
  en: {
    title: 'Analytics Dashboard',
    subtitle: 'Real-time impact data from all scans',
    totalScans: 'Total Scans',
    avgConfidence: 'Avg Confidence',
    healthy: 'Healthy',
    diseased: 'Diseased',
    diseaseChart: 'Top Diseases Detected',
    cropChart: 'Scans by Crop',
    healthChart: 'Healthy vs Diseased',
    confChart: 'Confidence Distribution',
    noData: 'No data yet. Start scanning crops!',
    loading: 'Loading analytics...',
    error: 'Could not load analytics. Is the backend running?',
    home: '🏠 Home',
    upload: '🔍 Scan a Crop',
    footer: 'Crop Disease Detector · BCA 8th Semester Final Year Project · Powered by MobileNetV2 + Gemini AI',
    scans: 'scans',
    back: '← Back',
  },
  np: {
    title: 'एनालिटिक्स ड्यासबोर्ड',
    subtitle: 'सबै स्क्यानबाट वास्तविक-समय प्रभाव डेटा',
    totalScans: 'कुल स्क्यानहरू',
    avgConfidence: 'औसत कन्फिडेन्स',
    healthy: 'स्वस्थ',
    diseased: 'रोगग्रस्त',
    diseaseChart: 'शीर्ष पत्ता लागेका रोगहरू',
    cropChart: 'बाली अनुसार स्क्यानहरू',
    healthChart: 'स्वस्थ बनाम रोगग्रस्त',
    confChart: 'कन्फिडेन्स वितरण',
    noData: 'अहिलेसम्म डेटा छैन। बाली स्क्यान सुरु गर्नुहोस्!',
    loading: 'एनालिटिक्स लोड हुँदैछ...',
    error: 'एनालिटिक्स लोड गर्न सकिएन। ब्याकएन्ड चलिरहेको छ?',
    home: '🏠 गृहपृष्ठ',
    upload: '🔍 बाली स्क्यान गर्नुहोस्',
    footer: 'बाली रोग पहिचानकर्ता · BCA ८औं सेमेस्टर अन्तिम वर्ष परियोजना · MobileNetV2 + Gemini AI',
    scans: 'स्क्यानहरू',
    back: '← फिर्ता',
  },
};

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7', '#f0fdf4', '#15803d', '#166534', '#14532d'];
const HEALTH_COLORS = ['#16a34a', '#dc2626'];

// Fix 2 — CSS spinner instead of spinning emoji
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

function StatCard({ label, value, icon, dark }) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm border flex flex-col items-center text-center ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-3xl font-extrabold ${dark ? 'text-green-400' : 'text-green-700'}`}>{value}</div>
      <div className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
    </div>
  );
}

function SectionCard({ title, dark, children }) {
  return (
    <div className={`rounded-2xl shadow-sm border p-5 mb-5 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
      <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-green-400' : 'text-green-800'}`}>{title}</h3>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`px-3 py-2 rounded-xl text-xs shadow border ${dark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-green-100 text-gray-700'}`}>
        <p className="font-semibold">{label}</p>
        <p>{payload[0].value} scans</p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const navigate = useNavigate();
  const { darkMode, toggleDark, language, toggleLang } = useApp();
  const t = text[language];
  const dark = darkMode;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const shortenName = (name) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 3)
      .join(' ');
  };

  const diseaseData = stats?.disease_breakdown?.map(d => ({
    name: shortenName(d.name),
    count: d.count,
  })) || [];

  const cropData = stats?.crop_breakdown?.map(d => ({
    name: d.crop,
    value: d.count,
  })) || [];

  const healthData = stats?.healthy_vs_diseased
    ? [
        { name: t.healthy, value: stats.healthy_vs_diseased.healthy },
        { name: t.diseased, value: stats.healthy_vs_diseased.diseased },
      ]
    : [];

  const confData = stats?.confidence_distribution || [];

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
          onClick={() => navigate('/')}
          className={`text-sm mb-6 inline-block ${dark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
        >
          {t.back}
        </button>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📊</div>
          <h1 className={`text-3xl font-extrabold mb-1 ${dark ? 'text-green-400' : 'text-green-800'}`}>{t.title}</h1>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.subtitle}</p>
        </div>

        {/* Fix 2 — CSS spinner instead of spinning emoji */}
        {loading && <Spinner dark={dark} />}

        {/* Error */}
        {error && (
          <div className={`rounded-2xl border p-8 text-center ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100'}`}>
            <div className="text-4xl mb-3">⚠️</div>
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.error}</p>
          </div>
        )}

        {/* No data */}
        {!loading && !error && stats?.total_scans === 0 && (
          <div className={`rounded-2xl border p-8 text-center ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'}`}>
            <div className="text-4xl mb-3">🌱</div>
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.noData}</p>
            <button
              onClick={() => navigate('/upload')}
              className="mt-4 bg-green-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition"
            >
              {t.upload}
            </button>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && stats?.total_scans > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <StatCard label={t.totalScans} value={stats.total_scans} icon="🔍" dark={dark} />
              <StatCard label={t.avgConfidence} value={`${stats.avg_confidence}%`} icon="🎯" dark={dark} />
              <StatCard label={t.healthy} value={stats.healthy_vs_diseased.healthy} icon="✅" dark={dark} />
              <StatCard label={t.diseased} value={stats.healthy_vs_diseased.diseased} icon="🦠" dark={dark} />
            </div>

            {/* Disease Bar Chart */}
            {diseaseData.length > 0 && (
              <SectionCard title={t.diseaseChart} dark={dark}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={diseaseData} margin={{ top: 0, right: 10, left: -20, bottom: 60 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip dark={dark} />} />
                    <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            )}

            {/* Fix 3 — Crop Pie: removed overlapping labels, Legend only */}
            {cropData.length > 0 && (
              <SectionCard title={t.cropChart} dark={dark}>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={cropData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                    >
                      {cropData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: dark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>{value}</span>
                      )}
                    />
                    <Tooltip content={<CustomTooltip dark={dark} />} />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>
            )}

            {/* Healthy vs Diseased Donut */}
            {healthData.length > 0 && (
              <SectionCard title={t.healthChart} dark={dark}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={healthData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {healthData.map((_, index) => (
                        <Cell key={index} fill={HEALTH_COLORS[index % HEALTH_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: dark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>{value}</span>
                      )}
                    />
                    <Tooltip content={<CustomTooltip dark={dark} />} />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>
            )}

            {/* Confidence Distribution */}
            {confData.length > 0 && (
              <SectionCard title={t.confChart} dark={dark}>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={confData} margin={{ top: 0, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip dark={dark} />} />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2">
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

export default Dashboard;