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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Companies...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} text-gray-900 dark:text-gray-100`}>
      {/* Top Menu Bar */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Career PathFinder</h1>
          <nav className="flex items-center gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
              }
              aria-label="Go to Home"
            >
              Home
            </NavLink>
            <NavLink
              to="/companies"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
              }
              aria-label="Go to Companies"
            >
              Jobs
            </NavLink>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const searchQuery = e.target.search.value.trim();
                if (searchQuery) {
                  window.location.href = `/companies?query=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="relative"
            >
              <input
                type="text"
                name="search"
                placeholder="Search companies or jobs..."
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                aria-label="Search companies or jobs"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 p-2 text-white bg-blue-500 rounded-r-md hover:bg-blue-600"
                aria-label="Submit search"
              >
                🔍
              </button>
            </form>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 bg-blue-500 text-white rounded-md md:hidden"
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
          } md:block w-full md:w-64 bg-white dark:bg-gray-800 p-4 rounded-md shadow-md fixed md:static top-0 left-0 h-full z-30 md:z-0 transition-transform duration-300`}
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
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                aria-label="Filter by location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Industry</label>
              <select
                name="industry"
                value={filters.industry}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
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
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
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
              className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
      <footer className="bg-white dark:bg-gray-800 py-4 text-center">
        <p>© 2025 Smart Company Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;