const express = require('express');
const userController = require('./user.controller');

const router = express.Router();

// Normally we'd use an auth middleware here like router.use(protect)
router.get('/me', userController.getMe);
router.put('/me/onboarding', userController.updateOnboarding);
router.get('/profile/:username', userController.getPublicProfile);

module.exports = router;
