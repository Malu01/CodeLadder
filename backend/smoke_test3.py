"""Verify band/difficulty and new challenge availability."""
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
    _, levels = call("GET", "/levels", token=t["access_token"])
    for lvl in levels:
        names = [c["title"] for c in lvl["challenges"]]
        print(f"L{lvl['position']} [{lvl['band']}/{lvl['difficulty']}/{lvl['unlocked']}] {lvl['title']}: {names}")
    print(f"\ntotal challenges: {sum(len(c['challenges']) for c in levels)}")


if __name__ == "__main__":
    main()