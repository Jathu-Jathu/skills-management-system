import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../../services/apiEndpoints';
import { format } from 'date-fns';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import SearchBar from '../Common/SearchBar';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCalendar,
  FaCheckCircle,
  FaPlayCircle,
  FaClock
} from 'react-icons/fa';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, statusFilter, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Planning': return <FaClock className="status-planning" />;
      case 'Active': return <FaPlayCircle className="status-active" />;
      case 'Completed': return <FaCheckCircle className="status-completed" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Planning': return 'planning';
      case 'Active': return 'active';
      case 'Completed': return 'completed';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} onRetry={fetchProjects} />;

  return (
    <div className="projects-list">
      <div className="list-header">
        <h2>Projects</h2>
        <Link to="/projects/new" className="btn btn-primary">
          <FaPlus /> New Project
        </Link>
      </div>

      <div className="filters-container">
        <SearchBar 
          onSearch={setSearchTerm}
          placeholder="      Search projects by name or description..."
        />
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-card-header">
              <div className="project-status">
                {getStatusIcon(project.status)}
                <span className={`status-badge ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="project-actions">
                <Link 
                  to={`/projects/${project.id}`}
                  className="btn btn-sm btn-info"
                >
                  <FaEdit /> Edit
                </Link>
                <Link 
                  to={`/matching?project=${project.id}`}
                  className="btn btn-sm btn-primary"
                >
                  Find Matches
                </Link>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="btn btn-sm btn-danger"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className="project-card-body">
              <h3>{project.name}</h3>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}
              
              <div className="project-dates">
                <div className="date-info">
                  <FaCalendar />
                  <span>Start: {formatDate(project.start_date)}</span>
                </div>
                <div className="date-info">
                  <FaCalendar />
                  <span>End: {formatDate(project.end_date)}</span>
                </div>
              </div>
              
              <div className="project-skills">
                <h4>Required Skills:</h4>
                {project.required_skills && project.required_skills.length > 0 ? (
                  <div className="skills-tags">
                    {project.required_skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill.name} ({skill.min_proficiency})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="no-skills">No skills specified</p>
                )}
              </div>
            </div>
            
            <div className="project-card-footer">
              <span className="project-id">ID: {project.id}</span>
              <span className="project-created">
                Created: {format(new Date(project.created_at), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <FaCalendar size={48} />
          <h3>No projects found</h3>
          <p>Try adjusting your search or create a new project.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
