import { FileCode2 } from 'lucide-react';
import type { ImportantFile } from '@/types';

export function ImportantFiles({ files }: { files: ImportantFile[] }) {
  if (files.length === 0) return null;

  return (
    <div className="apple-card p-6 border border-white/[0.08] shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-zinc-300" />
            <span>Key Architecture Files</span>
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">
            {files.length} critical files
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {files.map((file) => (
            <div
              key={file.path}
              className="flex items-start gap-2.5 rounded-xl bg-white/[0.02] p-3 border border-white/[0.06] hover:border-white/20 transition-colors"
            >
              <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <div className="flex flex-col gap-1 min-w-0">
                <code className="w-fit rounded-md bg-black/60 px-2 py-0.5 text-xs font-mono font-bold text-zinc-200 border border-white/[0.08] truncate max-w-full">
                  {file.path}
                </code>
                <p className="text-xs text-zinc-400 leading-relaxed">{file.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
