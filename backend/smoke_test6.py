"""Verify all 30 levels seeded + every challenge's starter code passes
sample tests (run) and hidden tests (submit).

Auth: signs up / logs in via the Firebase Auth REST API using the web API key
(read from the FIREBASE_WEB_API_KEY env var or frontend/.env.local).
"""
import json
import os
import re
import sys
import urllib.request

sys.path.insert(0, ".")
from app.seed import CURRICULUM

BASE = "http://localhost:8001/api/v1"
EMAIL = "fulltest@test.com"
PASSWORD = "secret123"

STARTER = {}
for lvl in CURRICULUM:
    for ch in lvl["challenges"]:
        STARTER[(lvl["position"], ch["title"])] = ch["starter_code"]


def api_key():
    key = os.environ.get("FIREBASE_WEB_API_KEY")
    if key:
        return key
    env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                       "frontend", ".env.local")
    if os.path.isfile(env):
        for line in open(env, encoding="utf-8"):
            m = re.match(r"\s*NEXT_PUBLIC_FIREBASE_API_KEY\s*=\s*(.+)\s*$", line)
            if m:
                return m.group(1).strip()
    raise SystemExit(
        "Set FIREBASE_WEB_API_KEY (or NEXT_PUBLIC_FIREBASE_API_KEY in frontend/.env.local)"
    )


def firebase_signin(email, password, key):
    """Sign up (or sign in if exists) via Firebase Auth REST; returns idToken."""
    body = json.dumps({"email": email, "password": password,
                       "returnSecureToken": True}).encode()
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={key}"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data=body,
                                  headers={"Content-Type": "application/json"})) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        payload = json.loads(e.read().decode())
        if payload.get("error", {}).get("message") == "EMAIL_EXISTS":
            url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={key}"
            with urllib.request.urlopen(urllib.request.Request(url, data=body,
                                      headers={"Content-Type": "application/json"})) as r:
                return json.loads(r.read().decode())
        raise


def call(method, path, body=None, token=None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    data = json.dumps(body).encode() if body else None
    try:
        with urllib.request.urlopen(req, data) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())


def main():
    auth = firebase_signin(EMAIL, PASSWORD, api_key())
    token = auth["idToken"]

    _, levels = call("GET", "/levels", token=token)
    assert len(levels) == 30, f"expected 30 levels, got {len(levels)}"

    print(f"levels: {len(levels)}")
    for lvl in levels:
        names = [c["title"] for c in lvl["challenges"]]
        print(f"  L{lvl['position']} [{lvl['band']}/{lvl['difficulty']}] {lvl['title']}: {len(names)} ch")

    run_fails = []
    sub_fails = []
    total = 0
    for lvl in levels:
        for ch in lvl["challenges"]:
            total += 1
            code_text = STARTER[(lvl["position"], ch["title"])]
            _, run = call("POST", f"/challenges/{ch['id']}/run",
                          {"challenge_id": ch["id"], "code": code_text}, token)
            if not run["all_passed"]:
                run_fails.append((lvl["position"], ch["title"], run))
            _, sub = call("POST", f"/challenges/{ch['id']}/submit",
                          {"challenge_id": ch["id"], "code": code_text}, token)
            if sub["status"] != "accepted":
                sub_fails.append((lvl["position"], ch["title"], sub))

    print(f"\nchecked {total} challenges (run + submit each)")
    for pos, title, r in run_fails:
        print(f"  RUN FAIL L{pos} {title}: {json.dumps(r)}")
    for pos, title, r in sub_fails:
        print(f"  SUBMIT FAIL L{pos} {title}: {json.dumps(r)}")

    ok = not run_fails and not sub_fails
    print("\nALL 64 CHALLENGES PASS" if ok else "\nSOME FAILED")


if __name__ == "__main__":
    main()
