const db = require('../config/database');

// Proficiency level mapping for comparison
const proficiencyLevels = {
  'Beginner': 1,
  'Intermediate': 2,
  'Advanced': 3,
  'Expert': 4
};

// Get personnel matching for a project
exports.getMatchingPersonnel = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get project requirements
    const [projectRows] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(s.id, ':', s.name, ':', prs.min_proficiency)) as required_skills
       FROM projects p
       LEFT JOIN project_required_skills prs ON p.id = prs.project_id
       LEFT JOIN skills s ON prs.skill_id = s.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [projectId]
    );
    
    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = projectRows[0];
    const requiredSkills = project.required_skills ? 
      project.required_skills.split(',').map(skill => {
        const [id, name, min_proficiency] = skill.split(':');
        return { 
          id: parseInt(id), 
          name, 
          min_proficiency,
          min_level: proficiencyLevels[min_proficiency] 
        };
      }) : [];
    
    // If no skills required, return all personnel
    if (requiredSkills.length === 0) {
      const [allPersonnel] = await db.execute(
        'SELECT * FROM personnel ORDER BY name'
      );
      
      return res.json({
        project,
        matches: allPersonnel.map(person => ({
          ...person,
          matched_skills: [],
          match_percentage: 0,
          missing_skills: []
        }))
      });
    }
    
    // Get all personnel with their skills
    const [personnelRows] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(s.id, ':', s.name, ':', ps.proficiency)) as skills
       FROM personnel p
       LEFT JOIN personnel_skills ps ON p.id = ps.personnel_id
       LEFT JOIN skills s ON ps.skill_id = s.id
       GROUP BY p.id`
    );
    
    const matches = [];
    
    // Calculate match for each person
    for (const person of personnelRows) {
      const personSkills = person.skills ? 
        person.skills.split(',').map(skill => {
          const [id, name, proficiency] = skill.split(':');
          return { 
            id: parseInt(id), 
            name, 
            proficiency,
            level: proficiencyLevels[proficiency] 
          };
        }) : [];
      
      // Check which required skills the person has
      const matchedSkills = [];
      const missingSkills = [];
      
      for (const requiredSkill of requiredSkills) {
        const personSkill = personSkills.find(ps => ps.id === requiredSkill.id);
        
        if (personSkill && personSkill.level >= requiredSkill.min_level) {
          matchedSkills.push({
            skill: requiredSkill.name,
            required: requiredSkill.min_proficiency,
            actual: personSkill.proficiency,
            meets_requirement: true
          });
        } else if (personSkill) {
          matchedSkills.push({
            skill: requiredSkill.name,
            required: requiredSkill.min_proficiency,
            actual: personSkill.proficiency,
            meets_requirement: false
          });
          missingSkills.push(requiredSkill.name);
        } else {
          missingSkills.push(requiredSkill.name);
        }
      }
      
      // Calculate match percentage
      const matchPercentage = (matchedSkills.filter(ms => ms.meets_requirement).length / requiredSkills.length) * 100;
      
      // Only include if person has at least one matching skill
      if (matchedSkills.length > 0) {
        matches.push({
          ...person,
          matched_skills: matchedSkills,
          match_percentage: Math.round(matchPercentage),
          missing_skills: missingSkills,
          meets_all_requirements: missingSkills.length === 0
        });
      }
    }
    
    // Sort by match percentage (highest first)
    matches.sort((a, b) => b.match_percentage - a.match_percentage);
    
    res.json({
      project: {
        ...project,
        required_skills: requiredSkills.map(rs => ({
          name: rs.name,
          min_proficiency: rs.min_proficiency
        }))
      },
      matches
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search personnel by skills
exports.searchPersonnelBySkills = async (req, res) => {
  try {
    const { skills } = req.query;
    
    if (!skills) {
      return res.status(400).json({ error: 'Skills parameter is required' });
    }
    
    const skillIds = skills.split(',').map(id => parseInt(id));
    
    // Get personnel with all specified skills
    const [rows] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(s.id, ':', s.name, ':', ps.proficiency)) as skills
       FROM personnel p
       INNER JOIN personnel_skills ps ON p.id = ps.personnel_id
       INNER JOIN skills s ON ps.skill_id = s.id
       WHERE s.id IN (?)
       GROUP BY p.id
       HAVING COUNT(DISTINCT s.id) = ?`,
      [skillIds, skillIds.length]
    );
    
    const personnel = rows.map(person => ({
      ...person,
      skills: person.skills ? 
        person.skills.split(',').map(skill => {
          const [id, name, proficiency] = skill.split(':');
          return { id: parseInt(id), name, proficiency };
        }) : []
    }));
    
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};