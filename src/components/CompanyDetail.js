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
      {/* Top Bar (consistent with HomePage) */}
      <header className="bg-card-light text-gray-700 dark:bg-card-dark dark:text-white shadow sticky top-0 z-20 transition-colors">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Centered heading */}
          <div className="flex-1 flex justify-center order-2">
            <h1 className="text-2xl font-bold text-center text-gray-700 dark:text-white">Smart Company Explorer</h1>
          </div>
          {/* Navigation at right */}
          <nav className="flex items-center gap-4 order-3">
            <NavLink
              to="/"
              className="px-4 py-2 rounded-md transition-colors font-semibold
                bg-white text-gray-700 dark:bg-black dark:text-white
                hover:bg-orange-400 hover:text-gray-900
                dark:hover:bg-white dark:hover:text-black"
              aria-label="Go to Home"
            >
              Home
            </NavLink>
            <NavLink
              to="/companies"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-colors font-semibold
                ${isActive
                  ? 'bg-accent text-white dark:bg-accent-dark dark:text-white'
                  : 'bg-white text-gray-700 dark:bg-black dark:text-white hover:bg-orange-400 hover:text-gray-900 dark:hover:bg-white dark:hover:text-black'}`
              }
              aria-label="Go to Companies"
            >
              Companies
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start py-10 px-2 md:px-10 w-full">
        <div className="w-full max-w-5xl bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark shadow-2xl rounded-2xl p-10 min-h-[70vh]">
          <div className="flex flex-col sm:flex-row items-center mb-10">
            <img
              src={company.logo || 'https://via.placeholder.com/150'}
              alt={`${company.name} logo`}
              className="w-40 h-40 object-contain mb-4 sm:mb-0 sm:mr-10 rounded-full border-4 border-primary/30 bg-white shadow-md"
            />
            <div>
              <h2 className="text-5xl font-extrabold mb-3 text-primary transition-colors hover:text-orange-500 dark:hover:text-white">
                {company.name}
              </h2>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-medium hover:text-orange-500 dark:hover:text-white transition-colors"
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
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Statistics</h3>
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

      {/* Footer (optional, for full consistency) */}
      <footer className="bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark py-4 text-center">
        <p>© 2025 Smart Company Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CompanyDetail;