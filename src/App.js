import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import CompanyPage from './pages/CompanyPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies" element={<HomePage />} />
          <Route path="/company/:companyName" element={<CompanyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;