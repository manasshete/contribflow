'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ApiError,
  getFirstContributionState,
  getIssueDetail,
  selectFirstContributionIssue,
  submitFirstContributionProfile,
  updateFirstContributionProgress,
} from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';
import { ProgressRail } from './ProgressRail';
import { RepositoryStep } from './steps/RepositoryStep';
import { IssueSelectionStep } from './steps/IssueSelectionStep';
import { IssueUnderstandingStep } from './steps/IssueUnderstandingStep';
import { CodeExplorationStep } from './steps/CodeExplorationStep';
import { SimilarPRStep } from './steps/SimilarPRStep';
import { ChecklistStep } from './steps/ChecklistStep';
import { PrPreparationStep } from './steps/PrPreparationStep';
import { CompletionStep } from './steps/CompletionStep';
import type { AnalyzedIssue, Experience, IssueType, Recommendation } from '@/types';

export function FirstContributionWizard({ owner, repo }: { owner: string; repo: string }) {
  const [sessionId, setSessionId] = useState('');
  useEffect(() => setSessionId(getOrCreateSessionId()), []);

  const { data, error, isLoading, mutate } = useSWR(
    sessionId ? { owner, repo, sessionId, kind: 'first-contribution' } : null,
    () => getFirstContributionState(owner, repo, sessionId)
  );

  const [step1Advanced, setStep1Advanced] = useState(false);
  const [viewStep, setViewStep] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [issue, setIssue] = useState<AnalyzedIssue | null>(null);
  const [selectedIssueHealth, setSelectedIssueHealth] = useState<number | null>(null);

  const session = data?.session ?? null;
  const repository = data?.repository ?? null;

  const currentStep = session?.currentStep ?? (step1Advanced ? 2 : 1);
  const displayStep = viewStep ?? currentStep;

  // Rehydrate recommendations on resume (step 2, no local recs yet) from the stored profile.
  useEffect(() => {
    if (session && session.currentStep === 2 && !recommendations && session.availableHours && session.experience) {
      submitFirstContributionProfile(owner, repo, {
        sessionId,
        skills: session.skills,
        experience: session.experience,
        availableHours: session.availableHours,
        preferredType: session.preferredType,
      })
        .then((res) => setRecommendations(res.recommendations))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentStep]);

  // Rehydrate the selected issue on resume (step >= 3, no local issue yet).
  useEffect(() => {
    if (session?.selectedIssueNumber && session.currentStep >= 3 && !issue) {
      getIssueDetail(owner, repo, session.selectedIssueNumber)
        .then(setIssue)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.selectedIssueNumber]);

  async function advance(nextStep: number, completedStep: number) {
    setViewStep(null);
    if (!session) return;
    const res = await updateFirstContributionProgress(session._id, {
      currentStep: nextStep,
      completedSteps: [completedStep],
    });
    await mutate({ repository: repository!, session: res.session }, { revalidate: false });
  }

  async function handleSubmitProfile(profile: {
    skills: string[];
    experience: Experience;
    availableHours: number;
    preferredType: IssueType | 'Any';
  }) {
    const res = await submitFirstContributionProfile(owner, repo, { sessionId, ...profile });
    setRecommendations(res.recommendations);
    await mutate({ repository: repository!, session: res.session }, { revalidate: false });
  }

  async function handleChooseIssue(issueNumber: number) {
    const health = recommendations?.find((r) => r.issueNumber === issueNumber)?.issueHealth ?? null;
    setSelectedIssueHealth(health);
    const res = await selectFirstContributionIssue(owner, repo, sessionId, issueNumber);
    setIssue(res.issue);
    setViewStep(null);
    await mutate({ repository: repository!, session: res.session }, { revalidate: false });
  }

  async function handleToggleChecklist(id: string, done: boolean) {
    if (!session) return;
    const optimistic = {
      ...session,
      checklist: session.checklist.map((c) => (c.id === id ? { ...c, done } : c)),
    };
    await mutate({ repository: repository!, session: optimistic }, { revalidate: false });
    const res = await updateFirstContributionProgress(session._id, { checklistToggle: { id, done } });
    await mutate({ repository: repository!, session: res.session }, { revalidate: false });
  }

  if (isLoading || !sessionId) {
    return (
      <div className="apple-card p-14 text-center flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-white" />
        <span className="text-sm text-zinc-400">Loading First Contribution Mode...</span>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof ApiError ? error.message : `Could not load ${owner}/${repo}.`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressRail
        currentStep={currentStep}
        completedSteps={session?.completedSteps ?? []}
        onSelect={(step) => setViewStep(step)}
      />

      {displayStep === 1 && (
        <RepositoryStep
          repository={repository}
          onNext={() => {
            setStep1Advanced(true);
            if (session && session.currentStep === 1) {
              advance(2, 1);
            }
          }}
        />
      )}

      {displayStep === 2 && (
        <IssueSelectionStep
          recommendations={recommendations}
          onSubmitProfile={handleSubmitProfile}
          onChooseIssue={handleChooseIssue}
          onResetProfile={() => setRecommendations(null)}
          owner={owner}
          repo={repo}
          initialProfile={
            session
              ? {
                  skills: session.skills,
                  experience: session.experience,
                  availableHours: session.availableHours,
                  preferredType: session.preferredType,
                }
              : undefined
          }
        />
      )}

      {displayStep === 3 && (
        issue ? (
          <IssueUnderstandingStep
            issue={issue}
            issueHealth={selectedIssueHealth}
            onNext={() => advance(4, 3)}
          />
        ) : (
          <div className="apple-card p-12 text-center flex items-center justify-center gap-3 border border-white/[0.08]">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="text-sm text-zinc-400">Loading issue details...</span>
          </div>
        )
      )}

      {displayStep === 4 && (
        issue?.contributionPlan ? (
          <CodeExplorationStep plan={issue.contributionPlan} onNext={() => advance(5, 4)} />
        ) : (
          <div className="apple-card p-12 text-center flex items-center justify-center gap-3 border border-white/[0.08]">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="text-sm text-zinc-400">Loading code exploration plan...</span>
          </div>
        )
      )}

      {displayStep === 5 && (
        issue?.contributionPlan ? (
          <SimilarPRStep
            owner={owner}
            repo={repo}
            similarPRs={issue.contributionPlan.similarPRs}
            onNext={() => advance(6, 5)}
          />
        ) : (
          <div className="apple-card p-12 text-center flex items-center justify-center gap-3 border border-white/[0.08]">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="text-sm text-zinc-400">Loading similar PR analysis...</span>
          </div>
        )
      )}

      {displayStep === 6 && (
        session ? (
          <ChecklistStep
            checklist={session.checklist}
            onToggle={handleToggleChecklist}
            onNext={() => advance(7, 6)}
          />
        ) : (
          <div className="apple-card p-12 text-center flex items-center justify-center gap-3 border border-white/[0.08]">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="text-sm text-zinc-400">Loading contribution checklist...</span>
          </div>
        )
      )}

      {displayStep === 7 && (
        session ? (
          <PrPreparationStep
            owner={owner}
            repo={repo}
            checklist={session.checklist}
            onToggle={handleToggleChecklist}
            onNext={() => advance(8, 7)}
          />
        ) : (
          <div className="apple-card p-12 text-center flex items-center justify-center gap-3 border border-white/[0.08]">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="text-sm text-zinc-400">Loading PR preparation guide...</span>
          </div>
        )
      )}

      {displayStep === 8 && (
        session ? (
          <CompletionStep session={session} issue={issue} />
        ) : (
          <div className="apple-card p-12 text-center flex items-center justify-center gap-3 border border-white/[0.08]">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="text-sm text-zinc-400">Loading completion status...</span>
          </div>
        )
      )}
    </div>
  );
}
