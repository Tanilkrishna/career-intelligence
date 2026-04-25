const mongoose = require('mongoose');

const analysisJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['queued', 'running', 'completed', 'failed'], default: 'queued' },
  currentStep: { type: String },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  error: { type: String }
}, { timestamps: true });

analysisJobSchema.index({ userId: 1 });
analysisJobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AnalysisJob', analysisJobSchema);
