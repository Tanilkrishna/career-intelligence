require('dotenv').config();
const mongoose = require('mongoose');
const JobRequirement = require('./src/modules/jobs/jobRequirement.model');
const Skill = require('./src/modules/skills/skill.model');

async function setupRoles() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const react = await Skill.findOne({ name: 'React' });
  const node = await Skill.findOne({ name: 'Node.js' });
  const express = await Skill.findOne({ name: 'Express' });
  const tailwind = await Skill.findOne({ name: 'Tailwind CSS' }) || await Skill.create({ name: 'Tailwind CSS', category: 'Frontend' });

  // Frontend Engineer
  await JobRequirement.findOneAndDelete({ role: 'Frontend Engineer' });
  await JobRequirement.create({
    role: 'Frontend Engineer',
    requiredSkills: [
      { skillId: react._id, targetScore: 90, priority: 'Mandatory', weight: 8 },
      { skillId: tailwind._id, targetScore: 70, priority: 'Preferred', weight: 5 }
    ]
  });

  // Backend Engineer
  await JobRequirement.findOneAndDelete({ role: 'Backend Engineer' });
  await JobRequirement.create({
    role: 'Backend Engineer',
    requiredSkills: [
      { skillId: node._id, targetScore: 90, priority: 'Mandatory', weight: 8 },
      { skillId: express._id, targetScore: 80, priority: 'Mandatory', weight: 7 }
    ]
  });

  console.log('--- Domain Roles Created ---');
  console.log('1. Frontend Engineer (React, Tailwind)');
  console.log('2. Backend Engineer (Node.js, Express)');
  
  process.exit(0);
}

setupRoles();
