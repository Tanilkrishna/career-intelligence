const skillService = require('./skill.service');
const skillExplainability = require('./skill.explainability');
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

exports.getSkillExplanation = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { skillId } = req.params;
  
  const explanation = await skillExplainability.getSkillExplanation(userId, skillId);
  return successResponse(res, 200, explanation, 'Skill explanation retrieved');
});
