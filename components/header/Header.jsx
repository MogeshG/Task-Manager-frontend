import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="w-full bg-white border-b border-b-green-500 h-16 flex justify-between items-center">
      <span className="text-xl font-bold text-green-600 ml-4">TaskMint</span>
      <button
        onClick={handleLogout}
        className="mr-4 px-4 py-2 h-fit bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
