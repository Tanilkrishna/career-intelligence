require('dotenv').config();
const mongoose = require('mongoose');
const JobRequirement = require('./src/modules/jobs/jobRequirement.model');
const Skill = require('./src/modules/skills/skill.model');

async function checkState() {
  await mongoose.connect(process.env.MONGO_URI);
  const req = await JobRequirement.findOne({ role: 'Fullstack JavaScript Engineer' }).populate('requiredSkills.skillId');
  
  if (!req) {
    console.log('No job requirement found for "Fullstack JavaScript Engineer"');
    const all = await JobRequirement.find();
    console.log('Available roles:', all.map(r => r.role));
  } else {
    console.log('--- Job Requirement: Fullstack JavaScript Engineer ---');
    req.requiredSkills.forEach(s => {
      console.log(`- ${s.skillId?.name || 'Unknown'}: Target ${s.targetScore} (${s.priority})`);
    });
  }
  
  process.exit(0);
}

checkState();
