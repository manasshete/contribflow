import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Architecture } from '@/types';

const LABELS: { key: keyof Architecture; label: string }[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'database', label: 'Database' },
  { key: 'testing', label: 'Testing' },
];

export function ArchitectureView({ architecture }: { architecture: Architecture }) {
  const entries = LABELS.filter(({ key }) => architecture[key]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Architecture</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="text-sm">
          <span className="text-muted-foreground">Type: </span>
          <span className="font-medium capitalize">{architecture.type.replace(/-/g, ' ')}</span>
        </div>
        {entries.length > 0 && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {entries.map(({ key, label }) => (
              <div key={key}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{architecture[key]}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
