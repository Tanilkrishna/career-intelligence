const User = require('./user.model');
const AppError = require('../../core/AppError');
const CareerScore = require('./careerScore.model');
const careerService = require('./career.service');
const UserSkill = require('../skills/userSkill.model');
const UserProject = require('../projects/userProject.model');

exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

exports.updateOnboarding = async (userId, onboardingData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: onboardingData },
    { returnDocument: 'after', runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

exports.getPublicProfile = async (identifier) => {
  let user;
  
  // Check if identifier is a valid MongoDB ObjectId
  const isId = identifier.match(/^[0-9a-fA-F]{24}$/);
  
  if (isId) {
    user = await User.findById(identifier).select('username targetRole experienceLevel streakCount createdAt');
  } else {
    user = await User.findOne({ username: identifier }).select('username targetRole experienceLevel streakCount createdAt');
  }

  if (!user) {
    throw new AppError('Profile not found', 404);
  }

  const scoreData = await careerService.getCareerScore(user._id);
  const skills = await UserSkill.find({ userId: user._id }).populate('skillId').sort({ score: -1 }).limit(5);
  const activeProjects = await UserProject.find({ userId: user._id, status: 'In Progress' }).limit(2);
  const completedProjects = await UserProject.find({ userId: user._id, status: 'Completed' }).sort({ completedAt: -1 }).limit(3);

  return {
    user,
    careerScore: scoreData,
    topSkills: skills,
    activeProjects,
    completedProjects
  };
};

exports.updateActivityStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const lastActivity = user.lastActivityDate;

  if (!lastActivity) {
    user.streakCount = 1;
  } else {
    // Zero out hours for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
    
    const diffTime = today - lastDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      user.streakCount += 1;
    } else if (diffDays > 1) {
      user.streakCount = 1;
    }
    // If diffDays === 0, streak stays same (already active today)
  }

  user.lastActivityDate = now;
  await user.save();
};
