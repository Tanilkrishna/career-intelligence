const z = require('zod');
const userService = require('./user.service');
const catchAsync = require('../../core/catchAsync');
const { successResponse } = require('../../shared/response');

const onboardingSchema = z.object({
  targetRole: z.string().min(2, "Target role must be at least 2 characters long"),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  dailyTime: z.number().min(5, "Minimum 5 minutes required")
});

exports.getMe = catchAsync(async (req, res) => {
  const userId = req.user.id; 
  
  const user = await userService.getUserProfile(userId);
  return successResponse(res, 200, user, 'User profile retrieved successfully');
});

exports.updateOnboarding = catchAsync(async (req, res) => {
  const parsedData = onboardingSchema.parse(req.body);
  const userId = req.user.id;

  const user = await userService.updateOnboarding(userId, parsedData);
  return successResponse(res, 200, user, 'Onboarding completed successfully');
});
