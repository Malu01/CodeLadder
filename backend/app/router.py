from fastapi import APIRouter

from app.routers import auth, leaderboard, levels, quiz, submissions

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(levels.router)
api_router.include_router(submissions.router)
api_router.include_router(leaderboard.router)
api_router.include_router(quiz.router)