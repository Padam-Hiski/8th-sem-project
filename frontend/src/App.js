import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Result from './pages/Result';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;