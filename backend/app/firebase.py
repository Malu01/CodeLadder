"""
Firebase Admin SDK bootstrap. Initialises the app once, exposes the
Firestore client and an auth helper that verifies Firebase ID tokens.
"""
import json
import os

import firebase_admin
from firebase_admin import auth, credentials, firestore

from app.core.config import settings

_client = None


def get_firestore():
    global _client
    if _client is None:
        _init()
    return _client


def verify_id_token(id_token: str) -> dict:
    """Verifies a Firebase ID token; raises auth.InvalidIdTokenError on failure."""
    if not firebase_admin._apps:
        _init()
    decoded = auth.verify_id_token(id_token)
    return decoded


def _init() -> None:
    if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        try:
            sa_info = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "FIREBASE_SERVICE_ACCOUNT_JSON is set but contains invalid JSON."
            ) from exc
        cred = credentials.Certificate(sa_info)
    else:
        service_account_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
        if not os.path.isfile(service_account_path):
            raise RuntimeError(
                f"Firebase service account not found at '{service_account_path}'. "
                "Download it from Firebase console -> Project settings -> Service accounts "
                "and set FIREBASE_SERVICE_ACCOUNT_PATH in backend/.env"
            )
        cred = credentials.Certificate(service_account_path)

    options = {"projectId": settings.FIREBASE_PROJECT_ID} if settings.FIREBASE_PROJECT_ID else None
    firebase_admin.initialize_app(cred, options=options)

    global _client
    _client = firestore.client()
