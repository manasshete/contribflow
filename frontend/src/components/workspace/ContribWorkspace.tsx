'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getIssueDetail, analyzeIssue, ApiError } from '@/lib/api';
import { IssueDetailsPanel } from './IssueDetailsPanel';
import { ContributionGuide } from './ContributionGuide';
import { ChatPanel } from './ChatPanel';

export function ContribWorkspace({
  owner,
  repo,
  issueNumber,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
}) {
  const { data: issue, error, isLoading, mutate } = useSWR(
    { owner, repo, issueNumber, kind: 'issue-detail' },
    () => getIssueDetail(owner, repo, issueNumber)
  );
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError(null);
    try {
      const updated = await analyzeIssue(owner, repo, issueNumber);
      await mutate(updated, { revalidate: false });
    } catch (err) {
      setGenerateError(err instanceof ApiError ? err.message : 'Failed to generate a contribution plan.');
    } finally {
      setGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof ApiError ? error.message : `Could not load issue #${issueNumber}.`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IssueDetailsPanel issue={issue} />

        {issue.contributionPlan ? (
          <ContributionGuide plan={issue.contributionPlan} />
        ) : (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">AI Contribution Guide</CardTitle>
              <CardDescription>
                Generate a step-by-step plan: relevant files, implementation steps, risks, and a testing strategy.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {generateError && (
                <Alert variant="destructive">
                  <AlertDescription>{generateError}</AlertDescription>
                </Alert>
              )}
              <Button onClick={handleGenerate} disabled={generating} className="w-fit gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? 'Generating plan…' : 'Generate Contribution Plan'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ChatPanel owner={owner} repo={repo} issueNumber={issueNumber} />
    </div>
  );
}
