# ContribFlow — AI-Powered Open Source Contribution Assistant

We are building a product called **ContribFlow**.

## 1. Product Vision

ContribFlow helps developers make meaningful open-source contributions by answering one core question:

> **"What can I contribute to this repository that matches my skills and experience?"**

Developers frequently want to contribute to open source but get stuck because:

* They don't understand the repository.
* They don't know which issue to choose.
* `good first issue` labels are often insufficient.
* They don't know which files are relevant.
* They don't understand the project's architecture.
* They don't know how difficult an issue actually is.
* They don't know how to turn an issue into an implementation plan.
* They are afraid of making a bad PR.

ContribFlow should reduce this friction from:

**"I want to contribute to open source."**

to:

**"I found an issue, I understand the code, I know what to change, and I'm ready to contribute."**

---

# 2. MVP — Core User Flow

The first MVP should focus on one killer workflow:

```text
GitHub Repository
       ↓
Repository Analysis
       ↓
Open Issues Analysis
       ↓
Developer Skills
       ↓
Issue Matching
       ↓
Recommended Issues
       ↓
Select Issue
       ↓
Understand Relevant Code
       ↓
Generate Contribution Plan
       ↓
AI Contribution Assistant
```

The user should be able to:

1. Enter a public GitHub repository URL.
2. Connect/fetch repository information.
3. Analyze the repository.
4. Enter their skills and experience level.
5. Fetch and analyze open issues.
6. Receive ranked issue recommendations.
7. Understand why each issue is suitable.
8. Select an issue.
9. See which files/modules are likely relevant.
10. Get a step-by-step implementation plan.
11. Ask questions about the repository and issue through an AI chat interface.

Do NOT implement autonomous coding or automatic PR creation in the initial MVP.

---

# 3. Example User Experience

The user enters:

```text
Repository:
https://github.com/example/project

Skills:
React
JavaScript
TypeScript
Node.js

Experience:
Intermediate

Available time:
3 hours
```

ContribFlow analyzes the repository and displays:

```text
Repository Analysis

Technology:
React
TypeScript
Node.js

Architecture:
Frontend + Backend

Repository Health:
Good

Open Issues:
127
```

Then:

```text
Your Best Contribution Opportunities

#142 — Improve error handling

Match: 94%
Difficulty: Beginner
Estimated time: 2–3 hours

Why this matches you:
✓ TypeScript
✓ React
✓ No deep backend knowledge required
✓ Similar changes exist in recent PRs

Relevant files:
src/api/client.ts
src/components/ErrorBoundary.tsx
src/utils/errors.ts
```

The user can click:

**Start Contribution**

and receive:

```text
Implementation Plan

1. Understand ErrorBoundary.tsx
2. Trace API error flow
3. Add centralized error handling
4. Update error states
5. Add tests
6. Run existing test suite
7. Review the final diff
```

---

# 4. Technology Stack

## Frontend

Use:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide icons

Use a clean, modern developer-tool aesthetic.

The UI should feel like a serious developer product, not a generic AI chatbot.

---

## Backend

Use:

* Node.js
* Express
* TypeScript

Keep backend and frontend separated.

Recommended structure:

```text
frontend/
backend/
```

The backend should contain clear service layers.

---

# 5. AI Provider — Groq

IMPORTANT:

The application should use the **Groq API** for AI inference.

Do NOT use the Claude API, OpenAI API, or Gemini API for the initial implementation.

Claude Code is being used only as the development agent.

The actual ContribFlow application should communicate with Groq.

Store the API key in:

```env
GROQ_API_KEY=
```

Never expose the Groq API key to the frontend.

---

# 6. AI Abstraction Layer

Do not tightly couple the entire application to Groq.

Create an AI abstraction layer.

For example:

```text
backend/
  services/
    ai/
      ai.service.ts
      groq.provider.ts
      types.ts
```

The rest of the application should call something like:

```text
AIService.generate()
```

rather than directly calling Groq.

This allows us to add other providers later:

```text
groq.provider.ts
anthropic.provider.ts
openai.provider.ts
gemini.provider.ts
```

without rewriting the application.

For the MVP, only implement:

```text
GroqProvider
```

---

# 7. Groq AI Responsibilities

Use Groq for:

### Repository Understanding

Analyze:

* README
* package.json
* configuration files
* directory structure
* important source files
* contribution guidelines
* documentation

Generate:

* repository summary
* technology stack
* architecture explanation
* important modules
* contribution requirements

---

### Issue Analysis

For each open issue, determine:

* issue type
* difficulty
* estimated effort
* required skills
* likely affected areas
* whether it is suitable for beginners
* whether it requires deep repository knowledge

Possible issue types:

```text
Bug
Feature
Documentation
Refactor
Testing
Performance
Security
Maintenance
Other
```

---

### Contributor Matching

Given:

```text
developer skills
developer experience
available time
```

rank issues based on compatibility.

Return:

```text
matchScore
difficulty
estimatedTime
requiredSkills
matchingSkills
reason
risk
```

Do not rely only on GitHub's labels.

An issue labelled `good first issue` should not automatically be considered easy.

---

### Codebase Understanding

When the user selects an issue:

Identify:

* relevant directories
* relevant files
* relevant functions/classes
* dependencies between files
* likely modification points
* relevant tests

Explain the reasoning.

---

### Contribution Plan

Generate:

```text
Problem
Why it matters
Relevant files
Relevant code
Implementation steps
Potential risks
Testing strategy
Expected result
```

The plan should be understandable to a developer who has never seen the repository before.

---

# 8. GitHub Integration

Use:

**Octokit**

for GitHub API access.

The backend should be responsible for GitHub API communication.

Never expose GitHub API credentials unnecessarily to the frontend.

For public repositories, the MVP should work without requiring the user to authenticate with GitHub.

Support:

```text
Repository metadata
README
File tree
File contents
Open issues
Issue labels
Issue comments
Pull requests
Recent merged PRs
Contributors
```

Only implement what is necessary for the MVP first.

---

# 9. Repository Analyzer

Create a repository analysis service.

Example:

```text
RepositoryAnalyzer
```

Responsibilities:

1. Parse GitHub URL.
2. Identify owner/repository.
3. Fetch repository metadata.
4. Fetch file tree.
5. Identify important files.
6. Fetch relevant files.
7. Detect technologies.
8. Analyze architecture.
9. Create a repository context that can be passed to the AI.

Avoid downloading the entire repository blindly.

Large repositories must be handled intelligently.

Prioritize:

```text
README
package.json
requirements.txt
pyproject.toml
go.mod
Cargo.toml
pom.xml
build.gradle
CONTRIBUTING.md
.github/
configuration files
important source directories
test directories
```

The analyzer should be extensible for different programming languages.

---

# 10. Issue Ranking System

Do not let the LLM blindly decide everything.

Create a structured scoring system.

Possible factors:

```text
Skill Match
Issue Difficulty
Estimated Time
Files Affected
Repository Complexity
Issue Age
Recent Activity
Contributor Experience
Good First Issue Label
```

Create a score such as:

```text
matchScore: 0–100
```

The final recommendation can combine:

```text
rule-based score
+
LLM analysis
```

This should make recommendations more consistent and explainable.

---

# 11. Database

Use MongoDB.

Suggested collections:

```text
users
repositories
repositoryAnalyses
issues
issueRecommendations
conversations
```

Do not over-engineer the database.

For the first MVP, repository analysis can optionally be cached to avoid repeatedly calling GitHub and Groq for the same repository.

---

# 12. API Design

Create clean REST APIs.

Initial routes:

```text
POST /api/repositories/analyze

GET /api/repositories/:owner/:repo

GET /api/repositories/:owner/:repo/issues

POST /api/recommendations

GET /api/issues/:issueId

POST /api/issues/:issueId/analyze

POST /api/chat
```

The exact API structure can be refined during implementation.

---

# 13. Frontend Pages

Create:

```text
/
```

Landing page.

```text
/analyze
```

Repository analysis input.

```text
/repository/:owner/:repo
```

Repository dashboard.

```text
/repository/:owner/:repo/issues
```

Recommended contribution opportunities.

```text
/repository/:owner/:repo/issues/:issueNumber
```

Issue contribution workspace.

---

# 14. Repository Dashboard

Display:

### Repository Overview

```text
Repository name
Description
Stars
Forks
Primary language
Technologies
Open issues
Contributors
```

### Architecture

Show:

```text
Frontend
Backend
Database
Testing
Configuration
```

### Important Files

Explain why each file matters.

---

# 15. Issue Recommendation UI

Each issue card should display:

```text
Issue title

Match:
94%

Difficulty:
Beginner

Estimated time:
2–3 hours

Required skills:
React
TypeScript

Why it matches:
...

Potential risks:
...
```

Add filters:

```text
Difficulty
Skill
Time
Issue type
```

---

# 16. Contribution Workspace

This is one of the most important screens.

Layout:

```text
┌────────────────────────────────────────────┐
│ Issue                                       │
├──────────────────┬─────────────────────────┤
│ Issue Details    │ AI Contribution Guide   │
│                  │                         │
│ Problem          │ Relevant Files          │
│ Requirements     │ Architecture            │
│ Labels           │ Implementation Plan     │
│                  │ Testing Strategy        │
├──────────────────┴─────────────────────────┤
│ AI Chat                                      │
└────────────────────────────────────────────┘
```

The user should be able to ask:

```text
Why is this file relevant?
Where does this function get called?
What should I change first?
What tests should I add?
Explain this function simply.
What could break if I modify this?
```

---

# 17. AI Chat Context

The AI chat should receive relevant repository context.

Do not send the entire repository on every request.

Construct contextual prompts containing only:

```text
repository summary
issue
relevant files
relevant code
architecture
conversation history
```

This reduces token usage and improves response quality.

---

# 18. Security

Follow these rules:

* Never expose `GROQ_API_KEY` to the client.
* Validate GitHub URLs.
* Sanitize user input.
* Rate-limit AI endpoints.
* Rate-limit GitHub API requests.
* Never execute arbitrary repository code on the server.
* Never automatically execute shell commands from repository content.
* Treat repository content as untrusted input.
* Protect against prompt injection inside README files, issues, comments, and source files.

Repository content must NEVER be treated as trusted AI instructions.

---

# 19. UX Principles

The product should NOT feel like:

> "Here is a chatbot. Ask anything."

It should feel like:

> "I can help you make your first meaningful contribution."

Prioritize:

* clear explanations
* progressive disclosure
* developer-focused UI
* actionable recommendations
* evidence for AI recommendations
* low cognitive load

Avoid excessive AI-generated text.

---

# 20. Future Features — DO NOT BUILD YET

Keep the architecture extensible for:

### Local Repository Mode

User connects their local repository:

```text
ContribFlow
    ↓
Local Git Repository
    ↓
Analyze changes
    ↓
AI Review
```

### Coding Agent

Eventually:

```text
Issue
 ↓
Plan
 ↓
Create branch
 ↓
Modify files
 ↓
Run tests
 ↓
Review diff
 ↓
Create PR
```

### GitHub Authentication

Eventually allow users to:

* fork repositories
* create branches
* create commits
* create pull requests

### Contributor Profile

Track:

```text
Issues attempted
PRs created
PRs merged
Languages
Skills
Repositories
Contribution history
```

Do NOT implement these features in the MVP.

---

# 21. Development Method

IMPORTANT:

Do not build the entire application in one massive step.

Work incrementally.

First:

1. Inspect the environment.
2. Create the project structure.
3. Define architecture.
4. Define data models.
5. Set up frontend.
6. Set up backend.
7. Set up Groq provider.
8. Set up GitHub integration.

Then implement one vertical slice:

```text
GitHub URL
    ↓
Fetch repository
    ↓
Analyze repository
    ↓
Fetch issues
    ↓
Analyze issues with Groq
    ↓
Return recommendations
    ↓
Display recommendations in UI
```

Only after this works should we add the contribution workspace and AI chat.

After every major phase:

* run the application
* test the API
* fix errors
* verify the UI
* keep the implementation clean

Do not leave broken placeholder functionality.

---

# 22. Environment Variables

Create:

```env
GROQ_API_KEY=
GITHUB_TOKEN=
MONGODB_URI=
NEXT_PUBLIC_API_URL=
```

`GITHUB_TOKEN` should be optional for public repositories initially, but support it for higher GitHub API rate limits.

Never commit `.env` files.

Create `.env.example`.

---

# 23. Important Product Constraint

The main differentiator of ContribFlow is NOT:

> "AI can write code."

Many tools already do this.

The differentiator is:

> **ContribFlow understands open-source repositories and helps developers discover, understand, and successfully complete contributions that match their abilities.**

Every product decision should reinforce this.

---

# 24. Start Now

Before writing substantial code, inspect the current environment and tell me:

1. What tools/frameworks are available.
2. Proposed directory structure.
3. Architecture diagram in text.
4. Database schema.
5. API routes.
6. Groq integration design.
7. GitHub API integration design.
8. MVP implementation phases.

Then wait for approval before beginning the large implementation.

Do not make unnecessary assumptions.

Do not over-engineer.

Build a polished, functional MVP first.
