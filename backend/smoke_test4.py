"""Test the new Level 5/6 challenges grade correctly via run endpoint."""
import json
import urllib.request

BASE = "http://localhost:8001/api/v1"
EMAIL = "gradecheck@test.com"
PASSWORD = "secret123"
CHALLENGES = {
    "Palindrome Check": "w = input().strip()\nprint('yes' if w == w[::-1] else 'no')\n",
    "Two Sum": (
        "n, t = map(int, input().split())\n"
        "nums = list(map(int, input().split()))\n"
        "seen = {}\n"
        "for i, x in enumerate(nums, 1):\n"
        "    if t - x in seen:\n"
        "        print(seen[t - x], i)\n"
        "        break\n"
        "    seen[x] = i\n"
    ),
    "Fibonacci (recursive)": (
        "def fib(n):\n"
        "    if n <= 2:\n"
        "        return 1\n"
        "    return fib(n - 1) + fib(n - 2)\n"
        "n = int(input())\n"
        "print(fib(n))\n"
    ),
    "Sum of Digits": (
        "n = int(input())\n"
        "print(sum(int(d) for d in str(n)))\n"
    ),
}


def call(method, path, body=None, token=None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    data = json.dumps(body).encode() if body else None
    with urllib.request.urlopen(req, data) as resp:
        return resp.status, json.loads(resp.read().decode())


def main():
    # signup or login with the fixed email
    code, r = call("POST", "/auth/signup", {"name": "Grade Check", "email": EMAIL, "password": PASSWORD})
    if code == 400:
        code, r = call("POST", "/auth/login", {"email": EMAIL, "password": PASSWORD})
    token = r["access_token"]

    _, levels = call("GET", "/levels", token=token)
    # find by title
    by_title = {}
    for lvl in levels:
        for ch in lvl["challenges"]:
            by_title[ch["title"]] = ch["id"]

    all_ok = True
    for title, code_text in CHALLENGES.items():
        cid = by_title.get(title)
        if cid is None:
            print(f"MISSING: {title}")
            all_ok = False
            continue
        _, run = call("POST", f"/challenges/{cid}/run", {"challenge_id": cid, "code": code_text}, token)
        passed = run["all_passed"]
        print(f"{'PASS' if passed else 'FAIL'}: {title} ({len(run['results'])} sample tests)")
        if not passed:
            all_ok = False
            print("   details:", json.dumps(run))

    print("\nALL GRADING CHECKS PASSED" if all_ok else "\nSOME CHECKS FAILED")


if __name__ == "__main__":
    main()