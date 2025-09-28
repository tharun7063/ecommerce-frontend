import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faUserPlus,
  faCircleUser,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const bgColor = "bg-[#f8f8f8]";

  const [cartCount, setCartCount] = useState(3);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  // Sidebar links
  const defaultLinks = [
    { label: "Brands", path: "/brands" },
    { label: "Products", path: "/products" },
    { label: "Categories", path: "/categories" },
  ];

  const adminLinks = [
    { label: "Users", path: "/admin/user" },
    { label: "Products", path: "/admin/product" },
  ];

  const isAdmin = user?.role_name === "admin";
  const isCustomer = !user || user.role_name === "customer";

  const links = isAdmin ? adminLinks : defaultLinks;

  const getLinkClasses = (isActive) =>
    `text-left px-3 py-2 rounded ${
      isActive ? "bg-orange-500 text-white font-semibold" : "hover:bg-orange-100"
    }`;

  return (
    <div className="flex h-screen m-0 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`w-[200px] flex-none border-r border-gray-300 pr-5 flex flex-col gap-5 ${bgColor}`}
      >
        <div
          className="flex items-center gap-1 mb-2 cursor-pointer"
          onClick={() => navigate(isAdmin ? "/admin" : "/")}
        >
          <img src={logo} alt="Project Logo" className="w-[100px]" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg">E - com</span>
            <span className="text-sm text-gray-600">Platform</span>
          </div>
        </div>

        {/* Sidebar links */}
        <div className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <button
                key={link.path}
                className={getLinkClasses(isActive)}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className={`h-[60px] border-b border-gray-300 flex items-center justify-between px-5 ${bgColor}`}
        >
          {isCustomer && (
            <>
              <input
                type="text"
                placeholder="Search..."
                className="w-full max-w-md px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <div className="flex items-center gap-5 ml-5 relative">
                <div
                  className="relative cursor-pointer"
                  onClick={() => navigate("/cart")}
                >
                  <FontAwesomeIcon
                    icon={faCartPlus}
                    className="text-gray-700 text-2xl"
                  />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </div>
              </div>
            </>
          )}

          {isAdmin && (
            <h1 className="text-xl font-semibold text-gray-700">Dashboard</h1>
          )}

          {/* Account dropdown */}
          <div className="relative ml-auto" ref={dropdownRef}>
            {user ? (
              <FontAwesomeIcon
                icon={faCircleUser}
                style={{ color: "#ea781a" }}
                className="cursor-pointer text-2xl"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
            ) : (
              <FontAwesomeIcon
                icon={faUserPlus}
                className="cursor-pointer text-2xl text-black"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
            )}

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-10">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-orange-100 text-red-600"
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      style={{ color: "#e3372b" }}
                    />
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-orange-100 text-black"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-5 bg-[#f0f2f5] overflow-y-auto min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
