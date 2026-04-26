require('dotenv').config();
const mongoose = require('mongoose');
const JobRequirement = require('./src/modules/jobs/jobRequirement.model');
const Skill = require('./src/modules/skills/skill.model');

async function createCustomRole() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // 1. Get Skill IDs
  const react = await Skill.findOne({ name: 'React' });
  const node = await Skill.findOne({ name: 'Node.js' }); // Base for Fastify
  
  // Create Fastify if it doesn't exist
  let fastify = await Skill.findOne({ name: 'Fastify' });
  if (!fastify) {
    fastify = await Skill.create({ 
      name: 'Fastify', 
      category: 'Backend', 
      tags: ['web', 'framework', 'node'] 
    });
  }

  // Create Postgres if it doesn't exist
  let postgres = await Skill.findOne({ name: 'PostgreSQL' });
  if (!postgres) {
    postgres = await Skill.create({ 
      name: 'PostgreSQL', 
      category: 'Database', 
      tags: ['sql', 'relational'] 
    });
  }

  // 2. Create Job Requirement
  await JobRequirement.findOneAndDelete({ role: 'Custom Stack Developer' });
  await JobRequirement.create({
    role: 'Custom Stack Developer',
    description: 'A developer focused on React, Fastify, and Postgres.',
    requiredSkills: [
      { skillId: react._id, targetScore: 85, priority: 'Mandatory' },
      { skillId: fastify._id, targetScore: 80, priority: 'Mandatory' },
      { skillId: postgres._id, targetScore: 80, priority: 'Mandatory' }
    ]
  });

  console.log('--- Custom Stack Developer Role Created ---');
  console.log('- React (85)');
  console.log('- Fastify (80)');
  console.log('- PostgreSQL (80)');
  
  process.exit(0);
}

createCustomRole();
