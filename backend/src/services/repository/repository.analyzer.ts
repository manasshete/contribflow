import { z } from 'zod';
import { GitHubService } from '../github/github.service';
import { RepoMetadata } from '../github/types';
import { buildDirectoryStructure, prioritizeFiles } from './file.prioritizer';

const MAX_FILE_CHARS = 600;
const MAX_CONTEXT_FILES = 6;
const MAX_README_CHARS = 1200;

export const repositoryAnalysisSchema = z.object({
  summary: z.string(),
  technologies: z.array(z.string()),
  architecture: z.object({
    type: z.string(),
    frontend: z.string().optional(),
    backend: z.string().optional(),
    database: z.string().optional(),
    testing: z.string().optional(),
  }),
  importantFiles: z.array(z.object({ path: z.string(), reason: z.string() })),
  contributionRequirements: z.array(z.string()),
  health: z.enum(['good', 'moderate', 'poor']),
});

export type RepositoryAnalysisResult = z.infer<typeof repositoryAnalysisSchema>;

export interface RepositoryContextBundle {
  metadata: RepoMetadata;
  repoContext: string;
  candidateFilePaths: string[];
}

export async function buildRepositoryContext(owner: string, repo: string): Promise<RepositoryContextBundle> {
  const metadata = await GitHubService.getRepoMetadata(owner, repo);
  const [readme, tree] = await Promise.all([
    GitHubService.getReadme(owner, repo),
    GitHubService.getFileTree(owner, repo, metadata.defaultBranch),
  ]);

  const directories = buildDirectoryStructure(tree);
  const prioritized = prioritizeFiles(tree, MAX_CONTEXT_FILES);

  const fileContents = await Promise.all(
    prioritized.map(async (file) => {
      const content = await GitHubService.getFileContent(owner, repo, file.path);
      if (!content) return null;
      const trimmed = content.length > MAX_FILE_CHARS ? `${content.slice(0, MAX_FILE_CHARS)}\n...[truncated]` : content;
      return { path: file.path, reason: file.reason, content: trimmed };
    })
  );

  const contextParts: string[] = [];
  contextParts.push(`# Repository: ${owner}/${repo}`);
  contextParts.push(`Description: ${metadata.description ?? 'N/A'}`);
  contextParts.push(`Primary language: ${metadata.primaryLanguage ?? 'unknown'}`);
  contextParts.push(`Topics: ${metadata.topics.join(', ') || 'none'}`);
  contextParts.push(`Stars: ${metadata.stars}, Open issues: ${metadata.openIssuesCount}`);

  if (readme) {
    contextParts.push(`\n## README (excerpt)\n${readme.slice(0, MAX_README_CHARS)}`);
  }

  contextParts.push(`\n## Directory Structure\n${directories.slice(0, 25).join('\n')}`);

  for (const file of fileContents) {
    if (!file) continue;
    contextParts.push(`\n## File: ${file.path} (${file.reason})\n\`\`\`\n${file.content}\n\`\`\``);
  }

  return {
    metadata,
    repoContext: contextParts.join('\n'),
    candidateFilePaths: prioritized.map((f) => f.path),
  };
}

/**
 * Derives a repository analysis purely from GitHub metadata, file tree,
 * package/config file detection, and README keyword matching - no AI.
 */
function deriveRepositoryAnalysis(
  metadata: RepoMetadata,
  candidateFilePaths: string[],
  repoContext: string
): RepositoryAnalysisResult {
  const lang = metadata.primaryLanguage || 'JavaScript';
  const desc = metadata.description || `Open source project ${metadata.repo}.`;

  const techSet = new Set<string>([lang, ...metadata.topics]);
  if (/next/i.test(repoContext) || /react/i.test(repoContext)) techSet.add('React');
  if (/vue/i.test(repoContext)) techSet.add('Vue');
  if (/express/i.test(repoContext)) techSet.add('Express');
  if (/typescript/i.test(repoContext) || candidateFilePaths.some((p) => p.endsWith('.ts') || p.endsWith('.tsx'))) techSet.add('TypeScript');
  if (/tailwind/i.test(repoContext)) techSet.add('Tailwind CSS');
  if (/docker/i.test(repoContext) || candidateFilePaths.some((p) => p.includes('Dockerfile'))) techSet.add('Docker');
  if (/python/i.test(repoContext)) techSet.add('Python');
  if (/node/i.test(repoContext)) techSet.add('Node.js');

  let archType = 'library';
  let frontend: string | undefined;
  let backend: string | undefined;
  let testing: string | undefined;

  const hasFrontend = candidateFilePaths.some((p) => /components|views|pages|app|src\/ui/i.test(p)) || techSet.has('React') || techSet.has('Vue');
  const hasBackend = candidateFilePaths.some((p) => /server|api|controllers|routes|services/i.test(p)) || techSet.has('Express') || techSet.has('Node.js');

  if (hasFrontend && hasBackend) archType = 'fullstack';
  else if (hasFrontend) archType = 'frontend-only';
  else if (hasBackend) archType = 'backend-only';

  if (hasFrontend) frontend = techSet.has('React') ? 'React / Modern UI' : 'Frontend UI';
  if (hasBackend) backend = techSet.has('Express') ? 'Express / Node.js' : 'Backend Services';
  if (/jest|vitest|pytest|mocha|playwright/i.test(repoContext)) testing = 'Unit & Integration Tests';

  const importantFiles = candidateFilePaths.slice(0, 5).map((path) => ({
    path,
    reason: 'Key entry point or architectural configuration manifest.',
  }));

  const health = metadata.stars > 500 ? ('good' as const) : ('moderate' as const);

  return {
    summary: `${desc} Powered by ${Array.from(techSet).slice(0, 3).join(', ')} with an active open-source codebase.`,
    technologies: Array.from(techSet).slice(0, 6),
    architecture: {
      type: archType,
      frontend,
      backend,
      testing,
    },
    importantFiles: importantFiles.length > 0 ? importantFiles : [{ path: 'package.json', reason: 'Project manifest and dependencies.' }],
    contributionRequirements: [
      `Proficiency in ${lang}`,
      'Git and GitHub workflow experience',
      'Understanding of project architecture and testing setup',
    ],
    health,
  };
}

export async function analyzeRepository(owner: string, repo: string): Promise<{
  metadata: RepoMetadata;
  analysis: RepositoryAnalysisResult;
  repoContext: string;
}> {
  const { metadata, repoContext, candidateFilePaths } = await buildRepositoryContext(owner, repo);
  const analysis = deriveRepositoryAnalysis(metadata, candidateFilePaths, repoContext);

  return { metadata, analysis, repoContext };
}
