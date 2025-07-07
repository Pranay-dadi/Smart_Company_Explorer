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
        className="w-full p-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background-secondary dark:bg-background-secondary_dark shadow-sm"
        aria-label="Search companies or jobs"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-background-secondary dark:bg-background-secondary_dark border border-primary/10 rounded-lg mt-1 shadow-xl max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => {
                setQuery(suggestion);
                setSuggestions([]);
                navigate(`/companies?query=${encodeURIComponent(suggestion)}`);
              }}
              className="p-3 hover:bg-accent/10 dark:hover:bg-accent/20 cursor-pointer transition"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        className="absolute right-0 top-0 p-3 text-white bg-primary rounded-r-lg hover:bg-accent transition"
        aria-label="Submit search"
      >
        🔍
      </button>
    </form>
  );
};

export default SearchBar;