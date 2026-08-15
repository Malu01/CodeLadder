from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from google.api_core.exceptions import ResourceExhausted

from app.core.config import settings
from app.deps import get_current_user
from app.repo import (
    add_user_submission,
    award_solved_challenge,
    complete_level_if_done,
    get_challenge_by_id,
    get_challenges_for_level,
    list_levels,
    list_user_submissions,
    record_activity,
)
from app.runner import grade
from app.schemas import (
    CodeRunRequest,
    RunResponse,
    SubmitResponse,
    SubmissionHistoryRow,
    TestResult,
)

router = APIRouter(tags=["submissions"])

MAX_CODE_LENGTH = settings.MAX_CODE_LENGTH


def _load_tests(challenge: dict, key: str) -> list[dict]:
    data = challenge.get(key) or []
    return [t for t in data if isinstance(t, dict)]


def _fully_solved_level_positions(user: dict) -> set[int]:
    solved = set(user.get("solved_challenge_ids") or [])
    fully = set()
    for lvl in list_levels():
        challenges = get_challenges_for_level(lvl["position"])
        if challenges and all(c["id"] in solved for c in challenges):
            fully.add(lvl["position"])
    return fully


@router.post("/challenges/{challenge_id}/run", response_model=RunResponse)
def run_code(
    challenge_id: int,
    payload: CodeRunRequest,
    current_user: dict = Depends(get_current_user),
) -> RunResponse:
    challenge = get_challenge_by_id(challenge_id)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    if len(payload.code) > MAX_CODE_LENGTH:
        raise HTTPException(status_code=400, detail="Code is too long")

    sample_tests = _load_tests(challenge, "sample_tests")
    verdict = grade(payload.code, sample_tests)

    results = [
        TestResult(
            input=t.get("input", ""),
            expected=t.get("expected", ""),
            actual=t.get("actual", ""),
            passed=t.get("passed", False),
        )
        for t in verdict["results"]
    ]
    return RunResponse(
        results=results,
        all_passed=verdict["status"] == "accepted",
        runtime_ms=verdict["runtime_ms"],
        error=verdict["error"],
    )


@router.post("/challenges/{challenge_id}/submit", response_model=SubmitResponse)
def submit_code(
    challenge_id: int,
    payload: CodeRunRequest,
    current_user: dict = Depends(get_current_user),
) -> SubmitResponse:
    challenge = get_challenge_by_id(challenge_id)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    if len(payload.code) > MAX_CODE_LENGTH:
        raise HTTPException(status_code=400, detail="Code is too long")

    hidden_tests = _load_tests(challenge, "hidden_tests")
    verdict = grade(payload.code, hidden_tests)

    status = verdict["status"]
    status_str = {
        "accepted": "accepted",
        "wrong": "wrong",
        "timeout": "timeout",
        "error": "error",
    }[status]

    xp_awarded = 0
    level_completion = None
    try:
        if status == "accepted":
            new_level = 1 + len(_fully_solved_level_positions(current_user))
            xp_awarded = award_solved_challenge(
                current_user["uid"], challenge_id, challenge["points"], new_level
            )
            if xp_awarded > 0:
                level_completion = complete_level_if_done(
                    current_user["uid"], challenge["level_position"]
                )
        add_user_submission(
            uid=current_user["uid"],
            challenge_id=challenge_id,
            challenge_title=challenge["title"],
            code=payload.code,
            status=status_str,
            runtime_ms=verdict["runtime_ms"],
            tests_passed=verdict["tests_passed"],
            tests_total=verdict["tests_total"],
        )
        record_activity(current_user["uid"])
    except ResourceExhausted:
        raise HTTPException(
            status_code=429,
            detail="Daily storage quota reached. Your corrected code was graded "
            "but not saved — try again after the quota resets.",
        )

    message = {
        "accepted": "All tests passed. You leveled up!",
        "wrong": "Some tests failed. Check your output against the expected values.",
        "timeout": "Your code exceeded the time limit.",
        "error": "Your program crashed. See the error output.",
    }[status]

    return SubmitResponse(
        status=status_str,
        tests_passed=verdict["tests_passed"],
        tests_total=verdict["tests_total"],
        runtime_ms=verdict["runtime_ms"],
        error=verdict["error"],
        xp_awarded=xp_awarded,
        message=message,
        level_completed=level_completion is not None,
        level_position=level_completion["position"] if level_completion else None,
        level_title=level_completion["title"] if level_completion else None,
        coins=level_completion["coins"] if level_completion else None,
    )


@router.get("/submissions/me", response_model=list[SubmissionHistoryRow])
def my_submissions(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(25, ge=1, le=100),
    before: Optional[float] = Query(None, description="Unix timestamp cursor for pagination"),
) -> list[SubmissionHistoryRow]:
    before_dt = datetime.fromtimestamp(before) if before else None
    rows = list_user_submissions(current_user["uid"], limit=limit, before=before_dt)
    return [
        SubmissionHistoryRow(
            id=int(r["created_at"].timestamp() * 1000),
            challenge_id=r["challenge_id"],
            challenge_title=r["challenge_title"],
            status=r["status"],
            runtime_ms=r["runtime_ms"],
            tests_passed=r["tests_passed"],
            tests_total=r["tests_total"],
            created_at=r["created_at"],
        )
        for r in rows
    ]
