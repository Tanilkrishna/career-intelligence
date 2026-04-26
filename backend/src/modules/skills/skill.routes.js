const express = require('express');
const skillController = require('./skill.controller');
const protect = require('../../core/middleware/auth.middleware');

const router = express.Router();

router.get('/', skillController.getAllSkills);
router.get('/user', protect, skillController.getUserSkills);
router.get('/explain/:skillId', protect, skillController.getSkillExplanation);

module.exports = router;
