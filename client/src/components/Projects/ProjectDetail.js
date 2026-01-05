import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, matchingAPI } from '../../services/apiEndpoints';
import { format } from 'date-fns';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import { 
  FaCalendar,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaUsers,
  FaCheckCircle,
  FaPlayCircle,
  FaClock,
  FaChartLine,
  FaTools
} from 'react-icons/fa';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id);
      setProject(response.data);
    } catch (err) {
      setError('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setMatchLoading(true);
      const response = await matchingAPI.getMatchingPersonnel(id);
      setMatches(response.data.matches || []);
    } catch (err) {
      setError('Failed to fetch matching personnel');
    } finally {
      setMatchLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        window.location.href = '/projects';
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM dd, yyyy');
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

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'match-excellent';
    if (percentage >= 70) return 'match-good';
    if (percentage >= 50) return 'match-fair';
    return 'match-poor';
  };

  useEffect(() => {
    if (activeTab === 'matching' && matches.length === 0) {
      fetchMatches();
    }
  }, [activeTab]);

  if (loading) return <LoadingSpinner text="Loading project details..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchProject} />;
  if (!project) return <div>No project data found.</div>;

  return (
    <div className="project-detail">
      <div className="detail-header">
        <Link to="/projects" className="btn btn-secondary">
          <FaArrowLeft /> Back to Projects
        </Link>
        <div className="header-actions">
          <Link to={`/matching?project=${id}`} className="btn btn-primary">
            <FaChartLine /> Find Matches
          </Link>
          <Link to={`/projects/${id}/edit`} className="btn btn-info">
            <FaEdit /> Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      <div className="project-overview">
        <div className="project-header">
          <div className="project-title">
            <h1>{project.name}</h1>
            <div className="project-status">
              {getStatusIcon(project.status)}
              <span className={`status-badge ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
          </div>
          
          {project.description && (
            <p className="project-description">{project.description}</p>
          )}

          <div className="project-meta">
            <div className="meta-item">
              <FaCalendar />
              <div>
                <strong>Start Date</strong>
                <p>{formatDate(project.start_date)}</p>
              </div>
            </div>
            <div className="meta-item">
              <FaCalendar />
              <div>
                <strong>End Date</strong>
                <p>{formatDate(project.end_date)}</p>
              </div>
            </div>
            <div className="meta-item">
              <div>
                <strong>Created</strong>
                <p>{formatDate(project.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="project-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <FaTools /> Required Skills
          </button>
          <button 
            className={`tab-btn ${activeTab === 'matching' ? 'active' : ''}`}
            onClick={() => setActiveTab('matching')}
          >
            <FaUsers /> Matching Personnel
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{project.required_skills?.length || 0}</h3>
                  <p>Required Skills</p>
                </div>
                <div className="stat-card">
                  <h3>
                    {matches.filter(m => m.meets_all_requirements).length}
                  </h3>
                  <p>Perfect Matches</p>
                </div>
                <div className="stat-card">
                  <h3>
                    {project.status}
                  </h3>
                  <p>Current Status</p>
                </div>
              </div>

              <div className="project-timeline">
                <h3>Project Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">
                      {formatDate(project.start_date) || 'TBD'}
                    </div>
                    <div className="timeline-content">
                      <h4>Project Start</h4>
                      <p>Planned start date</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">
                      {formatDate(project.end_date) || 'TBD'}
                    </div>
                    <div className="timeline-content">
                      <h4>Project End</h4>
                      <p>Planned completion date</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="skills-content">
              <h3>Required Skills & Proficiency</h3>
              {project.required_skills && project.required_skills.length > 0 ? (
                <div className="skills-grid">
                  {project.required_skills.map((skill, index) => (
                    <div key={index} className="skill-requirement-card">
                      <div className="skill-header">
                        <h4>{skill.name}</h4>
                        <span className="min-proficiency">
                          Min: <strong>{skill.min_proficiency}</strong>
                        </span>
                      </div>
                      <div className="proficiency-bar">
                        <div 
                          className="proficiency-fill"
                          style={{
                            width: skill.min_proficiency === 'Beginner' ? '25%' :
                                   skill.min_proficiency === 'Intermediate' ? '50%' :
                                   skill.min_proficiency === 'Advanced' ? '75%' : '100%',
                            backgroundColor: '#4361ee'
                          }}
                        ></div>
                      </div>
                      <div className="skill-help">
                        <small>
                          Personnel must have this skill at {skill.min_proficiency} level or higher
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-skills">
                  <p>No specific skills required for this project.</p>
                  <Link to={`/projects/${id}/edit`} className="btn btn-primary">
                    <FaTools /> Add Required Skills
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'matching' && (
            <div className="matching-content">
              <div className="matching-header">
                <h3>Matching Personnel</h3>
                <button 
                  onClick={fetchMatches}
                  className="btn btn-primary"
                  disabled={matchLoading}
                >
                  {matchLoading ? 'Loading...' : 'Refresh Matches'}
                </button>
              </div>

              {matchLoading ? (
                <LoadingSpinner text="Finding matching personnel..." />
              ) : matches.length > 0 ? (
                <div className="matches-list">
                  {matches.map((person, index) => (
                    <div key={index} className="match-card">
                      <div className="match-header">
                        <div className="person-info">
                          <h4>{person.name}</h4>
                          <p className="person-role">{person.role}</p>
                          <span className={`experience-badge ${person.experience_level.toLowerCase()}`}>
                            {person.experience_level}
                          </span>
                        </div>
                        <div className={`match-score ${getMatchColor(person.match_percentage)}`}>
                          <div className="score-value">
                            {person.match_percentage}%
                          </div>
                          <div className="score-label">
                            {person.meets_all_requirements ? 'Perfect Match' : 'Partial Match'}
                          </div>
                        </div>
                      </div>

                      <div className="match-details">
                        <div className="skills-match">
                          <h5>Skills Match:</h5>
                          <div className="matched-skills">
                            {person.matched_skills?.map((skill, idx) => (
                              <span key={idx} className={`skill-tag ${skill.meets_requirement ? 'match-success' : 'match-warning'}`}>
                                {skill.skill} ({skill.actual})
                              </span>
                            ))}
                          </div>
                        </div>

                        {person.missing_skills && person.missing_skills.length > 0 && (
                          <div className="missing-skills">
                            <h5>Missing Skills:</h5>
                            <div className="missing-tags">
                              {person.missing_skills.map((skill, idx) => (
                                <span key={idx} className="missing-tag">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="match-actions">
                          <Link 
                            to={`/personnel/${person.id}`}
                            className="btn btn-sm btn-primary"
                          >
                            View Profile
                          </Link>
                          <button className="btn btn-sm btn-success">
                            Assign to Project
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-matches">
                  <p>No matching personnel found. Try adjusting skill requirements or check personnel skills.</p>
                  <button 
                    onClick={fetchMatches}
                    className="btn btn-primary"
                  >
                    Find Matches
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
