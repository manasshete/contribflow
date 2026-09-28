import { ContribWorkspace } from '@/components/workspace/ContribWorkspace';

interface PageParams {
  owner: string;
  repo: string;
  issueNumber: string;
}

export default async function IssueWorkspacePage({ params }: { params: Promise<PageParams> }) {
  const { owner, repo, issueNumber } = await params;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <ContribWorkspace owner={owner} repo={repo} issueNumber={Number(issueNumber)} />
    </main>
  );
}
