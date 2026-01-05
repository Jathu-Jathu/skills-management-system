const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');

// GET all projects
router.get('/', projectsController.getAllProjects);

// GET single project
router.get('/:id', projectsController.getProjectById);

// POST create new project
router.post('/', projectsController.createProject);

// PUT update project
router.put('/:id', projectsController.updateProject);

// DELETE project
router.delete('/:id', projectsController.deleteProject);

module.exports = router;
