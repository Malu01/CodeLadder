from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.repo import leaderboard
from app.schemas import LeaderboardEntry

router = APIRouter(tags=["stats"])


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard_endpoint(
    current_user: dict = Depends(get_current_user),
) -> list[LeaderboardEntry]:
    """Top users by XP (those with xp > 0)."""
    rows = leaderboard()
    return [
        LeaderboardEntry(
            rank=r["rank"],
            name=r["name"],
            xp=int(r.get("xp") or 0),
            solved_challenges=len(r.get("solved_challenge_ids") or []),
            current_level=int(r.get("current_level") or 1),
        )
        for r in rows
        if int(r.get("xp") or 0) > 0
    ]
