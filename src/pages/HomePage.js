import React, { useState, useEffect } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import CompaniesGrid from '../components/CompanyCard';
import InfiniteScrollWrapper from '../components/InfiniteScrollWrapper';

const HomePage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [filters, setFilters] = useState({
    location: '',
    industry: '',
    jobType: '',
  });
  const [darkMode, setDarkMode] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchCompanies = async (query) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies?query=${query}`);
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Always stop loading, even if error
    }
  };

  useEffect(() => {
    fetchCompanies(query);
  }, [query]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    setIsFilterOpen(false);
    // TODO: Implement filter logic by updating the fetchCompanies query
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background light:bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary light:border-primary-light dark:border-primary-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text light:text-text-light dark:text-text-dark">Loading Companies...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-error light:text-error-light dark:text-error-dark">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-background light:bg-background-light dark:bg-background-dark text-text light:text-text-light dark:text-text-dark">
      {/* Top Menu Bar */}
      <header className="bg-card-light text-gray-700 dark:bg-card-dark dark:text-white shadow sticky top-0 z-20 transition-colors">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Search bar at the left */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const searchQuery = e.target.search.value.trim();
              if (searchQuery) {
                window.location.href = `/companies?query=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="relative w-full sm:w-auto sm:mr-4 order-1"
          >
            <input
              type="text"
              name="search"
              placeholder="Search companies or jobs..."
              className="p-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background-secondary text-text w-full shadow-sm"
              aria-label="Search companies or jobs"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 p-3 text-background-secondary bg-primary rounded-r-lg hover:bg-accent transition"
              aria-label="Submit search"
            >
              🔍
            </button>
          </form>
          {/* Centered heading */}
          <div className="flex-1 flex justify-center order-2">
            <h1 className="text-2xl font-bold text-center text-gray-700 dark:text-white">Smart Company Explorer</h1>
          </div>
          {/* Navigation and dark mode toggle at right */}
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
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-background text-text light:bg-background-light light:text-text-light dark:bg-background-dark dark:text-text-dark transition hover:bg-orange-400 hover:text-gray-900 dark:hover:bg-white dark:hover:text-black"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 bg-primary text-background-secondary light:bg-primary-light light:text-background-secondary_light dark:bg-primary-dark dark:text-background-secondary_dark rounded-md md:hidden transition hover:bg-orange-400 hover:text-gray-900 dark:hover:bg-white dark:hover:text-black"
              aria-label="Toggle filter sidebar"
            >
              {isFilterOpen ? 'Hide Filters' : 'Filters'}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar with Filters */}
        <aside
          className={`${
            isFilterOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-card-light text-gray-700 dark:bg-card-dark dark:text-white p-6 rounded-2xl shadow-xl fixed md:static top-0 left-0 h-full z-30 md:z-0 transition-colors duration-300`}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700 dark:text-white">Filters</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium mb-1 text-text">Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., San Francisco"
                className="w-full p-3 border border-primary/20 rounded-lg bg-background-secondary text-text focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Filter by location"
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1 text-text">Industry</label>
              <select
                name="industry"
                value={filters.industry}
                onChange={handleFilterChange}
                className="w-full p-3 border border-primary/20 rounded-lg bg-background-secondary text-text focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Filter by industry"
              >
                <option value="">All</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium mb-1 text-text">Job Type</label>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="w-full p-3 border border-primary/20 rounded-lg bg-background-secondary text-text focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Filter by job type"
              >
                <option value="">All</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <button
              onClick={applyFilters}
              className="w-full p-3 bg-primary text-background-secondary rounded-lg hover:bg-accent transition font-semibold mt-4"
              aria-label="Apply filters"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Company Cards */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-700 dark:text-white">Companies</h1>
          {companies.length === 0 ? (
            <p className="text-center text-gray-500">No companies found.</p>
          ) : (
            <CompaniesGrid companies={companies} />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark py-4 text-center">
        <p>© 2025 Smart Company Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;