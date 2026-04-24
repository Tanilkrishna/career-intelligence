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
  try {
    console.log('[AuthService] Searching for user:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('[AuthService] User not found in database');
      throw new AppError('Invalid email or password', 401);
    }

    console.log('[AuthService] User found. Verifying credentials...');
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log('[AuthService] Credential mismatch');
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const payload = { id: user._id, email: user.email };
    const accessToken = jwtUtils.signAccessToken(payload);
    const refreshToken = jwtUtils.signRefreshToken(payload);

    console.log('[AuthService] Login successful, tokens generated');
    return {
      user: { id: user._id, email: user.email, targetRole: user.targetRole },
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('[AuthService] CRITICAL Error during login:', error.message);
    if (error.isOperational) throw error;
    throw error;
  }
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
