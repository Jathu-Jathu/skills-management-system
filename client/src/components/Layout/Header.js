import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserFriends, FaProjectDiagram, FaChartBar } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>🛠️ SkillsMatch Pro</h1>
          </Link>
          <p className="tagline">Smart Team Allocation for Consultancies</p>
        </div>
        
        <nav className="nav-links">
          <Link to="/personnel" className="nav-link">
            <FaUserFriends /> Personnel
          </Link>
          <Link to="/projects" className="nav-link">
            <FaProjectDiagram /> Projects
          </Link>
          <Link to="/matching" className="nav-link">
            <FaChartBar /> Matching
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;



