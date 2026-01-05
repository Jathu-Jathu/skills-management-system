import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaUsers, 
  FaToolbox, 
  FaPlus, 
  FaList, 
  FaSearch,
  FaLightbulb,
  FaProjectDiagram
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Personnel',
      icon: <FaUsers />,
      items: [
        { path: '/personnel', label: 'View All', icon: <FaList /> },
        { path: '/personnel/new', label: 'Add New', icon: <FaPlus /> }
      ]
    },

    // Add this to your sidebar menu items:
{
  title: 'Search',
  icon: <FaSearch />,
  items: [
    { path: '/advanced-search', label: 'Advanced Search', icon: <FaSearch /> }
  ]
},
    {
      title: 'Skills',
      icon: <FaToolbox />,
      items: [
        { path: '/skills', label: 'Skill Catalog', icon: <FaList /> },
        { path: '/skills/new', label: 'Add Skill', icon: <FaPlus /> }
      ]
    },
    {
      title: 'Projects',
      icon: <FaProjectDiagram/>,
      items: [
        { path: '/projects', label: 'All Projects', icon: <FaList /> },
        { path: '/projects/new', label: 'New Project', icon: <FaPlus /> }
      ]
    },
    {
      title: 'Matching',
      icon: <FaLightbulb />,
      items: [
        { path: '/matching', label: 'Find Matches', icon: <FaSearch /> }
      ]
    }
  ];
  
  return (
    <aside className="sidebar">
      {menuItems.map((section, index) => (
        <div key={index} className="sidebar-section">
          <div className="sidebar-section-title">
            {section.icon}
            <span>{section.title}</span>
          </div>
          <ul className="sidebar-menu">
            {section.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Link 
                  to={item.path} 
                  className={`sidebar-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <div className="sidebar-footer">
        <div className="stats-card">
          <h4>Quick Stats</h4>
          <p>👥 12 Team Members</p>
          <p>🛠️ 45 Skills</p>
          <p>📊 8 Active Projects</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
