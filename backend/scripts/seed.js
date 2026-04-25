require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../src/modules/users/user.model');
const Skill = require('../src/modules/skills/skill.model');
const JobRequirement = require('../src/modules/jobs/jobRequirement.model');
const Project = require('../src/modules/projects/project.model');

// Data
const skillsData = require('./data/skills');
const jobReqData = require('./data/jobRequirements');
const usersData = require('./data/users');
const projectsData = require('./data/projects');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/career-intelligence';

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const seedData = async (shouldExit = true) => {
  try {
    // If not already connected, connect
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log('[Seed] Connected to MongoDB');
    }

    // 1. Seed Skills (Idempotent)
    console.log('\n[Seed] Seeding skills...');
    const skillMap = {}; // To map names to IDs for JobRequirements
    
    for (const skill of skillsData) {
      // Create normalized aliases array
      const allAliases = [skill.name, ...skill.aliases];
      skill.normalizedAliases = allAliases.map(normalize);

      const dbSkill = await Skill.findOneAndUpdate(
        { name: skill.name },
        { $set: skill },
        { upsert: true, returnDocument: 'after' }
      );
      skillMap[skill.name] = dbSkill._id;
      console.log(`  - Upserted skill: ${skill.name}`);
    }

    // 2. Seed Job Requirements (Idempotent)
    console.log('\n[Seed] Seeding job requirements...');
    for (const req of jobReqData) {
      // Map skill names to ObjectIDs
      const formattedSkills = req.requiredSkills.map(rs => {
        if (!skillMap[rs.skillName]) {
          throw new Error(`Skill ${rs.skillName} not found in seeded skills.`);
        }
        return {
          skillId: skillMap[rs.skillName],
          targetScore: rs.targetScore,
          weight: rs.weight,
          priority: rs.priority
        };
      });

      await JobRequirement.findOneAndUpdate(
        { role: req.role },
        { $set: { requiredSkills: formattedSkills } },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`  - Upserted job requirement: ${req.role}`);
    }

    // 3. Seed Users (Idempotent & Password Hashing)
    console.log('\n[Seed] Seeding users...');
    for (const u of usersData) {
      const passwordHash = await bcrypt.hash(u.rawPassword, 10);
      
      await User.findOneAndUpdate(
        { email: u.email },
        { 
          $set: { 
            passwordHash,
            targetRole: u.targetRole
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`  - Upserted user: ${u.email}`);
    }

    // 4. Seed Projects
    console.log('\n[Seed] Seeding projects...');
    for (const proj of projectsData) {
      // Map string targetSkills to their ObjectIDs
      const mappedSkillIds = proj.targetSkills.map(skillName => {
        if (!skillMap[skillName]) {
          throw new Error(`Skill ${skillName} not found for Project ${proj.title}`);
        }
        return skillMap[skillName];
      });

      const { targetSkills, ...projectData } = proj;
      projectData.targetSkillIds = mappedSkillIds;

      await Project.findOneAndUpdate(
        { title: proj.title },
        { $set: projectData },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`  - Upserted project: ${proj.title}`);
    }

    console.log('\n[Seed] Seeding completed successfully! 🎉');
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error('\n[Seed] 💥 Error seeding data:', error);
    if (shouldExit) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
