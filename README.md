# 🛰️ Career Intelligence: Adaptive Career GPS
![Version](https://img.shields.io/badge/version-v1.0.0-blue)
![Status](https://img.shields.io/badge/status-stable-green)
![License](https://img.shields.io/badge/license-MIT-purple)

**Stop guessing your career path. Let your code tell the story.**

Career Intelligence is an AI-powered growth platform that performs deep **AST (Abstract Syntax Tree)** analysis on your actual GitHub repositories to calculate your true technical depth, identify critical skill gaps, and provide a personalized roadmap to become "Job-Ready."

---

### 🚀 Key Features
- **Semantic Code Analysis**: Uses Babel to detect advanced architectural patterns (Custom Hooks, Middleware, etc.) beyond simple dependency counts.
- **Role-Weighted Scoring**: Evaluates you against real-world job requirements using the **Core + Depth + Momentum** formula.
- **Evidence Transparency**: See exactly which repositories and files contributed to each skill score via the **Trust Check** dashboard.
- **Grounded Readiness**: Understand your "Profile Grade" (A, B, C) and technical readiness for Junior, Mid, or Senior-level roles.

---

### 🛠️ Tech Stack
- **Frontend**: React 18, TailwindCSS, Recharts (Visualizations), Lucide React.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Engine**: Babel Parser & Traverse for AST analysis.
- **Integration**: GitHub REST API with recursive tree scanning.

---

### 🏁 Quick Start
1. **Clone & Install**:
   ```bash
   git clone https://github.com/Tanilkrishna/career-intelligence.git
   cd career-intelligence
   # Install backend
   cd backend && npm install
   # Install frontend
   cd ../frontend && npm install
   ```
2. **Environment**:
   Create a `.env` in the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   GITHUB_TOKEN=your_personal_access_token (recommended for rate limits)
   ```
3. **Run**:
   - Backend: `npm run dev` (inside /backend)
   - Frontend: `npm run dev` (inside /frontend)

---

### 🧭 Scoring Logic
- **Core Score (600 pts)**: Tied to meeting mandatory role requirements.
- **Depth Bonus (300 pts)**: Calculated from tiered technical pattern detection.
- **Momentum (100 pts)**: Based on activity and evaluation frequency.

---

### 🛡️ Known Limitations
- **Language Support**: Currently optimized for the JavaScript/TypeScript ecosystem.
- **Rate Limits**: Performance depends on GitHub API rate limits (Personal Access Token highly recommended).
- **Sampling**: Large repositories are sampled to ensure fast, responsive evaluations.

---

### 📣 Soft Launch
> "I built a tool that analyzes your real GitHub code (not your resume) and tells you exactly what to build next to become job-ready."

---
*Created with ❤️ for the Engineering Community.*
