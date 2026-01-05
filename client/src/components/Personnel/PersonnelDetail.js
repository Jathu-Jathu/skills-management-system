import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { personnelAPI } from '../../services/apiEndpoints';

import { 
  FaUser, 
  FaEnvelope, 
  FaBriefcase, 
  FaCalendar,
  FaStar,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaTools,
  FaCheckCircle
} from 'react-icons/fa';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';

const PersonnelDetail = () => {
  const { id } = useParams();
  const [personnel, setPersonnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillForm, setSkillForm] = useState({
    skill_id: '',
    proficiency: 'Intermediate'
  });
  const [allSkills, setAllSkills] = useState([]);
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    fetchPersonnel();
    fetchAllSkills();
  }, [id]);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const response = await personnelAPI.getById(id);
      setPersonnel(response.data);
    } catch (err) {
      setError('Failed to fetch personnel details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSkills = async () => {
    try {
      const response = await personnelAPI.getAll();
      // Extract unique skills from all personnel
      const skillsSet = new Set();
      response.data.forEach(person => {
        if (person.skills) {
          person.skills.forEach(skill => {
            skillsSet.add(JSON.stringify(skill));
          });
        }
      });
      setAllSkills(Array.from(skillsSet).map(s => JSON.parse(s)));
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this personnel?')) {
      try {
        await personnelAPI.delete(id);
        window.location.href = '/personnel';
      } catch (err) {
        setError('Failed to delete personnel');
      }
    }
  };

  const handleAssignSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.skill_id) {
      alert('Please select a skill');
      return;
    }

    try {
      setAddingSkill(true);
      await personnelAPI.assignSkill(id, {
        personnel_id: parseInt(id),
        skill_id: parseInt(skillForm.skill_id),
        proficiency: skillForm.proficiency
      });
      
      setSkillForm({ skill_id: '', proficiency: 'Intermediate' });
      fetchPersonnel(); // Refresh data
      alert('Skill assigned successfully!');
    } catch (err) {
      setError('Failed to assign skill');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (window.confirm('Are you sure you want to remove this skill?')) {
      try {
        await personnelAPI.removeSkill(id, skillId);
        fetchPersonnel(); // Refresh data
      } catch (err) {
        setError('Failed to remove skill');
      }
    }
  };

  const getProficiencyColor = (proficiency) => {
    switch(proficiency) {
      case 'Beginner': return 'proficiency-beginner';
      case 'Intermediate': return 'proficiency-intermediate';
      case 'Advanced': return 'proficiency-advanced';
      case 'Expert': return 'proficiency-expert';
      default: return '';
    }
  };

  const getExperienceColor = (level) => {
    switch(level) {
      case 'Junior': return 'junior';
      case 'Mid-Level': return 'mid-level';
      case 'Senior': return 'senior';
      default: return '';
    }
  };

  if (loading) return <LoadingSpinner text="Loading personnel details..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchPersonnel} />;
  if (!personnel) return <div>No personnel data found.</div>;

  // Get skills that are not already assigned
  const assignedSkillIds = personnel.skills?.map(s => s.id) || [];
  const availableSkills = allSkills.filter(skill => 
    !assignedSkillIds.includes(skill.id)
  );

  return (
    <div className="personnel-detail">
      <div className="detail-header">
        <Link to="/personnel" className="btn btn-secondary">
          <FaArrowLeft /> Back to List
        </Link>
        <div className="header-actions">
          <Link to={`/personnel/${id}/edit`} className="btn btn-primary">
            <FaEdit /> Edit Profile
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-large">
              <FaUser />
            </div>
            <div className="profile-info">
              <h1>{personnel.name}</h1>
              <div className="profile-meta">
                <span className="profile-email">
                  <FaEnvelope /> {personnel.email}
                </span>
                <span className="profile-role">
                  <FaBriefcase /> {personnel.role || 'No role specified'}
                </span>
                <span className={`experience-badge ${getExperienceColor(personnel.experience_level)}`}>
                  {personnel.experience_level}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <h3>{personnel.skills?.length || 0}</h3>
              <p>Total Skills</p>
            </div>
            <div className="stat-item">
              <h3>
                {personnel.skills?.filter(s => s.proficiency === 'Expert').length || 0}
              </h3>
              <p>Expert Skills</p>
            </div>
            <div className="stat-item">
              <h3>
                {new Date(personnel.created_at).toLocaleDateString()}
              </h3>
              <p>Member Since</p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="skills-section">
          <div className="section-header">
            <h2><FaTools /> Skills & Proficiencies</h2>
            {availableSkills.length > 0 && (
              <button 
                className="btn btn-primary"
                onClick={() => document.getElementById('skillForm').scrollIntoView()}
              >
                <FaCheckCircle /> Add Skill
              </button>
            )}
          </div>

          {personnel.skills && personnel.skills.length > 0 ? (
            <div className="skills-grid">
              {personnel.skills.map((skill, index) => (
                <div key={index} className="skill-card">
                  <div className="skill-card-header">
                    <h3>{skill.name}</h3>
                    <span className={`proficiency-badge ${getProficiencyColor(skill.proficiency)}`}>
                      {skill.proficiency}
                    </span>
                  </div>
                  <div className="skill-card-body">
                    <div className="proficiency-indicator">
                      <div className="proficiency-bar">
                        <div 
                          className="proficiency-fill"
                          style={{
                            width: skill.proficiency === 'Beginner' ? '25%' :
                                   skill.proficiency === 'Intermediate' ? '50%' :
                                   skill.proficiency === 'Advanced' ? '75%' : '100%',
                            backgroundColor: getProficiencyColor(skill.proficiency)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="skill-card-footer">
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-skills">
              <p>No skills assigned yet. Add skills to help match this person to projects.</p>
            </div>
          )}

          {/* Add Skill Form */}
          {availableSkills.length > 0 && (
            <div id="skillForm" className="add-skill-form">
              <h3>Add New Skill</h3>
              <form onSubmit={handleAssignSkill}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Skill:</label>
                    <select
                      value={skillForm.skill_id}
                      onChange={(e) => setSkillForm({...skillForm, skill_id: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="">Choose a skill...</option>
                      {availableSkills.map(skill => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Proficiency Level:</label>
                    <select
                      value={skillForm.proficiency}
                      onChange={(e) => setSkillForm({...skillForm, proficiency: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={addingSkill}
                    >
                      {addingSkill ? 'Adding...' : 'Add Skill'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <h2><FaCalendar /> Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon success">
                <FaCheckCircle />
              </div>
              <div className="activity-content">
                <p>Profile created</p>
                <small>{new Date(personnel.created_at).toLocaleString()}</small>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon info">
                <FaTools />
              </div>
              <div className="activity-content">
                <p>{personnel.skills?.length || 0} skills assigned</p>
                <small>Last updated: Today</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelDetail;