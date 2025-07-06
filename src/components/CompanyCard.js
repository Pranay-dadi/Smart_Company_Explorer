import React from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => {
  if (!company) return null;

  return (
    <Link
      to={`/company/${encodeURIComponent(company.name)}`}
      className="p-4 bg-white dark:bg-gray-800 border rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
      aria-label={`View details for ${company.name}`}
    >
      <div className="flex items-center mb-4">
        <img
          src={company.logo || 'https://via.placeholder.com/50'}
          alt={`${company.name} logo`}
          className="w-12 h-12 object-contain mr-3"
        />
        <h3 className="text-lg font-bold truncate">{company.name}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{company.industry || 'N/A'}</p>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{company.location || 'N/A'}</p>
      <p className="text-gray-500 dark:text-gray-500 text-sm mt-2 line-clamp-2">
        {company.description || 'No description available'}
      </p>
      <span className="text-blue-500 hover:underline text-sm mt-2 block">View Details</span>
    </Link>
  );
};

export default CompanyCard;