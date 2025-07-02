import React from 'react';

const CompanyDetail = ({ company }) => {
  console.log('Rendering CompanyDetail for:', company);
  if (!company) {
    console.log('No company data available for CompanyDetail');
    return <div className="text-center text-gray-600">Company not found</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <img
          src={company.logo || 'https://via.placeholder.com/150'}
          alt={`${company.name} logo`}
          className="w-32 h-32 object-contain mr-4"
        />
        <div>
          <h2 className="text-3xl font-bold">{company.name}</h2>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visit Website
            </a>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Description</h3>
          <p className="text-gray-600">{company.description || 'No description available'}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Details</h3>
          <p><strong>Employees:</strong> {company.employees || 'N/A'}</p>
          <p><strong>Revenue:</strong> {company.revenue || 'N/A'}</p>
          <p><strong>Industries:</strong> {company.industries || 'N/A'}</p>
          <p><strong>Tech Stack:</strong> {company.tech_stack?.join(', ') || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

console.log('CompanyDetail component loaded');
export default CompanyDetail;