require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/modules/users/user.model');
const Skill = require('./src/modules/skills/skill.model');
const JobRequirement = require('./src/modules/jobs/jobRequirement.model');
const AnalysisJob = require('./src/modules/jobs/analysisJob.model');
const { processAnalysisJob } = require('./src/jobs/processors/analysis.processor');
const queue = require('./src/jobs/queue');

async function runSmokeTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'testuser@careerintel.com' });
    user.targetRole = 'Backend Engineer';
    await user.save();

    console.log(`Starting smoke test for user: ${user.email} (Target: ${user.targetRole})`);

    // Create a job
    const job = await AnalysisJob.create({
      userId: user._id,
      status: 'queued',
      currentStep: 'Initializing Smoke Test',
      progress: 0
    });

    console.log(`Job created: ${job._id}`);

    // Manually run the processor for this job
    // We use a React repo to see if it flags Backend Gaps correctly
    await processAnalysisJob({
      jobId: job._id,
      userId: user._id,
      githubUrl: 'https://github.com/facebook/react' 
    });

    // Check final state
    const finalJob = await AnalysisJob.findById(job._id);
    console.log(`\nFinal Job Status: ${finalJob.status}`);
    console.log(`Final Step: ${finalJob.currentStep}`);
    console.log(`Progress: ${finalJob.progress}%`);
    if (finalJob.error) console.error(`Error: ${finalJob.error}`);

    const CareerScore = require('./src/modules/users/careerScore.model');
    const careerService = require('./src/modules/users/career.service');
    const score = await CareerScore.findOne({ userId: user._id });
    
    if (score) {
      console.log(`\n--- CareerScore Results ---`);
      console.log(`Total Score: ${score.score}`);
      console.log(`Breakdown:`, score.breakdown);
    } else {
      console.log('\nNo CareerScore generated.');
    }

    const recs = await careerService.getRecommendations(user._id);
    const gaps = await careerService.getCareerGaps(user._id);
    
    console.log(`\n--- Critical Gaps ---`);
    console.log(JSON.stringify(gaps, null, 2));

    console.log(`\n--- Recommendations (Hybrid) ---`);
    console.log(JSON.stringify(recs, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(1);
  }
}

runSmokeTest();
