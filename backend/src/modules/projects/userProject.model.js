const mongoose = require('mongoose');

const userProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String },
  skills: [{ type: String }],
  status: { type: String, enum: ['In Progress', 'Completed', 'Paused'], default: 'In Progress' },
  progress: { type: Number, default: 0 },
  tasks: [{
    label: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  githubUrl: { type: String },
  verificationResults: {
    verified: { type: Boolean, default: false },
    scoreGain: { type: Number, default: 0 },
    feedback: { type: String }
  },
  predictedGain: { type: Number },
  typicalCompletionDays: { type: Number, default: 7 },
  lastTaskUpdate: { type: Date, default: Date.now },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('UserProject', userProjectSchema);
