"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Me, api, clearToken } from "../lib/api";
import { useTheme } from "./ThemeProvider";

type HeaderProps = {
  activeTab?: string;
};

const NAV_TABS = [
  { id: "prepare", label: "Prepare", path: "/levels" },
  { id: "quiz", label: "Quiz", path: "/quiz" },
  { id: "leaderboard", label: "Leaderboard", path: "/leaderboard" },
  { id: "history", label: "History", path: "/submissions" },
];

export default function Header({ activeTab }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const [me, setMe] = useState<Me | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [nameBannerDismissed, setNameBannerDismissed] = useState(false);

  // Challenge search
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchItems, setSearchItems] = useState<{ id: number; title: string; level: number }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const res = await api.me();
      if (res.ok) setMe(res.data);
    })();
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    let cancelled = false;
    (async () => {
      const lvl = await api.levels();
      if (cancelled || !lvl.ok) return;
      const items = lvl.data.flatMap((l) =>
        l.challenges.map((c) => ({ id: c.id, title: c.title, level: l.position }))
      );
      setSearchItems(items);
    })();
    return () => {
      cancelled = true;
    };
  }, [searchOpen]);

  // Close menus when clicking outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const current =
    activeTab ??
    NAV_TABS.find((t) => pathname.startsWith(t.path))?.id ??
    "prepare";

  function logout() {
    clearToken();
    router.push("/");
  }

  function navTo(path: string) {
    setMobileOpen(false);
    router.push(path);
  }

  const matches = searchItems
    .filter((i) => i.title.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 8);

  return (
    <>
      {me && !me.name && !nameBannerDismissed && (
        <div className="border-b border-amber-200/70 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Hi! Set your display name so it shows up on the leaderboard.
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => router.push("/profile")}
                className="rounded text-sm font-semibold text-amber-800 underline-offset-2 hover:underline dark:text-amber-300"
              >
                Set name
              </button>
              <button
                onClick={() => setNameBannerDismissed(true)}
                aria-label="Dismiss"
                className="rounded text-sm text-amber-500 hover:text-amber-700 dark:text-amber-400"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <button
            onClick={() => router.push("/levels")}
            className="flex shrink-0 items-center gap-2 rounded-lg py-3"
            aria-label="CodeLadder home"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <img src="/header-logo.png" alt="" className="h-full w-full object-cover" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Code<span className="text-brand-500">Ladder</span>
            </span>
          </button>

          {/* Nav tabs (desktop) */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => router.push(t.path)}
                aria-current={current === t.id ? "page" : undefined}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition ${
                  current === t.id
                    ? "text-brand-600 after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand-500 dark:text-brand-400"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Search (desktop) */}
            <div ref={searchRef} className="relative hidden lg:block">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                aria-expanded={searchOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-400 transition hover:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <span>Search</span>
              </button>
              {searchOpen && (
                <div
                  role="listbox"
                  aria-label="Challenge search results"
                  className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-elevated dark:border-slate-700 dark:bg-slate-800"
                >
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Find a challenge…"
                    aria-label="Search challenges"
                    className="w-full border-b border-slate-200 bg-transparent px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:text-white"
                  />
                  <div className="max-h-72 overflow-y-auto py-1">
                    {matches.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        No matching challenges.
                      </p>
                    ) : (
                      matches.map((m) => (
                        <button
                          key={m.id}
                          role="option"
                          onClick={() => {
                            setSearchOpen(false);
                            setQuery("");
                            router.push(`/challenge/${m.id}`);
                          }}
                          className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <span className="truncate">{m.title}</span>
                          <span className="shrink-0 text-xs text-slate-400">L{m.level}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
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

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Profile menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {(me?.name?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="max-w-[120px] truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {me?.name ?? "…"}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Level {me?.current_level ?? 0}</p>
                </div>
                <svg
                  className={`h-4 w-4 text-slate-400 transition ${menuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div role="menu" className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-elevated dark:border-slate-700 dark:bg-slate-800">
                    <MenuItem onClick={() => { setMenuOpen(false); router.push("/profile"); }}>
                      My profile
                    </MenuItem>
                    <MenuItem onClick={() => { setMenuOpen(false); router.push("/leaderboard"); }}>
                      My rank
                    </MenuItem>
                    <MenuItem onClick={() => { setMenuOpen(false); router.push("/submissions"); }}>
                      My submissions
                    </MenuItem>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <MenuItem danger onClick={logout}>
                      Log out
                    </MenuItem>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav
            aria-label="Mobile"
            className="border-t border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900 md:hidden"
          >
            <div className="grid gap-1">
              {NAV_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navTo(t.path)}
                  aria-current={current === t.id ? "page" : undefined}
                  className={`rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${
                    current === t.id
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                onClick={() => navTo("/profile")}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                My profile
              </button>
              <button
                onClick={logout}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                Log out
              </button>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full px-4 py-2 text-left text-sm transition ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}