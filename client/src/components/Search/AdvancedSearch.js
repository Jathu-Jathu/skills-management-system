import React, { useState, useEffect } from 'react';
import { personnelAPI, skillsAPI } from '../../services/apiEndpoints';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import { 
  FaSearch, 
  FaFilter, 
  FaSave, 
  FaDownload,
  FaTimes,
  FaCheck,
  FaStar,
  FaUser,
  FaEnvelope,
  FaBriefcase
} from 'react-icons/fa';

const AdvancedSearch = () => {
  const [personnel, setPersonnel] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Advanced filters state
  const [filters, setFilters] = useState({
    searchText: '',
    experienceLevels: [],
    selectedSkills: [],
    minProficiency: 'Any',
    role: ''
  });
  
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    fetchData();
    loadSavedSearches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, personnel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [personnelRes, skillsRes] = await Promise.all([
        personnelAPI.getAll(),
        skillsAPI.getAll()
      ]);
      setPersonnel(personnelRes.data);
      setSkills(skillsRes.data);
      setFilteredPersonnel(personnelRes.data);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const proficiencyLevels = [
    { value: 'Any', label: 'Any Proficiency' },
    { value: 'Beginner', label: 'Beginner+' },
    { value: 'Intermediate', label: 'Intermediate+' },
    { value: 'Advanced', label: 'Advanced+' },
    { value: 'Expert', label: 'Expert' }
  ];

  const experienceOptions = ['Junior', 'Mid-Level', 'Senior'];

  const applyFilters = () => {
    let results = [...personnel];

    // Text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      results = results.filter(person =>
        person.name.toLowerCase().includes(searchLower) ||
        person.email.toLowerCase().includes(searchLower) ||
        (person.role && person.role.toLowerCase().includes(searchLower)) ||
        (person.skills && person.skills.some(skill => 
          skill.name.toLowerCase().includes(searchLower)
        ))
      );
    }

    // Experience level filter
    if (filters.experienceLevels.length > 0) {
      results = results.filter(person =>
        filters.experienceLevels.includes(person.experience_level)
      );
    }

    // Skills filter
    if (filters.selectedSkills.length > 0) {
      results = results.filter(person => {
        if (!person.skills || person.skills.length === 0) return false;
        
        const personSkillIds = person.skills.map(s => s.id);
        return filters.selectedSkills.every(skillId => 
          personSkillIds.includes(skillId)
        );
      });
    }

    // Proficiency filter
    if (filters.minProficiency !== 'Any') {
      const proficiencyOrder = {
        'Beginner': 1,
        'Intermediate': 2,
        'Advanced': 3,
        'Expert': 4
      };
      const minLevel = proficiencyOrder[filters.minProficiency];
      
      results = results.filter(person => {
        if (!person.skills || person.skills.length === 0) return false;
        
        if (filters.selectedSkills.length === 0) {
          return person.skills.some(skill => 
            proficiencyOrder[skill.proficiency] >= minLevel
          );
        } else {
          return filters.selectedSkills.every(skillId => {
            const skill = person.skills.find(s => s.id === skillId);
            return skill && proficiencyOrder[skill.proficiency] >= minLevel;
          });
        }
      });
    }

    // Role filter
    if (filters.role) {
      results = results.filter(person =>
        person.role && person.role.toLowerCase().includes(filters.role.toLowerCase())
      );
    }

    setFilteredPersonnel(results);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleExperienceToggle = (level) => {
    setFilters(prev => {
      const newLevels = prev.experienceLevels.includes(level)
        ? prev.experienceLevels.filter(l => l !== level)
        : [...prev.experienceLevels, level];
      return { ...prev, experienceLevels: newLevels };
    });
  };

  const handleSkillToggle = (skillId) => {
    setFilters(prev => {
      const newSkills = prev.selectedSkills.includes(skillId)
        ? prev.selectedSkills.filter(id => id !== skillId)
        : [...prev.selectedSkills, skillId];
      return { ...prev, selectedSkills: newSkills };
    });
  };

  const saveSearch = () => {
    if (!searchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    const newSearch = {
      id: Date.now(),
      name: searchName,
      filters: { ...filters },
      date: new Date().toISOString(),
      resultCount: filteredPersonnel.length
    };

    const updatedSearches = [newSearch, ...savedSearches.slice(0, 4)];
    setSavedSearches(updatedSearches);
    
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    setSearchName('');
    
    alert(`Search "${searchName}" saved!`);
  };

  const loadSavedSearch = (search) => {
    setFilters(search.filters);
  };

  const loadSavedSearches = () => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const clearFilters = () => {
    setFilters({
      searchText: '',
      experienceLevels: [],
      selectedSkills: [],
      minProficiency: 'Any',
      role: ''
    });
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(filteredPersonnel, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'personnel-search-results.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getSkillName = (skillId) => {
    return skills.find(s => s.id === skillId)?.name || `Skill ${skillId}`;
  };

  if (loading) return <LoadingSpinner text="Loading search data..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;

  return (
    <div className="advanced-search">
      <div className="search-header">
        <h2><FaSearch /> Advanced Personnel Search</h2>
        <div className="search-stats">
          <span className="stat">
            Found: <strong>{filteredPersonnel.length}</strong> of {personnel.length} personnel
          </span>
        </div>
      </div>

      <div className="search-container">
        {/* Left sidebar - Filters */}
        <div className="filters-sidebar">
          <div className="filter-section">
            <h4><FaFilter /> Filters</h4>
            
            <div className="filter-group">
              <label>Text Search</label>
              <input
                type="text"
                placeholder="Search by name, email, role, or skills..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label>Experience Level</label>
              <div className="filter-chips">
                {experienceOptions.map(level => (
                  <button
                    key={level}
                    type="button"
                    className={`filter-chip ${filters.experienceLevels.includes(level) ? 'active' : ''}`}
                    onClick={() => handleExperienceToggle(level)}
                  >
                    {level}
                    {filters.experienceLevels.includes(level) && <FaCheck />}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Skills</label>
              <div className="skills-filter">
                {skills.map(skill => (
                  <div key={skill.id} className="skill-checkbox">
                    <input
                      type="checkbox"
                      id={`skill-${skill.id}`}
                      checked={filters.selectedSkills.includes(skill.id)}
                      onChange={() => handleSkillToggle(skill.id)}
                    />
                    <label htmlFor={`skill-${skill.id}`}>
                      {skill.name}
                      {filters.selectedSkills.includes(skill.id) && (
                        <span className="checkmark">✓</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Minimum Proficiency</label>
              <select
                value={filters.minProficiency}
                onChange={(e) => handleFilterChange('minProficiency', e.target.value)}
                className="proficiency-select"
              >
                {proficiencyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Role/Title</label>
              <input
                type="text"
                placeholder="e.g., Frontend Developer"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="role-input"
              />
            </div>

            <div className="filter-actions">
              <button type="button" onClick={clearFilters} className="btn btn-secondary">
                <FaTimes /> Clear All
              </button>
              <button type="button" onClick={applyFilters} className="btn btn-primary">
                <FaSearch /> Apply Filters
              </button>
            </div>

            <div className="save-search">
              <h5>Save This Search</h5>
              <div className="save-input-group">
                <input
                  type="text"
                  placeholder="Enter search name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="save-input"
                />
                <button type="button" onClick={saveSearch} className="btn btn-success">
                  <FaSave /> Save
                </button>
              </div>
            </div>
          </div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="saved-searches">
              <h5>Saved Searches</h5>
              {savedSearches.map(search => (
                <div key={search.id} className="saved-search-item">
                  <div className="search-info">
                    <strong>{search.name}</strong>
                    <small>{new Date(search.date).toLocaleDateString()}</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadSavedSearch(search)}
                    className="btn btn-sm btn-outline"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main content - Results */}
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results ({filteredPersonnel.length})</h3>
            <div className="results-actions">
              <button type="button" onClick={exportResults} className="btn btn-secondary">
                <FaDownload /> Export JSON
              </button>
            </div>
          </div>

          {/* Active filters display */}
          {(filters.searchText || 
            filters.experienceLevels.length > 0 || 
            filters.selectedSkills.length > 0 || 
            filters.minProficiency !== 'Any' || 
            filters.role) && (
            <div className="active-filters">
              <h5>Active Filters:</h5>
              <div className="filter-tags">
                {filters.searchText && (
                  <span className="filter-tag">
                    Text: "{filters.searchText}" <FaTimes />
                  </span>
                )}
                {filters.experienceLevels.map(level => (
                  <span key={level} className="filter-tag">
                    {level} <FaTimes />
                  </span>
                ))}
                {filters.selectedSkills.map(skillId => (
                  <span key={skillId} className="filter-tag">
                    {getSkillName(skillId)} <FaTimes />
                  </span>
                ))}
                {filters.minProficiency !== 'Any' && (
                  <span className="filter-tag">
                    Proficiency: {filters.minProficiency}+ <FaTimes />
                  </span>
                )}
                {filters.role && (
                  <span className="filter-tag">
                    Role: {filters.role} <FaTimes />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Results grid */}
          {filteredPersonnel.length === 0 ? (
            <div className="no-results">
              <FaSearch size={48} />
              <h4>No personnel match your search criteria</h4>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="results-grid">
              {filteredPersonnel.map(person => (
                <div key={person.id} className="person-card">
                  <div className="person-header">
                    <div className="person-avatar">
                      <FaUser />
                    </div>
                    <div className="person-info">
                      <h4>{person.name}</h4>
                      <p className="person-role">{person.role || 'No role specified'}</p>
                      <span className={`experience-badge ${person.experience_level.toLowerCase()}`}>
                        {person.experience_level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="person-contact">
                    <p><FaEnvelope /> {person.email}</p>
                    <p><FaBriefcase /> {person.role || 'No role'}</p>
                  </div>
                  
                  <div className="person-skills">
                    <h5>Skills:</h5>
                    <div className="skill-tags">
                      {person.skills && person.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill.name} <small>({skill.proficiency})</small>
                        </span>
                      ))}
                      {(!person.skills || person.skills.length === 0) && (
                        <span className="no-skills">No skills assigned</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="person-match-score">
                    <div className="match-indicator">
                      <div className="match-bar">
                        <div 
                          className="match-fill"
                          style={{ 
                            width: `${Math.min(100, (person.skills?.length || 0) * 20)}%`,
                            backgroundColor: (person.skills?.length || 0) >= 3 ? '#06d6a0' : '#ffd166'
                          }}
                        ></div>
                      </div>
                      <span>{person.skills?.length || 0} skills</span>
                    </div>
                  </div>
                  
                  <div className="person-actions">
                    <a href={`/personnel/${person.id}`} className="btn btn-sm btn-primary">
                      View Profile
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
