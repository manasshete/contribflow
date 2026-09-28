import { FileCode2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ImportantFile } from '@/types';

export function ImportantFiles({ files }: { files: ImportantFile[] }) {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Important files</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {files.map((file) => (
          <div key={file.path} className="flex items-start gap-2 text-sm">
            <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <code className="rounded bg-muted px-1 py-0.5 text-xs">{file.path}</code>
              <p className="mt-0.5 text-muted-foreground">{file.reason}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
