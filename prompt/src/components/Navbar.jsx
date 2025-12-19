import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faTerminal, faCircleUser, faX } from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const token = localStorage.getItem("token");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  // Auto-close mobile menu 
  useEffect(() => {
    if (mobileOpen) {
      const timer = setTimeout(() => {
        setMobileOpen(false);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [mobileOpen]);

  useEffect(() => {
    if(darkMode){
      document.body.classList.add("dark-mode");
    }else{
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          Prompt Generator
        </div>

        <div className="nav-links">
          {token ? (
            <>
              <Link to="/dashboard">
                <FontAwesomeIcon icon={faHouse} /> Dashboard
              </Link>
              <Link to="/prompting">
                <FontAwesomeIcon icon={faTerminal} /> Prompting
              </Link>
              <Link to="/profile">
                <FontAwesomeIcon icon={faCircleUser} /> Profile
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="hamburger" onClick={toggleMobileMenu}>
          {mobileOpen ? (
            <FontAwesomeIcon icon={faX} size="lg" />
          ) : (
            <>
              <div></div>
              <div></div>
              <div></div>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-nav ${mobileOpen ? "active" : ""}`}>
        {token ? (
          <>
            <Link to="/dashboard" onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faHouse} /> Dashboard
            </Link>
            <Link to="/prompting" onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faTerminal} /> Prompting
            </Link>
            <Link to="/profile" onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faCircleUser} /> Profile
            </Link>
            <button
              className="logout-btn"
              onClick={() => {
                handleLogout();
                handleLinkClick();
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={handleLinkClick}>Login</Link>
            <Link to="/register" onClick={handleLinkClick}>Register</Link>
          </>
        )}
      </div>
    </>
  );
}
