"""
Firestore data-access layer. All DB reads/writes go through here so the
routers stay thin. Collections:

  users/{uid}          -> { name, email, xp, current_level, solved_challenge_ids: [int] }
  levels/{position}    -> { position, title, description, band, difficulty }
  challenges/{id}      -> { id, level_position, position, title, statement, ...tests }
  submissions/{doc_id} -> { user_id, challenge_id, code, status, runtime_ms, ... }
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from firebase_admin import firestore

from app.firebase import get_firestore

# The curriculum (levels + challenges) is static between seeds, so cache it in
# memory with a short TTL. This avoids re-reading the whole collection on every
# request (Firestore free tier has a 50K reads/day quota).
_CACHE_TTL = timedelta(minutes=5)
_CACHE_TTL_USER = timedelta(seconds=60)
_CACHE_TTL_RANK = timedelta(seconds=120)
_cache = {}  # key -> (expires_at, value)


def _cache_get(key: str):
    entry = _cache.get(key)
    if entry is None:
        return None
    expires_at, value = entry
    if datetime.now(timezone.utc) > expires_at:
        _cache.pop(key, None)
        return None
    return value


def _cache_set(key: str, value, ttl: timedelta | None = None) -> None:
    _cache[key] = (datetime.now(timezone.utc) + (ttl or _CACHE_TTL), value)


def _cache_remove(*keys: str) -> None:
    for k in keys:
        _cache.pop(k, None)


def _read(key: str, ttl: timedelta, load, fallback=None):
    """Read-through cache. If Firestore refuses the read (e.g. 429 quota
    exceeded), fall back to the last cached copy (even if expired). If there is
    no cached copy yet, return `fallback` instead of raising."""
    now = datetime.now(timezone.utc)
    entry = _cache.get(key)
    if entry is not None and now <= entry[0]:
        return entry[1]
    try:
        value = load()
    except Exception:
        if entry is not None:
            return entry[1]
        return fallback
    if value is not None:
        _cache[key] = (now + ttl, value)
    return value


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _today_str() -> str:
    return _now().strftime("%Y-%m-%d")


def _yesterday_str() -> str:
    return (_now() - timedelta(days=1)).strftime("%Y-%m-%d")


def record_activity(uid: str) -> None:
    """Updates the user's daily streak after any submission. Returns None;
    streaks are computed client-visible via get_user()."""
    user = get_user(uid)
    if user is None:
        return
    today = _today_str()
    last = user.get("last_active_date") or ""
    if last == today:
        return  # already counted today
    if last == _yesterday_str():
        streak = int(user.get("streak") or 0) + 1
    else:
        streak = 1
    get_firestore().collection("users").document(uid).update(
        {"last_active_date": today, "streak": streak}
    )
    _cache_remove(f"user:{uid}")


def challenge_doc_id(level_position: int, challenge_position: int) -> str:
    return f"{level_position}_{challenge_position}"


# ---------- Users ----------
def get_user(uid: str) -> Optional[dict]:
    def load():
        doc = get_firestore().collection("users").document(uid).get()
        return doc.to_dict() if doc.exists else None

    return _read(f"user:{uid}", _CACHE_TTL_USER, load)


def create_user(uid: str, name: str, email: str) -> dict:
    data = {
        "uid": uid,
        "name": name,
        "email": email,
        "xp": 0,
        "current_level": 1,
        "solved_challenge_ids": [],
        "xp_history": [],
        "streak": 0,
        "last_active_date": "",
        "submission_count": 0,
        "coins": 0,
        "completed_levels": {},
        "created_at": _now(),
    }
    get_firestore().collection("users").document(uid).set(data)
    _cache_set(f"user:{uid}", data, ttl=_CACHE_TTL_USER)
    return data


def award_solved_challenge(uid: str, challenge_id: int, points: int, new_level: int) -> int:
    """
    Awards XP + marks a challenge solved (first time only).
    Returns XP actually awarded (0 if already solved).
    `new_level` is the user's current_level computed by the caller.
    """
    user = get_user(uid)
    if user is None:
        return 0

    solved = list(user.get("solved_challenge_ids") or [])
    if challenge_id in solved:
        return 0

    new_xp = int(user.get("xp") or 0) + points
    solved.append(challenge_id)

    history = list(user.get("xp_history") or [])
    history.append({"xp": new_xp, "ts": _now()})
    history = history[-200:]  # keep the graph bounded

    doc = get_firestore().collection("users").document(uid)
    doc.update(
        {
            "xp": new_xp,
            "solved_challenge_ids": solved,
            "current_level": new_level,
            "xp_history": history,
        }
    )
    # XP / level changed -> invalidate cached copies of this user + their rank.
    _cache_remove(f"user:{uid}", f"rank:{uid}", "leaderboard")
    return points


def update_user_name(uid: str, name: str) -> Optional[dict]:
    name = name.strip()
    if not name:
        return None
    doc = get_firestore().collection("users").document(uid)
    doc.update({"name": name})
    _cache_remove(f"user:{uid}")
    return get_user(uid)


def complete_level_if_done(uid: str, level_position: int) -> Optional[dict]:
    """If every challenge in the level is solved and the completion hasn't been
    recorded yet, record it and grant 1 coin. Returns the completion entry
    { position, title, coins } or None if nothing new was completed."""
    user = get_user(uid)
    if user is None:
        return None
    solved = set(user.get("solved_challenge_ids") or [])
    challenges = get_challenges_for_level(level_position)
    if not challenges or not all(c["id"] in solved for c in challenges):
        return None

    completed = dict(user.get("completed_levels") or {})
    key = str(level_position)
    if key in completed:
        return None

    title = ""
    for lvl in list_levels():
        if lvl["position"] == level_position:
            title = lvl["title"]
            break

    completed[key] = {"completed_at": _now(), "title": title}
    coins = int(user.get("coins") or 0) + 1
    doc = get_firestore().collection("users").document(uid)
    doc.update({"completed_levels": completed, "coins": coins})
    _cache_remove(f"user:{uid}")
    return {"position": level_position, "title": title, "coins": coins}


def add_user_submission(
    uid: str,
    challenge_id: int,
    challenge_title: str,
    code: str,
    status: str,
    runtime_ms: int,
    tests_passed: int,
    tests_total: int,
) -> str:
    # Store under users/{uid}/submissions so queries are scoped to one user and
    # can order by created_at using the auto-created single-field index.
    ref = get_firestore().collection("users").document(uid).collection("submissions").document()
    ref.set(
        {
            "challenge_id": challenge_id,
            "challenge_title": challenge_title,
            "code": code,
            "status": status,
            "runtime_ms": runtime_ms,
            "tests_passed": tests_passed,
            "tests_total": tests_total,
            "created_at": _now(),
        }
    )
    # Cheap running count on the user doc (no separate count query needed).
    get_firestore().collection("users").document(uid).update(
        {"submission_count": firestore.Increment(1)}
    )
    _cache_remove(f"user:{uid}")
    return ref.id


def list_user_submissions(
    uid: str, limit: int = 25, before: Optional[datetime] = None
) -> list[dict]:
    """A user's submissions, newest first, limited + optionally paginated with a
    `before` created_at cursor. Fetches only the fields the API returns (no code)."""
    q = (
        get_firestore()
        .collection("users")
        .document(uid)
        .collection("submissions")
        .select(
            [
                "challenge_id",
                "challenge_title",
                "status",
                "runtime_ms",
                "tests_passed",
                "tests_total",
                "created_at",
            ]
        )
        .order_by("created_at", direction="DESCENDING")
    )
    if before is not None:
        q = q.end_at({"created_at": before})
    snaps = q.limit(limit).stream()
    return [s.to_dict() for s in snaps]


def leaderboard(limit: int = 25) -> list[dict]:
    """Top users by XP, each with a 1-based rank (cached)."""
    def load():
        snaps = (
            get_firestore()
            .collection("users")
            .order_by("xp", direction="DESCENDING")
            .limit(limit)
            .stream()
        )
        rows = [s.to_dict() for s in snaps]
        return [{"rank": i, **r} for i, r in enumerate(rows, start=1)]

    return _read("leaderboard", _CACHE_TTL_RANK, load)


def user_rank(uid: str) -> int:
    """
    Rank of a user on the XP leaderboard (1-based). Users with 0 XP are
    unranked (returns 0). Cached briefly because the count query costs a read.
    """
    def load():
        user = get_user(uid)
        if user is None or int(user.get("xp") or 0) <= 0:
            return 0
        me_xp = int(user["xp"])
        above = (
            get_firestore()
            .collection("users")
            .where("xp", ">", me_xp)
            .count()
            .get()[0][0]
            .value
        )
        return int(above) + 1

    return _read(f"rank:{uid}", _CACHE_TTL_RANK, load, fallback=0)


# ---------- Levels & challenges ----------
def list_levels() -> list[dict]:
    def load():
        snaps = get_firestore().collection("levels").order_by("position").stream()
        return [s.to_dict() for s in snaps]

    return _read("levels", _CACHE_TTL, load, fallback=[])


def list_challenges() -> list[dict]:
    """All challenges, each carrying its level_position (cached)."""
    def load():
        snaps = get_firestore().collection("challenges").stream()
        return [s.to_dict() for s in snaps]

    return _read("challenges", _CACHE_TTL, load, fallback=[])


def get_challenge_by_id(challenge_id: int) -> Optional[dict]:
    for c in list_challenges():
        if c["id"] == challenge_id:
            return c
    return None


def get_challenges_for_level(level_position: int) -> list[dict]:
    """All challenges in a level, ordered by position. Reads the cached
    challenges list once and filters in Python (no composite index needed)."""
    rows = [r for r in list_challenges() if r.get("level_position") == level_position]
    rows.sort(key=lambda r: r.get("position", 0))
    return rows


# ---------- Seeding ----------
def upsert_level(level_data: dict) -> None:
    data = {
        "position": level_data["position"],
        "title": level_data["title"],
        "description": level_data["description"],
        "band": level_data["band"],
        "difficulty": level_data["difficulty"],
    }
    get_firestore().collection("levels").document(str(level_data["position"])).set(data)


def upsert_challenge(level_position: int, ch: dict) -> int:
    """Writes a challenge; returns its stable integer id.

    id = level_position * 100 + challenge_position, e.g. L3 challenge 0 -> 300.
    """
    challenge_id = level_position * 100 + ch["position"]

    data = {
        "id": challenge_id,
        "level_position": level_position,
        "position": ch["position"],
        "title": ch["title"],
        "statement": ch["statement"],
        "input_format": ch.get("input_format", ""),
        "output_format": ch.get("output_format", ""),
        "starter_code": ch.get("starter_code", ""),
        "points": ch.get("points", 50),
        "sample_tests": ch.get("sample_tests") or [],
        "hidden_tests": ch.get("hidden_tests") or [],
    }
    get_firestore().collection("challenges").document(str(challenge_id)).set(data)
    return challenge_id


# ---------- Quiz ----------
def get_quiz_progress(uid: str) -> dict:
    """Per-user quiz progress: { '<level>': { attempts, best, badge, badge_at } }."""
    user = get_user(uid)
    return dict(user.get("quiz_progress") or {}) if user else {}


def quiz_scores(level: int) -> list[dict]:
    """Every participant's best score for a quiz level (cached, best first).

    Reads the whole (tiny) quiz_scores collection and filters in Python so no
    composite Firestore index is required.
    """
    def load():
        rows = []
        for s in get_firestore().collection("quiz_scores").stream():
            d = s.to_dict()
            if d.get("level") == level and d.get("best") is not None:
                rows.append(d)
        rows.sort(key=lambda r: r["best"], reverse=True)
        return rows

    return _read(f"quizscores:{level}", _CACHE_TTL_RANK, load, fallback=[])


def save_quiz_result(
    uid: str, name: str, level: int, score: int
) -> tuple[int, dict]:
    """Records a quiz attempt. Enforces at most 3 attempts per level.

    Returns (rank, progress_entry) where progress_entry is the updated entry:
    { level, attempts, best, badge, badge_at, rank, participants }.
    """
    if not name:
        name = "Anonymous"

    progress = get_quiz_progress(uid)
    entry = dict(progress.get(str(level)) or {})
    attempts = int(entry.get("attempts") or 0) + 1
    best = max(int(entry.get("best") or 0), score)

    user = get_user(uid)
    if user is None:
        raise RuntimeError("user not found")

    user_doc = get_firestore().collection("users").document(uid)

    # Update running progress on the user document.
    progress[str(level)] = {
        "attempts": attempts,
        "best": best,
        "badge": bool(entry.get("badge")),
        "badge_at": entry.get("badge_at"),
    }
    user_doc.update({"quiz_progress": progress})
    _cache_remove(f"user:{uid}")

    # Upsert the participant score for ranking.
    qs_doc = f"{level}_{uid}"
    qs_ref = get_firestore().collection("quiz_scores").document(qs_doc)
    qs_ref.set(
        {
            "level": level,
            "uid": uid,
            "name": name,
            "best": best,
            "updated_at": _now(),
        }
    )
    _cache_remove(f"quizscores:{level}")

    # Rank among participants by best score (query returns best DESC).
    scores = quiz_scores(level)
    participants = len(scores)
    uids = [s["uid"] for s in scores]
    uid_rank = uids.index(uid) + 1 if uid in uids else participants + 1

    from app.data.quiz import QUIZ_BADGE_MIN_SCORE

    badge = bool(entry.get("badge")) or score >= QUIZ_BADGE_MIN_SCORE
    badge_at = entry.get("badge_at")
    if badge and not badge_at:
        badge_at = _now()
        progress[str(level)]["badge"] = True
        progress[str(level)]["badge_at"] = badge_at
        user_doc.update({"quiz_progress": progress})
        _cache_remove(f"user:{uid}")

    return uid_rank, {
        "attempts": attempts,
        "best": best,
        "badge": badge,
        "badge_at": badge_at,
        "rank": uid_rank,
        "participants": participants,
    }


def quiz_badge_state(uid: str) -> list[dict]:
    """For each quiz level, the user's progress + computed rank/badge flag."""
    progress = get_quiz_progress(uid)
    name = (get_user(uid) or {}).get("name") or "Anonymous"

    result = []
    from app.data.quiz import QUIZ_LEVELS, QUIZ_BADGE_MIN_SCORE

    for lvl in QUIZ_LEVELS:
        level = lvl["level"]
        entry = dict(progress.get(str(level)) or {})
        attempts = int(entry.get("attempts") or 0)
        best = int(entry.get("best") or 0)
        badge = bool(entry.get("badge")) or (attempts > 0 and best >= QUIZ_BADGE_MIN_SCORE)

        rank: Optional[int] = None
        participants = 0
        if attempts > 0:
            scores = quiz_scores(level)
            participants = len(scores)
            ranked = [s["uid"] for s in scores]
            rank = ranked.index(uid) + 1 if uid in ranked else participants + 1

        result.append(
            {
                "level": level,
                "title": lvl["title"],
                "description": lvl["description"],
                "attempts": attempts,
                "attempts_left": max(0, 3 - attempts),
                "best": best,
                "badge": badge,
                "rank": rank,
                "participants": participants,
                "name": name,
            }
        )
    return result
