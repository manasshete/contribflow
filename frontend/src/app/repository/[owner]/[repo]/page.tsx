import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getRepository, ApiError } from '@/lib/api';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RepoOverview } from '@/components/repository/RepoOverview';
import { ArchitectureView } from '@/components/repository/ArchitectureView';
import { ImportantFiles } from '@/components/repository/ImportantFiles';
import type { RepositoryAnalysis } from '@/types';

interface PageParams {
  owner: string;
  repo: string;
}

export default async function RepositoryPage({ params }: { params: Promise<PageParams> }) {
  const { owner, repo } = await params;

  let analysis: RepositoryAnalysis | null = null;
  let errorStatus = 500;
  let errorMessage = 'Please try again.';

  try {
    analysis = await getRepository(owner, repo);
  } catch (err) {
    errorStatus = err instanceof ApiError ? err.status : 500;
    errorMessage = err instanceof ApiError ? err.message : errorMessage;
  }

  if (!analysis) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="text-xl font-semibold">
          {errorStatus === 404 ? "We haven't analyzed this repository yet" : 'Something went wrong'}
        </h1>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <Link href="/analyze" className={cn(buttonVariants())}>
          Analyze {owner}/{repo}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="flex flex-col gap-6">
        <RepoOverview analysis={analysis} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ArchitectureView architecture={analysis.architecture} />
          <ImportantFiles files={analysis.importantFiles} />
        </div>

        {analysis.contributionRequirements.length > 0 && (
          <div className="rounded-lg border border-border p-4 text-sm">
            <p className="mb-2 font-medium">What you&apos;ll want going in</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {analysis.contributionRequirements.map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href={`/repository/${owner}/${repo}/issues`}
          className={cn(buttonVariants({ size: 'lg' }), 'w-fit gap-2')}
        >
          View Recommended Issues
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
