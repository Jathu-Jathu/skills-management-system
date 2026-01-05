import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { personnelAPI } from '../../services/apiEndpoints';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import { FaSave, FaTimes, FaUserPlus } from 'react-icons/fa';

const PersonnelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    experience_level: 'Mid-Level'
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchPersonnel();
    }
  }, [id]);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const response = await personnelAPI.getById(id);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch personnel data');
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
      setError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
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
        await personnelAPI.update(id, formData);
        setSuccess('Personnel updated successfully!');
      } else {
        await personnelAPI.create(formData);
        setSuccess('Personnel created successfully!');
      }
      
      setTimeout(() => {
        navigate('/personnel');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save personnel');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>
          {isEditMode ? 'Edit Personnel' : 'Add New Personnel'}
        </h2>
        <button 
          onClick={() => navigate('/personnel')}
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

      <form onSubmit={handleSubmit} className="personnel-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role/Title</label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g., Frontend Developer"
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience_level">Experience Level</label>
            <select
              id="experience_level"
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
            >
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
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
                {isEditMode ? <FaSave /> : <FaUserPlus />}
                {isEditMode ? 'Update Personnel' : 'Create Personnel'}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="form-help">
        <h4>💡 Tips</h4>
        <ul>
          <li>All fields marked with * are required</li>
          <li>Use official email addresses for better tracking</li>
          <li>Experience level helps in matching with project requirements</li>
        </ul>
      </div>
    </div>
  );
};

export default PersonnelForm;