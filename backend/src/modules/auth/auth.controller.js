const authService = require('./auth.service');
const catchAsync = require('../../core/catchAsync');
const { successResponse } = require('../../shared/response');
const { z } = require('zod');
const AppError = require('../../core/AppError');

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

exports.register = catchAsync(async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid email or password format', 400);
  }

  const { email, password } = parsed.data;
  const { user, accessToken, refreshToken } = await authService.register(email, password);

  setRefreshCookie(res, refreshToken);

  return successResponse(res, 201, { user, accessToken }, 'Registration successful');
});

exports.login = catchAsync(async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid email or password format', 400);
  }

  const { email, password } = parsed.data;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  setRefreshCookie(res, refreshToken);

  return successResponse(res, 200, { user, accessToken }, 'Login successful');
});

exports.refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken;
  
  const accessToken = await authService.refresh(token);

  return successResponse(res, 200, { accessToken }, 'Token refreshed');
});

exports.logout = catchAsync(async (req, res) => {
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 5 * 1000) // expires immediately
  });

  return successResponse(res, 200, null, 'Logout successful');
});
