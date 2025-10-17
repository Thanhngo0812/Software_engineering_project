import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import { Outlet } from 'react-router-dom';
export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  
    // useEffect(() => {
    //   const savedTheme = localStorage.getItem('theme') || 'light';
    //   setIsDarkMode(savedTheme === 'dark');
    // }, []);
  
    // useEffect(() => {
    //   if (isDarkMode) {
    //     document.body.classList.add('dark-mode');
    //     localStorage.setItem('theme', 'dark');
    //   } else {
    //     document.body.classList.remove('dark-mode');
    //     localStorage.setItem('theme', 'light');
    //   }
    // }, [isDarkMode]);
  
    const handleMenuToggle = () => {
      setSidebarOpen(!sidebarOpen);
    };
  
  
  
    useEffect(() => {
      const handleClickOutside = (e) => {
        const sidebar = document.querySelector('.sidebar');
        const toggle = document.querySelector('.menu-toggle');
        
        if (window.innerWidth <= 768 && sidebarOpen) {
          if (sidebar && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
            setSidebarOpen(false);
          }
        }
      };
  
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [sidebarOpen]);
  
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth > 768) {
          setSidebarOpen(false);
        }
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return (
      <div className="layout">
        <Sidebar isOpen={sidebarOpen} />
        <div className="main-container">
          <Header 
            onMenuToggle={handleMenuToggle}
          />
          <Outlet />
        </div>
        <style>{`
          /* Reset & base */
          body {
            margin: 0;
            font-family: sans-serif;
            background-color: #f4f7fa;
          }
  
          .layout {
            display: flex;
          }
  
          /* Sidebar */
          .sidebar {
            width: 250px;
            background: #fff;
            height: 100vh;
            position: sticky;
            top: 0;
            overflow-y: auto;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, width 0.3s ease;
          }
  
          .sidebar-header {
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
  
          .sidebar a {
            display: block;
            color: #555;
            padding: 15px 20px;
            text-decoration: none;
            margin: 5px 10px;
            border-radius: 8px;
          }
  
          .sidebar a.active, .sidebar a:hover {
            background-color: #ffc107;
            color: #fff;
          }
  
          .sidebar p {
            color: #555;
            padding: 10px 20px;
            margin: 10px 0;
            font-size: 12px;
            text-transform: uppercase;
          }
  
          .sidebar p.medium-text {
            font-weight: bold;
          }
  
          .sidebar-title {
            padding: 20px;
            margin: 0;
            font-size: 14px;
            color: #333;
          }
  
          /* Main Container */
          .main-container {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
  
          /* Top Bar */
          .top-bar {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding: 15px 20px;
            background: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            gap: 15px;
          }
  
          .menu-toggle {
            display: none;
            font-size: 20px;
            cursor: pointer;
            background: none;
            border: none;
            color: #333;
            padding: 5px;
          }
  
          .top-bar-icons {
            display: flex;
            gap: 20px;
            font-size: 20px;
          }
  
          .top-bar-icons .icon-container {
            position: relative;
            cursor: pointer;
          }
  
          .notification-badge {
            position: absolute;
            top: -5px;
            right: -8px;
            background-color: red;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            min-width: 12px;
            height: 15px;
          }
  
          /* Content Header */
          .content-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
  
          .content-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 24px;
            font-weight: bold;
          }
  
          .content-actions {
            display: flex;
            gap: 10px;
          }
  
          .btn {
            padding: 10px 15px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
          }
  
          .btn-primary {
            background-color: #8a2be2;
            color: white;
          }
  
          .btn-secondary {
            background-color: #ff8c00;
            color: white;
          }
  
          .btn:hover {
            opacity: 0.9;
          }
  
          /* Content */
          .content {
            flex: 1;
            padding: 20px;
          }
  
          /* Dropdown Menus */
          .dropdown-menu {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            width: 300px;
            z-index: 1001;
            margin-top: 10px;
          }
  
          .dropdown-menu.show {
            display: block;
          }
  
          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px 15px;
            color: #333;
            text-decoration: none;
            font-size: 14px;
          }
  
          .dropdown-item:hover {
            background-color: #f5f5f5;
          }
  
          .dropdown-item .notification-count {
            margin-left: auto;
            background-color: red;
            color: white;
            border-radius: 50%;
            padding: 2px 8px;
            font-size: 12px;
          }
  
          .dropdown-profile {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            border-bottom: 1px solid #eee;
          }
  
          .dropdown-profile img {
            border-radius: 50%;
            width: 40px;
            height: 40px;
          }
  
          .profile-name {
            font-weight: bold;
            margin: 0;
          }
  
          .profile-role {
            font-size: 12px;
            color: #777;
            margin: 0;
          }
  
          /* Search Container */
          .search-container {
            margin-bottom: 20px;
          }
  
          .search-container input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }
  
          /* Create Form */
          .create-form {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
  
          .create-form h3 {
            margin-top: 0;
          }
  
          .form-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
  
          .form-inputs input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }
  
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
  
          /* Dark Mode */
          body.dark-mode {
            background-color: #1a1a1a;
            color: #e0e0e0;
          }
  
          body.dark-mode .sidebar {
            background: #2c2c2c;
            box-shadow: 2px 0 5px rgba(0,0,0,0.5);
          }
  
          body.dark-mode .sidebar-header .logo,
          body.dark-mode .sidebar-title,
          body.dark-mode .sidebar p {
            color: #e0e0e0;
          }
  
          body.dark-mode .sidebar a {
            color: #b0b0b0;
          }
  
          body.dark-mode .sidebar a.active, 
          body.dark-mode .sidebar a:hover {
            background-color: #ff8c00;
            color: #fff;
          }
  
          body.dark-mode .top-bar {
            background: #2c2c2c;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
          }
  
          body.dark-mode .menu-toggle,
          body.dark-mode .top-bar-icons {
            color: #e0e0e0;
          }
  
          body.dark-mode .content-title h2 {
            color: #e0e0e0;
          }
  
          body.dark-mode .search-container input,
          body.dark-mode .create-form {
            background-color: #3a3a3a;
            border-color: #555;
            color: #f4f7fa;
          }
  
          body.dark-mode .form-inputs input {
            background-color: #2c2c2c;
            border-color: #555;
            color: #f4f7fa;
          }
  
          body.dark-mode .dropdown-menu,
          body.dark-mode .dropdown-item {
            background-color: #2c2c2c;
            color: #e0e0e0;
            border-color: #555;
          }
  
          body.dark-mode .dropdown-item:hover {
            background-color: #3a3a3a;
          }
  
          body.dark-mode .dropdown-profile {
            border-bottom-color: #555;
          }
  
          /* Responsive */
          @media (max-width: 768px) {
            .layout {
              flex-direction: column;
            }
  
            .sidebar {
              position: fixed;
              left: 0;
              top: 0;
              width: 80%;
              max-width: 250px;
              height: 100vh;
              transform: translateX(-100%);
              z-index: 1000;
              background: #fff;
            }
  
            .sidebar.active {
              transform: translateX(0);
            }
  
            .menu-toggle {
              display: block;
              margin-right: auto;
            }
  
            .top-bar {
              justify-content: space-between;
            }
  
            .content {
              padding: 15px;
            }
  
            .content-header {
              flex-direction: column;
              gap: 15px;
              align-items: flex-start;
            }
  
            .content-title {
              font-size: 20px;
            }
  
            .content-title h2 {
              margin: 0;
            }
  
            .content-title i {
              font-size: 20px;
            }
  
            .form-inputs {
              grid-template-columns: 1fr;
            }
  
            .btn {
              padding: 8px 12px;
              font-size: 14px;
            }
  
            .search-container input {
              font-size: 14px;
            }
  
            .dropdown-menu {
              width: 250px;
              right: -50px;
            }
  
            .top-bar-icons {
              gap: 15px;
              font-size: 18px;
            }
          }
  
          @media (max-width: 480px) {
            .sidebar {
              width: 80%;
            //   max-width: 100%;
            }
  
            .top-bar {
              padding: 12px 15px;
            }
  
            .top-bar-icons {
              gap: 12px;
              font-size: 16px;
            }
  
            .content {
              padding: 10px;
            }
  
            .content-title {
              font-size: 18px;
              gap: 8px;
            }
  
            .content-title i {
              font-size: 18px;
            }
  
            .btn {
              padding: 8px 10px;
              font-size: 12px;
              gap: 5px;
            }
  
            .create-form {
              padding: 15px;
            }
  
            .create-form h3 {
              font-size: 16px;
              margin-bottom: 10px;
            }
  
            .form-inputs {
              gap: 10px;
              margin-bottom: 10px;
            }
  
            .form-inputs input {
              padding: 8px;
              font-size: 14px;
            }
  
            .form-actions {
              gap: 8px;
            }
  
            .dropdown-menu {
              width: 200px;
              right: -30px;
            }
  
            .dropdown-item {
              padding: 10px 12px;
              font-size: 12px;
              gap: 10px;
            }
  
            .search-container input {
              padding: 8px;
              font-size: 12px;
            }
  
            .sidebar-header {
              padding: 15px;
              font-size: 18px;
            }
  
            .sidebar a {
              padding: 12px 15px;
              font-size: 13px;
              margin: 3px 5px;
            }
  
            .sidebar p {
              padding: 8px 15px;
              font-size: 10px;
            }
  
            .notification-badge {
              top: -8px;
              right: -10px;
              font-size: 10px;
              padding: 1px 5px;
              min-width: 10px;
              height: 10px;
            }
          }
        `}</style>
      </div>
    );
  }