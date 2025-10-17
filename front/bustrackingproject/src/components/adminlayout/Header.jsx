import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Bước 1: Import
const Header = ({ onMenuToggle, onThemeToggle }) => {
    const [showNotification, setShowNotification] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate(); 
    function handleLogout(){
        logout();
        navigate('/');
    }
    return (
      <header className="top-bar">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="top-bar-icons">
          <i 
            id="theme-toggle"
            onClick={onThemeToggle}
            style={{ cursor: 'pointer' }}
          ></i>
  
          {/* Notification Icon & Dropdown */}
          <div 
            className="icon-container" 
            onClick={() => {
              setShowNotification(!showNotification);
              setShowUserMenu(false);
            }}
          >
            <i className="fa-solid fa-bell"></i>
            <span className="notification-badge" style={{ display: 'block' }}>2</span>
            {showNotification && (
              <div className="dropdown-menu show">
                <a href="#" className="dropdown-item">
                  <i className="fa-solid fa-id-card"></i>
                  <span>Students require review</span>
                  <span className="notification-count">1</span>
                </a>
                <a href="#" className="dropdown-item">
                  <i className="fa-solid fa-bus"></i>
                  <span>Students need bus assignment</span>
                  <span className="notification-count">1</span>
                </a>
              </div>
            )}
          </div>
  
          {/* User Icon & Dropdown */}
          <div 
            className="icon-container" 
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotification(false);
            }}
          >
            <i className="fa-solid fa-user"></i>
            {showUserMenu && (
              <div className="dropdown-menu show">
                <div className="dropdown-profile">
                  <img src="https://via.placeholder.com/40" alt="User" />
                  <div>
                    <p className="profile-name">demo</p>
                    <p className="profile-role">School</p>
                  </div>
                </div>
                <div href="#" className="dropdown-item">
                  <i className="fa-solid fa-user-pen"></i>
                  <span>Profile</span>
                </div>
                <div onClick={handleLogout} className="dropdown-item">
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  };

  export default Header;