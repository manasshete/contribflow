import { FileCode2, Info, ListChecks, TriangleAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ContributionPlan } from '@/types';

export function ContributionGuide({ plan }: { plan: ContributionPlan }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-base">AI Contribution Guide</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 text-sm">
        <section>
          <p className="mb-1 font-medium">Problem</p>
          <p className="text-muted-foreground">{plan.problem}</p>
        </section>

        <section>
          <p className="mb-1 font-medium">Why it matters</p>
          <p className="text-muted-foreground">{plan.whyItMatters}</p>
        </section>

        {plan.relevantFiles.length > 0 && (
          <section>
            <p className="mb-2 flex items-center gap-1.5 font-medium">
              <FileCode2 className="h-4 w-4" /> Relevant files
            </p>
            <div className="flex flex-col gap-2">
              {plan.relevantFiles.map((file) => (
                <div key={file.path}>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">{file.path}</code>
                  <p className="mt-0.5 text-muted-foreground">{file.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className="mb-2 flex items-center gap-1.5 font-medium">
            <ListChecks className="h-4 w-4" /> Implementation steps
          </p>
          <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
            {plan.implementationSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {plan.potentialRisks.length > 0 && (
          <section>
            <p className="mb-2 flex items-center gap-1.5 font-medium">
              <TriangleAlert className="h-4 w-4" /> Potential risks
            </p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {plan.potentialRisks.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <p className="mb-1 font-medium">Testing strategy</p>
          <p className="text-muted-foreground">{plan.testingStrategy}</p>
        </section>

        <section>
          <p className="mb-1 font-medium">Expected result</p>
          <p className="text-muted-foreground">{plan.expectedResult}</p>
        </section>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{plan.recentActivityInsight}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
