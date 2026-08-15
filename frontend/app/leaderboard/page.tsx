"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardEntry, api } from "../../lib/api";
import Header from "../../components/Header";
import { PageLoader, ErrorState, EmptyState } from "../../components/ui";

export default function LeaderboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [meName, setMeName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("codeladder_token");
      if (!token) {
        router.replace("/");
        return;
      }
      const [lb, me] = await Promise.all([api.leaderboard(), api.me()]);
      if (!lb.ok) {
        setError(lb.error);
        setLoading(false);
        return;
      }
      if (!me.ok) {
        setError(me.error);
        setLoading(false);
        return;
      }
      setRows(lb.data);
      setMeName(me.data.name.toLowerCase());
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <PageLoader />;
  if (error)
    return (
      <div className="min-h-screen">
        <Header activeTab="leaderboard" />
        <ErrorState message={error} onBack={() => router.push("/levels")} />
      </div>
    );

  const medal = (rank: number) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className="min-h-screen">
      <Header activeTab="leaderboard" />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">Top climbers on CodeLadder, ranked by XP.</p>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon="🏔️"
            title="No climbers yet"
            body="Solve your first challenge to take the top spot!"
            action={
              <button onClick={() => router.push("/levels")} className="btn-primary">
                Start climbing
              </button>
            }
          />
        ) : (
          <ol className="space-y-2" aria-label="Leaderboard">
            {rows.map((r) => {
              const isMe =
                meName && r.name.toLowerCase() === meName.toLowerCase();
              return (
                <li
                  key={r.rank}
                  className={`card flex items-center gap-4 p-4 ${isMe ? "border-brand-400 ring-1 ring-brand-400/60" : ""}`}
                >
                  <span className="flex w-9 shrink-0 justify-center text-center text-base font-bold text-slate-600 dark:text-slate-300">
                    {medal(r.rank) ?? (
                      <span className="tabular-nums">{r.rank}.</span>
                    )}
                  </span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-bold text-brand-600 dark:text-brand-400">
                    {(r.name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {r.name}
                      {isMe && (
                        <span className="ml-2 text-xs font-medium text-brand-600 dark:text-brand-400">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Level {r.current_level} · {r.solved_challenges} solved
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {r.xp.toLocaleString()} XP
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}