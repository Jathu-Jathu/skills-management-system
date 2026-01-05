import React, { useState, useEffect } from 'react';
import { projectsAPI, matchingAPI } from '../../services/apiEndpoints';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import MatchingResults from './MatchingResults';
import { FaSearch, FaFilter, FaChartLine } from 'react-icons/fa';

const MatchingForm = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [matchingResults, setMatchingResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    minMatchPercentage: 50,
    experienceLevel: 'all',
    onlyPerfectMatches: false
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
    }
  };

  const handleFindMatches = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await matchingAPI.getMatchingPersonnel(selectedProject);
      setMatchingResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const filteredMatches = matchingResults?.matches ? 
    matchingResults.matches.filter(match => {
      // Filter by match percentage
      if (match.match_percentage < filters.minMatchPercentage) return false;
      
      // Filter by experience level
      if (filters.experienceLevel !== 'all' && 
          match.experience_level !== filters.experienceLevel) {
        return false;
      }
      
      // Filter for perfect matches only
      if (filters.onlyPerfectMatches && !match.meets_all_requirements) {
        return false;
      }
      
      return true;
    }) : [];

  return (
    <div className="matching-container">
      <div className="matching-header">
        <h2><FaChartLine /> Smart Personnel Matching</h2>
        <p>Find the best team members for your projects based on skills and requirements</p>
      </div>

      <div className="matching-controls">
        <div className="matching-form">
          <div className="form-group">
            <label>Select Project:</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="form-select"
            >
              <option value="">Choose a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFindMatches}
            disabled={!selectedProject || loading}
            className="btn btn-primary btn-lg"
          >
            {loading ? (
              <LoadingSpinner size="small" text="Finding matches..." />
            ) : (
              <>
                <FaSearch /> Find Best Matches
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-secondary"
          >
            <FaFilter /> {showAdvanced ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-filters">
            <h4>Advanced Filters</h4>
            <div className="filter-grid">
              <div className="form-group">
                <label>Minimum Match %:</label>
                <input
                  type="range"
                  name="minMatchPercentage"
                  min="0"
                  max="100"
                  value={filters.minMatchPercentage}
                  onChange={handleFilterChange}
                />
                <span>{filters.minMatchPercentage}%</span>
              </div>

              <div className="form-group">
                <label>Experience Level:</label>
                <select
                  name="experienceLevel"
                  value={filters.experienceLevel}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Levels</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="onlyPerfectMatches"
                    checked={filters.onlyPerfectMatches}
                    onChange={handleFilterChange}
                  />
                  Show only perfect matches
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <ErrorAlert message={error} />}

      {matchingResults && (
        <MatchingResults 
          project={matchingResults.project}
          matches={filteredMatches}
          filters={filters}
        />
      )}

      {!matchingResults && (
        <div className="matching-guide">
          <div className="guide-card">
            <h3>How It Works</h3>
            <ol>
              <li>Select a project from the dropdown</li>
              <li>Click "Find Best Matches" to analyze personnel skills</li>
              <li>Review match results with proficiency levels</li>
              <li>Use filters to refine your search</li>
            </ol>
          </div>
          
          <div className="stats-card">
            <h3>Matching Algorithm</h3>
            <p>The system matches personnel based on:</p>
            <ul>
              <li>✅ Required skills for the project</li>
              <li>✅ Minimum proficiency levels</li>
              <li>✅ Experience level consideration</li>
              <li>✅ All skill requirements must be met</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingForm;