const express = require('express');
const careerController = require('./career.controller');

const router = express.Router();

router.get('/state', careerController.getState);
router.get('/score', careerController.getScore);
router.get('/gaps', careerController.getGaps);
router.get('/recommendations', careerController.getRecommendations);

// Retention Loop: Projects
router.post('/projects/start', careerController.startProject);
router.get('/projects/active', careerController.getActiveProjects);
router.post('/projects/submit', careerController.submitProject);
router.put('/projects/:projectId/tasks/:taskId/toggle', careerController.toggleTask);

// Multi-Session AI Mentoring
router.get('/projects/:projectId/chats', careerController.getChatSessions);
router.post('/projects/:projectId/chats', careerController.startChatSession);
router.get('/chats/:sessionId', careerController.getChatHistory);
router.post('/chats/:sessionId/message', careerController.sendChatMessage);

module.exports = router;
