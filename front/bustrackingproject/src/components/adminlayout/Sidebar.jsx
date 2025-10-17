import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
    return (
      <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">SchoolTripTrack</div>
        </div>
        <h2 className="sidebar-title">Menu</h2>
        <a href="#" className="active">Dashboard</a>
        <p>Users</p>
        <a href="#">Students</a>
        <a href="#">Guardians</a>
        <a href="#">Drivers</a>
        <p className="medium-text">SYSTEM SETUP</p>
        <a href="#">School</a>
        <a href="#">Buses</a>
        <a href="#">Routes</a>
        <Link to="/school/stop">Stops</Link>
        <a href="#">Trips</a>
        <p className="medium-text">LIVE</p>
        <a href="#">Live Tracking</a>
        <p className="medium-text">REPORTS</p>
        <a href="#">Time Table</a>
        <a href="#">Student Rides</a>
        <a href="#">Driver Conflicts</a>
        <p className="medium-text">PLAN</p>
        <a href="#">Buy</a>
        <a href="#">Payments</a>
        <a href="#">Transfer Coins</a>
      </aside>
    );
  };

  export default Sidebar;