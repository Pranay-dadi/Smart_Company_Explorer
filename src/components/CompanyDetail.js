import React from 'react';

const CompanyDetail = ({ company }) => {
  if (!company) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Company not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center mb-6">
        <img
          src={company.logo || 'https://via.placeholder.com/150'}
          alt={`${company.name} logo`}
          className="w-32 h-32 object-contain mb-4 sm:mb-0 sm:mr-6"
        />
        <div>
          <h2 className="text-3xl font-bold mb-2">{company.name}</h2>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              aria-label={`Visit ${company.name} website`}
            >
              Visit Website
            </a>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-600 dark:text-gray-400">{company.description || 'No description available'}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Details</h3>
          <p className="text-gray-600 dark:text-gray-400"><strong>Employees:</strong> {company.employees || 'N/A'}</p>
          <p className="text-gray-600 dark:text-gray-400"><strong>Revenue:</strong> {company.revenue || 'N/A'}</p>
          <p className="text-gray-600 dark:text-gray-400"><strong>Industries:</strong> {company.industries || 'N/A'}</p>
          <p className="text-gray-600 dark:text-gray-400"><strong>Tech Stack:</strong> {company.tech_stack?.join(', ') || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;