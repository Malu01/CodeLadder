from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import auth as firebase_auth
from pydantic import BaseModel, Field

from app.deps import get_current_user
from app.repo import update_user_name, user_rank
from app.schemas import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


class UpdateNameRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)) -> UserOut:
    uid = current_user["uid"]
    solved = len(current_user.get("solved_challenge_ids") or [])
    history = [
        {"xp": int(h.get("xp") or 0), "ts": h["ts"]}
        for h in (current_user.get("xp_history") or [])
        if isinstance(h, dict) and h.get("ts") is not None
    ]
    return UserOut(
        id=uid,
        name=current_user.get("name") or "",
        email=current_user.get("email") or "",
        xp=int(current_user.get("xp") or 0),
        current_level=int(current_user.get("current_level") or 1),
        solved_challenges=solved,
        submission_count=int(current_user.get("submission_count") or 0),
        streak=int(current_user.get("streak") or 0),
        xp_history=history,
        rank=user_rank(uid),
        coins=int(current_user.get("coins") or 0),
        completed_levels=current_user.get("completed_levels") or {},
    )


@router.patch("/me", response_model=UserOut)
def update_me(
    body: UpdateNameRequest, current_user: dict = Depends(get_current_user)
) -> UserOut:
    uid = current_user["uid"]
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name cannot be empty")

    user = update_user_name(uid, name)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        firebase_auth.update_user(uid, display_name=name)
    except Exception:
        pass  # Firestore name is the source of truth for leaderboard/header

    solved = len(user.get("solved_challenge_ids") or [])
    history = [
        {"xp": int(h.get("xp") or 0), "ts": h["ts"]}
        for h in (user.get("xp_history") or [])
        if isinstance(h, dict) and h.get("ts") is not None
    ]
    return UserOut(
        id=uid,
        name=user.get("name") or "",
        email=user.get("email") or "",
        xp=int(user.get("xp") or 0),
        current_level=int(user.get("current_level") or 1),
        solved_challenges=solved,
        submission_count=int(user.get("submission_count") or 0),
        streak=int(user.get("streak") or 0),
        xp_history=history,
        rank=user_rank(uid),
        coins=int(user.get("coins") or 0),
        completed_levels=user.get("completed_levels") or {},
    )
