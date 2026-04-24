const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  score: { type: Number, min: 0, max: 100, default: 0 },
  confidence: { type: Number, min: 0, max: 1, default: 0 },
  evidence: [{
    source: { type: String, enum: ['github', 'manual', 'challenge', 'endorsement'] },
    rawScore: Number,
    metadata: mongoose.Schema.Types.Mixed
  }],
  lastEvaluatedAt: { type: Date, default: Date.now }
});

// Ensure a user has only one evaluation per skill
userSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model('UserSkill', userSkillSchema);
