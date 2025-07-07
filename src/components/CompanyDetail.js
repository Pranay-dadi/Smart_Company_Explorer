import React from 'react';
import { NavLink } from 'react-router-dom';

// Utility: Extract at least the first 4 sentences and split into 2 paragraphs
const getImportantDescription = (description) => {
  if (!description) return ['No description available.', ''];
  // Split into sentences
  const sentences = description.split(/(?<=[.?!])\s+/).filter(Boolean);
  // Ensure at least 4 sentences for two paragraphs, or split what is available
  const firstPara = sentences.slice(0, 2).join(' ');
  const secondPara = sentences.slice(2, 4).join(' ');
  return [
    firstPara || 'No description available.',
    secondPara || ''
  ];
};

const CompanyDetail = ({ company }) => {
  if (!company) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Company not found</div>;
  }

  return (
    <div className="min-h-screen bg-background light:bg-background-light dark:bg-background-dark text-text light:text-text-light dark:text-text-dark flex flex-col">
      {/* Top Bar (copied from HomePage) */}
      <header className="bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark shadow sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <h1 className="text-2xl font-bold">Smart Company Explorer</h1>
          </div>
          <nav className="flex items-center gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary text-background-secondary light:bg-primary-light light:text-background-secondary_light dark:bg-primary-dark dark:text-background-secondary_dark'
                    : 'hover:bg-accent hover:text-background-secondary light:hover:bg-accent-light light:hover:text-background-secondary_light dark:hover:bg-accent-dark dark:hover:text-background-secondary_dark'
                }`
              }
              aria-label="Go to Home"
            >
              Home
            </NavLink>
            <NavLink
              to="/companies"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md ${
                  isActive
                    ? 'bg-primary text-background-secondary light:bg-primary-light light:text-background-secondary_light dark:bg-primary-dark dark:text-background-secondary_dark'
                    : 'hover:bg-accent hover:text-background-secondary light:hover:bg-accent-light light:hover:text-background-secondary_light dark:hover:bg-accent-dark dark:hover:text-background-secondary_dark'
                }`
              }
              aria-label="Go to Companies"
            >
              Companies
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start py-8 px-2 md:px-8 w-full">
        <div className="w-full max-w-5xl bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark shadow-lg rounded-xl p-8 min-h-[70vh]">
          <div className="flex flex-col sm:flex-row items-center mb-8">
            <img
              src={company.logo || 'https://via.placeholder.com/150'}
              alt={`${company.name} logo`}
              className="w-36 h-36 object-contain mb-4 sm:mb-0 sm:mr-8"
            />
            <div>
              <h2 className="text-4xl font-bold mb-2">{company.name}</h2>
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

          {/* Description at the top */}
          <div className="mb-10">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">About</h3>
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
              {getImportantDescription(company.description).map(
                (para, idx) =>
                  para && (
                    <p
                      key={idx}
                      className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed mb-4 last:mb-0"
                    >
                      {para}
                    </p>
                  )
              )}
            </div>
          </div>

          {/* Statistics below */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Statistics</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                <strong>Employees:</strong> {company.employees || 'N/A'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                <strong>Revenue:</strong> {company.revenue || 'N/A'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                <strong>Industries:</strong> {company.industries || 'N/A'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                <strong>Tech Stack:</strong> {company.tech_stack?.join(', ') || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDetail;