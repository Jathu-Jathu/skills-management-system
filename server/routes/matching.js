const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');

// GET matching personnel for a project
router.get('/project/:projectId', matchingController.getMatchingPersonnel);

// GET search personnel by skills
router.get('/search', matchingController.searchPersonnelBySkills);

module.exports = router;
