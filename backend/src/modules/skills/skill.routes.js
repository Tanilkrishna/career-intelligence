const express = require('express');
const skillController = require('./skill.controller');

const router = express.Router();

router.get('/', skillController.getAllSkills);
router.get('/user', skillController.getUserSkills);

module.exports = router;
