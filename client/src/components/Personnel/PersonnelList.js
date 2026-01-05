import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { personnelAPI } from '../../services/apiEndpoints';

import { 
  FaUser, 
  FaEnvelope, 
  FaBriefcase, 
  FaStar, 
  FaEdit,
  FaTrash,
  FaTools
} from 'react-icons/fa';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import SearchBar from '../Common/SearchBar';

const PersonnelList = () => {
  const [personnel, setPersonnel] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');

  useEffect(() => {
    fetchPersonnel();
  }, []);

  useEffect(() => {
    filterPersonnel();
  }, [searchTerm, experienceFilter, personnel]);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const response = await personnelAPI.getAll();
      setPersonnel(response.data);
      setFilteredPersonnel(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch personnel');
    } finally {
      setLoading(false);
    }
  };

  const filterPersonnel = () => {
    let filtered = personnel;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply experience filter
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(person => 
        person.experience_level === experienceFilter
      );
    }

    setFilteredPersonnel(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      try {
        await personnelAPI.delete(id);
        setPersonnel(personnel.filter(p => p.id !== id));
      } catch (err) {
        setError('Failed to delete personnel');
      }
    }
  };

  const getExperienceColor = (level) => {
    switch(level) {
      case 'Senior': return 'senior';
      case 'Mid-Level': return 'mid-level';
      case 'Junior': return 'junior';
      default: return '';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} onRetry={fetchPersonnel} />;

  return (
    <div className="personnel-list">
      <div className="list-header">
        <h2>Team Personnel</h2>
        <Link to="/personnel/new" className="btn btn-primary">
          <FaUser /> Add New Personnel
        </Link>
      </div>

      <div className="filters-container">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="      Search by name, email, or role..."
        />
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Experience Level:</label>
            <select 
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>{personnel.length}</h3>
          <p>Total Team Members</p>
        </div>
        <div className="stat-card">
          <h3>{personnel.filter(p => p.experience_level === 'Senior').length}</h3>
          <p>Senior Members</p>
        </div>
        <div className="stat-card">
          <h3>{personnel.reduce((acc, p) => acc + (p.skills?.length || 0), 0)}</h3>
          <p>Total Skills</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Experience</th>
              <th>Skills</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonnel.map((person) => (
              <tr key={person.id}>
                <td>
                  <div className="person-info">
                    <div className="avatar">
                      <FaUser />
                    </div>
                    <div>
                      <strong>{person.name}</strong>
                      <small>ID: {person.id}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div><FaEnvelope /> {person.email}</div>
                  </div>
                </td>
                <td>
                  <div className="role-info">
                    <FaBriefcase /> {person.role || 'Not specified'}
                  </div>
                </td>
                <td>
                  <span className={`experience-badge ${getExperienceColor(person.experience_level)}`}>
                    {person.experience_level}
                  </span>
                </td>
                <td>
                  <div className="skills-tags">
                    {person.skills?.slice(0, 3).map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill.name} <small>({skill.proficiency})</small>
                      </span>
                    ))}
                    {person.skills?.length > 3 && (
                      <span className="skill-tag more">
                        +{person.skills.length - 3} more
                      </span>
                    )}
                    {(!person.skills || person.skills.length === 0) && (
                      <span className="no-skills">No skills assigned</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <Link 
                      to={`/personnel/${person.id}`}
                      className="btn btn-sm btn-info"
                    >
                      <FaEdit /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="btn btn-sm btn-danger"
                    >
                      <FaTrash /> Delete
                    </button>
                    <Link 
                      to={`/personnel/${person.id}/skills`}
                      className="btn btn-sm btn-secondary"
                    >
                      <FaTools /> Skills
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredPersonnel.length === 0 && (
          <div className="empty-state">
            <FaUser size={48} />
            <h3>No personnel found</h3>
            <p>Try adjusting your search or add new personnel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonnelList;