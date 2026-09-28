import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalyzedIssue } from '@/types';

export function IssueDetailsPanel({ issue }: { issue: AnalyzedIssue }) {
  const { analysis } = issue;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-base leading-snug">
          #{issue.issueNumber} — {issue.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {analysis && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="secondary" className="capitalize">
              {analysis.type}
            </Badge>
            <span className="capitalize">{analysis.difficulty}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {analysis.estimatedHours.min}-{analysis.estimatedHours.max}h
            </span>
          </div>
        )}

        <p className="whitespace-pre-wrap text-muted-foreground">{issue.body || 'No description provided.'}</p>

        <div className="flex flex-wrap gap-1.5">
          {issue.labels.map((label) => (
            <Badge key={label} variant="outline" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>

        {analysis && analysis.requiredSkills.length > 0 && (
          <div>
            <p className="mb-1.5 font-medium">Required skills</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.requiredSkills.map((skill) => (
                <Badge key={skill} className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
