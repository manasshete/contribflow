import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { RecommendationsView } from '@/components/issues/RecommendationsView';

interface PageParams {
  owner: string;
  repo: string;
}

export default async function IssuesPage({ params }: { params: Promise<PageParams> }) {
  const { owner, repo } = await params;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 animate-fade-in-up">
      {/* Apple-style Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/repository/${owner}/${repo}`} className="hover:text-white transition-colors">{owner}/{repo}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white font-semibold">Recommendations</span>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-mono text-zinc-300 mb-2">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span>Two-Stage Deterministic Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Contribution Opportunities
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Ranked for <span className="text-white font-semibold font-mono">{owner}/{repo}</span> based on your skills, estimated difficulty, and available schedule.
        </p>
      </div>

      <RecommendationsView owner={owner} repo={repo} />
    </main>
  );
}
