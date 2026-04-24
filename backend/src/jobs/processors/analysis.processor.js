const AnalysisJob = require('../../modules/jobs/analysisJob.model');
const UserSkill = require('../../modules/skills/userSkill.model');
const Skill = require('../../modules/skills/skill.model');
const CareerScore = require('../../modules/users/careerScore.model');
const githubProvider = require('../../providers/github.provider');
const codeAnalysisService = require('../../services/codeAnalysis.service');
const User = require('../../modules/users/user.model');
const JobRequirement = require('../../modules/jobs/jobRequirement.model');

exports.processAnalysisJob = async (jobData) => {
  const { jobId, userId, githubUrl } = jobData;
  const job = await AnalysisJob.findById(jobId);
  if (!job) return;

  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    let username = githubUrl.split('/').pop().trim();
    let specificRepo = null;

    if (githubUrl.includes('/')) {
      const parts = githubUrl.replace(/\/$/, '').split('/');
      if (parts.length >= 2) {
        specificRepo = parts.pop();
        username = parts.pop();
      }
    }

    if (!username) throw new Error("Invalid GitHub Username or URL");

    // 1. Fetch Repos/Dependencies
    await updateJob(job, `Scanning repositories for ${username}...`, 20);
    
    let dependencies = [];
    let codeEvidence = {};

    if (specificRepo) {
      await updateJob(job, `Analyzing specific repo: ${specificRepo}...`, 30);
      const tree = await githubProvider.fetchRepoTree(username, specificRepo);
      const packageFiles = tree.filter(node => node.type === 'blob' && node.path.endsWith('package.json'));
      
      for (const file of packageFiles) {
        const content = await githubProvider.fetchFileContent(username, specificRepo, file.path);
        if (content) {
          try {
            const pkg = JSON.parse(content);
            const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
            dependencies.push(...Object.keys(deps));
          } catch (e) {}
        }
      }
      codeEvidence = await codeAnalysisService.getRepoEvidence(username, specificRepo);
    } else {
      dependencies = await githubProvider.getUserDependencies(username);
      codeEvidence = await codeAnalysisService.aggregateUserEvidence(username);
    }

    // 2. Evaluate Skills
    await updateJob(job, 'Calculating skill competency scores...', 70);
    
    const masterSkills = await Skill.find();
    const evaluatedSkills = [];

    for (const skill of masterSkills) {
      const normalizedName = skill.normalizedAliases[0];
      
      const isPresent = dependencies.some(dep => {
        const normDep = dep.toLowerCase().replace(/[^a-z0-9]/g, '');
        return skill.normalizedAliases.some(alias => 
          normDep === alias || normDep.startsWith(alias) || normDep.endsWith(alias)
        );
      });

      const evidence = codeEvidence[normalizedName] || null;

      if (isPresent || evidence) {
        const presenceScore = isPresent ? 100 : 0;
        
        // Pattern Density Normalization: patterns / (filesAnalyzed + small_constant)
        const density = evidence ? (evidence.usageCount / (evidence.filesAnalyzed + 0.5)) : 0;
        const usageScore = Math.min(100, density * 20); // 5 patterns per file = 100% usage score

        // Tiered Depth Scoring: Basic=30, Intermediate=60, Advanced=100
        let depthScore = 0;
        if (evidence) {
          if (evidence.depth >= 3) depthScore = 100;
          else if (evidence.depth >= 2) depthScore = 60;
          else if (evidence.depth >= 1) depthScore = 30;
        }

        const finalSkillScore = Math.round(
          (presenceScore * 0.2) + (usageScore * 0.3) + (depthScore * 0.5)
        );

        const savedSkill = await UserSkill.findOneAndUpdate(
          { userId, skillId: skill._id },
          { 
            score: finalSkillScore, 
            confidence: 0.8,
            evidence: [
              { source: 'dependency', rawScore: presenceScore },
              { 
                source: 'code_patterns', 
                rawScore: Math.round((usageScore + depthScore) / 2),
                metadata: { repos: evidence ? evidence.repos : [] }
              }
            ],
            lastEvaluated: new Date()
          },
          { upsert: true, new: true }
        );
        evaluatedSkills.push(savedSkill);
      }
    }

    // 3. Compute Weighted CareerScore
    await updateJob(job, 'Applying role-weighted model...', 90);
    
    const jobReq = await JobRequirement.findOne({ role: user.targetRole });
    let coreScore = 0;
    let depthBonus = 0;
    let momentum = 50; // Base momentum for V1

    if (jobReq) {
      const mandatorySkills = jobReq.requiredSkills.filter(s => s.priority === 'Mandatory');
      const metMandatory = mandatorySkills.filter(ms => {
        const evaluated = evaluatedSkills.find(es => es.skillId.toString() === ms.skillId.toString());
        return evaluated && evaluated.score >= 40; // Threshold for "Met"
      }).length;

      // 1. Core Score (max 600)
      coreScore = (metMandatory / mandatorySkills.length) * 600;

      // 2. Depth Bonus (max 300)
      const avgSkillScore = evaluatedSkills.length > 0 
        ? evaluatedSkills.reduce((acc, s) => acc + s.score, 0) / evaluatedSkills.length 
        : 0;
      depthBonus = Math.min(300, avgSkillScore * 3);

      // 3. Penalty for missing mandatory skills
      if (metMandatory < mandatorySkills.length) {
        const penaltyMultiplier = 0.7;
        coreScore *= penaltyMultiplier;
        depthBonus *= penaltyMultiplier;
      }
    }

    const computedCareerScore = Math.round(coreScore + depthBonus + momentum);
    
    await CareerScore.findOneAndUpdate(
      { userId },
      { 
        $set: {
          score: Math.min(1000, computedCareerScore), 
          breakdown: { core: Math.round(coreScore), depth: Math.round(depthBonus), momentum: Math.round(momentum) } 
        },
        $push: {
          history: {
            score: Math.min(1000, computedCareerScore),
            breakdown: { core: Math.round(coreScore), depth: Math.round(depthBonus), momentum: Math.round(momentum) },
            createdAt: new Date()
          }
        }
      },
      { upsert: true }
    );

    // Step 6: Update AnalysisJob to completed
    await updateJob(job, 'Completed', 100, 'completed');
    
  } catch (error) {
    console.error(`[Processor] Error processing job ${jobId}:`, error);
    await updateJob(job, 'Failed', job.progress, 'failed', error.message);
  }
};

// Helper to update job status
async function updateJob(job, step, progress, status = 'running', errorMsg = null) {
  job.currentStep = step;
  job.progress = progress;
  job.status = status;
  if (errorMsg) job.error = errorMsg;
  await job.save();
}
