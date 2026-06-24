import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Result from './pages/Result';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

function App() {
  useEffect(() => {
    fetch('https://padamd3ploy-production.hf.space')
      .catch(() => {});
  }, []);

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/result" element={<Result />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;