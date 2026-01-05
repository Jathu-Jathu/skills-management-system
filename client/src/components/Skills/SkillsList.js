import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillsAPI } from '../../services/apiEndpoints';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import SearchBar from '../Common/SearchBar';
import { FaPlus, FaEdit, FaTrash, FaTag, FaFilter } from 'react-icons/fa';

const SkillsList = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    filterSkills();
  }, [searchTerm, categoryFilter, skills]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await skillsAPI.getAll();
      setSkills(response.data);
      setFilteredSkills(response.data);
    } catch (err) {
      setError('Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = skills;

    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(skill => skill.category === categoryFilter);
    }

    setFilteredSkills(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await skillsAPI.delete(id);
        setSkills(skills.filter(s => s.id !== id));
      } catch (err) {
        setError('Failed to delete skill');
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Programming Language': 'category-pl',
      'Framework': 'category-fw',
      'Tool': 'category-tool',
      'Soft Skill': 'category-soft',
      'Database': 'category-db',
      'Cloud': 'category-cloud'
    };
    return colors[category] || 'category-default';
  };

  const categories = [
    'Programming Language',
    'Framework',
    'Tool',
    'Soft Skill',
    'Database',
    'Cloud'
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} onRetry={fetchSkills} />;

  return (
    <div className="skills-list">
      <div className="list-header">
        <h2>Skill Catalog</h2>
        <Link to="/skills/new" className="btn btn-primary">
          <FaPlus /> Add New Skill
        </Link>
      </div>

      <div className="filters-container">
        <SearchBar 
          onSearch={setSearchTerm}
          placeholder="Search skills by name or description..."
        />
        
        <div className="filter-controls">
          <div className="filter-group">
            <label><FaFilter /> Category:</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="skills-grid">
        {filteredSkills.map((skill) => (
          <div key={skill.id} className="skill-card">
            <div className="skill-card-header">
              <span className={`skill-category ${getCategoryColor(skill.category)}`}>
                <FaTag /> {skill.category}
              </span>
              <div className="skill-actions">
                <Link 
                  to={`/skills/${skill.id}/edit`}
                  className="btn btn-sm btn-info"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="btn btn-sm btn-danger"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className="skill-card-body">
              <h3>{skill.name}</h3>
              {skill.description && (
                <p className="skill-description">{skill.description}</p>
              )}
              <div className="skill-meta">
                <span className="skill-id">ID: {skill.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="empty-state">
          <FaTag size={48} />
          <h3>No skills found</h3>
          <p>Try adjusting your search or add new skills.</p>
        </div>
      )}
    </div>
  );
};

export default SkillsList;