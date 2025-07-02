import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  console.log('Rendering Sidebar');
  return (
    <div className="w-64 bg-gray-800 text-white h-full p-4">
      <h2 className="text-2xl font-bold mb-6">Smart Company Explorer</h2>
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block py-2 px-4 rounded mb-2 ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/companies"
          className={({ isActive }) =>
            `block py-2 px-4 rounded mb-2 ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
          }
        >
          Companies
        </NavLink>
      </nav>
    </div>
  );
};

console.log('Sidebar component loaded');
export default Sidebar;