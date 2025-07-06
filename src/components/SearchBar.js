import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Mock autocomplete suggestions (replace with API call)
  useEffect(() => {
    if (query.length > 2) {
      const mockSuggestions = [
        'Software Engineer',
        'Google',
        'Data Analyst',
        'Amazon',
        'Product Manager',
      ].filter((item) => item.toLowerCase().includes(query.toLowerCase()));
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/companies?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search companies or jobs..."
        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        aria-label="Search companies or jobs"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => {
                setQuery(suggestion);
                setSuggestions([]);
                navigate(`/companies?query=${encodeURIComponent(suggestion)}`);
              }}
              className="p-2 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        className="absolute right-0 top-0 p-3 text-white bg-blue-500 rounded-r-md hover:bg-blue-600"
        aria-label="Submit search"
      >
        🔍
      </button>
    </form>
  );
};

export default SearchBar;