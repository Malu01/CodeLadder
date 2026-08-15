from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth

from app.firebase import verify_id_token
from app.repo import create_user, get_user

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Verifies a Firebase ID token (Bearer) and returns the user dict,
    creating the Firestore user record on first login."""
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        decoded = verify_id_token(credentials.credentials)
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed"
        )

    uid = decoded["uid"]
    user = get_user(uid)
    if user is None:
        try:
            record = firebase_auth.get_user(uid)
            name = record.display_name or ""
            email = record.email or decoded.get("email") or ""
        except Exception:
            name = ""
            email = decoded.get("email") or ""
        user = create_user(uid, name, email)
    return user
