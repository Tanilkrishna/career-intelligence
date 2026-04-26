const mongoose = require('mongoose');

const careerScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  score: { type: Number, min: 0, max: 1000, default: 0 },
  breakdown: {
    core: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },
    momentum: { type: Number, default: 0 },
    engineeringBaseline: { type: Number, default: 0 }
  },
  history: [{
    score: { type: Number, required: true },
    breakdown: {
      core: { type: Number, default: 0 },
      depth: { type: Number, default: 0 },
      momentum: { type: Number, default: 0 },
      engineeringBaseline: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('CareerScore', careerScoreSchema);
