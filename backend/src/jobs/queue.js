// A simple in-memory queue for V1
const jobQueue = [];

exports.pushJob = (jobData) => {
  jobQueue.push(jobData);
  console.log(`[Queue] Job pushed: ${jobData.jobId}`);
};

exports.popJob = () => {
  return jobQueue.shift();
};

exports.getQueueLength = () => {
  return jobQueue.length;
};
