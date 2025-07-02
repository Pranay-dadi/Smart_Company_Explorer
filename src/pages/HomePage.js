import React, { useState, useEffect } from 'react';
import CompanyCard from '../components/CompanyCard';

const HomePage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('HomePage mounted');

  useEffect(() => {
    console.log('Fetching companies...');
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        console.log('Fetched companies:', data);
        setCompanies(data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    console.log('Loading state active');
    return <div className="text-center text-gray-600">Loading...</div>;
  }
  if (error) {
    console.log('Error state:', error);
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  console.log('Rendering HomePage with companies:', companies);
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Companies</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {companies.length > 0 ? (
          companies.map((company) => (
            <CompanyCard key={company.name} company={company} />
          ))
        ) : (
          <p className="text-gray-600">No companies available.</p>
        )}
      </div>
    </div>
  );
};

console.log('HomePage component loaded');
export default HomePage;