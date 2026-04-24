const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  targetSkillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true
  },
  // We'll optionally store a numeric value for the difficulty to easily compare it against avg user score
  difficultyScore: { type: Number, required: true }, 
  tags: [{ type: String }],
  requirements: [{ type: String }]
});

module.exports = mongoose.model('Project', projectSchema);
