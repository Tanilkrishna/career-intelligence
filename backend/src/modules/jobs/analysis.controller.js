const z = require('zod');
const analysisService = require('./analysis.service');
const catchAsync = require('../../core/catchAsync');
const { successResponse } = require('../../shared/response');

const runAnalysisSchema = z.object({
  githubUrl: z.string().min(1, "GitHub URL or username is required")
});

const statusSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Job ID format")
});

exports.runAnalysis = catchAsync(async (req, res) => {
  const parsedData = runAnalysisSchema.parse(req.body);
  const userId = req.user.id;

  const job = await analysisService.createAnalysisJob(userId, parsedData.githubUrl);
  return successResponse(res, 202, job, 'Analysis job queued successfully');
});

exports.getAnalysisStatus = catchAsync(async (req, res) => {
  const { jobId } = statusSchema.parse(req.params);
  
  const jobStatus = await analysisService.getJobStatus(jobId);
  return successResponse(res, 200, jobStatus, 'Analysis job status retrieved');
});
