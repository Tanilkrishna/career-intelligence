const careerService = require('./career.service');
const catchAsync = require('../../core/catchAsync');
const { successResponse } = require('../../shared/response');

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
