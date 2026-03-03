import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="w-full bg-white border-b border-b-green-500 h-16 flex justify-between items-center px-3 md:px-4">
      <div className="flex items-center gap-3">
        {/* Hamburger menu for mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex flex-col gap-1.5 cursor-pointer"
          aria-label="Toggle menu"
        >
          <span className="w-6 h-0.5 bg-gray-700"></span>
          <span className="w-6 h-0.5 bg-gray-700"></span>
          <span className="w-6 h-0.5 bg-gray-700"></span>
        </button>
        <span className="text-lg md:text-xl font-bold text-green-600 whitespace-nowrap">
          TaskMint
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="px-3 md:px-4 py-2 h-fit bg-red-500 text-white text-sm md:text-base rounded hover:bg-red-600 transition whitespace-nowrap"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
