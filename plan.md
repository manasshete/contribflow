# ContribFlow — Implementation Plan

> Based on [`project.md`](file:///l:/5th%20semister/open%20source%20help/project.md)

---

## 🖥️ Environment Summary

| Tool | Version | Status |
|------|---------|--------|
| Node.js | v24.20.0 | ✅ Ready |
| npm | v11.19.0 | ✅ Ready |
| npx | v11.19.0 | ✅ Ready |
| Git | 2.45.2 | ✅ Ready |
| MongoDB | — | ⚠️ Not installed locally — use MongoDB Atlas (cloud) |

> [!IMPORTANT]
> MongoDB is not installed locally. Use **MongoDB Atlas** free tier with a connection string in `MONGODB_URI`. No local setup needed.

---

## 📁 Directory Structure

```
contribflow/
├── frontend/                        # Next.js + TypeScript + Tailwind + shadcn
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Landing page  /
│   │   │   ├── analyze/
│   │   │   │   └── page.tsx         # Repo URL + skills input  /analyze
│   │   │   └── repository/
│   │   │       └── [owner]/
│   │   │           └── [repo]/
│   │   │               ├── page.tsx          # Repository dashboard
│   │   │               ├── issues/
│   │   │               │   ├── page.tsx      # Issue recommendations
│   │   │               │   └── [issueNumber]/
│   │   │               │       └── page.tsx  # Contribution workspace
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── layout/              # Navbar, Footer, Shell
│   │   │   ├── repository/          # RepoCard, RepoOverview, ArchitectureView
│   │   │   ├── issues/              # IssueCard, IssueFilters, MatchBadge
│   │   │   └── workspace/           # ContribWorkspace, ChatPanel, PlanView
│   │   ├── lib/
│   │   │   ├── api.ts               # API client (fetch wrapper)
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts             # Shared TypeScript types
│   ├── .env.local
│   ├── .env.example
│   └── package.json
│
├── backend/                         # Express + TypeScript
│   ├── src/
│   │   ├── index.ts                 # Entry point, app bootstrap
│   │   ├── config/
│   │   │   └── env.ts               # Validated env vars
│   │   ├── routes/
│   │   │   ├── repository.routes.ts
│   │   │   ├── recommendation.routes.ts
│   │   │   ├── issue.routes.ts
│   │   │   └── chat.routes.ts
│   │   ├── controllers/
│   │   │   ├── repository.controller.ts
│   │   │   ├── recommendation.controller.ts
│   │   │   ├── issue.controller.ts
│   │   │   └── chat.controller.ts
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── types.ts          # AIMessage, AIResponse, AIProvider interface
│   │   │   │   ├── ai.service.ts     # AIService.generate() — provider-agnostic
│   │   │   │   └── groq.provider.ts  # GroqProvider implements AIProvider
│   │   │   ├── github/
│   │   │   │   ├── github.service.ts # Octokit wrapper
│   │   │   │   └── types.ts
│   │   │   ├── repository/
│   │   │   │   ├── repository.analyzer.ts  # RepositoryAnalyzer
│   │   │   │   └── file.prioritizer.ts     # Smart file selection
│   │   │   ├── issue/
│   │   │   │   ├── issue.analyzer.ts
│   │   │   │   └── issue.scorer.ts   # Rule-based scoring system
│   │   │   ├── recommendation/
│   │   │   │   └── recommendation.service.ts
│   │   │   └── chat/
│   │   │       └── chat.service.ts
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── Repository.model.ts
│   │   │   ├── RepositoryAnalysis.model.ts
│   │   │   ├── Issue.model.ts
│   │   │   ├── IssueRecommendation.model.ts
│   │   │   └── Conversation.model.ts
│   │   ├── middleware/
│   │   │   ├── rateLimiter.ts
│   │   │   ├── validateGithubUrl.ts
│   │   │   └── errorHandler.ts
│   │   └── utils/
│   │       ├── promptSanitizer.ts   # Anti-prompt-injection
│   │       └── cache.ts             # Simple in-memory / MongoDB cache
│   ├── .env
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                                                               │
│   Next.js Frontend (TypeScript + Tailwind + shadcn/ui)       │
│   ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│   │ Landing  │  │  Analyze /   │  │  Repository Dashboard  │ │
│   │   Page   │  │  Skills Form │  │  Issue List            │ │
│   └──────────┘  └──────────────┘  │  Workspace + AI Chat   │ │
│                                   └───────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (NEXT_PUBLIC_API_URL)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express Backend (Node.js + TypeScript)      │
│                                                               │
│  Routes → Controllers → Services                              │
│                                                               │
│  ┌─────────────────┐   ┌──────────────────┐                  │
│  │  GitHubService  │   │    AIService      │                  │
│  │  (Octokit)      │   │  (abstraction)    │                  │
│  └────────┬────────┘   └────────┬─────────┘                  │
│           │                     │                             │
│           ▼                     ▼                             │
│  ┌────────────────┐   ┌──────────────────┐                   │
│  │  GitHub API    │   │   GroqProvider   │                    │
│  │  (public repos)│   │  (Groq Cloud)    │                    │
│  └────────────────┘   └──────────────────┘                   │
│                                                               │
│  ┌─────────────────────────────────────────┐                  │
│  │           RepositoryAnalyzer            │                  │
│  │  URL Parse → Fetch → Prioritize Files   │                  │
│  │  → Detect Tech → Build AI Context       │                  │
│  └─────────────────────────────────────────┘                  │
│                                                               │
│  ┌──────────────┐   ┌────────────────────────────────────┐   │
│  │ IssueScorer  │   │      RecommendationService         │   │
│  │ (rule-based) │ + │  (Rule Score + Groq LLM Analysis)  │   │
│  └──────────────┘   └────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │    MongoDB Atlas          │
                    │  repositories            │
                    │  repositoryAnalyses      │
                    │  issues                  │
                    │  issueRecommendations    │
                    │  conversations           │
                    └──────────────────────────┘
```

---

## 🗄️ Database Schema

### `repositories`
```ts
{
  _id: ObjectId,
  owner: string,
  repo: string,
  url: string,
  metadata: {
    description: string,
    stars: number,
    forks: number,
    primaryLanguage: string,
    openIssuesCount: number,
    topics: string[],
    license: string,
    defaultBranch: string,
    updatedAt: Date
  },
  lastFetchedAt: Date,
  createdAt: Date
}
```

### `repositoryAnalyses`
```ts
{
  _id: ObjectId,
  repositoryId: ObjectId,        // ref: repositories
  owner: string,
  repo: string,
  summary: string,               // Groq-generated
  technologies: string[],
  architecture: {
    type: string,                // 'fullstack' | 'frontend-only' | 'backend-only' | ...
    frontend?: string,
    backend?: string,
    database?: string,
    testing?: string,
  },
  importantFiles: [{ path: string, reason: string }],
  contributionRequirements: string[],
  repoContext: string,           // Serialized context for AI prompts
  health: 'good' | 'moderate' | 'poor',
  cachedAt: Date,
  expiresAt: Date                // TTL — re-analyze after 24h
}
```

### `issues`
```ts
{
  _id: ObjectId,
  repositoryId: ObjectId,
  issueNumber: number,
  title: string,
  body: string,
  labels: string[],
  state: 'open' | 'closed',
  author: string,
  createdAt: Date,
  updatedAt: Date,
  commentCount: number,
  // AI-analyzed fields:
  analysis: {
    type: 'Bug' | 'Feature' | 'Documentation' | 'Refactor' | 'Testing' |
           'Performance' | 'Security' | 'Maintenance' | 'Other',
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    estimatedHours: { min: number, max: number },
    requiredSkills: string[],
    likelyAffectedAreas: string[],
    requiresDeepKnowledge: boolean,
    suitableForBeginners: boolean,
    analyzedAt: Date
  }
}
```

### `issueRecommendations`
```ts
{
  _id: ObjectId,
  sessionId: string,             // ephemeral session key
  repositoryId: ObjectId,
  developerProfile: {
    skills: string[],
    experience: 'beginner' | 'intermediate' | 'advanced',
    availableHours: number
  },
  recommendations: [{
    issueId: ObjectId,
    issueNumber: number,
    matchScore: number,          // 0–100 combined score
    ruleScore: number,           // rule-based component
    llmScore: number,            // Groq component
    difficulty: string,
    estimatedTime: string,
    requiredSkills: string[],
    matchingSkills: string[],
    reason: string,
    risk: string,
    relevantFiles: string[]
  }],
  createdAt: Date
}
```

### `conversations`
```ts
{
  _id: ObjectId,
  sessionId: string,
  repositoryId: ObjectId,
  issueNumber: number,
  messages: [{
    role: 'user' | 'assistant',
    content: string,
    timestamp: Date
  }],
  context: {
    repoSummary: string,
    issueTitle: string,
    relevantFiles: string[],
    architecture: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌐 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/repositories/analyze` | Parse URL, fetch GitHub data, run Groq analysis |
| `GET` | `/api/repositories/:owner/:repo` | Get cached repo analysis |
| `GET` | `/api/repositories/:owner/:repo/issues` | Fetch & return analyzed issues |
| `POST` | `/api/recommendations` | Match issues to developer profile |
| `GET` | `/api/issues/:owner/:repo/:issueNumber` | Get single issue detail |
| `POST` | `/api/issues/:owner/:repo/:issueNumber/analyze` | Deep-analyze issue + relevant files |
| `POST` | `/api/chat` | AI chat with contextual prompt construction |

### Request/Response Examples

**`POST /api/repositories/analyze`**
```json
// Request
{ "url": "https://github.com/vercel/next.js" }

// Response
{
  "owner": "vercel",
  "repo": "next.js",
  "summary": "...",
  "technologies": ["TypeScript", "React", "Node.js"],
  "architecture": { "type": "fullstack", "frontend": "React", ... },
  "importantFiles": [{ "path": "packages/next/src/...", "reason": "..." }],
  "health": "good",
  "openIssuesCount": 2100
}
```

**`POST /api/recommendations`**
```json
// Request
{
  "owner": "vercel",
  "repo": "next.js",
  "skills": ["React", "TypeScript"],
  "experience": "intermediate",
  "availableHours": 3
}

// Response
{
  "recommendations": [{
    "issueNumber": 142,
    "title": "Improve error handling",
    "matchScore": 94,
    "difficulty": "beginner",
    "estimatedTime": "2–3 hours",
    "matchingSkills": ["TypeScript", "React"],
    "reason": "...",
    "risk": "Low",
    "relevantFiles": ["src/api/client.ts", "src/components/ErrorBoundary.tsx"]
  }]
}
```

---

## 🤖 Groq / AI Integration Design

```
AIProvider (interface)
└── GroqProvider
    └── POST https://api.groq.com/openai/v1/chat/completions
        Model: llama-3.3-70b-versatile (or mixtral-8x7b-32768)
```

**`ai.service.ts`** exposes:
```ts
AIService.generate(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>
AIService.generateStructured<T>(prompt: string, schema: ZodSchema<T>): Promise<T>
```

**Groq prompt responsibilities:**
1. `analyzeRepository(context)` → structured repo summary
2. `analyzeIssue(issue, repoContext)` → issue type, difficulty, skills
3. `rankIssues(issues[], devProfile, repoContext)` → scored recommendations
4. `analyzeIssueCode(issue, files[])` → relevant files, plan
5. `chat(messages[], context)` → contextual response

> [!NOTE]
> All repository content passed to Groq is sanitized through `promptSanitizer.ts` to prevent prompt injection from README/issue bodies.

---

## 📊 Issue Scoring System

Final `matchScore = 0.6 × ruleScore + 0.4 × llmScore`

**Rule-based factors:**
| Factor | Weight | Logic |
|--------|--------|-------|
| Skill match | 35% | Intersection of devSkills ∩ requiredSkills |
| Time fit | 20% | Does estimated time ≤ available hours? |
| Difficulty | 20% | Match experience level to issue difficulty |
| Activity | 10% | Recent comments = active issue |
| Issue age | 10% | Not stale (opened < 6 months) |
| Good first issue label | 5% | Bonus, not the only signal |

---

## 🖼️ Frontend Pages Summary

| Route | Page | Key Components |
|-------|------|----------------|
| `/` | Landing | Hero, Features, CTA |
| `/analyze` | Analyze | URL input, Skills selector, Experience picker |
| `/repository/[owner]/[repo]` | Dashboard | RepoOverview, ArchitectureView, ImportantFiles |
| `/repository/[owner]/[repo]/issues` | Issues | IssueCard[], Filters (difficulty/skill/time/type) |
| `/repository/[owner]/[repo]/issues/[n]` | Workspace | Issue detail + AI Guide + Chat |

---

## 🔐 Environment Variables

**`backend/.env.example`**
```env
GROQ_API_KEY=
GITHUB_TOKEN=              # Optional — increases rate limit from 60 to 5000 req/hr
MONGODB_URI=               # MongoDB Atlas connection string
PORT=4000
```

**`frontend/.env.example`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🚀 MVP Implementation Phases

### Phase 0 — Project Setup *(~30 min)*
- [ ] Scaffold `frontend/` with `create-next-app` (TypeScript + Tailwind + App Router)
- [ ] Scaffold `backend/` with Express + TypeScript (`tsconfig`, `ts-node-dev`)
- [ ] Install core dependencies on both sides
- [ ] Create `.env.example` files
- [ ] Connect MongoDB Atlas

### Phase 1 — Backend Foundation *(~1 hr)*
- [ ] `config/env.ts` — validate all env vars at startup
- [ ] `models/` — define all Mongoose schemas
- [ ] `services/ai/` — `AIProvider` interface + `GroqProvider` + `AIService`
- [ ] `services/github/github.service.ts` — Octokit wrapper
- [ ] `middleware/` — rate limiter, URL validator, error handler
- [ ] `utils/promptSanitizer.ts`

### Phase 2 — Repository Analysis Vertical Slice *(~2 hr)*
- [ ] `services/repository/repository.analyzer.ts`
  - Parse GitHub URL → owner/repo
  - Fetch metadata, README, file tree, package.json, CONTRIBUTING.md
  - Smart file prioritization (no blind cloning)
  - Build `repoContext` string for AI
- [ ] `services/repository/` → Groq analysis → structured output
- [ ] `POST /api/repositories/analyze` endpoint
- [ ] Cache analysis in MongoDB (24hr TTL)
- [ ] **Test:** curl the endpoint, verify JSON output ✅

### Phase 3 — Issue Analysis *(~1.5 hr)*
- [ ] `services/github/` — fetch open issues (paginated, max 50 for MVP)
- [ ] `services/issue/issue.analyzer.ts` — batch analyze issues with Groq
- [ ] `services/issue/issue.scorer.ts` — rule-based scoring
- [ ] `GET /api/repositories/:owner/:repo/issues`
- [ ] **Test:** verify issues are fetched and analyzed ✅

### Phase 4 — Recommendation Engine *(~1.5 hr)*
- [ ] `services/recommendation/recommendation.service.ts`
  - Accept developer profile
  - Compute `ruleScore` for each issue
  - Run Groq for `llmScore` + reason/risk
  - Combine into ranked list
- [ ] `POST /api/recommendations`
- [ ] **Test:** send a developer profile, receive ranked issues ✅

### Phase 5 — Frontend Core *(~2 hr)*
- [ ] Landing page `/` — hero + CTA
- [ ] Analyze page `/analyze` — URL + skills form → POST to backend
- [ ] Repository dashboard `/repository/[owner]/[repo]`
- [ ] Issues page `/repository/[owner]/[repo]/issues` — IssueCard grid + filters
- [ ] **Test:** full UI flow from URL entry → recommendations ✅

### Phase 6 — Issue Deep Analysis + Contribution Plan *(~2 hr)*
- [ ] `POST /api/issues/:owner/:repo/:issueNumber/analyze`
  - Identify relevant files using Groq
  - Fetch those files from GitHub
  - Generate contribution plan
- [ ] Contribution Workspace page `/repository/[owner]/[repo]/issues/[n]`
  - 3-panel layout: Issue Details | AI Guide | Chat
  - Render plan with relevant files, steps, testing strategy
- [ ] **Test:** select an issue, verify plan generation ✅

### Phase 7 — AI Chat *(~1.5 hr)*
- [ ] `services/chat/chat.service.ts`
  - Build contextual prompt (repo summary + issue + relevant files + history)
  - Anti-prompt-injection sanitization
  - Stream or return response
- [ ] `POST /api/chat`
- [ ] Chat panel UI — message list, input, streaming response
- [ ] **Test:** ask questions in chat, verify contextual answers ✅

### Phase 8 — Polish & Security *(~1 hr)*
- [ ] Rate limiting on all AI endpoints (express-rate-limit)
- [ ] Input validation (zod) on all routes
- [ ] Error states in UI (failed fetch, no issues found, API errors)
- [ ] Loading skeletons on all async operations
- [ ] Responsive layout check
- [ ] Final end-to-end test

---

## 🔑 Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| AI provider | Groq only (MVP) | Spec requirement; abstraction layer allows future providers |
| GitHub auth | Optional token | Public repos work without auth; token raises rate limit |
| Repo cloning | ❌ Never | Fetch only priority files via GitHub API |
| Cache | MongoDB TTL (24hr) | Avoid re-calling GitHub + Groq for same repo |
| Scoring | Rule (60%) + LLM (40%) | Consistency + explainability |
| Prompt injection | Sanitizer middleware | All user-supplied repo content is untrusted |
| Session | Ephemeral `sessionId` | No auth in MVP; recommendations tied to session |

---

## 📦 Key Dependencies

### Frontend
```
next, react, typescript, tailwindcss
@shadcn/ui, lucide-react
axios (or native fetch)
```

### Backend
```
express, typescript, ts-node-dev
@octokit/rest               # GitHub API
groq-sdk                    # Groq API client
mongoose                    # MongoDB ODM
express-rate-limit          # Rate limiting
zod                         # Validation + structured AI output
cors, helmet, dotenv
```

---

> [!TIP]
> Start with Phase 0 → 1 → 2 and test each one before moving on. The vertical slice (Phase 2–4) is the core MVP value. Once it works end-to-end, the UI phases build on top cleanly.
