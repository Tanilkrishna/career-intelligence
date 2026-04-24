const Skill = require('./skill.model');
const UserSkill = require('./userSkill.model');
const AppError = require('../../core/AppError');

exports.getMasterSkills = async () => {
  return await Skill.find();
};

exports.getUserSkills = async (userId) => {
  return await UserSkill.find({ userId }).populate('skillId');
};
