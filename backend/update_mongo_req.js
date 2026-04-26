require('dotenv').config();
const mongoose = require('mongoose');
const JobRequirement = require('./src/modules/jobs/jobRequirement.model');
const Skill = require('./src/modules/skills/skill.model');

async function updateReq() {
  await mongoose.connect(process.env.MONGO_URI);
  const mongoSkill = await Skill.findOne({ name: 'MongoDB' });
  
  await JobRequirement.findOneAndUpdate(
    { role: 'Fullstack JavaScript Engineer', 'requiredSkills.skillId': mongoSkill._id },
    { 
      $set: { 
        'requiredSkills.$.priority': 'Mandatory', 
        'requiredSkills.$.targetScore': 80 
      } 
    }
  );
  
  console.log('MongoDB is now MANDATORY for Fullstack JavaScript Engineer');
  process.exit(0);
}

updateReq();
