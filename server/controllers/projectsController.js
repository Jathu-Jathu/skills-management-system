const db = require('../config/database');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(s.name, ':', prs.min_proficiency)) as required_skills
       FROM projects p
       LEFT JOIN project_required_skills prs ON p.id = prs.project_id
       LEFT JOIN skills s ON prs.skill_id = s.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    
    const projects = rows.map(project => ({
      ...project,
      required_skills: project.required_skills ? 
        project.required_skills.split(',').map(skill => {
          const [name, min_proficiency] = skill.split(':');
          return { name, min_proficiency };
        }) : []
    }));
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(s.id, ':', s.name, ':', prs.min_proficiency)) as required_skills
       FROM projects p
       LEFT JOIN project_required_skills prs ON p.id = prs.project_id
       LEFT JOIN skills s ON prs.skill_id = s.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = {
      ...rows[0],
      required_skills: rows[0].required_skills ? 
        rows[0].required_skills.split(',').map(skill => {
          const [id, name, min_proficiency] = skill.split(':');
          return { id: parseInt(id), name, min_proficiency };
        }) : []
    };
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  const { name, description, start_date, end_date, status, required_skills } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insert project
    const [projectResult] = await connection.execute(
      'INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
      [name, description, start_date, end_date, status || 'Planning']
    );
    
    const projectId = projectResult.insertId;
    
    // Insert required skills if provided
    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await connection.execute(
          'INSERT INTO project_required_skills (project_id, skill_id, min_proficiency) VALUES (?, ?, ?)',
          [projectId, skill.skill_id, skill.min_proficiency]
        );
      }
    }
    
    await connection.commit();
    
    // Get the created project with skills
    const [newProject] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(s.name, ':', prs.min_proficiency)) as required_skills
       FROM projects p
       LEFT JOIN project_required_skills prs ON p.id = prs.project_id
       LEFT JOIN skills s ON prs.skill_id = s.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [projectId]
    );
    
    const project = {
      ...newProject[0],
      required_skills: newProject[0].required_skills ? 
        newProject[0].required_skills.split(',').map(skill => {
          const [name, min_proficiency] = skill.split(':');
          return { name, min_proficiency };
        }) : []
    };
    
    res.status(201).json(project);
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Update project
exports.updateProject = async (req, res) => {
  const { name, description, start_date, end_date, status, required_skills } = req.body;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Update project basic info
    const [result] = await connection.execute(
      'UPDATE projects SET name = ?, description = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
      [name, description, start_date, end_date, status, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Remove existing required skills
    await connection.execute(
      'DELETE FROM project_required_skills WHERE project_id = ?',
      [req.params.id]
    );
    
    // Insert new required skills if provided
    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await connection.execute(
          'INSERT INTO project_required_skills (project_id, skill_id, min_proficiency) VALUES (?, ?, ?)',
          [req.params.id, skill.skill_id, skill.min_proficiency]
        );
      }
    }
    
    await connection.commit();
    
    // Get the updated project
    const [updatedProject] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(s.name, ':', prs.min_proficiency)) as required_skills
       FROM projects p
       LEFT JOIN project_required_skills prs ON p.id = prs.project_id
       LEFT JOIN skills s ON prs.skill_id = s.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );
    
    const project = {
      ...updatedProject[0],
      required_skills: updatedProject[0].required_skills ? 
        updatedProject[0].required_skills.split(',').map(skill => {
          const [name, min_proficiency] = skill.split(':');
          return { name, min_proficiency };
        }) : []
    };
    
    res.json(project);
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM projects WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};