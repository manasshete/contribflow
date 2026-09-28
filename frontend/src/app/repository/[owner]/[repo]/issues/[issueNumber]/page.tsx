import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ContribWorkspace } from '@/components/workspace/ContribWorkspace';

interface PageParams {
  owner: string;
  repo: string;
  issueNumber: string;
}

export default async function IssueWorkspacePage({ params }: { params: Promise<PageParams> }) {
  const { owner, repo, issueNumber } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 animate-fade-in-up">
      {/* Apple-style Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/repository/${owner}/${repo}`} className="hover:text-white transition-colors">{owner}/{repo}</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/repository/${owner}/${repo}/issues`} className="hover:text-white transition-colors">Issues</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white font-semibold">Workspace #{issueNumber}</span>
      </div>

      <ContribWorkspace owner={owner} repo={repo} issueNumber={Number(issueNumber)} />
    </main>
  );
}
