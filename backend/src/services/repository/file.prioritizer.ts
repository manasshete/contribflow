import { RepoTreeEntry } from '../github/types';

const PRIORITY_FILENAMES = [
  'package.json',
  'requirements.txt',
  'pyproject.toml',
  'go.mod',
  'cargo.toml',
  'pom.xml',
  'build.gradle',
  'contributing.md',
  'tsconfig.json',
];

const PRIORITY_DIR_HINTS = ['.github', 'src', 'lib', 'app', 'core', 'api', 'server', 'test', 'tests', '__tests__'];

const IGNORED_DIR_SEGMENTS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  'vendor',
  'coverage',
  '.next',
  '.turbo',
  'target',
]);

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.py',
  '.go',
  '.rs',
  '.java',
  '.rb',
  '.php',
  '.c',
  '.cpp',
  '.cs',
]);

export interface PrioritizedFile {
  path: string;
  reason: string;
  score: number;
}

function isIgnored(path: string): boolean {
  const segments = path.split('/');
  return segments.some((segment) => IGNORED_DIR_SEGMENTS.has(segment));
}

export function buildDirectoryStructure(tree: RepoTreeEntry[], maxDepth = 2): string[] {
  const dirs = new Set<string>();
  for (const entry of tree) {
    if (isIgnored(entry.path)) continue;
    const segments = entry.path.split('/');
    const depth = entry.type === 'tree' ? segments.length : segments.length - 1;
    if (depth === 0 || depth > maxDepth) continue;
    dirs.add(segments.slice(0, depth).join('/'));
  }
  return Array.from(dirs).sort();
}

export function prioritizeFiles(tree: RepoTreeEntry[], maxFiles = 15): PrioritizedFile[] {
  const blobs = tree.filter((entry) => entry.type === 'blob' && !isIgnored(entry.path));

  const scored: PrioritizedFile[] = blobs.map((entry) => {
    const lower = entry.path.toLowerCase();
    const filename = lower.split('/').pop() ?? '';
    let score = 0;
    let reason = 'General source file';

    if (PRIORITY_FILENAMES.includes(filename)) {
      score += 100;
      reason = 'Project manifest / configuration file';
    }

    if (filename === 'readme.md') {
      score += 90;
      reason = 'Repository README';
    }

    if (lower.startsWith('.github/')) {
      score += 40;
      reason = 'CI / repository workflow configuration';
    }

    if (PRIORITY_DIR_HINTS.some((hint) => lower.startsWith(`${hint}/`))) {
      score += 20;
      reason = 'Core source directory';
    }

    if (lower.includes('test')) {
      score += 10;
      reason = 'Test file';
    }

    const ext = `.${lower.split('.').pop()}`;
    if (SOURCE_EXTENSIONS.has(ext)) {
      score += 5;
    }

    // Prefer shallower files (closer to entry points)
    const depth = entry.path.split('/').length;
    score -= depth;

    return { path: entry.path, reason, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles);
}
