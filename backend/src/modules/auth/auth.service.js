const User = require('../users/user.model');
const AppError = require('../../core/AppError');
const bcrypt = require('bcryptjs');
const jwtUtils = require('../../shared/utils/jwt');

exports.register = async (email, password) => {
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    email,
    passwordHash
  });

  // Generate tokens
  const payload = { id: user._id, email: user.email };
  const accessToken = jwtUtils.signAccessToken(payload);
  const refreshToken = jwtUtils.signRefreshToken(payload);

  return {
    user: { id: user._id, email: user.email, targetRole: user.targetRole },
    accessToken,
    refreshToken
  };
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const payload = { id: user._id, email: user.email };
  const accessToken = jwtUtils.signAccessToken(payload);
  const refreshToken = jwtUtils.signRefreshToken(payload);

  return {
    user: { id: user._id, email: user.email, targetRole: user.targetRole },
    accessToken,
    refreshToken
  };
};

exports.refresh = async (token) => {
  if (!token) {
    throw new AppError('Refresh token required', 401);
  }

  try {
    const decoded = jwtUtils.verifyToken(token);
    
    // Ensure user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    const payload = { id: user._id, email: user.email };
    const accessToken = jwtUtils.signAccessToken(payload);
    
    return accessToken;
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};
