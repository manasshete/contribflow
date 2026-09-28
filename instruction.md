Use the attached ContribFlow implementation plan as the technical specification.

The architecture and phases in the plan are approved, but follow these implementation priorities:

### Primary MVP Goal

The most important end-to-end flow is:

GitHub Repository URL
→ Repository Analysis
→ Open Issue Discovery
→ Developer Skills
→ Issue Matching
→ Best Issue Recommendation
→ Issue Explanation
→ Relevant Files
→ Contribution Plan

Everything else is secondary.

### AI

Use Groq as the ONLY AI provider for the MVP.

Use the existing AI abstraction:

AIProvider
→ GroqProvider
→ AIService

Keep the provider abstraction so another model can be added later.

Do not use the Claude API.

Claude Code is only being used as the development agent.

### GitHub

Use Octokit.

Do not clone repositories.

Fetch repository data through GitHub's API and intelligently prioritize files.

Treat all GitHub content as untrusted input.

### Issue Analysis Optimization

Do NOT send all repository issues directly to Groq.

Use a two-stage pipeline:

Stage 1 — deterministic filtering:

* issue state
* labels
* issue age
* activity
* issue type
* obvious spam
* available metadata

Stage 2 — AI analysis:
Send only the most promising issues to Groq.

For the MVP, target approximately 10–15 candidate issues for deep AI analysis rather than analyzing 50 issues indiscriminately.

### Recommendation Engine

Use a hybrid ranking system.

The recommendation should consider:

* developer skill match
* available time
* experience level
* issue difficulty
* repository complexity
* issue activity
* issue age
* good-first-issue label
* AI analysis

Keep the final score explainable.

The user should be able to understand:

"Why did ContribFlow recommend this issue to me?"

### Important Feature

Analyze recent merged pull requests related to the selected issue or affected files whenever practical.

Use this information to improve difficulty estimation and implementation guidance.

For example:

If an issue appears simple but similar recent PRs required changes across many files, the system should increase its estimated complexity.

### Repository Context

Do not send the entire repository to Groq.

Build a compact repository context containing:

* README
* package/configuration files
* contribution guidelines
* repository structure
* important directories
* selected source files
* relevant tests

For issue-specific analysis, only send files relevant to that issue.

### AI Output

Prefer structured JSON responses validated with Zod.

Do not rely on free-form LLM responses when the application needs fields such as:

matchScore
difficulty
estimatedHours
requiredSkills
relevantFiles
reason
risk
implementationSteps

### Product Experience

This should feel like a developer tool, not a generic chatbot.

The primary CTA should be:

"Find My Contribution"

The user should quickly reach a useful recommendation.

### Do NOT build yet

Do not implement:

* GitHub OAuth
* automatic repository cloning
* autonomous coding agent
* automatic commits
* automatic branch creation
* automatic PR creation
* contributor reputation system
* complex user authentication

These are future features.

### Development Process

Implement incrementally.

Start with:

PHASE 0
Project setup.

Then:

PHASE 1
Backend foundation.

Then:

PHASE 2
Repository analysis vertical slice.

After Phase 2, STOP and verify the API manually.

Then implement:

PHASE 3
Issue analysis.

STOP and verify again.

Then:

PHASE 4
Recommendation engine.

STOP and verify the complete backend flow.

Only after the backend vertical slice works should you build the main frontend experience.

### Quality Requirements

For every phase:

1. Run the application.
2. Test the relevant API endpoints.
3. Fix TypeScript errors.
4. Fix runtime errors.
5. Verify environment variables.
6. Do not leave fake/mock functionality unless explicitly marked.
7. Keep the code modular.
8. Avoid unnecessary abstractions.
9. Do not rewrite working code without a reason.

### Most Important Rule

Do not optimize for writing the most code.

Optimize for getting this working:

"Paste a GitHub repository → enter my skills → receive a genuinely useful open-source contribution recommendation."

That is the core ContribFlow MVP.
