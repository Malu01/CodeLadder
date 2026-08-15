"""End-to-end smoke test for the CodeLadder backend."""
import json
import urllib.error
import urllib.request

BASE = "http://localhost:8001/api/v1"
EMAIL = "smoke@test.com"


def call(method: str, path: str, body: dict | None = None, token: str | None = None):
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
    # signup (or login if already exists)
    code, r = call("POST", "/auth/signup", {"name": "Test Student", "email": EMAIL, "password": "secret123"})
    if code == 400:
        code, r = call("POST", "/auth/login", {"email": EMAIL, "password": "secret123"})
    assert r.get("access_token"), f"no token: {r}"
    token = r["access_token"]
    print("auth ok")

    code, levels = call("GET", "/levels", token=token)
    assert code == 200, levels
    print(f"levels: {len(levels)}; first: {levels[0]['title']} ({len(levels[0]['challenges'])} challenges)")

    ch = levels[0]["challenges"][0]
    cid = ch["id"]
    print(f"first challenge: {ch['title']} (id={cid}) unlocked={levels[0]['unlocked']}")

    # run sample test
    code, run = call("POST", f"/challenges/{cid}/run", {"challenge_id": cid, "code": 'print("Hello, World!")'}, token)
    assert code == 200, run
    print("run:", json.dumps(run))

    # submit hidden tests
    code, sub = call("POST", f"/challenges/{cid}/submit", {"challenge_id": cid, "code": 'print("Hello, World!")'}, token=token)
    assert code == 200, sub
    print("submit:", json.dumps(sub))

    # levels should now show solved
    code, levels = call("GET", "/levels", token=token)
    print("challenge solved:", levels[0]["challenges"][0]["solved"])

    # test a wrong answer
    code, sub2 = call("POST", "/challenges/1/submit", {"challenge_id": 1, "code": "print('nope')"}, token=token)
    print("wrong submit:", json.dumps(sub2))

    print("\nALL SMOKE TESTS PASSED")


if __name__ == "__main__":
    main()