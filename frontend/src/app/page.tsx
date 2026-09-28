import Link from "next/link";
import { ArrowRight, Compass, ListChecks, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Compass,
    title: "Understand the repository",
    description:
      "ContribFlow analyzes the README, structure, and key files so you're not guessing how the project fits together.",
  },
  {
    icon: ListChecks,
    title: "Match issues to your skills",
    description:
      "A hybrid rule + AI scoring engine ranks open issues against your skills, experience, and available time — with a clear reason for every match.",
  },
  {
    icon: Sparkles,
    title: "Get a contribution plan",
    description:
      "See the relevant files, likely affected areas, and risk level before you write a single line of code.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          AI-assisted open-source contribution
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Find your next open-source contribution — one that actually fits you.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Paste a GitHub repository, tell ContribFlow your skills, and get a ranked, explainable
          recommendation for which open issue to tackle first.
        </p>
        <Link href="/analyze" className={cn(buttonVariants({ size: "lg" }), "mt-2 gap-2")}>
          Find My Contribution
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border-border/80">
            <CardHeader>
              <Icon className="h-6 w-6 text-muted-foreground" />
              <CardTitle className="mt-2 text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
