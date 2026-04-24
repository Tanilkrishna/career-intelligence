const AnalysisJob = require('./analysisJob.model');
const AppError = require('../../core/AppError');
const queue = require('../../jobs/queue');

exports.createAnalysisJob = async (userId, githubUrl) => {
  const job = await AnalysisJob.create({
    userId,
    status: 'queued',
    currentStep: 'Initializing',
    progress: 0
  });

  // Push to background worker queue
  queue.pushJob({ jobId: job._id, userId, githubUrl });

  return job;
};

exports.getJobStatus = async (jobId) => {
  const job = await AnalysisJob.findById(jobId);
  if (!job) {
    throw new AppError('Analysis job not found', 404);
  }
  return job;
};
