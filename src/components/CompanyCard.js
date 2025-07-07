import React from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => {
  if (!company) return null;

  return (
    <Link
      to={`/company/${encodeURIComponent(company.name)}`}
      className="p-4 bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark border border-text/20 light:border-text-light/20 dark:border-text-dark/20 rounded-md shadow-sm hover:shadow-md hover:border-accent light:hover:border-accent-light dark:hover:border-accent-dark transition-shadow duration-200"
      aria-label={`View details for ${company.name}`}
    >
      <div className="flex items-center mb-4">
        <img
          src={company.logo || 'https://via.placeholder.com/50'}
          alt={`${company.name} logo`}
          className="w-12 h-12 object-contain mr-3"
        />
        <h3 className="text-lg font-bold truncate"> {company.name}</h3>
      </div>
      <p className="text-text light:text-text-light dark:text-text-dark text-sm">{company.industry || 'N/A'}</p>
      <p className="text-text light:text-text-light dark:text-text-dark text-sm">{company.location || 'N/A'}</p>
      <p className="text-text light:text-text-light dark:text-text-dark text-sm mt-2 line-clamp-2">
        {company.description || 'No description available'}
      </p>
      <span className="text-primary light:text-primary-light dark:text-primary-dark hover:underline text-sm mt-2 block">View Details</span>
    </Link>
  );
};

export default CompanyCard;