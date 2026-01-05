const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');

// GET all personnel
router.get('/', personnelController.getAllPersonnel);

// GET single personnel
router.get('/:id', personnelController.getPersonnelById);

// POST create new personnel
router.post('/', personnelController.createPersonnel);

// PUT update personnel
router.put('/:id', personnelController.updatePersonnel);

// DELETE personnel
router.delete('/:id', personnelController.deletePersonnel);

// POST assign skill to personnel
router.post('/skills/assign', personnelController.assignSkill);

// DELETE remove skill from personnel
router.delete('/:personnelId/skills/:skillId', personnelController.removeSkill);

module.exports = router;
