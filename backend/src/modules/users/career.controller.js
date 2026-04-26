const careerService = require('./career.service');
const catchAsync = require('../../core/catchAsync');
const { successResponse } = require('../../shared/response');

exports.getState = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const state = await careerService.getCareerState(userId);
  return successResponse(res, 200, state, 'Career state retrieved');
});

exports.getScore = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const score = await careerService.getCareerScore(userId);
  return successResponse(res, 200, score, 'Career score retrieved');
});

exports.getGaps = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const gaps = await careerService.getCareerGaps(userId);
  return successResponse(res, 200, gaps, 'Career gaps retrieved');
});

exports.getRecommendations = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const recommendations = await careerService.getRecommendations(userId);
  return successResponse(res, 200, recommendations, 'Career recommendations retrieved');
});

exports.startProject = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const projectData = req.body;
  
  const project = await careerService.startProject(userId, projectData);
  return successResponse(res, 201, project, 'Project started successfully');
});

exports.getActiveProjects = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const projects = await careerService.getActiveProjects(userId);
  return successResponse(res, 200, projects, 'Active projects retrieved');
});

exports.submitProject = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { projectId, githubUrl } = req.body;
  
  const result = await careerService.submitProject(userId, projectId, githubUrl);
  return successResponse(res, 200, result, 'Project submitted and verified');
});

exports.toggleTask = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { projectId, taskId } = req.params;
  
  const project = await careerService.toggleProjectTask(userId, projectId, taskId);
  return successResponse(res, 200, project, 'Task toggled successfully');
});

exports.getChatSessions = async (req, res) => {
  const userId = req.user.id;
  const { projectId } = req.params;
  
  const sessions = await careerService.getChatSessions(userId, projectId);
  return successResponse(res, 200, sessions, 'Chat sessions retrieved');
};

exports.startChatSession = async (req, res) => {
  const userId = req.user.id;
  const { projectId } = req.params;
  const { title } = req.body;
  
  const session = await careerService.startChatSession(userId, projectId, title);
  return successResponse(res, 201, session, 'Chat session started');
};

exports.getChatHistory = async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.params;
  
  const history = await careerService.getChatHistory(userId, sessionId);
  return successResponse(res, 200, history, 'Chat history retrieved');
};

exports.sendChatMessage = async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.params;
  const { query } = req.body;
  
  const response = await careerService.sendChatMessage(userId, sessionId, query);
  return successResponse(res, 200, response, 'AI response received');
};
