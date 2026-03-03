import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const BreadCrumbs = () => {
  const location = useLocation();
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const paths = location.pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, arr) => ({
        name: segment,
        path: "/" + arr.slice(0, index + 1).join("/"),
      }));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocations(paths);
  }, [location.pathname]);

  return (
    <div className="flex gap-1 md:gap-2 text-xs md:text-sm overflow-x-auto pb-1">
      {locations.map((loc, index) => (
        <React.Fragment key={loc.path}>
          {index === 0 && <span className="text-gray-600">Home /</span>}
          <Link
            to={loc.path}
            className="capitalize text-green-600 font-semibold hover:underline truncate"
          >
            {loc.name}
          </Link>
          {index < locations.length - 1 && <span className="text-gray-600">/</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BreadCrumbs;
