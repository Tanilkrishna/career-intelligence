# Career Intelligence

**The Predictive Career GPS for Engineers.**

Career Intelligence is a production-ready platform that verifies your technical skills by analyzing your actual code, identifies critical gaps for your target roles, and provides a personalized roadmap to job-readiness.

## 🚀 Core Features

### 🧠 AST Parsing Engine
Unlike simple keyword search, our engine uses **Abstract Syntax Tree (AST)** parsing via Babel to detect pattern depth. It distinguishes between someone who just installed React and someone who builds custom hooks and advanced middleware.

### 🧭 Predictive Career GPS
Know exactly where you stand. Our GPS banner estimates your "Time to Job-Ready" in weeks, based on your current skill gaps and your specific daily time commitment.

### 🎯 Decision-Centric Recommendations
Stop guessing what project to build next. Our engine suggests the **"Perfect Challenge"**—projects that are exactly 5-15 points above your current level and align with the mandatory requirements of your target role.

### 📈 Progress Tracking
Visualize your growth with time-series CareerScore tracking. Every evaluation snapshot is preserved, allowing you to see your technical delta over time.

## 🛠️ Architecture

### Tech Stack
- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Analysis**: Babel Parser, GitHub REST API.
- **Jobs**: In-memory job processor with status tracking.

### Scoring Formula
The `CareerScore` is a weighted aggregate of:
- **Presence (20%)**: Dependency detection in `package.json`.
- **Usage (30%)**: Frequency of patterns found in source code.
- **Depth (50%)**: Advanced pattern detection (AST evidence of hooks, middleware, etc.).

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- GitHub Personal Access Token (for high rate limits)

### Installation
1. Clone the repository.
2. Install dependencies: `npm install` in both `frontend` and `backend`.
3. Set environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/career-intel
   JWT_SECRET=your_secret
   GITHUB_TOKEN=your_token
   ```
4. Run the seed script: `cd backend && node scripts/seed.js`.
5. Start the development servers: `npm run dev`.

## 📜 License
MIT
