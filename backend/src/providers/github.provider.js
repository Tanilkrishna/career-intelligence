const axios = require('axios');

class GitHubProvider {
  constructor() {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'your_token_here') {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers,
    });
  }

  async fetchUserRepos(username) {
    try {
      // Fetch public repos for the user. We limit to 30 for V1 basic testing
      const response = await this.api.get(`/users/${username}/repos?per_page=30&sort=updated`);
      return response.data;
    } catch (error) {
      console.error(`[GitHub] Failed to fetch repos for user ${username}:`, error.message);
      return [];
    }
  }

  async fetchRepoTree(username, repoName) {
    try {
      // Get the main branch SHA first to get the recursive tree
      const repoInfo = await this.api.get(`/repos/${username}/${repoName}`);
      const defaultBranch = repoInfo.data.default_branch;
      
      const response = await this.api.get(`/repos/${username}/${repoName}/git/trees/${defaultBranch}?recursive=1`);
      return response.data.tree;
    } catch (error) {
      console.error(`[GitHub] Failed to fetch tree for ${repoName}:`, error.message);
      return [];
    }
  }

  async fetchFileContent(username, repoName, path) {
    try {
      const response = await this.api.get(`/repos/${username}/${repoName}/contents/${path}`);
      if (Array.isArray(response.data)) return null; // Path is a directory
      const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return decodedContent;
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error(`[GitHub] Error fetching file ${path} for ${repoName}:`, error.message);
      }
      return null;
    }
  }

  async fetchPackageJson(username, repoName) {
    return this.fetchFileContent(username, repoName, 'package.json').then(content => {
      try {
        return content ? JSON.parse(content) : null;
      } catch (e) {
        return null;
      }
    });
  }

  async getUserDependencies(username) {
    const repos = await this.fetchUserRepos(username);
    const uniqueDependencies = new Set();

    // Limit to top 5 most recently updated repos to stay within rate limits but gain depth
    const topRepos = repos.slice(0, 5);

    for (const repo of topRepos) {
      const tree = await this.fetchRepoTree(username, repo.name);
      
      // Look for package.json files recursively
      const packageFiles = tree.filter(node => 
        node.type === 'blob' && node.path.endsWith('package.json')
      );

      for (const file of packageFiles) {
        const content = await this.fetchFileContent(username, repo.name, file.path);
        if (content) {
          try {
            const packageJson = JSON.parse(content);
            const deps = {
              ...(packageJson.dependencies || {}),
              ...(packageJson.devDependencies || {})
            };
            Object.keys(deps).forEach(dep => uniqueDependencies.add(dep));
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return Array.from(uniqueDependencies);
  }
}

module.exports = new GitHubProvider();
