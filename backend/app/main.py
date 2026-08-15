from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.router import api_router
from app.seed import seed

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # Seed the curriculum into Firestore (idempotent).
    seed()


app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "app": settings.APP_NAME}
