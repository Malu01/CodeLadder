"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../components/ThemeProvider";

export default function LandingPage() {
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const [auth, setAuth] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("codeladder_token");
    if (!token) {
      setAuth(false);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("unauthorized");
        const me = await r.json();
        setName(me.name);
        setXp(me.xp);
        setAuth(true);
      })
      .catch(() => setAuth(false));
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* Top bar */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => auth ? router.push("/levels") : undefined}
            className="flex items-center gap-2 rounded-lg"
            aria-label="CodeLadder"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <img src="/header-logo.png" alt="" className="h-full w-full object-cover" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Code<span className="text-brand-500">Ladder</span>
            </span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {dark ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.72 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.35 17.65A8.5 8.5 0 0112 4.35a8.5 8.5 0 008.35 13.3z" />
                </svg>
              )}
            </button>
            {auth === false && (
              <>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 sm:block"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
                >
                  Get started
                </button>
              </>
            )}
            {auth === true && (
              <button
                onClick={() => router.push("/levels")}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
              >
                Continue as {name.split(" ")[0]}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(46,200,102,0.12),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-16 text-center sm:pb-28 sm:pt-24">
          <span className="chip border border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-900 dark:bg-brand-500/10 dark:text-brand-400">
            🎯 Beginner → Mythic · Python challenges
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Practice code.{" "}
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-600">
              Climb the ladder.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-500 dark:text-slate-400 sm:text-lg">
            CodeLadder is a focused, level-by-level practice arena for Python.
            Solve challenges in a live editor, run your code, earn XP, take quizzes,
            and prove your rank — one problem at a time.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {auth === false ? (
              <>
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="w-full rounded-lg bg-brand-500 px-7 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-600 sm:w-auto"
                >
                  Create a free account
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full rounded-lg border border-slate-300 px-7 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
                >
                  Log in
                </button>
              </>
            ) : auth === null ? (
              <span className="text-slate-400 dark:text-slate-500">Checking your session…</span>
            ) : (
              <button
                onClick={() => router.push("/levels")}
                className="rounded-lg bg-brand-500 px-7 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-600"
              >
                Continue climbing · {xp.toLocaleString()} XP
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24" aria-label="What CodeLadder offers">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon="🧗"
            title="Level-by-level ladder"
            body="Eight bands from Beginner to Mythic. Each level unlocks only once you’ve proven the one before it."
          />
          <Feature
            icon="⚡"
            title="Live code runner"
            body="Write Python in a full editor, run, and submit against real tests — instant feedback, no setup."
          />
          <Feature
            icon="🏆"
            title="Quiz arena"
            body="25-question themed rounds across 5 levels. Score 20/25 or higher to earn a downloadable badge you can share."
          />
          <Feature
            icon="🔥"
            title="Streaks & XP"
            body="Keep your streak alive, watch cumulative XP climb, and track your history on a progress graph."
          />
          <Feature
            icon="📊"
            title="Honest leaderboard"
            body="Compete transparently by XP and solved count. Your rank updates the moment you submit."
          />
          <Feature
            icon="🪙"
            title="Completion coins"
            body="Finish every challenge in a level to earn a coin and a celebratory badge. Small wins, collected."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-slate-400 sm:flex-row dark:text-slate-500">
          <p>© {new Date().getFullYear()} CodeLadder. Build your ladder, one problem at a time.</p>
          <div className="flex items-center gap-4">
            {auth === false && (
              <button onClick={() => router.push("/auth/login")} className="rounded hover:text-slate-600 dark:hover:text-slate-300">
                Log in
              </button>
            )}
            {auth === true && (
              <button onClick={() => router.push("/leaderboard")} className="rounded hover:text-slate-600 dark:hover:text-slate-300">
                Leaderboard
              </button>
            )}
            <button onClick={toggle} className="rounded hover:text-slate-600 dark:hover:text-slate-300">
              {dark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-elevated dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-800">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl dark:bg-brand-500/10" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{body}</p>
    </div>
  );
}