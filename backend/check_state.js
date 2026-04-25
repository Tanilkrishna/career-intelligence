require('dotenv').config();
const mongoose = require('mongoose');
const AnalysisJob = require('./src/modules/jobs/analysisJob.model');
const CareerScore = require('./src/modules/users/careerScore.model');
const User = require('./src/modules/users/user.model');

async function checkSystemState() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const jobCount = await AnalysisJob.countDocuments();
    const userCount = await User.countDocuments();
    const activeJobs = await AnalysisJob.find({ status: { $in: ['queued', 'running'] } });
    const completedJobs = await AnalysisJob.find({ status: 'completed' });
    const failedJobs = await AnalysisJob.find({ status: 'failed' });

    console.log(`\n--- Analysis Jobs Summary ---`);
    console.log(`Total Users: ${userCount}`);
    console.log(`Total Jobs: ${jobCount}`);
    console.log(`Active (Queued/Running): ${activeJobs.length}`);
    console.log(`Completed: ${completedJobs.length}`);
    console.log(`Failed: ${failedJobs.length}`);

    if (activeJobs.length > 0) {
      console.log(`\n--- Stale/Active Jobs ---`);
      activeJobs.forEach(j => {
        console.log(`ID: ${j._id} | Status: ${j.status} | Progress: ${j.progress}% | Step: ${j.currentStep} | Created: ${j.createdAt}`);
      });
    }

    const scores = await CareerScore.find().populate('userId', 'email');
    console.log(`\n--- Career Scores ---`);
    scores.forEach(s => {
      console.log(`User: ${s.userId?.email || 'Unknown'} | Score: ${s.score} | Core: ${s.breakdown.core} | Depth: ${s.breakdown.depth}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking state:', err);
  }
}

checkSystemState();
