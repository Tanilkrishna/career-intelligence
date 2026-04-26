const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  githubId: { type: String, sparse: true, unique: true },
  targetRole: { type: String, default: null },
  techStack: { type: String, enum: ['frontend', 'backend', 'fullstack', 'custom'], default: null },
  customTechnologies: [{ type: String }],
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: null },
  dailyTime: { type: Number, default: 0 }, // minutes per day
  username: { type: String, unique: true, sparse: true },
  streakCount: { type: Number, default: 0 },
  lastActivityDate: { type: Date },
  projectsCompleted: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
