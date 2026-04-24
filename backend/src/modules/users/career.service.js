const CareerScore = require('./careerScore.model');
const UserSkill = require('../skills/userSkill.model');
const JobRequirement = require('../jobs/jobRequirement.model');
const User = require('./user.model');
const Project = require('../projects/project.model');
const Skill = require('../skills/skill.model');
const AppError = require('../../core/AppError');

exports.getCareerScore = async (userId) => {
  const user = await User.findById(userId);
  let score = await CareerScore.findOne({ userId });
  
  if (!score) {
    // Return a default empty score for new users to prevent 404s
    return {
      score: 0,
      breakdown: { core: 0, depth: 0, momentum: 0 },
      history: [],
      weeksToReady: null
    };
  }

  // Calculate "Weeks to Ready" (Career GPS)
  const gaps = await this.getCareerGaps(userId);
  const totalGapScore = gaps.reduce((acc, gap) => acc + gap.urgencyScore, 0);
  
  let weeksToReady = null;
  if (user.dailyTime > 0 && totalGapScore > 0) {
    // Assumption: 1 point of urgency takes ~15 mins of focused work to close
    const totalMinutesNeeded = totalGapScore * 15; 
    weeksToReady = Math.ceil(totalMinutesNeeded / (user.dailyTime * 7));
  }

  return {
    ...score.toObject(),
    weeksToReady
  };
};

exports.getCareerGaps = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.targetRole) return [];

  const jobReq = await JobRequirement.findOne({ role: user.targetRole });
  if (!jobReq) return [];

  const userSkills = await UserSkill.find({ userId });
  const userSkillMap = new Map(userSkills.map(us => [us.skillId.toString(), us.score]));

  // Experience level modifier
  const experienceModifier = user.experienceLevel === 'Beginner' ? 0.8 : 
                             user.experienceLevel === 'Advanced' ? 1.2 : 1.0;

  let rawGaps = [];

  for (const reqSkill of jobReq.requiredSkills) {
    const userScore = userSkillMap.get(reqSkill.skillId.toString()) || 0;
    const adjustedTargetScore = Math.min(100, reqSkill.targetScore * experienceModifier);
    
    if (userScore < adjustedTargetScore) {
      const skillDoc = await Skill.findById(reqSkill.skillId);
      
      // Multipliers
      const priorityMultiplier = reqSkill.priority === 'Mandatory' ? 1.5 : 
                                 reqSkill.priority === 'Bonus' ? 0.5 : 1.0;
      
      // Formulas
      const gapSeverity = Math.max(0, (adjustedTargetScore - userScore) / adjustedTargetScore);
      const gapUrgency = gapSeverity * reqSkill.weight * priorityMultiplier;
      
      const userSkill = userSkills.find(us => us.skillId.toString() === reqSkill.skillId.toString());
      
      rawGaps.push({
        skillId: reqSkill.skillId,
        skill: skillDoc ? skillDoc.name : 'Unknown Skill',
        userScore,
        targetScore: Math.round(adjustedTargetScore),
        gapUrgency,
        priority: reqSkill.priority,
        evidence: userSkill ? userSkill.evidence : []
      });
    }
  }

  if (rawGaps.length === 0) return [];

  // Normalize Urgency Scores (0-100)
  const maxUrgency = Math.max(...rawGaps.map(g => g.gapUrgency));
  
  const gaps = rawGaps.map(g => {
    const normalizedUrgency = maxUrgency > 0 ? Math.round((g.gapUrgency / maxUrgency) * 100) : 0;
    
    // Status Labels
    let status = 'No Gap';
    if (normalizedUrgency >= 70) status = 'Critical Gap';
    else if (normalizedUrgency >= 30) status = 'Moderate Gap';
    else if (normalizedUrgency > 0) status = 'Minor Gap';

    return {
      ...g,
      urgencyScore: normalizedUrgency,
      status,
      reason: `${g.priority} skill for ${user.targetRole} but currently below target`
    };
  });

  // Sort by urgency descending and take top 5
  return gaps.sort((a, b) => b.urgencyScore - a.urgencyScore).slice(0, 5);
};

exports.getRecommendations = async (userId) => {
  const user = await User.findById(userId);
  const gaps = await this.getCareerGaps(userId);
  if (gaps.length === 0) return [];

  // Fetch all projects and populate skills
  const projects = await Project.find().populate('targetSkillIds');
  const userSkills = await UserSkill.find({ userId });
  const userSkillMap = new Map(userSkills.map(us => [us.skillId.toString(), us.score]));
  
  const jobReq = await JobRequirement.findOne({ role: user.targetRole });
  const mandatorySkillIds = new Set(
    jobReq?.requiredSkills
      .filter(s => s.priority === 'Mandatory')
      .map(s => s.skillId.toString()) || []
  );

  const scoredProjects = projects.map(project => {
    // 1. Compute UserLevel (Average of project-relevant skills)
    const projectSkillIds = project.targetSkillIds.map(s => s._id.toString());
    const relevantScores = projectSkillIds.map(id => userSkillMap.get(id) || 0);
    const userLevel = relevantScores.reduce((a, b) => a + b, 0) / (relevantScores.length || 1);

    // 2. Base Impact (Σ GapUrgency × SkillCoverage)
    let baseImpact = 0;
    let coveredGaps = [];
    let mandatorySkillsCovered = 0;
    let criticalGapsCovered = 0;

    project.targetSkillIds.forEach(targetSkill => {
      const targetSkillId = targetSkill._id.toString();
      const matchingGap = gaps.find(g => g.skillId.toString() === targetSkillId);
      
      if (matchingGap) {
        baseImpact += matchingGap.urgencyScore;
        coveredGaps.push(targetSkill.name);
        if (mandatorySkillIds.has(targetSkillId)) mandatorySkillsCovered++;
        if (matchingGap.urgencyScore >= 70) criticalGapsCovered++;
      }
    });

    if (baseImpact === 0) return null;

    // 3. Role Alignment Bonus
    let roleBonus = 1.0;
    if (mandatorySkillsCovered >= 3) roleBonus = 1.4;
    else if (mandatorySkillsCovered >= 2) roleBonus = 1.2;

    // 4. Difficulty Synergy
    const diff = project.difficultyScore - userLevel;
    let difficultySynergy = 1.0;
    if (diff >= 5 && diff <= 15) difficultySynergy = 1.2; // Perfect Challenge
    else if (diff < 0) difficultySynergy = 0.9;           // Too Easy
    else if (diff > 25) difficultySynergy = 0.7;          // Too Hard

    const finalImpactScore = baseImpact * roleBonus * difficultySynergy;

    // 5. Predicted Gain (Impact × 0.8, clamped 20-200)
    const predictedGain = Math.min(200, Math.max(20, Math.round(finalImpactScore * 0.8)));

    // 6. Recommendation Type (Priority order)
    let type = 'Foundation Builder';
    if (criticalGapsCovered >= 2) type = 'Career Accelerator';
    else if (diff >= 5 && diff <= 15) type = 'Perfect Challenge';
    else type = 'Foundation Builder';

    // 7. Adaptive Estimated Completion Time (Days)
    // 1 point of impact ≈ 20 mins of work
    const minutesToComplete = finalImpactScore * 20;
    const daysToComplete = user.dailyTime > 0 ? Math.ceil(minutesToComplete / user.dailyTime) : '??';

    return {
      title: project.title,
      description: project.description,
      difficulty: project.difficulty,
      difficultyScore: project.difficultyScore,
      skills: project.targetSkillIds.map(s => s.name),
      impactScore: Math.round(finalImpactScore),
      predictedGain,
      recommendationType: type,
      estimatedDays: daysToComplete,
      reason: `Directly addresses your ${coveredGaps.length} gaps in ${coveredGaps.join(', ')}`,
      diffFromUser: diff
    };
  }).filter(p => p !== null);

  // 8. Ranking
  scoredProjects.sort((a, b) => {
    if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
    const aDist = Math.abs(a.diffFromUser - 10);
    const bDist = Math.abs(b.diffFromUser - 10);
    return aDist - bDist;
  });

  return scoredProjects.slice(0, 3);
};
