"""Verify levels 7-12 seeded + new challenge grading."""
import json
import urllib.request

BASE = "http://localhost:8001/api/v1"
EMAIL = "lvltest@test.com"
PASSWORD = "secret123"

SOLUTIONS = {
    "Character Frequency": "w = input().strip()\nfrom collections import Counter\ncounts = Counter(w)\nseen = set()\nfor ch in w:\n    if ch not in seen:\n        print(ch, counts[ch])\n        seen.add(ch)\n",
    "Unique Elements": "n = int(input())\nnums = list(map(int, input().split()))\nfrom collections import Counter\nc = Counter(nums)\nsingles = [x for x in nums if c[x] == 1]\nprint('\\n'.join(map(str, singles)) if singles else 'none')\n",
    "Sort the List": "n = int(input())\nnums = list(map(int, input().split()))\nprint(' '.join(map(str, sorted(nums))))\n",
    "Find the Position": "n = int(input())\nnums = list(map(int, input().split()))\nt = int(input())\nprint(nums.index(t) + 1 if t in nums else -1)\n",
    "Matrix Sum": "r, c = map(int, input().split())\nmat = [list(map(int, input().split())) for _ in range(r)]\nprint(sum(sum(row) for row in mat))\n",
    "Count the Row Sums": "r, c = map(int, input().split())\nfor _ in range(r):\n    row = list(map(int, input().split()))\n    print(sum(row))\n",
    "Is It Prime?": "n = int(input())\ndef is_prime(x):\n    if x < 2:\n        return False\n    for i in range(2, int(x ** 0.5) + 1):\n        if x % i == 0:\n            return False\n    return True\nprint('prime' if is_prime(n) else 'not')\n",
    "GCD": "import math\na, b = map(int, input().split())\nprint(math.gcd(a, b))\n",
    "Longest Word": "s = input().strip().split()\nprint(max(s, key=len))\n",
    "Are They Anagrams?": "a = input().strip()\nb = input().strip()\nprint('yes' if sorted(a) == sorted(b) else 'no')\n",
    "Perfect Number": "n = int(input())\ndef is_perfect(x):\n    if x < 2:\n        return False\n    s = sum(d for d in range(1, x) if x % d == 0)\n    return s == x\nprint('yes' if is_perfect(n) else 'no')\n",
    "FizzBuzz Extreme": "n, m = map(int, input().split())\nfor i in range(n, m + 1):\n    if i % 15 == 0:\n        print('FizzBuzz')\n    elif i % 3 == 0:\n        print('Fizz')\n    elif i % 5 == 0:\n        print('Buzz')\n    else:\n        print(i)\n",
}


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
    code, r = call("POST", "/auth/signup", {"name": "Verify", "email": EMAIL, "password": PASSWORD})
    if code == 400:
        code, r = call("POST", "/auth/login", {"email": EMAIL, "password": PASSWORD})
    token = r["access_token"]

    _, levels = call("GET", "/levels", token=token)
    assert len(levels) == 12, f"expected 12 levels, got {len(levels)}"

    by_title = {}
    for lvl in levels:
        for ch in lvl["challenges"]:
            by_title[ch["title"]] = (lvl, ch)

    print(f"levels: {len(levels)}")
    for lvl in levels:
        names = [c["title"] for c in lvl["challenges"]]
        print(f"  L{lvl['position']} [{lvl['band']}/{lvl['difficulty']}] {lvl['title']}")

    all_ok = True
    for title, code_text in SOLUTIONS.items():
        lvl, ch = by_title[title]
        _, run = call("POST", f"/challenges/{ch['id']}/run", {"challenge_id": ch["id"], "code": code_text}, token)
        ok = run["all_passed"]
        print(f"  {'PASS' if ok else 'FAIL'}: L{lvl['position']} {title}")
        if not ok:
            all_ok = False
            print("    ", json.dumps(run))

    print("\nALL NEW CHALLENGES PASS" if all_ok else "\nSOME FAILED")


if __name__ == "__main__":
    main()