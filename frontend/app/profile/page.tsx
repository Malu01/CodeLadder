"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Level, Me, QuizLevelStatus, api } from "../../lib/api";
import Header from "../../components/Header";
import { PageLoader, ErrorState } from "../../components/ui";

const BAND_META: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "text-emerald-600 dark:text-emerald-400" },
  intermediate: { label: "Intermediate", color: "text-amber-600 dark:text-amber-400" },
  advanced: { label: "Advanced", color: "text-red-600 dark:text-red-400" },
  expert: { label: "Expert", color: "text-fuchsia-600 dark:text-fuchsia-400" },
  master: { label: "Master", color: "text-cyan-600 dark:text-cyan-400" },
  legend: { label: "Legend", color: "text-orange-600 dark:text-orange-400" },
  mythic: { label: "Mythic", color: "text-violet-600 dark:text-violet-400" },
};

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [quiz, setQuiz] = useState<QuizLevelStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("codeladder_token");
      if (!token) {
        router.replace("/");
        return;
      }
      const [meRes, lvlRes] = await Promise.all([api.me(), api.levels()]);
      if (!meRes.ok) {
        setError(meRes.error);
        setLoading(false);
        return;
      }
      if (!lvlRes.ok) {
        setError(lvlRes.error);
        setLoading(false);
        return;
      }
      setMe(meRes.data);
      setNameInput(meRes.data.name);
      setLevels(lvlRes.data);
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    (async () => {
      const res = await api.quizLevels();
      if (res.ok) setQuiz(res.data);
    })();
  }, [router]);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    setSaving(true);
    setSaveMsg(null);
    const res = await api.updateName(name);
    setSaving(false);
    if (!res.ok) {
      setSaveMsg(res.error);
      return;
    }
    setMe(res.data);
    setSaveMsg("Name updated.");
    setTimeout(() => setSaveMsg(null), 2500);
  }

  if (loading) return <PageLoader />;
  if (error || !me)
    return (
      <div className="min-h-screen">
        <Header />
        <ErrorState message={error || "Something went wrong"} onBack={() => router.push("/levels")} />
      </div>
    );

  const solved = new Set(levels.flatMap((l) => l.challenges.filter((c) => c.solved).map((c) => c.id)));
  const solvedList = levels.flatMap((l) =>
    l.challenges
      .filter((c) => solved.has(c.id))
      .map((c) => ({ id: c.id, title: c.title, levelPosition: l.position, band: l.band, levelTitle: l.title }))
  );
  const totalChallenges = levels.reduce((n, l) => n + l.challenges.length, 0);

  const statCards = [
    { label: "Rank", value: me.rank ? `#${me.rank}` : "–" },
    { label: "Points", value: me.xp.toLocaleString() },
    { label: "Coins", value: (me.coins ?? 0).toLocaleString(), icon: "🪙" },
    { label: "Solved", value: `${me.solved_challenges}/${totalChallenges}` },
    { label: "Level", value: String(me.current_level) },
    { label: "Streak", value: `${me.streak ?? 0} 🔥` },
    { label: "Submissions", value: String(me.submission_count ?? 0) },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-extrabold text-white shadow-card">
            {(me.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            {editingName ? (
              <form onSubmit={handleSaveName} className="flex flex-wrap items-center gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  aria-label="Display name"
                  className="input w-44 sm:w-56"
                />
                <button
                  disabled={saving || !nameInput.trim()}
                  className="btn-primary px-3 py-1.5 text-sm"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(false);
                    setNameInput(me.name);
                    setSaveMsg(null);
                  }}
                  className="btn-ghost px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {me.name || "Unnamed climber"}
                </h1>
                <button onClick={() => setEditingName(true)} className="btn-ghost text-sm">
                  Edit
                </button>
              </div>
            )}
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{me.email}</p>
            {saveMsg && (
              <p
                role="status"
                aria-live="polite"
                className={`mt-1 text-xs ${
                  saveMsg.includes("error") || saveMsg.includes("failed") ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {saveMsg}
              </p>
            )}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="card p-4 text-center"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                {s.icon ? `${s.icon} ` : ""}
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <section className="card mb-8">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">XP history</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Cumulative points earned from your last {me.xp_history?.length ?? 0} solved challenges.
            </p>
          </div>
          <div className="px-4 py-6">
            <XpHistoryGraph history={me.xp_history ?? []} />
          </div>
        </section>

        <section className="card mb-8">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Quiz badges</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {quiz.filter((q) => q.badge).length} of {quiz.length} quiz badges earned.
            </p>
          </div>
          {quiz.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="text-4xl" aria-hidden="true">📘</span>
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                No quizzes attempted yet — head to the Quiz arena and earn your first badge!
              </p>
              <button onClick={() => router.push("/quiz")} className="btn-primary mt-2">
                Take a quiz
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {quiz.map((lv) => (
                <li key={lv.level}>
                  <button
                    onClick={() => router.push(`/quiz/${lv.level}`)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
                          lv.badge ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800"
                        }`}
                        aria-hidden="true"
                      >
                        {lv.badge ? "🏆" : "📘"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          Level {lv.level} · {lv.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Best: {lv.best_score}/{lv.total}
                          {lv.participants > 0 ? ` · Rank #${lv.rank ?? "–"} of ${lv.participants}` : ""}
                        </p>
                      </div>
                    </div>
                    {lv.badge ? (
                      <span className="chip shrink-0 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                        ✓ Badge earned
                      </span>
                    ) : lv.attempts === 0 ? (
                      <span className="chip shrink-0 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Not started
                      </span>
                    ) : lv.attempts_left > 0 ? (
                      <span className="chip shrink-0 bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                        {lv.attempts_left} attempts left
                      </span>
                    ) : (
                      <span className="chip shrink-0 bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                        No attempts left
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Solved challenges</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {solvedList.length} of {totalChallenges} challenges completed.
            </p>
          </div>
          {solvedList.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="text-4xl" aria-hidden="true">🧗</span>
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Nothing solved yet — head to Challenges and start climbing!
              </p>
              <button onClick={() => router.push("/levels")} className="btn-primary mt-2">
                Browse challenges
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {solvedList.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => router.push(`/challenge/${c.id}`)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Level {c.levelPosition} · {c.levelTitle}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold capitalize ${
                        BAND_META[c.band]?.color ?? "text-slate-500"
                      }`}
                    >
                      {BAND_META[c.band]?.label ?? c.band}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function XpHistoryGraph({ history }: { history: { xp: number; ts: string }[] }) {
  const W = 640;
  const H = 180;
  const PAD = 28;

  if (!history || history.length < 2) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="text-3xl" aria-hidden="true">📈</span>
        <p className="text-sm text-slate-400">
          Solve a few challenges to see your XP progress over time.
        </p>
      </div>
    );
  }

  // Cumulative XP at each point in time
  let cum = 0;
  const pts = history.map((h) => {
    cum += h.xp;
    return { t: new Date(h.ts).getTime(), xp: cum };
  });

  const t0 = pts[0].t;
  const t1 = pts[pts.length - 1].t;
  const xMax = pts[pts.length - 1].xp;
  const xMin = 0;

  const spanT = Math.max(t1 - t0, 1);
  const spanX = Math.max(xMax - xMin, 1);

  const coords = pts.map((p) => {
    const x = PAD + ((p.t - t0) / spanT) * (W - PAD * 2);
    const y = H - PAD - ((p.xp - xMin) / spanX) * (H - PAD * 2);
    return [x, y] as const;
  });

  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${coords[coords.length - 1][0].toFixed(1)},${H - PAD} L${coords[0][0].toFixed(1)},${H - PAD} Z`;

  function fmtDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="XP history graph">
      <defs>
        <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2ec866" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2ec866" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={PAD}
          x2={W - PAD}
          y1={PAD + f * (H - PAD * 2)}
          y2={PAD + f * (H - PAD * 2)}
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeDasharray="4 4"
        />
      ))}
      <path d={area} fill="url(#xpFill)" />
      <path d={path} fill="none" stroke="#1ea94f" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* first & last labels */}
      <text x={PAD} y={H - 10} className="fill-slate-400 text-[11px]">
        {fmtDate(t0)}
      </text>
      <text x={W - PAD} y={H - 10} textAnchor="end" className="fill-slate-400 text-[11px]">
        {fmtDate(t1)}
      </text>
      <text x={W - PAD} y={12} textAnchor="end" className="fill-slate-500 text-[11px] font-semibold">
        {xMax.toLocaleString()} XP
      </text>
    </svg>
  );
}