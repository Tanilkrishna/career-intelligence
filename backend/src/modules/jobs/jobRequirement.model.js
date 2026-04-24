const mongoose = require('mongoose');

const jobRequirementSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  requiredSkills: [{
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    targetScore: { type: Number, min: 0, max: 100 },
    weight: { type: Number, min: 1, max: 10 },
    priority: { type: String, enum: ['Mandatory', 'Preferred', 'Bonus'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('JobRequirement', jobRequirementSchema);
