import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsAPI, skillsAPI } from '../../services/apiEndpoints';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Planning',
    required_skills: []
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({
    skill_id: '',
    min_proficiency: 'Intermediate'
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSkills();
    if (isEditMode) {
      fetchProject();
    }
  }, [id]);

  const fetchSkills = async () => {
    try {
      const response = await skillsAPI.getAll();
      setSkills(response.data);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    }
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (!newSkill.skill_id) {
      alert('Please select a skill');
      return;
    }

    const skill = skills.find(s => s.id === parseInt(newSkill.skill_id));
    if (!skill) return;

    // Check if skill already added
    if (formData.required_skills.some(s => s.skill_id === parseInt(newSkill.skill_id))) {
      alert('This skill is already added to requirements');
      return;
    }

    setFormData(prev => ({
      ...prev,
      required_skills: [
        ...prev.required_skills,
        {
          skill_id: parseInt(newSkill.skill_id),
          min_proficiency: newSkill.min_proficiency,
          name: skill.name
        }
      ]
    }));

    setNewSkill({ skill_id: '', min_proficiency: 'Intermediate' });
  };

  const handleRemoveSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s.skill_id !== skillId)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return false;
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        setError('End date cannot be before start date');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError(null);

      // Prepare data for API
      const projectData = {
        ...formData,
        required_skills: formData.required_skills.map(skill => ({
          skill_id: skill.skill_id,
          min_proficiency: skill.min_proficiency
        }))
      };

      if (isEditMode) {
        await projectsAPI.update(id, projectData);
        setSuccess('Project updated successfully!');
      } else {
        await projectsAPI.create(projectData);
        setSuccess('Project created successfully!');
      }
      
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const getSkillName = (skillId) => {
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.name : `Skill ${skillId}`;
  };

  if (loading) return <LoadingSpinner text="Loading project data..." />;

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>
          {isEditMode ? 'Edit Project' : 'Create New Project'}
        </h2>
        <button 
          onClick={() => navigate('/projects')}
          className="btn btn-secondary"
        >
          <FaTimes /> Cancel
        </button>
      </div>

      {error && <ErrorAlert message={error} />}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the project scope, objectives, and requirements..."
            rows="4"
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">End Date</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Required Skills Section */}
        <div className="required-skills-section">
          <h3>Required Skills</h3>
          <p className="section-help">Add skills required for this project with minimum proficiency levels.</p>
          
          <div className="add-skill-form">
            <div className="form-row">
              <div className="form-group">
                <label>Select Skill:</label>
                <select
                  value={newSkill.skill_id}
                  onChange={(e) => setNewSkill({...newSkill, skill_id: e.target.value})}
                  className="form-select"
                >
                  <option value="">Choose a skill...</option>
                  {skills.map(skill => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Min Proficiency:</label>
                <select
                  value={newSkill.min_proficiency}
                  onChange={(e) => setNewSkill({...newSkill, min_proficiency: e.target.value})}
                  className="form-select"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="form-group">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddSkill}
                >
                  <FaPlus /> Add Skill
                </button>
              </div>
            </div>
          </div>

          {/* Skills List */}
          {formData.required_skills.length > 0 ? (
            <div className="skills-list">
              {formData.required_skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">{getSkillName(skill.skill_id)}</span>
                    <span className="min-proficiency">
                      Min: <strong>{skill.min_proficiency}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.skill_id)}
                    className="btn btn-sm btn-danger"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-skills">
              <p>No skills added yet. Skills help match the right personnel to this project.</p>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <LoadingSpinner size="small" text="Saving..." />
            ) : (
              <>
                <FaSave />
                {isEditMode ? 'Update Project' : 'Create Project'}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="form-help">
        <h4>💡 Tips for Project Creation</h4>
        <ul>
          <li>Be specific with project names for easy identification</li>
          <li>Set realistic start and end dates for better resource planning</li>
          <li>Add all required skills to ensure proper personnel matching</li>
          <li>Update status regularly to reflect current project state</li>
          <li>Use descriptions to provide context for team members</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectForm;
