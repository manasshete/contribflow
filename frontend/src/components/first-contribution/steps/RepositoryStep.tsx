import { ArrowRight, FolderTree, TestTube, Package, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RepositoryUnderstanding } from '@/types';

function DirGroup({ label, dirs }: { label: string; dirs: string[] }) {
  if (dirs.length === 0) return null;
  return (
    <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.06]">
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block mb-1.5">{label}</span>
      <div className="flex flex-col gap-1">
        {dirs.slice(0, 6).map((dir) => (
          <code key={dir} className="text-xs font-mono text-zinc-300">
            ├── {dir}
          </code>
        ))}
      </div>
    </div>
  );
}

export function RepositoryStep({
  repository,
  onNext,
}: {
  repository: RepositoryUnderstanding;
  onNext: () => void;
}) {
  const { mainDirectories } = repository;
  const hasDirs = mainDirectories.frontend.length + mainDirectories.backend.length + mainDirectories.tests.length > 0;

  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-6">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Step 1 of 8</span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">Understand the Repository</h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Start by understanding these three areas: what the project does, how the code is organized, and how
          contributions are validated (tests, package manager, contribution guide).
        </p>
      </div>

      <div className="rounded-2xl bg-white/[0.03] p-5 border border-white/[0.06]">
        <h2 className="text-lg font-bold text-white">
          {repository.owner}/<span className="titanium-text">{repository.repo}</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
          {repository.description ?? 'No description provided.'}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {repository.primaryLanguage && (
            <span className="rounded-full bg-white/[0.06] border border-white/[0.1] px-3 py-1 text-xs font-mono font-semibold text-zinc-200">
              {repository.primaryLanguage}
            </span>
          )}
          {repository.technologies.map((tech) => (
            <span key={tech} className="rounded-full bg-white/[0.06] border border-white/[0.1] px-3 py-1 text-xs font-mono text-zinc-300">
              {tech}
            </span>
          ))}
          <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-mono capitalize text-indigo-300">
            {repository.repositoryType.replace(/-/g, ' ')}
          </span>
        </div>
      </div>

      {hasDirs && (
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-2">
            <FolderTree className="h-3.5 w-3.5 text-zinc-400" /> Repository Structure
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DirGroup label="Frontend" dirs={mainDirectories.frontend} />
            <DirGroup label="Backend" dirs={mainDirectories.backend} />
            <DirGroup label="Tests" dirs={mainDirectories.tests} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/[0.02] p-3.5 border border-white/[0.06] flex items-center gap-2.5">
          <TestTube className="h-4 w-4 text-zinc-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Testing Framework</span>
            <span className="text-xs font-bold text-white">{repository.testingFramework ?? 'Not detected'}</span>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] p-3.5 border border-white/[0.06] flex items-center gap-2.5">
          <Package className="h-4 w-4 text-zinc-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Package Manager</span>
            <span className="text-xs font-bold text-white">{repository.packageManager ?? 'Not detected'}</span>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] p-3.5 border border-white/[0.06] flex items-center gap-2.5">
          <BookOpenCheck className="h-4 w-4 text-zinc-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Contribution Guide</span>
            <span className="text-xs font-bold text-white">
              {repository.contributionGuideAvailable ? 'Available' : 'Not found'}
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="h-12 w-fit px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl self-end"
      >
        <span>I&apos;m Ready</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
