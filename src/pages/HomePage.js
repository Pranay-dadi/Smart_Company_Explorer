import React, { useState, useEffect } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import CompanyCard from '../components/CompanyCard';
import InfiniteScrollWrapper from '../components/InfiniteScrollWrapper';

const HomePage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchCompanies = async (page = 1) => {
    try {
      const response = await fetch(
        `/api/companies?page=${page}${query ? `&query=${encodeURIComponent(query)}` : ''}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    fetchCompanies().then((data) => setCompanies(data));
  }, [query]);

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
    <div className={`min-h-screen bg-background light:bg-background-light dark:bg-background-dark text-text light:text-text-light dark:text-text-dark ${darkMode ? 'dark' : ''}`}>
      {/* Top Menu Bar */}
      <header className="bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark shadow sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <h1 className="text-2xl font-bold">Smart Company Explorer</h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const searchQuery = e.target.search.value.trim();
                if (searchQuery) {
                  window.location.href = `/companies?query=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="relative w-full sm:w-auto"
            >
              <input
                type="text"
                name="search"
                placeholder="Search companies or jobs..."
                className="p-2 border border-text/20 light:border-text-light/20 dark:border-text-dark/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary light:focus:ring-primary-light dark:focus:ring-primary-dark bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark text-text light:text-text-light dark:text-text-dark w-full"
                aria-label="Search companies or jobs"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 p-2 text-background-secondary light:text-background-secondary_light dark:text-background-secondary_dark bg-primary light:bg-primary-light dark:bg-primary-dark rounded-r-md hover:bg-accent light:hover:bg-accent-light dark:hover:bg-accent-dark"
                aria-label="Submit search"
              >
                🔍
              </button>
            </form>
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
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-background text-text light:bg-background-light light:text-text-light dark:bg-background-dark dark:text-text-dark hover:bg-accent hover:text-background-secondary light:hover:bg-accent-light light:hover:text-background-secondary_light dark:hover:bg-accent-dark dark:hover:text-background-secondary_dark transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 bg-primary text-background-secondary light:bg-primary-light light:text-background-secondary_light dark:bg-primary-dark dark:text-background-secondary_dark rounded-md md:hidden hover:bg-accent light:hover:bg-accent-light dark:hover:bg-accent-dark"
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
          } md:block w-full md:w-64 bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark p-4 rounded-md shadow-md fixed md:static top-0 left-0 h-full z-30 md:z-0 transition-transform duration-300`}
        >
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., San Francisco"
                className="w-full p-2 border border-text/20 light:border-text-light/20 dark:border-text-dark/20 rounded-md bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark text-text light:text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary light:focus:ring-primary-light dark:focus:ring-primary-dark"
                aria-label="Filter by location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Industry</label>
              <select
                name="industry"
                value={filters.industry}
                onChange={handleFilterChange}
                className="w-full p-2 border border-text/20 light:border-text-light/20 dark:border-text-dark/20 rounded-md bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark text-text light:text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary light:focus:ring-primary-light dark:focus:ring-primary-dark"
                aria-label="Filter by industry"
              >
                <option value="">All</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Job Type</label>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="w-full p-2 border border-text/20 light:border-text-light/20 dark:border-text-dark/20 rounded-md bg-background-secondary light:bg-background-secondary_light dark:bg-background-secondary_dark text-text light:text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary light:focus:ring-primary-light dark:focus:ring-primary-dark"
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
              className="w-full p-2 bg-primary text-background-secondary light:bg-primary-light light:text-background-secondary_light dark:bg-primary-dark dark:text-background-secondary_dark rounded-md hover:bg-accent light:hover:bg-accent-light dark:hover:bg-accent-dark"
              aria-label="Apply filters"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Company Cards */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Companies</h1>
          <InfiniteScrollWrapper
            fetchData={fetchCompanies}
            data={companies}
            renderItem={(company, index) => <CompanyCard key={index} company={company} />}
            type="companies"
          />
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