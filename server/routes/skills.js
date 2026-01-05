const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillsController');

// GET all skills
router.get('/', skillsController.getAllSkills);

// POST create new skill
router.post('/', skillsController.createSkill);

// PUT update skill
router.put('/:id', skillsController.updateSkill);

// DELETE skill
router.delete('/:id', skillsController.deleteSkill);

module.exports = router;