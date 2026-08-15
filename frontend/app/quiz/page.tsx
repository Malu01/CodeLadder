"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuizLevelStatus, api } from "../../lib/api";
import Header from "../../components/Header";
import { PageLoader, ErrorState, EmptyState } from "../../components/ui";

const LEVEL_META: Record<number, { color: string; ring: string; icon: string }> = {
  1: { color: "bg-emerald-500", ring: "text-emerald-600 dark:text-emerald-400", icon: "🌱" },
  2: { color: "bg-sky-500", ring: "text-sky-600 dark:text-sky-400", icon: "⚙️" },
  3: { color: "bg-amber-500", ring: "text-amber-600 dark:text-amber-400", icon: "🚀" },
  4: { color: "bg-fuchsia-500", ring: "text-fuchsia-600 dark:text-fuchsia-400", icon: "🧠" },
  5: { color: "bg-violet-500", ring: "text-violet-600 dark:text-violet-400", icon: "🤖" },
};

export default function QuizPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<QuizLevelStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("codeladder_token");
      if (!token) {
        router.replace("/");
        return;
      }
      const res = await api.quizLevels();
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setLevels(res.data);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <PageLoader />;

  if (error)
    return (
      <div className="min-h-screen">
        <Header activeTab="quiz" />
        <ErrorState message={error} onBack={() => router.push("/levels")} />
      </div>
    );

  const earned = levels.filter((l) => l.badge).length;

  return (
    <div className="min-h-screen">
      <Header activeTab="quiz" />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Quiz Arena</h1>
            <p className="page-subtitle">
              5 levels · 25 questions each · score 20/25 or higher to earn a downloadable badge · 3 attempts per level.
            </p>
          </div>
          {levels.length > 0 && (
            <span className="chip shrink-0 border border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-900 dark:bg-brand-500/10 dark:text-brand-400">
              🏆 {earned} of {levels.length} badges earned
            </span>
          )}
        </div>

        {levels.length === 0 ? (
          <EmptyState
            icon="📘"
            title="No quiz levels available yet"
            body="Check back soon — the arena is being stocked."
          />
        ) : (
          <div className="space-y-4">
            {levels.map((lv) => {
              const meta = LEVEL_META[lv.level] ?? { color: "bg-slate-500", ring: "text-slate-500", icon: "📘" };
              return (
                <button
                  key={lv.level}
                  onClick={() => router.push(`/quiz/${lv.level}`)}
                  className="group card card-hover flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl text-white shadow-sm ${meta.color}`}
                      aria-hidden="true"
                    >
                      {meta.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                        Level {lv.level}
                      </p>
                      <p className="text-lg font-extrabold text-slate-900 group-hover:text-brand-600 dark:text-white">
                        {lv.title}
                      </p>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{lv.description}</p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        {lv.total} questions · Best: {lv.best_score}/{lv.total} · {lv.participants} participant
                        {lv.participants === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {lv.badge ? (
                      <span className="chip bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                        ✓ Badge earned
                      </span>
                    ) : lv.attempts === 0 ? (
                      <span className={`text-sm font-semibold ${meta.ring}`}>Start →</span>
                    ) : lv.attempts_left > 0 ? (
                      <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                        Retake ({lv.attempts_left} left) →
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-red-500">No attempts left</span>
                    )}
                    {lv.rank != null && lv.participants > 0 && (
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Rank #{lv.rank} of {lv.participants}
                      </span>
                    )}
                    {lv.attempts > 0 && lv.attempts_left === 0 && !lv.badge && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">Best: {lv.best_score}/{lv.total}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}