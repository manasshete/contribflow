import Link from 'next/link';
import { ArrowRight, Check, Clock, ExternalLink, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MatchBadge } from './MatchBadge';
import type { Recommendation } from '@/types';

const RISK_STYLES: Record<Recommendation['risk'], string> = {
  Low: 'text-emerald-700 dark:text-emerald-400',
  Medium: 'text-amber-700 dark:text-amber-400',
  High: 'text-red-700 dark:text-red-400',
};

export function IssueCard({
  recommendation,
  owner,
  repo,
}: {
  recommendation: Recommendation;
  owner: string;
  repo: string;
}) {
  const { matchingSkills } = recommendation;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base leading-snug">
            #{recommendation.issueNumber} — {recommendation.title}
          </CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="capitalize">{recommendation.difficulty}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {recommendation.estimatedTime}
            </span>
            <span className={`flex items-center gap-1 ${RISK_STYLES[recommendation.risk]}`}>
              <TriangleAlert className="h-3 w-3" /> {recommendation.risk} risk
            </span>
          </div>
        </div>
        <MatchBadge score={recommendation.matchScore} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{recommendation.reason}</p>

        <div className="flex flex-wrap gap-1.5">
          {recommendation.requiredSkills.map((skill) => {
            const isMatch = matchingSkills.includes(skill);
            return (
              <Badge key={skill} variant={isMatch ? 'default' : 'outline'} className="gap-1 text-xs">
                {isMatch && <Check className="h-3 w-3" />}
                {skill}
              </Badge>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <a
            href={`https://github.com/${owner}/${repo}/issues/${recommendation.issueNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View on GitHub <ExternalLink className="h-3 w-3" />
          </a>

          <Link
            href={`/repository/${owner}/${repo}/issues/${recommendation.issueNumber}`}
            className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}
          >
            Start Contribution
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
