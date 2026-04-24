const skillService = require('./skill.service');
const catchAsync = require('../../core/catchAsync');
const { successResponse } = require('../../shared/response');

exports.getAllSkills = catchAsync(async (req, res) => {
  const skills = await skillService.getMasterSkills();
  return successResponse(res, 200, skills, 'Master skills retrieved');
});

exports.getUserSkills = catchAsync(async (req, res) => {
  const userId = req.user?.id || '60d21b4667d0d8992e610c85';
  
  const userSkills = await skillService.getUserSkills(userId);
  return successResponse(res, 200, userSkills, 'User skills retrieved');
});
