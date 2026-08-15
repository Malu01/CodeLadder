from fastapi import APIRouter, Depends, HTTPException

from app.data.quiz import QUIZ_MAX_ATTEMPTS, QUIZ_QUESTIONS_PER_LEVEL, get_quiz_level
from app.deps import get_current_user
from app.repo import get_quiz_progress, quiz_badge_state, save_quiz_result
from app.schemas import (
    QuizLevelDetailOut,
    QuizLevelOut,
    QuizQuestionOut,
    QuizReviewItem,
    QuizSubmitRequest,
    QuizSubmitResult,
)

router = APIRouter(tags=["quiz"])


@router.get("/quiz/levels", response_model=list[QuizLevelOut])
def list_quiz_levels(current_user: dict = Depends(get_current_user)) -> list[QuizLevelOut]:
    states = quiz_badge_state(current_user["uid"])
    return [
        QuizLevelOut(
            level=s["level"],
            title=s["title"],
            description=s["description"],
            total=QUIZ_QUESTIONS_PER_LEVEL,
            attempts=s["attempts"],
            attempts_left=s["attempts_left"],
            best_score=s["best"],
            badge=s["badge"],
            rank=s["rank"],
            participants=s["participants"],
        )
        for s in states
    ]


@router.get("/quiz/levels/{level}", response_model=QuizLevelDetailOut)
def get_quiz_level_questions(
    level: int, current_user: dict = Depends(get_current_user)
) -> QuizLevelDetailOut:
    lvl = get_quiz_level(level)
    if lvl is None:
        raise HTTPException(status_code=404, detail="Quiz level not found")

    progress = get_quiz_progress(current_user["uid"]).get(str(level)) or {}
    attempts = int(progress.get("attempts") or 0)
    attempts_left = max(0, QUIZ_MAX_ATTEMPTS - attempts)

    return QuizLevelDetailOut(
        level=level,
        title=lvl["title"],
        description=lvl["description"],
        total=QUIZ_QUESTIONS_PER_LEVEL,
        attempts_left=attempts_left,
        max_attempts=QUIZ_MAX_ATTEMPTS,
        questions=[QuizQuestionOut(id=q["id"], question=q["question"], options=q["options"]) for q in lvl["questions"]],
    )


@router.post("/quiz/levels/{level}/submit", response_model=QuizSubmitResult)
def submit_quiz(
    level: int,
    payload: QuizSubmitRequest,
    current_user: dict = Depends(get_current_user),
) -> QuizSubmitResult:
    lvl = get_quiz_level(level)
    if lvl is None:
        raise HTTPException(status_code=404, detail="Quiz level not found")

    progress = get_quiz_progress(current_user["uid"]).get(str(level)) or {}
    attempts = int(progress.get("attempts") or 0)
    if attempts >= QUIZ_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=400,
            detail=f"You have used all {QUIZ_MAX_ATTEMPTS} attempts for this level.",
        )

    by_id = {q["id"]: q for q in lvl["questions"]}
    score = 0
    review: list[QuizReviewItem] = []
    for qid, selected in payload.answers.items():
        q = by_id.get(qid)
        if q:
            if selected == q["answer"]:
                score += 1
            review.append(
                QuizReviewItem(
                    question_id=q["id"],
                    question=q["question"],
                    options=q["options"],
                    selected=selected,
                    correct=q["answer"],
                )
            )

    name = current_user.get("name") or "Anonymous"
    rank, entry = save_quiz_result(current_user["uid"], name, level, score)
    percentage = round(score * 100 / QUIZ_QUESTIONS_PER_LEVEL)

    return QuizSubmitResult(
        level=level,
        title=lvl["title"],
        score=score,
        total=QUIZ_QUESTIONS_PER_LEVEL,
        percentage=percentage,
        attempts=entry["attempts"],
        attempts_left=max(0, QUIZ_MAX_ATTEMPTS - entry["attempts"]),
        badge=entry["badge"],
        rank=rank,
        participants=entry["participants"],
        review=review,
    )