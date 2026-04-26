const githubProvider = require('../providers/github.provider');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const PATTERNS = {
  'react': [
    { name: 'useState', regex: /useState\(/g, depth: 1 },
    { name: 'useEffect', regex: /useEffect\(/g, depth: 1 },
    { name: 'useContext', regex: /useContext\(/g, depth: 2 },
    { name: 'useMemo', regex: /useMemo\(/g, depth: 2 },
    { name: 'useCallback', regex: /useCallback\(/g, depth: 2 },
    { name: 'customHooks', regex: /use[A-Z]\w+\(/g, depth: 3 }
  ],
  'express': [
    { name: 'Router', regex: /express\.Router\(\)/g, depth: 2 },
    { name: 'Middleware', regex: /app\.use\(.*next.*\)/g, depth: 3 },
    { name: 'Controllers', regex: /require\(.*controllers.*\)/g, depth: 2 }
  ],
  'mongoose': [
    { name: 'Schema', regex: /new mongoose\.Schema\(/g, depth: 1 },
    { name: 'Aggregation', regex: /\.aggregate\(\[/g, depth: 3 },
    { name: 'Middleware', regex: /\.pre\(['"]save['"]/g, depth: 3 }
  ],
  'architecture': [
    { name: 'Microservices', regex: /(gateway|docker-compose|kubernetes|proxy_pass)/gi, depth: 3 },
    { name: 'EventDriven', regex: /(kafka|rabbitmq|pubsub|redis\.createClient.*\.on|EventEmitter)/gi, depth: 3 },
    { name: 'DataModeling', regex: /(prisma|typeorm|sequelize|knex|migrations)/gi, depth: 2 },
    { name: 'Observability', regex: /(winston|pino|prometheus|otel|tracing|sentry)/gi, depth: 2 }
  ]
};

class CodeAnalysisService {
  async getRepoEvidence(username, repoName) {
    try {
      const tree = await githubProvider.fetchRepoTree(username, repoName);
      
      const relevantFiles = tree
        .filter(node => 
          node.type === 'blob' && 
          /\.(js|jsx|ts|tsx)$/.test(node.path) &&
          !node.path.includes('node_modules') &&
          !node.path.includes('dist') &&
          !node.path.includes('test')
        )
        .sort((a, b) => {
          const priority = (path) => (path.includes('src/') || path.includes('components/') || path.includes('routes/') || path.includes('models/')) ? -1 : 1;
          return priority(a.path) - priority(b.path);
        })
        .slice(0, 8);

      const evidence = {
        react: { usageCount: 0, patterns: new Set(), depth: 0, filesAnalyzed: 0, proofs: [] },
        express: { usageCount: 0, patterns: new Set(), depth: 0, filesAnalyzed: 0, proofs: [] },
        mongoose: { usageCount: 0, patterns: new Set(), depth: 0, filesAnalyzed: 0, proofs: [] },
        architecture: { usageCount: 0, patterns: new Set(), depth: 0, filesAnalyzed: 0, proofs: [] }
      };

      for (const file of relevantFiles) {
        const content = await githubProvider.fetchFileContent(username, repoName, file.path);
        if (!content) continue;

        const lines = content.split('\n');
        let fileHadEvidence = false;

        // Phase 1: Regex Scan
        Object.entries(PATTERNS).forEach(([tech, techPatterns]) => {
          techPatterns.forEach(p => {
            const matches = content.match(p.regex);
            if (matches) {
              evidence[tech].usageCount += matches.length;
              evidence[tech].patterns.add(p.name);
              evidence[tech].depth = Math.max(evidence[tech].depth, p.depth);
              fileHadEvidence = true;

              // Extract proof (file + line)
              lines.forEach((line, index) => {
                if (p.regex.test(line)) {
                  // Avoid pushing too many duplicate proofs for the same pattern in same file
                  if (evidence[tech].proofs.length < 20) {
                    evidence[tech].proofs.push({
                      pattern: p.name,
                      file: file.path,
                      line: index + 1,
                      snippet: line.trim().substring(0, 100)
                    });
                  }
                }
              });
            }
          });
        });

        if (fileHadEvidence) {
          Object.keys(evidence).forEach(tech => {
            if (content.toLowerCase().includes(tech)) {
              evidence[tech].filesAnalyzed++;
            }
          });
        }

        // Phase 2: Targeted AST Analysis
        if (evidence.react.usageCount > 0 || evidence.express.usageCount > 0) {
          const astDepth = this.deepASTAnalysis(content);
          if (astDepth.react) evidence.react.depth = Math.max(evidence.react.depth, astDepth.react);
          if (astDepth.express) evidence.express.depth = Math.max(evidence.express.depth, astDepth.express);
        }
      }

      Object.keys(evidence).forEach(tech => {
        evidence[tech].patterns = Array.from(evidence[tech].patterns);
      });

      return evidence;
    } catch (error) {
      console.error(`[CodeAnalysis] Failed to analyze ${repoName}:`, error.message);
      return null;
    }
  }

  deepASTAnalysis(code) {
    const depths = { react: 0, express: 0 };
    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy']
      });

      traverse(ast, {
        CallExpression(path) {
          const callee = path.node.callee;

          // React Depth
          if (callee.type === 'Identifier') {
            if (callee.name.startsWith('use') && !['useState', 'useEffect'].includes(callee.name)) {
              depths.react = Math.max(depths.react, 3); // Custom Hook Mastery
            }
          }

          // Express Depth
          if (callee.type === 'MemberExpression' && callee.property.name === 'use') {
            if (path.node.arguments.length >= 2) {
              depths.express = Math.max(depths.express, 3); // Advanced Middleware usage
            }
          }
        }
      });
    } catch (e) {
      // Ignore parse errors for single files
    }
    return depths;
  }

  async getEngineeringBaseline(username, repos) {
    let testPresence = 0;
    let configStandards = 0;
    let structureDepth = 0;
    let totalFiles = 0;

    // Sampling the most recent 3 repos for baseline signals
    const sampleRepos = repos.slice(0, 3);
    
    for (const repo of sampleRepos) {
      const tree = await githubProvider.fetchRepoTree(username, repo.name);
      
      // 1. Check for tests
      const hasTests = tree.some(n => 
        n.path.includes('test') || n.path.includes('spec') || n.path.endsWith('.test.js') || n.path.endsWith('.spec.js')
      );
      if (hasTests) testPresence += 33;

      // 2. Check for configs (Lint, Prettier, TS, Docker, CI)
      const hasConfig = tree.some(n => 
        ['.eslintrc', '.prettierrc', 'tsconfig.json', 'Dockerfile', '.github/workflows'].some(c => n.path.includes(c))
      );
      if (hasConfig) configStandards += 33;

      // 3. Structure depth
      const maxDepth = Math.max(...tree.map(n => n.path.split('/').length));
      if (maxDepth > 3) structureDepth += 10;
      
      totalFiles += tree.length;
    }

    const baselineScore = Math.min(100, (testPresence + configStandards + structureDepth));
    return {
      score: Math.round(baselineScore),
      signals: {
        tests: testPresence > 0,
        configs: configStandards > 0,
        depth: structureDepth > 0
      }
    };
  }

  async aggregateUserEvidence(username) {
    const repos = await githubProvider.fetchUserRepos(username);
    const aggregated = {
      engineeringBaseline: await this.getEngineeringBaseline(username, repos)
    };

    // Analyze top 5 most recently updated repos for deep patterns
    const topRepos = repos.slice(0, 5);
    
    for (const repo of topRepos) {
      const repoEvidence = await this.getRepoEvidence(username, repo.name);
      if (!repoEvidence) continue;

      Object.entries(repoEvidence).forEach(([tech, data]) => {
        if (data.usageCount > 0) {
          if (!aggregated[tech]) {
            aggregated[tech] = { usageCount: 0, patterns: new Set(), maxDepth: 0, repos: new Set(), filesAnalyzed: 0, proofs: [] };
          }
          aggregated[tech].usageCount += data.usageCount;
          aggregated[tech].filesAnalyzed += data.filesAnalyzed;
          data.patterns.forEach(p => aggregated[tech].patterns.add(p));
          aggregated[tech].maxDepth = Math.max(aggregated[tech].maxDepth, data.depth);
          aggregated[tech].repos.add(repo.name);
          
          // Add proofs with repo context, limit total proofs to keep payload manageable
          if (data.proofs && aggregated[tech].proofs.length < 30) {
            const repoProofs = data.proofs.map(p => ({ ...p, repo: repo.name }));
            aggregated[tech].proofs.push(...repoProofs.slice(0, 5));
          }
        }
      });
    }

    // Serialize
    Object.keys(aggregated).forEach(tech => {
      if (tech === 'engineeringBaseline') return;
      aggregated[tech].patterns = Array.from(aggregated[tech].patterns);
      aggregated[tech].repos = Array.from(aggregated[tech].repos);
    });

    return aggregated;
  }
}

module.exports = new CodeAnalysisService();
