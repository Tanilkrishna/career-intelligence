const User = require('./user.model');
const AppError = require('../../core/AppError');

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
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
