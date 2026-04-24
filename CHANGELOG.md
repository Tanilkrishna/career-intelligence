# Changelog - Career Intelligence

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-04-24
### Added
- **Contextual Onboarding**: Multi-step wizard to capture target role, experience level, and daily commitment.
- **AST Parsing Engine (Phase 1 & 2)**: Deep repository analysis using regex patterns and Babel AST parsing to detect skill depth.
- **Predictive Career GPS**: Time-to-goal estimation banner and personalized project timelines.
- **Refined Recommendation Engine**: Decision-centric project suggestions based on "Perfect Challenge" difficulty synergy and role alignment.
- **Progress Tracking**: Time-series CareerScore history and delta visualization using Recharts.
- **Weighted Gap Analysis**: Deterministic urgency scoring for skills based on priority multipliers (Mandatory/Bonus).
- **Authentication**: JWT-based auth with protected routes and onboarding guards.

### Changed
- Refactored `AnalysisProcessor` to use the new multi-factor scoring formula (Presence + Usage + Depth).
- Upgraded `GitHubProvider` to support recursive tree fetching and file content retrieval.
- Enhanced Dashboard UI with adaptive banners and glassmorphic design.

### Fixed
- Improved error handling for invalid GitHub usernames and missing `package.json`.
- Optimized GitHub API calls to stay within rate limits using heuristic sampling.
- Fixed layout overflows on smaller dashboard screens.
