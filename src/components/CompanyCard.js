import React from 'react';
import { Link } from 'react-router-dom';

export const CompanyCard = ({ company }) => {
  if (!company) return null;

  return (
    <div className="
      inline-flex flex-col items-center gap-2
      bg-card-light text-text-light
      dark:bg-card-dark dark:text-text-dark
      border border-primary/10 rounded-xl shadow-lg w-auto h-auto px-4 py-3
      transition
      ">
      <img
        src={company.logo || 'https://via.placeholder.com/50'}
        alt={`${company.name} logo`}
        className="w-14 h-14 object-contain rounded-full border border-primary/20 bg-white mb-2"
      />
      <Link
        to={`/company/${encodeURIComponent(company.name)}`}
        className="w-full text-center text-xl font-bold italic text-gray-700 dark:text-white hover:text-accent dark:hover:text-accent-dark transition-colors"
        aria-label={`View details for ${company.name}`}
      >
        {company.name}
      </Link>
    </div>
  );
};

const CompaniesGrid = ({ companies = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {companies.map(company => (
        <CompanyCard key={company.id || company._id || company.name} company={company} />
      ))}
    </div>
  );
};

export default CompaniesGrid;