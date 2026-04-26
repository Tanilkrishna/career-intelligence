# 🛰️ Career Intelligence: Adaptive AI Career GPS & Sidekick
![Version](https://img.shields.io/badge/version-v1.2.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-production_ready-emerald?style=for-the-badge)
![AI-Powered](https://img.shields.io/badge/AI-Mentor_Enabled-indigo?style=for-the-badge)

**Stop guessing your career path. Let your code tell the story.**

Career Intelligence is a premium, AI-powered growth platform designed for modern engineers. It performs deep **AST (Abstract Syntax Tree)** analysis on your actual GitHub repositories to calculate your true technical depth, identify critical skill gaps, and provide a personalized roadmap to become "Job-Ready."

---

## 🚀 Key Features

### 🧠 Semantic AST Engine
Uses **Babel** to perform deep recursive scans of your repositories. It doesn't just count dependencies; it detects advanced architectural patterns like:
- Custom React Hooks & Context Providers
- Middleware chains & Security interceptors
- Domain-driven structure & Clean Architecture
- Unit/Integration test coverage patterns

### 🤖 AI Mentor Sidekick (Strict but Helpful)
A resident technical architect built into your dashboard.
- **Strict Pedagogy**: Refuses to give full code solutions to ensure you actually learn.
- **Step-by-Step Guidance**: Provides architectural patterns, pseudocode, and mental models.
- **Context-Aware**: Knows your current project, tech stack, and skill gaps.

### 🗺️ Career GPS & Readiness Grade
- **Weeks-to-Ready**: Predicts exactly when you'll be job-ready based on your current daily commitment and gap complexity.
- **Milestone Grades**: Tiered grading (A+, A, B+, etc.) calibrated against Senior, Mid, and Junior job requirements.

### 🌐 Shareable Public Profiles
A high-fidelity, recruiter-ready profile page.
- **Evidence-Based**: Displays your score trajectory and top skills verified by code.
- **Universal Links**: Shareable via custom username or unique user identifier.
- **Technical Aesthetics**: Dark-mode, glassmorphic design that screams "Senior Engineer."

---

## 🛠️ Technology Stack

### Core Ecosystem
- **Frontend**: React 19, Vite, TailwindCSS 4, Recharts (Premium Visualizations), Lucide React.
- **Backend**: **Express 5.2.1** (Modern Async Error Handling), Node.js, MongoDB (Mongoose 9).
- **AI Integration**: HuggingFace Hub Router (`openai/gpt-oss-20b`) with a 3000-token technical context window.

### Architecture & Security
- **Modern Async**: Native Promise handling in Express 5 routes.
- **Data Integrity**: Zod-based schema validation for all user inputs.
- **Authentication**: JWT-based stateless auth with secure local persistence.
- **CORS Hardened**: Production-ready cross-origin configuration for Vercel/Render deployments.

---

## 🏁 Installation & Setup

### 1. Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- GitHub Personal Access Token (for high-rate AST scanning)
- HuggingFace API Token (for the AI Sidekick)

### 2. Clone & Install
```bash
git clone https://github.com/Tanilkrishna/career-intelligence.git
cd career-intelligence

# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_ultra_secure_secret
HF_TOKEN=your_huggingface_api_token
GITHUB_TOKEN=your_github_pat
FRONTEND_URL=http://localhost:5173
```

### 4. Start Development
```bash
# In /backend
npm run dev

# In /frontend
npm run dev
```

---

## 🧪 Scoring Formula (V2.0)
The platform uses a role-weighted composite formula:
- **Core (60% / 600pts)**: Meeting the mandatory baseline requirements for your target role.
- **Depth (30% / 300pts)**: Bonus points for advanced patterns (e.g., CI/CD, Docker, Microservices).
- **Momentum (10% / 100pts)**: Reward for consistent activity and iterative repository improvements.

---

## 📣 Design Philosophy
**"Aesthetics are Features."**
The platform is built with a "Browser-Native Zero" philosophy—replacing all native dialogs with high-fidelity, technical-themed components. Every interaction includes subtle micro-animations and transitions to provide a premium, state-of-the-art user experience.

---
*Created with ❤️ for the Engineering Community by the Career Intelligence Team.*
