import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CompanyDetail from '../components/CompanyDetail';

const CompanyPage = () => {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('CompanyPage mounted with companyName:', companyName);

  useEffect(() => {
    console.log('Fetching company data for:', companyName);
    const fetchCompany = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/company/${encodeURIComponent(companyName)}`);
        console.log('API response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to fetch company data');
        }
        const data = await response.json();
        console.log('Fetched company data:', data);
        setCompany(data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyName]);

  if (loading) {
    console.log('Loading state active');
    return <div className="text-center text-gray-600">Loading...</div>;
  }
  if (error) {
    console.log('Error state:', error);
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  console.log('Rendering CompanyPage with company:', company);
  return <CompanyDetail company={company} />;
};

console.log('CompanyPage component loaded');
export default CompanyPage;