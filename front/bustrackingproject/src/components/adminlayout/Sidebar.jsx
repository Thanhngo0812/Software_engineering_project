import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
    // State để lưu trữ mục menu đang được chọn (lưu trữ đường dẫn/key của mục đó)
    // Khởi tạo là '/' hoặc 'Dashboard' (vì Dashboard đang có class 'active' ban đầu)
    const [activeItem, setActiveItem] = useState('Dashboard'); 

    // Hàm xử lý khi một mục được click
    const handleItemClick = (key) => {
        setActiveItem(key);
    };
    
    // Hàm hỗ trợ để render Link/a, kiểm tra xem nó có phải là mục active không
    const renderMenuItem = (label, href, isLink = false) => {
        const isActive = activeItem === label;
        const Component = isLink ? Link : 'a';

        return (
            <Component 
                // Nếu là Link (cho React Router) thì dùng to, nếu là <a> thì dùng href
                {...(isLink ? { to: href } : { href: href })}
                className={isActive ? 'active' : ''}
                onClick={() => handleItemClick(label)}
            >
                {label}
            </Component>
        );
    }

    // --- Cần đảm bảo rằng các 'key' trong handleItemClick là duy nhất ---
    return (
        <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
         
            <div onClick={() => handleItemClick('Dashboard')} className="sidebar-header">
                <div className="logo">SchoolTripTrack</div>
            </div>
           
            {/* MENU */}
            <h2 className="sidebar-title">Menu</h2>
            
            {/* Dashboard: Sử dụng href="#" cho mục đầu tiên*/}
            {renderMenuItem("Dashboard", "#")} 
            
            <p>Users</p>
            {renderMenuItem("Students", "#")}
            {renderMenuItem("Guardians", "#")}
            {renderMenuItem("Drivers", "#")}
            
            <p className="medium-text">SYSTEM SETUP</p>
            {renderMenuItem("School", "#")}
            {renderMenuItem("Buses", "#")}
            {renderMenuItem("Routes", "#")}
            
            {/* Stops: Sử dụng Link và isLink=true */}
            {/* LƯU Ý: Nếu bạn dùng React Router, hãy dùng đường dẫn (e.g., /school/stop) làm key */}
            <Link 
                to="/school/stop"
                className={activeItem === 'Stops' ? 'active' : ''}
                onClick={() => handleItemClick('Stops')}
            >
                Stops
            </Link>
            
            {renderMenuItem("Trips", "#")}
            
            <p className="medium-text">LIVE</p>
            {renderMenuItem("Live Tracking", "#")}
            
            <p className="medium-text">REPORTS</p>
            {renderMenuItem("Time Table", "#")}
            {renderMenuItem("Student Rides", "#")}
            {renderMenuItem("Driver Conflicts", "#")}
            
            <p className="medium-text">PLAN</p>
            {renderMenuItem("Buy", "#")}
            {renderMenuItem("Payments", "#")}
            {renderMenuItem("Transfer Coins", "#")}
        </aside>
    );
};

export default Sidebar;
