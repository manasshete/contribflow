import { Star, GitFork, CircleDot, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RepositoryAnalysis } from '@/types';

const HEALTH_STYLES: Record<RepositoryAnalysis['health'], string> = {
  good: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export function RepoOverview({ analysis }: { analysis: RepositoryAnalysis }) {
  const { metadata } = analysis;
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl">
            {analysis.owner}/{analysis.repo}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{metadata.description ?? 'No description provided.'}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${HEALTH_STYLES[analysis.health]}`}>
          <ShieldCheck className="mr-1 inline h-3 w-3" />
          {analysis.health}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed">{analysis.summary}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" /> {metadata.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-4 w-4" /> {metadata.forks.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <CircleDot className="h-4 w-4" /> {metadata.openIssuesCount.toLocaleString()} open issues
          </span>
          {metadata.license && <span>License: {metadata.license}</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          {analysis.technologies.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
