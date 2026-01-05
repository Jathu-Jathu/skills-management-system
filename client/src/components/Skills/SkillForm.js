import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { skillsAPI } from '../../services/apiEndpoints';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const SkillForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Programming Language',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const categories = [
    'Programming Language',
    'Framework',
    'Tool',
    'Soft Skill',
    'Database',
    'Cloud'
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchSkill();
    }
  }, [id]);

  const fetchSkill = async () => {
    try {
      setLoading(true);
      const response = await skillsAPI.getById(id);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch skill data');
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Skill name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      if (isEditMode) {
        await skillsAPI.update(id, formData);
        setSuccess('Skill updated successfully!');
      } else {
        await skillsAPI.create(formData);
        setSuccess('Skill created successfully!');
      }
      
      setTimeout(() => {
        navigate('/skills');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save skill');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading skill data..." />;

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>
          {isEditMode ? 'Edit Skill' : 'Create New Skill'}
        </h2>
        <button 
          onClick={() => navigate('/skills')}
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

      <form onSubmit={handleSubmit} className="skill-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Skill Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter skill name (e.g., React, Python, AWS)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the skill, its applications, or any important details..."
            rows="4"
          />
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
                {isEditMode ? <FaSave /> : <FaPlus />}
                {isEditMode ? 'Update Skill' : 'Create Skill'}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="form-help">
        <h4>💡 Tips for Skill Creation</h4>
        <ul>
          <li>Use clear, specific names (e.g., "React.js" instead of just "React")</li>
          <li>Choose the most appropriate category for better organization</li>
          <li>Add descriptions to help team members understand skill requirements</li>
          <li>Check if a similar skill already exists to avoid duplicates</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillForm;

