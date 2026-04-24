const express = require('express');
const analysisController = require('./analysis.controller');

const router = express.Router();

router.post('/run', analysisController.runAnalysis);
router.get('/status/:jobId', analysisController.getAnalysisStatus);

module.exports = router;
