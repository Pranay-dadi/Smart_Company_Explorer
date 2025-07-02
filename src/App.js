import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import CompanyPage from './pages/CompanyPage';

function App() {
  console.log('App component rendering');
  return (
    <Router>
      <div className="flex h-screen bg-gray-100 text-black">
        <Sidebar />
        <div className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/companies" element={<HomePage />} />
            <Route path="/company/:companyName" element={<CompanyPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

console.log('App component loaded');
export default App;