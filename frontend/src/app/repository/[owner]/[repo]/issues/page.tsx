import { RecommendationsView } from '@/components/issues/RecommendationsView';

interface PageParams {
  owner: string;
  repo: string;
}

export default async function IssuesPage({ params }: { params: Promise<PageParams> }) {
  const { owner, repo } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Your Best Contribution Opportunities
        </h1>
        <p className="text-sm text-muted-foreground">
          {owner}/{repo} — ranked by fit for your skills and time.
        </p>
      </div>
      <RecommendationsView owner={owner} repo={repo} />
    </main>
  );
}
