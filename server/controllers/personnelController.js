const db = require('../config/database');

// Get all personnel
exports.getAllPersonnel = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(s.name, ':', ps.proficiency)) as skills
       FROM personnel p
       LEFT JOIN personnel_skills ps ON p.id = ps.personnel_id
       LEFT JOIN skills s ON ps.skill_id = s.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    
    // Parse skills string into array
    const personnel = rows.map(person => ({
      ...person,
      skills: person.skills ? 
        person.skills.split(',').map(skill => {
          const [name, proficiency] = skill.split(':');
          return { name, proficiency };
        }) : []
    }));
    
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single personnel
exports.getPersonnelById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(s.id, ':', s.name, ':', ps.proficiency)) as skills
       FROM personnel p
       LEFT JOIN personnel_skills ps ON p.id = ps.personnel_id
       LEFT JOIN skills s ON ps.skill_id = s.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Personnel not found' });
    }
    
    const person = {
      ...rows[0],
      skills: rows[0].skills ? 
        rows[0].skills.split(',').map(skill => {
          const [id, name, proficiency] = skill.split(':');
          return { id: parseInt(id), name, proficiency };
        }) : []
    };
    
    res.json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new personnel
exports.createPersonnel = async (req, res) => {
  const { name, email, role, experience_level } = req.body;
  
  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  try {
    const [result] = await db.execute(
      'INSERT INTO personnel (name, email, role, experience_level) VALUES (?, ?, ?, ?)',
      [name, email, role, experience_level]
    );
    
    const [newPerson] = await db.execute(
      'SELECT * FROM personnel WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newPerson[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update personnel
exports.updatePersonnel = async (req, res) => {
  try {
    const { name, email, role, experience_level } = req.body;
    
    const [result] = await db.execute(
      'UPDATE personnel SET name = ?, email = ?, role = ?, experience_level = ? WHERE id = ?',
      [name, email, role, experience_level, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Personnel not found' });
    }
    
    const [updatedPerson] = await db.execute(
      'SELECT * FROM personnel WHERE id = ?',
      [req.params.id]
    );
    
    res.json(updatedPerson[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete personnel
exports.deletePersonnel = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM personnel WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Personnel not found' });
    }
    
    res.json({ message: 'Personnel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign skill to personnel
exports.assignSkill = async (req, res) => {
  const { personnel_id, skill_id, proficiency } = req.body;
  
  if (!personnel_id || !skill_id || !proficiency) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    await db.execute(
      'INSERT INTO personnel_skills (personnel_id, skill_id, proficiency) VALUES (?, ?, ?)',
      [personnel_id, skill_id, proficiency]
    );
    
    res.status(201).json({ message: 'Skill assigned successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Skill already assigned to this person' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Remove skill from personnel
exports.removeSkill = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM personnel_skills WHERE personnel_id = ? AND skill_id = ?',
      [req.params.personnelId, req.params.skillId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Skill assignment not found' });
    }
    
    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};