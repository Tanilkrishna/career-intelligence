const UserSkill = require('./userSkill.model');
const Skill = require('./skill.model');
const AppError = require('../../core/AppError');

/**
 * Generates a detailed explanation for a user's skill score.
 * This converts raw evidence data into a human-readable trust layer.
 */
exports.getSkillExplanation = async (userId, skillId) => {
  const userSkill = await UserSkill.findOne({ userId, skillId }).populate('skillId');
  
  if (!userSkill) {
    throw new AppError('No evaluation data found for this skill.', 404);
  }

  const skillName = userSkill.skillId.name;
  const score = userSkill.score;

  // Extract evidence details
  const dependencyEvidence = userSkill.evidence.find(e => e.source === 'dependency');
  const patternEvidence = userSkill.evidence.find(e => e.source === 'code_patterns');

  // Breakdown calculation (mirroring the logic in analysis.processor.js)
  // presence (20%) + usage (30%) + depth (50%)
  // In the processor: 
  // usageScore = Math.min(100, density * 20)
  // depthScore = 0, 30, 60, or 100
  
  const presenceScore = dependencyEvidence ? dependencyEvidence.rawScore : 0;
  // Note: rawScore in evidence for code_patterns was stored as Math.round((usageScore + depthScore) / 2)
  // This is a bit lossy for explanation, but we can reconstruct based on metadata if needed
  // For V2, we'll use the stored rawScore but label it clearly.

  const explanation = {
    skillName,
    overallScore: score,
    grade: getGrade(score),
    breakdown: [
      {
        label: 'Foundation (Dependencies)',
        value: presenceScore,
        weight: '20%',
        description: presenceScore > 0 
          ? `Detected ${skillName} in your project manifest files (package.json).`
          : `Manifest entry for ${skillName} was not found.`
      },
      {
        label: 'Implementation Depth',
        value: patternEvidence ? patternEvidence.rawScore : 0,
        weight: '80%',
        description: patternEvidence?.rawScore > 70 
          ? `Advanced patterns detected. You're using ${skillName} with high complexity.`
          : patternEvidence?.rawScore > 30
          ? `Solid implementation found. You use ${skillName} for core features.`
          : `Basic usage detected. Focus on adding more complex ${skillName} patterns.`
      }
    ],
    evidenceRepos: patternEvidence?.metadata?.repos || [],
    missingForNextLevel: getMissingSuggestions(skillName, score)
  };

  return explanation;
};

function getGrade(score) {
  if (score >= 90) return 'Expert';
  if (score >= 70) return 'Advanced';
  if (score >= 40) return 'Competent';
  return 'Beginner';
}

function getMissingSuggestions(skill, score) {
  const suggestions = {
    'React': ['useMemo/useCallback for optimization', 'Custom hooks for logic reuse', 'Context API or State Management', 'Testing with Vitest/RTL'],
    'Node': ['Middleware pattern', 'Error handling middleware', 'Stream processing', 'Authentication/JWT depth'],
    'Express': ['Router modularization', 'Request validation', 'Security headers', 'Rate limiting'],
    'MongoDB': ['Aggregation pipelines', 'Indexing strategies', 'Schema validation', 'Transactions'],
    'TypeScript': ['Generics', 'Utility types', 'Strict mode compliance', 'Discriminated unions']
  };

  const defaultSuggestions = ['Build more complex projects', 'Refactor code for better patterns', 'Add unit tests', 'Implement documentation'];
  
  let list = suggestions[skill] || defaultSuggestions;
  
  // If score is high, pick harder ones, if low pick easier
  if (score > 80) return list.slice(0, 2);
  return list.slice(2);
}
