const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  githubId: { type: String, sparse: true, unique: true },
  targetRole: { type: String, default: null },
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: null },
  dailyTime: { type: Number, default: 0 }, // minutes per day
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
