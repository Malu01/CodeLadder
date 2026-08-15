// Persist editor drafts + last run/submit results per challenge in
// localStorage so work survives a refresh or accidental navigation.

export type ChallengeDraft = {
  code: string;
  runResult: unknown | null;
  submitResult: unknown | null;
  savedAt: number;
};

const KEY = (id: number) => `codeladder_draft_${id}`;

export function loadDraft(id: number): ChallengeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY(id));
    return raw ? (JSON.parse(raw) as ChallengeDraft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(id: number, draft: Omit<ChallengeDraft, "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY(id), JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch {
    /* storage full / private mode — ignore */
  }
}

export function clearDraft(id: number) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY(id));
}
