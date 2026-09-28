import Link from 'next/link';
import { ArrowRight, ChevronRight, Check } from 'lucide-react';
import { getRepository, ApiError } from '@/lib/api';
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
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 py-28 text-center">
        <div className="apple-card p-8 border border-white/[0.1] shadow-2xl flex flex-col items-center gap-4 w-full">
          <span className="text-3xl">🔍</span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {errorStatus === 404 ? "Repository Not Analyzed Yet" : 'Analysis Error'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">{errorMessage}</p>
          <Link
            href="/analyze"
            className="h-11 px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 mt-2 shadow-lg"
          >
            <span>Analyze {owner}/{repo}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 animate-fade-in-up">
      {/* Apple-style Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/analyze" className="hover:text-white transition-colors">Analyze</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white font-semibold">{owner}/{repo}</span>
      </div>

      <div className="flex flex-col gap-6">
        <RepoOverview analysis={analysis} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ArchitectureView architecture={analysis.architecture} />
          <ImportantFiles files={analysis.importantFiles} />
        </div>

        {analysis.contributionRequirements.length > 0 && (
          <div className="apple-card p-6 border border-white/[0.08] shadow-lg">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>Contribution Requirements &amp; Workflow Rules</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              {analysis.contributionRequirements.map((req) => (
                <li
                  key={req}
                  className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-3 border border-white/[0.06] text-zinc-300"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* First time contributing CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-indigo-500/[0.06] border border-indigo-500/20 mt-2">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">First time contributing to open source?</span>
            <span className="text-base font-black text-white mt-0.5">Get a guided, step-by-step path to your first PR</span>
          </div>

          <Link
            href={`/repository/${owner}/${repo}/first-contribution`}
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-indigo-500 text-white font-extrabold text-sm hover:bg-indigo-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/20"
          >
            <span>Start First Contribution Mode</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Nike High-Impact Navigation Anchor */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] mt-2">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">Next Step</span>
            <span className="text-base font-black text-white mt-0.5">Explore Issues Matched to Your Skills</span>
          </div>

          <Link
            href={`/repository/${owner}/${repo}/issues`}
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-black font-extrabold text-sm hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-white/10"
          >
            <span>View Recommended Issues</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
