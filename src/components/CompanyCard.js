import React from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => {
  console.log('Rendering CompanyCard for:', company);
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2 w-80">
      <img
        src={company.logo || 'https://via.placeholder.com/150'}
        alt={`${company.name} logo`}
        className="w-full h-32 object-contain mb-4"
      />
      <h3 className="text-xl font-semibold mb-2">
        <Link to={`/company/${encodeURIComponent(company.name)}`} className="text-blue-600 hover:underline">
          {company.name}
        </Link>
      </h3>
      <p className="text-gray-600 line-clamp-3">{company.description || 'No description available'}</p>
    </div>
  );
};

console.log('CompanyCard component loaded');
export default CompanyCard;