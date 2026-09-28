import Link from 'next/link';
import { GitBranch } from 'lucide-react';

export function Navbar() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <GitBranch className="h-5 w-5" />
          ContribFlow
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/analyze" className="hover:text-foreground transition-colors">
            Analyze a repo
          </Link>
        </nav>
      </div>
    </header>
  );
}
