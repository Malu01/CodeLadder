from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user
from app.repo import get_challenge_by_id, get_challenges_for_level, list_levels
from app.schemas import ChallengeOut, LevelOut

router = APIRouter(prefix="/levels", tags=["levels"])


def _build_level_out(user: dict) -> list[LevelOut]:
    solved = set(user.get("solved_challenge_ids") or [])
    levels = list_levels()

    result: list[LevelOut] = []
    previous_all_solved = True

    for lvl in levels:
        pos = lvl["position"]
        challenges = get_challenges_for_level(pos)

        solved_here = sum(1 for c in challenges if c["id"] in solved)
        all_solved = len(challenges) > 0 and solved_here == len(challenges)

        result.append(
            LevelOut(
                id=pos,
                position=pos,
                title=lvl["title"],
                description=lvl["description"],
                band=lvl["band"],
                difficulty=lvl["difficulty"],
                unlocked=previous_all_solved,
                solved_count=solved_here,
                challenges=[
                    {
                        "id": c["id"],
                        "title": c["title"],
                        "position": c["position"],
                        "points": c["points"],
                        "solved": c["id"] in solved,
                    }
                    for c in challenges
                ],
            )
        )
        previous_all_solved = all_solved

    return result


@router.get("", response_model=list[LevelOut])
def list_levels_endpoint(current_user: dict = Depends(get_current_user)) -> list[LevelOut]:
    return _build_level_out(current_user)


@router.get("/{challenge_id}", response_model=ChallengeOut)
def get_challenge(
    challenge_id: int, current_user: dict = Depends(get_current_user)
) -> ChallengeOut:
    challenge = get_challenge_by_id(challenge_id)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    solved_ids = set(current_user.get("solved_challenge_ids") or [])
    return ChallengeOut(
        id=challenge["id"],
        title=challenge["title"],
        level_id=challenge["level_position"],
        position=challenge["position"],
        statement=challenge["statement"],
        input_format=challenge.get("input_format", ""),
        output_format=challenge.get("output_format", ""),
        starter_code=challenge.get("starter_code", ""),
        points=challenge["points"],
        solved=challenge["id"] in solved_ids,
    )
