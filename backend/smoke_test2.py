"""Quick check of the new /leaderboard and /submissions/me endpoints."""
import json
import urllib.request

BASE = "http://localhost:8001/api/v1"


def call(method, path, body=None, token=None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    data = json.dumps(body).encode() if body else None
    with urllib.request.urlopen(req, data) as resp:
        return resp.status, json.loads(resp.read().decode())


def main():
    _, t = call("POST", "/auth/login", {"email": "smoke@test.com", "password": "secret123"})
    token = t["access_token"]

    code, lb = call("GET", "/leaderboard", token=token)
    print("leaderboard:", code, json.dumps(lb))

    code, subs = call("GET", "/submissions/me", token=token)
    print("history count:", code, len(subs))
    if subs:
        print("latest:", json.dumps(subs[0]))


if __name__ == "__main__":
    main()