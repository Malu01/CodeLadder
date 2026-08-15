"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Level } from "../../lib/api";
import Header from "../../components/Header";
import { PageLoader, ErrorState, EmptyState } from "../../components/ui";

const BAND_META: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "text-emerald-600 dark:text-emerald-400" },
  intermediate: { label: "Intermediate", color: "text-amber-600 dark:text-amber-400" },
  advanced: { label: "Advanced", color: "text-red-600 dark:text-red-400" },
  expert: { label: "Expert", color: "text-fuchsia-600 dark:text-fuchsia-400" },
  master: { label: "Master", color: "text-cyan-600 dark:text-cyan-400" },
  legend: { label: "Legend", color: "text-orange-600 dark:text-orange-400" },
  mythic: { label: "Mythic", color: "text-violet-600 dark:text-violet-400" },
};

const DIFF_ACCENT: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  advanced: "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  expert: "bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400",
  master: "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  legend: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  mythic: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
};

type FlatChallenge = {
  id: number;
  title: string;
  points: number;
  solved: boolean;
  levelPosition: number;
  levelTitle: string;
  band: string;
  difficulty: string;
  unlocked: boolean;
};

function flatten(levels: Level[]): FlatChallenge[] {
  return levels.flatMap((l) =>
    l.challenges.map((ch) => ({
      id: ch.id,
      title: ch.title,
      points: ch.points,
      solved: ch.solved,
      levelPosition: l.position,
      levelTitle: l.title,
      band: l.band,
      difficulty: l.difficulty,
      unlocked: l.unlocked,
    }))
  );
}

type Filters = Record<string, string[]>;

const STATUS_OPTIONS = [
  { value: "solved", label: "Solved" },
  { value: "unsolved", label: "Unsolved" },
];

export default function LevelsPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [me, setMe] = useState<{ name: string; xp: number; coins: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    status: [],
    skills: [],
    difficulty: [],
    subdomain: [],
  });

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("codeladder_token");
      if (!token) {
        router.replace("/");
        return;
      }
      const [lvlRes, meRes] = await Promise.all([api.levels(), api.me()]);
      if (!lvlRes.ok) {
        setError(lvlRes.error);
        setLoading(false);
        return;
      }
      if (!meRes.ok) {
        setError(meRes.error);
        setLoading(false);
        return;
      }
      setLevels(lvlRes.data);
      setMe(meRes.data);
      setLoading(false);
    })();
  }, [router]);

  const list = useMemo(() => flatten(levels), [levels]);

  // Deterministic daily challenge: pick by hashing the UTC date string.
  const daily = useMemo(() => {
    if (list.length === 0) return null;
    const day = new Date().toISOString().slice(0, 10);
    let h = 0;
    for (let i = 0; i < day.length; i++) {
      h = (h * 31 + day.charCodeAt(i)) >>> 0;
    }
    return list[h % list.length];
  }, [list]);

  const now = new Date();
  const dayOfMonth = now.getDate();
  const monthShort = now.toLocaleString(undefined, { month: "short" });

  const solvedCount = list.filter((c) => c.solved).length;

  // Option sets for the filter sidebar (derived from real data).
  const skillOptions = useMemo(
    () =>
      [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
        "master",
        "legend",
        "mythic",
      ].filter((b) => levels.some((l) => l.band === b)),
    [levels]
  );

  const subdomainOptions = useMemo(
    () => Array.from(new Set(levels.map((l) => l.title))),
    [levels]
  );

  const allSelected = Object.values(filters).some((v) => v.length > 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      if (filters.status.length && !filters.status.includes(c.solved ? "solved" : "unsolved"))
        return false;
      if (filters.skills.length && !filters.skills.includes(c.band)) return false;
      if (filters.difficulty.length && !filters.difficulty.includes(c.difficulty)) return false;
      if (filters.subdomain.length && !filters.subdomain.includes(c.levelTitle)) return false;
      if (q && !`${c.title} ${c.levelTitle}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list, filters, query]);

  const countFor = (group: string, value: string) => {
    return list.filter((c) => {
      const match: Record<string, boolean> = {
        status: c.solved ? value === "solved" : value === "unsolved",
        skills: c.band === value,
        difficulty: c.difficulty === value,
        subdomain: c.levelTitle === value,
      };
      return match[group];
    }).length;
  };

  const toggle = (group: string, value: string) => {
    setFilters((f) => {
      const cur = f[group] ?? [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...f, [group]: next };
    });
  };

  const clearAll = () =>
    setFilters({ status: [], skills: [], difficulty: [], subdomain: [] });

  if (loading) return <PageLoader />;

  if (error)
    return (
      <div className="min-h-screen">
        <Header activeTab="prepare" />
        <ErrorState message={error} onBack={() => router.push("/")} />
      </div>
    );

  return (
    <div className="min-h-screen">
      <Header activeTab="prepare" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Challenges</h1>
            <p className="page-subtitle">Work through the ladder, Beginner → Mythic.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <StatChip label="Solved" value={`${solvedCount}/${list.length}`} />
            <StatChip label="XP" value={(me?.xp ?? 0).toLocaleString()} />
            <StatChip label="Coins" value={(me?.coins ?? 0).toLocaleString()} icon="🪙" />
          </div>
        </div>

        {daily && (
          <button
            onClick={() => router.push(`/challenge/${daily.id}`)}
            className={`group mb-8 flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 text-left shadow-card transition hover:border-emerald-500 hover:shadow-elevated dark:border-emerald-800 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 dark:hover:border-emerald-600`}
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-16 w-14 shrink-0 flex-col overflow-hidden rounded-xl border border-emerald-300 shadow-sm dark:border-emerald-700">
                <span className="bg-emerald-600 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-white">
                  {monthShort}
                </span>
                <span
                  className={`flex flex-1 items-center justify-center bg-white text-2xl font-black ${
                    daily.solved ? "text-emerald-600" : "text-slate-800"
                  } dark:bg-slate-800 ${daily.solved ? "dark:text-emerald-400" : "dark:text-white"}`}
                >
                  {dayOfMonth}
                </span>
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-emerald-700 uppercase dark:text-emerald-400">
                  Today&apos;s challenge
                  {daily.solved && (
                    <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                      ✓
                    </span>
                  )}
                </p>
                <p className="truncate text-lg font-black text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">
                  {daily.title}
                </p>
                <p className="text-sm text-slate-500">
                  Level {daily.levelPosition} · {daily.levelTitle}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  DIFF_ACCENT[daily.difficulty] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {daily.difficulty}
              </span>
              {daily.solved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  ✓ Solved
                </span>
              ) : (
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Solve →
                </span>
              )}
            </div>
          </button>
        )}

        <div className="flex flex-col-reverse gap-8 lg:flex-row">
          {/* Main challenge list */}
          <main className="min-w-0 flex-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800">
                <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by problem or subdomain"
                  aria-label="Search challenges"
                  className="w-full bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                />
              </div>
              <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                {visible.length} challenge{visible.length === 1 ? "" : "s"}
              </span>
            </div>

            {visible.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No challenges match your filters"
                action={
                  <button onClick={clearAll} className="btn-outline text-sm">
                    Clear all filters
                  </button>
                }
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
                {visible.map((c) => (
                  <button
                    key={c.id}
                    disabled={!c.unlocked}
                    onClick={() => c.unlocked && router.push(`/challenge/${c.id}`)}
                    aria-disabled={!c.unlocked}
                    className={`group flex w-full items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5 text-left transition last:border-b-0 ${
                      c.unlocked
                        ? "hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                        : "cursor-not-allowed bg-slate-50/60 opacity-60 dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {c.unlocked ? (
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                            c.solved
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-slate-300 text-transparent group-hover:border-brand-500"
                          }`}
                        >
                          ✓
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xs text-slate-400" aria-label="Locked">
                          🔒
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          Level {c.levelPosition} · {c.levelTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          DIFF_ACCENT[c.difficulty] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.difficulty}
                      </span>
                      <span className="w-16 text-right text-xs font-medium text-slate-500">
                        {c.points} XP
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </main>

          {/* Right filter sidebar */}
          <aside className="w-full shrink-0 lg:w-72" aria-label="Filters">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
                <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                  Filters
                </h2>
                {allSelected && (
                  <button onClick={clearAll} className="text-xs font-medium text-brand-600 hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              <FilterGroup
                label="Status"
                options={STATUS_OPTIONS}
                selected={filters.status}
                onToggle={(v) => toggle("status", v)}
                countFor={(v) => countFor("status", v)}
              />
              <FilterGroup
                label="Skills"
                options={skillOptions.map((b) => ({
                  value: b,
                  label: BAND_META[b]?.label ?? b,
                }))}
                selected={filters.skills}
                onToggle={(v) => toggle("skills", v)}
                countFor={(v) => countFor("skills", v)}
              />
              <FilterGroup
                label="Difficulty"
                options={[
                  { value: "easy", label: "Easy" },
                  { value: "medium", label: "Medium" },
                  { value: "advanced", label: "Advanced" },
                  { value: "expert", label: "Expert" },
                  { value: "master", label: "Master" },
                  { value: "legend", label: "Legend" },
                  { value: "mythic", label: "Mythic" },
                ]}
                selected={filters.difficulty}
                onToggle={(v) => toggle("difficulty", v)}
                countFor={(v) => countFor("difficulty", v)}
              />
              <FilterGroup
                label="Subdomains"
                options={subdomainOptions.map((t) => ({ value: t, label: t }))}
                selected={filters.subdomain}
                onToggle={(v) => toggle("subdomain", v)}
                countFor={(v) => countFor("subdomain", v)}
                singleCol
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {icon ? `${icon} ${label}` : label}
      </span>
      <span className="text-sm font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function FilterGroup(props: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  countFor: (value: string) => number;
  singleCol?: boolean;
}) {
  const { label, options, selected, onToggle, countFor, singleCol } = props;
  return (
    <fieldset className="border-b border-slate-100 px-5 py-4 last:border-b-0 dark:border-slate-800">
      <legend className="mb-2.5 text-xs font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
        {label}
      </legend>
      <div className={singleCol ? "space-y-1" : "grid grid-cols-2 gap-x-3 gap-y-1"}>
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          const count = countFor(opt.value);
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                checked ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(opt.value)}
                className="h-4 w-4 shrink-0 rounded border-slate-300 accent-brand-500"
              />
              <span className="min-w-0 flex-1 truncate capitalize">{opt.label}</span>
              <span className="shrink-0 text-xs text-slate-400">{count}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}