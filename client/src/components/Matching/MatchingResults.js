import React from 'react';
import { FaUser, FaStar, FaCheck, FaTimes, FaPercentage } from 'react-icons/fa';

const MatchingResults = ({ project, matches, filters }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="no-matches">
        <h3>No matches found</h3>
        <p>Try adjusting your filters or add more skills to personnel.</p>
      </div>
    );
  }

  const getProficiencyColor = (proficiency) => {
    switch(proficiency) {
      case 'Beginner': return 'proficiency-beginner';
      case 'Intermediate': return 'proficiency-intermediate';
      case 'Advanced': return 'proficiency-advanced';
      case 'Expert': return 'proficiency-expert';
      default: return '';
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'match-excellent';
    if (percentage >= 70) return 'match-good';
    if (percentage >= 50) return 'match-fair';
    return 'match-poor';
  };

  return (
    <div className="matching-results">
      <div className="results-header">
        <h3>
          Matching Results for: <strong>{project.name}</strong>
        </h3>
        <div className="results-stats">
          <span className="stat">
            <FaUser /> {matches.length} matches found
          </span>
          <span className="stat">
            <FaPercentage /> Min: {filters.minMatchPercentage}%
          </span>
        </div>
      </div>

      <div className="project-requirements">
        <h4>Project Requirements:</h4>
        <div className="requirements-list">
          {project.required_skills?.map((skill, index) => (
            <span key={index} className="requirement-tag">
              {skill.name} (Min: {skill.min_proficiency})
            </span>
          ))}
          {(!project.required_skills || project.required_skills.length === 0) && (
            <p>No specific requirements set for this project</p>
          )}
        </div>
      </div>

      <div className="matches-list">
        {matches.map((person) => (
          <div key={person.id} className="match-card">
            <div className="match-card-header">
              <div className="person-info">
                <div className="avatar">
                  <FaUser />
                </div>
                <div>
                  <h4>{person.name}</h4>
                  <p className="person-role">{person.role}</p>
                  <span className={`experience-badge ${person.experience_level.toLowerCase()}`}>
                    {person.experience_level}
                  </span>
                </div>
              </div>
              
              <div className={`match-score ${getMatchColor(person.match_percentage)}`}>
                <div className="score-value">
                  <FaPercentage />
                  {person.match_percentage}%
                </div>
                <div className="score-label">
                  {person.meets_all_requirements ? 'Perfect Match' : 'Partial Match'}
                </div>
              </div>
            </div>
            
            <div className="match-card-body">
              <div className="skills-match">
                <h5>Skills Match Analysis:</h5>
                <div className="skills-grid">
                  {person.matched_skills.map((skill, index) => (
                    <div key={index} className="skill-match-item">
                      <div className="skill-name">{skill.skill}</div>
                      <div className="skill-requirements">
                        <span className="required">
                          Required: <strong>{skill.required}</strong>
                        </span>
                        <span className="actual">
                          Actual: 
                          <strong className={getProficiencyColor(skill.actual)}>
                            {skill.actual}
                          </strong>
                        </span>
                      </div>
                      <div className="skill-status">
                        {skill.meets_requirement ? (
                          <span className="status-success">
                            <FaCheck /> Meets requirement
                          </span>
                        ) : (
                          <span className="status-warning">
                            <FaTimes /> Below requirement
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {person.missing_skills && person.missing_skills.length > 0 && (
                <div className="missing-skills">
                  <h5>Missing Skills:</h5>
                  <div className="missing-tags">
                    {person.missing_skills.map((skill, index) => (
                      <span key={index} className="missing-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="match-card-footer">
              <div className="match-actions">
                <button className="btn btn-primary">
                  View Profile
                </button>
                <button className="btn btn-success">
                  Assign to Project
                </button>
                <button className="btn btn-secondary">
                  Contact
                </button>
              </div>
              
              <div className="match-details">
                <span className="detail">
                  <FaStar /> Skills: {person.matched_skills.length}
                </span>
                <span className="detail">
                  Email: {person.email}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="results-summary">
        <h4>Summary</h4>
        <div className="summary-stats">
          <div className="summary-stat">
            <h5>Perfect Matches</h5>
            <p>{matches.filter(m => m.meets_all_requirements).length}</p>
          </div>
          <div className="summary-stat">
            <h5>Average Match %</h5>
            <p>
              {Math.round(
                matches.reduce((acc, m) => acc + m.match_percentage, 0) / matches.length
              )}%
            </p>
          </div>
          <div className="summary-stat">
            <h5>Top Match</h5>
            <p>{matches[0]?.name} ({matches[0]?.match_percentage}%)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingResults;



