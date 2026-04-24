const express = require('express');
const careerController = require('./career.controller');

const router = express.Router();

router.get('/score', careerController.getScore);
router.get('/gaps', careerController.getGaps);
router.get('/recommendations', careerController.getRecommendations);

module.exports = router;
