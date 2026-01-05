const db = require('../config/database');

// Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM skills ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new skill
exports.createSkill = async (req, res) => {
  const { name, category, description } = req.body;
  
  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required' });
  }
  
  try {
    const [result] = await db.execute(
      'INSERT INTO skills (name, category, description) VALUES (?, ?, ?)',
      [name, category, description]
    );
    
    const [newSkill] = await db.execute(
      'SELECT * FROM skills WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newSkill[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update skill
exports.updateSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    
    const [result] = await db.execute(
      'UPDATE skills SET name = ?, category = ?, description = ? WHERE id = ?',
      [name, category, description, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    const [updatedSkill] = await db.execute(
      'SELECT * FROM skills WHERE id = ?',
      [req.params.id]
    );
    
    res.json(updatedSkill[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM skills WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};