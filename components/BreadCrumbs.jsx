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
    <div className="flex gap-2 ">
      {locations.map((loc, index) => (
        <React.Fragment key={loc.path}>
          {index === 0 && <span>Home /</span>}
          <Link to={loc.path} className="capitalize text-green-600 font-semibold hover:underline">
            {loc.name}
          </Link>
          {index < locations.length - 1 && <span>/</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BreadCrumbs;
