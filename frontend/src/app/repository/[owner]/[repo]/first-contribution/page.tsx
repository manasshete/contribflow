import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { FirstContributionWizard } from '@/components/first-contribution/FirstContributionWizard';

interface PageParams {
  owner: string;
  repo: string;
}

export default async function FirstContributionPage({ params }: { params: Promise<PageParams> }) {
  const { owner, repo } = await params;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 animate-fade-in-up">
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/repository/${owner}/${repo}`} className="hover:text-white transition-colors">{owner}/{repo}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white font-semibold">First Contribution Mode</span>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">First Contribution Mode</h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          A guided, step-by-step path to your first contribution to <span className="text-white font-semibold font-mono">{owner}/{repo}</span>.
        </p>
      </div>

      <FirstContributionWizard owner={owner} repo={repo} />
    </main>
  );
}
