const { popJob, getQueueLength } = require('./queue');
const { processAnalysisJob } = require('./processors/analysis.processor');

const WORKER_POLL_INTERVAL = 2000; // Check queue every 2 seconds

console.log('[Worker] Background worker process started.');

setInterval(async () => {
  const jobData = popJob();
  
  if (jobData) {
    console.log(`[Worker] Picked up job ${jobData.jobId}. Remaining in queue: ${getQueueLength()}`);
    // We intentionally don't await here so the worker loop isn't fully blocked, 
    // though in V1 we could await to process strictly sequentially.
    await processAnalysisJob(jobData);
    console.log(`[Worker] Finished processing job ${jobData.jobId}`);
  }
}, WORKER_POLL_INTERVAL);
