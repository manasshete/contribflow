export interface RepositoryMetadata {
  description: string | null;
  stars: number;
  forks: number;
  primaryLanguage: string | null;
  openIssuesCount: number;
  topics: string[];
  license: string | null;
  defaultBranch: string;
  updatedAt: string;
}

export interface Architecture {
  type: string;
  frontend?: string;
  backend?: string;
  database?: string;
  testing?: string;
}

export interface ImportantFile {
  path: string;
  reason: string;
}

export type RepoHealth = 'good' | 'moderate' | 'poor';

export interface RepositoryAnalysis {
  owner: string;
  repo: string;
  url: string;
  metadata: RepositoryMetadata;
  summary: string;
  technologies: string[];
  architecture: Architecture;
  importantFiles: ImportantFile[];
  contributionRequirements: string[];
  health: RepoHealth;
  cachedAt: string;
  expiresAt: string;
}

export type IssueType =
  | 'Bug'
  | 'Feature'
  | 'Documentation'
  | 'Refactor'
  | 'Testing'
  | 'Performance'
  | 'Security'
  | 'Maintenance'
  | 'Other';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Experience = 'beginner' | 'intermediate' | 'advanced';

export interface IssueAnalysis {
  type: IssueType;
  difficulty: Difficulty;
  estimatedHours: { min: number; max: number };
  requiredSkills: string[];
  likelyAffectedAreas: string[];
  requiresDeepKnowledge: boolean;
  suitableForBeginners: boolean;
  analyzedAt: string;
}

export interface ContributionPlan {
  problem: string;
  whyItMatters: string;
  relevantFiles: ImportantFile[];
  implementationSteps: string[];
  potentialRisks: string[];
  testingStrategy: string;
  expectedResult: string;
  recentActivityInsight: string;
  generatedAt: string;
}

export interface AnalyzedIssue {
  issueNumber: number;
  title: string;
  body: string | null;
  labels: string[];
  state: 'open' | 'closed';
  author: string | null;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  analysis?: IssueAnalysis;
  contributionPlan?: ContributionPlan;
}

export interface Recommendation {
  issueNumber: number;
  title: string;
  matchScore: number;
  ruleScore: number;
  llmScore: number;
  difficulty: Difficulty;
  estimatedTime: string;
  requiredSkills: string[];
  matchingSkills: string[];
  reason: string;
  risk: 'Low' | 'Medium' | 'High';
  relevantFiles: string[];
  labels: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DeveloperProfileInput {
  owner: string;
  repo: string;
  skills: string[];
  experience: Experience;
  availableHours: number;
  sessionId?: string;
}
