'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getIssueDetail, analyzeIssue, ApiError } from '@/lib/api';
import { IssueDetailsPanel } from './IssueDetailsPanel';
import { ContributionGuide } from './ContributionGuide';

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
        <div className="apple-card p-8 h-80 animate-pulse border border-white/[0.06] bg-white/[0.02]" />
        <div className="apple-card p-8 h-80 animate-pulse border border-white/[0.06] bg-white/[0.02]" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30 text-rose-300 rounded-2xl p-6">
        <AlertDescription className="text-sm">
          {error instanceof ApiError ? error.message : `Could not load issue #${issueNumber}.`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
        <IssueDetailsPanel issue={issue} />

        {issue.contributionPlan ? (
          <ContributionGuide plan={issue.contributionPlan} />
        ) : (
          <div className="apple-card p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h2 className="text-xl font-black text-white tracking-tight">Contribution Guide</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Generate a custom file-by-file implementation plan for this issue: exact affected files, step-by-step checklist, potential architectural risks, and a verified testing strategy.
            </p>

            {generateError && (
              <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30 text-rose-300 rounded-xl">
                <AlertDescription className="text-xs">{generateError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="h-12 w-fit px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl mt-2"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>{generating ? 'Generating contribution plan…' : 'Generate Contribution Plan'}</span>
              {!generating && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
