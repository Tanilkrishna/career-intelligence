const axios = require('axios');

class AIService {
  constructor() {
    this.token = process.env.HF_TOKEN;
    this.model = "openai/gpt-oss-20b"; // Using the model that works on user's machine
    this.apiUrl = "https://router.huggingface.co/v1/chat/completions";
  }

  async generateProjectEnrichment(userContext, baseProject) {
    if (!this.token || this.token === 'your_token_here' || this.token === '') {
      console.warn('[AI Service] No HF_TOKEN provided. Falling back to static content.');
      return baseProject;
    }

    try {
      console.log(`[AI Service] Generating enrichment via Hub Router (${this.model})...`);
      const response = await axios.post(
        this.apiUrl,
        { 
          model: this.model,
          messages: [
            {
              role: "system",
              content: "You are a senior technical architect. Respond with valid JSON only."
            },
            {
              role: "user",
              content: `Task: Enrich a professional software project template.
Role: ${userContext.role}
Skill Gaps: ${userContext.gaps.join(', ')}
Level: ${userContext.level}

Base Project:
Title: ${baseProject.title}
Description: ${baseProject.description}

Generate JSON:
1. personalizedDescription: Technical description adapting the project to their gaps.
2. strictConstraints: 3-4 non-negotiable requirements.
3. learningGoals: 3 specific technical outcomes.
4. whyThisProject: 1-2 sentences on why this project closes their specific gaps.`
            }
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" }
        },
        { 
          headers: { Authorization: `Bearer ${this.token}` },
          timeout: 20000
        }
      );

      const text = response.data.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const enrichedData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (!enrichedData) return baseProject;

      return {
        ...baseProject,
        description: enrichedData.personalizedDescription || baseProject.description,
        requirements: enrichedData.strictConstraints || [],
        learningOutcomes: enrichedData.learningGoals || [],
        impactSummary: enrichedData.whyThisProject || baseProject.impactSummary
      };
    } catch (error) {
      console.error(`[AI Service] Enrichment failed:`, error.response?.data || error.message);
      return baseProject;
    }
  }

  async getProjectHelp(userContext, project, userQuery, history = []) {
    if (!this.token || this.token === 'your_token_here' || this.token === '') {
      return "AI Debugging is currently unavailable. Check your local setup.";
    }

    try {
      console.log(`[AI Service] Getting mentor help via Hub Router (${this.model})...`);
      
      const historyMessages = history.flatMap(h => [
        { role: "user", content: h.query },
        { role: "assistant", content: h.response }
      ]);

      const response = await axios.post(
        this.apiUrl,
        { 
          model: this.model,
          messages: [
            {
              role: "system",
              content: `You are a strict but helpful senior engineer mentor.
User Role: ${userContext.role}
User Level: ${userContext.level}
Current Project: ${project.title}
Project Skills: ${project.skills.join(', ')}

CORE MENTOR RULES:
1. NEVER provide full working code or complete files.
2. You may provide small snippets, pseudocode, or architectural patterns to illustrate concepts.
3. Always guide the user step-by-step instead of solving the problem directly.
4. Prioritize technical understanding and mental models over quick shortcuts.
5. If the user asks for a full solution, refuse politely and redirect them to the next logical step in their implementation.

Goal: Help the user think and implement on their own to close their career gaps.`
            },
            ...historyMessages,
            {
              role: "user",
              content: userQuery
            }
          ],
          max_tokens: 3000
        },
        { 
          headers: { Authorization: `Bearer ${this.token}` },
          timeout: 25000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(`[AI Service] Mentor help failed:`, error.response?.data || error.message);
      return "I'm having trouble connecting to the mentor brain. Try again in a moment.";
    }
  }
}

module.exports = new AIService();
