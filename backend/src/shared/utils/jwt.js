const jwt = require('jsonwebtoken');

// A default fallback for dev, but really JWT_SECRET should be defined
const secret = process.env.JWT_SECRET || 'fallback_super_secret_key_123';

exports.signAccessToken = (payload) =>
  jwt.sign(payload, secret, { expiresIn: '15m' });

exports.signRefreshToken = (payload) =>
  jwt.sign(payload, secret, { expiresIn: '7d' });

exports.verifyToken = (token) => {
  return jwt.verify(token, secret);
};
