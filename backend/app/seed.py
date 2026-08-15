"""
Seeds Firestore with the CodeLadder curriculum: 30 levels spanning
beginner -> mythic, each tagged easy / medium / hard, with sample + hidden
test cases per challenge.

Idempotent: re-running overwrites level/challenge documents with the latest
CURRICULUM values.
"""

from app.repo import upsert_challenge, upsert_level
CURRICULUM = [
    {
        "position": 1,
        "band": "beginner",
        "difficulty": "easy",
        "title": "Warm-Up",
        "description": "Get comfortable running Python and reading simple inputs.",
        "challenges": [
            {
                "position": 0,
                "title": "Hello, World!",
                "statement": (
                    "Write a program that prints exactly:\n"
                    "    Hello, World!\n\n"
                    "This is the classic rite of passage."
                ),
                "input_format": "No input.",
                "output_format": "A single line: Hello, World!",
                "starter_code": '# Type your code below, press "Run" to test it!\n',
                "points": 10,
                "sample_tests": [{"input": "", "expected": "Hello, World!"}],
                "hidden_tests": [{"input": "", "expected": "Hello, World!"}],
            },
            {
                "position": 1,
                "title": "Sum of Two Numbers",
                "statement": (
                    "Read two space-separated integers from one line of input,\n"
                    "and print their sum."
                ),
                "input_format": "Two integers a and b on a single line (e.g. 3 4).",
                "output_format": "The sum as a single integer.",
                "starter_code": "a, b = map(int, input().split())\nprint(a + b)\n",
                "points": 20,
                "sample_tests": [{"input": "3 4", "expected": "7"}],
                "hidden_tests": [
                    {"input": "10 20", "expected": "30"},
                    {"input": "-5 5", "expected": "0"},
                    {"input": "0 0", "expected": "0"},
                ],
            },
            {
                "position": 2,
                "title": "Even or Odd",
                "statement": (
                    "Read one integer and print 'even' if it is divisible by 2,\n"
                    "otherwise print 'odd'."
                ),
                "input_format": "One integer.",
                "output_format": "The string 'even' or 'odd'.",
                "starter_code": "n = int(input())\n# your code here\n",
                "points": 20,
                "sample_tests": [{"input": "4", "expected": "even"}],
                "hidden_tests": [
                    {"input": "7", "expected": "odd"},
                    {"input": "0", "expected": "even"},
                    {"input": "-3", "expected": "odd"},
                ],
            },
        ],
    },
    {
        "position": 2,
        "band": "beginner",
        "difficulty": "easy",
        "title": "Conditions & Logic",
        "description": "Power through if/else and comparisons.",
        "challenges": [
            {
                "position": 0,
                "title": "Grade the Score",
                "statement": (
                    "Read a score from 0 to 100 and print the letter grade:"
                    "\n90+ -> 'A', 80-89 -> 'B', 70-79 -> 'C', 60-69 -> 'D',"
                    " else 'F'."
                ),
                "input_format": "One integer score.",
                "output_format": "One letter: A, B, C, D or F.",
                "starter_code": "score = int(input())\nif score >= 90:\n    print('A')\n# ... complete the ladder\n",
                "points": 30,
                "sample_tests": [{"input": "85", "expected": "B"}],
                "hidden_tests": [
                    {"input": "95", "expected": "A"},
                    {"input": "70", "expected": "C"},
                    {"input": "63", "expected": "D"},
                    {"input": "30", "expected": "F"},
                ],
            },
            {
                "position": 1,
                "title": "Largest of Three",
                "statement": (
                    "Read three space-separated integers and print the largest one."
                ),
                "input_format": "Three integers a b c on one line.",
                "output_format": "The largest integer.",
                "starter_code": "a, b, c = map(int, input().split())\n# print the max\n",
                "points": 30,
                "sample_tests": [{"input": "5 9 3", "expected": "9"}],
                "hidden_tests": [
                    {"input": "1 1 1", "expected": "1"},
                    {"input": "-1 -5 -2", "expected": "-1"},
                    {"input": "7 3 7", "expected": "7"},
                ],
            },
        ],
    },
    {
        "position": 3,
        "band": "intermediate",
        "difficulty": "medium",
        "title": "Loops",
        "description": "Master while and for loops.",
        "challenges": [
            {
                "position": 0,
                "title": "Countdown from N",
                "statement": (
                    "Read an integer n and print the numbers n, n-1, ..., 1\n"
                    "each on its own line. If n is 0 print nothing."
                ),
                "input_format": "One integer n.",
                "output_format": "Each number on its own line, descending.",
                "starter_code": "n = int(input())\n# print n down to 1\n",
                "points": 40,
                "sample_tests": [{"input": "3", "expected": "3\n2\n1"}],
                "hidden_tests": [
                    {"input": "1", "expected": "1"},
                    {"input": "5", "expected": "5\n4\n3\n2\n1"},
                    {"input": "0", "expected": ""},
                ],
            },
            {
                "position": 1,
                "title": "Sum 1 to N",
                "statement": (
                    "Read an integer n and print the sum 1 + 2 + ... + n."
                ),
                "input_format": "One integer n (1 <= n <= 10000).",
                "output_format": "The sum as an integer.",
                "starter_code": "n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(total)\n",
                "points": 40,
                "sample_tests": [{"input": "10", "expected": "55"}],
                "hidden_tests": [
                    {"input": "1", "expected": "1"},
                    {"input": "100", "expected": "5050"},
                    {"input": "0", "expected": "0"},
                ],
            },
            {
                "position": 2,
                "title": "FizzBuzz",
                "statement": (
                    "Read n. For each i from 1 to n print 'Fizz' if divisible by 3,\n"
                    "'Buzz' if divisible by 5, 'FizzBuzz' if both, else the number."
                ),
                "input_format": "One integer n.",
                "output_format": "n lines, one result per line.",
                "starter_code": "n = int(input())\nfor i in range(1, n + 1):\n    # ...\n    print()\n",
                "points": 50,
                "sample_tests": [{"input": "5", "expected": "1\n2\nFizz\n4\nBuzz"}],
                "hidden_tests": [
                    {"input": "15", "expected": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"},
                ],
            },
        ],
    },
    {
        "position": 4,
        "band": "intermediate",
        "difficulty": "medium",
        "title": "Strings",
        "description": "Slice, search and transform text.",
        "challenges": [
            {
                "position": 0,
                "title": "Reverse a String",
                "statement": "Read a line of text and print it reversed.",
                "input_format": "One line of text (no spaces is fine, spaces allowed).",
                "output_format": "The reversed line.",
                "starter_code": "s = input().strip()\nprint(s[::-1])\n",
                "points": 40,
                "sample_tests": [{"input": "abc", "expected": "cba"}],
                "hidden_tests": [
                    {"input": "hello", "expected": "olleh"},
                    {"input": "racecar", "expected": "racecar"},
                    {"input": "A B C", "expected": "C B A"},
                ],
            },
            {
                "position": 1,
                "title": "Count Vowels",
                "statement": (
                    "Read a lower-case word and print how many vowels it contains "
                    "(a, e, i, o, u)."
                ),
                "input_format": "One lower-case word.",
                "output_format": "Count as an integer.",
                "starter_code": "w = input().strip()\nvowels = set('aeiou')\ncount = 0\n# count vowels\nprint(count)\n",
                "points": 40,
                "sample_tests": [{"input": "hello", "expected": "2"}],
                "hidden_tests": [
                    {"input": "aeiou", "expected": "5"},
                    {"input": "python", "expected": "1"},
                    {"input": "rhythm", "expected": "0"},
                ],
            },
            {
                "position": 2,
                "title": "Palindrome Check",
                "statement": (
                    "Read a word (lower-case) and print 'yes' if it reads the\n"
                    "same forwards and backwards, otherwise 'no'."
                ),
                "input_format": "One lower-case word.",
                "output_format": "The string 'yes' or 'no'.",
                "starter_code": "w = input().strip()\n# print 'yes' if palindrome else 'no'\n",
                "points": 60,
                "sample_tests": [{"input": "racecar", "expected": "yes"}],
                "hidden_tests": [
                    {"input": "madam", "expected": "yes"},
                    {"input": "hello", "expected": "no"},
                    {"input": "a", "expected": "yes"},
                ],
            },
        ],
    },
    {
        "position": 5,
        "band": "advanced",
        "difficulty": "advanced",
        "title": "Intro Arrays",
        "description": "Work with lists and simple algorithms.",
        "challenges": [
            {
                "position": 0,
                "title": "Sum of a List",
                "statement": (
                    "First line: integer n. Second line: n integers.\n"
                    "Print the sum of the list."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "The sum as an integer.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nprint(sum(nums))\n",
                "points": 50,
                "sample_tests": [{"input": "3\n1 2 3", "expected": "6"}],
                "hidden_tests": [
                    {"input": "4\n10 -4 7 2", "expected": "15"},
                    {"input": "1\n5", "expected": "5"},
                ],
            },
            {
                "position": 1,
                "title": "Find the Maximum",
                "statement": (
                    "Second line of integers with n on the first line.\n"
                    "Print the largest number."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "The maximum as an integer.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nprint(max(nums))\n",
                "points": 50,
                "sample_tests": [{"input": "4\n3 9 2 7", "expected": "9"}],
                "hidden_tests": [
                    {"input": "3\n-1 -2 -3", "expected": "-1"},
                    {"input": "5\n5 5 5 5 5", "expected": "5"},
                ],
            },
            {
                "position": 2,
                "title": "Two Sum",
                "statement": (
                    "First line: integer n and target t. Second line: n integers.\n"
                    "Find two distinct elements whose sum equals t and print the\n"
                    "two 1-based indices (space separated). You may assume exactly\n"
                    "one solution exists."
                ),
                "input_format": "n t on line 1, then n integers on line 2.",
                "output_format": "Two 1-based indices separated by a space.",
                "starter_code": "n, t = map(int, input().split())\nnums = list(map(int, input().split()))\n# find two indices that sum to t\n",
                "points": 80,
                "sample_tests": [{"input": "4 9\n2 7 11 15", "expected": "1 2"}],
                "hidden_tests": [
                    {"input": "3 6\n3 2 4", "expected": "2 3"},
                    {"input": "2 5\n2 3", "expected": "1 2"},
                    {"input": "4 0\n-1 2 1 4", "expected": "1 3"},
                ],
            },
        ],
    },
    {
        "position": 6,
        "band": "advanced",
        "difficulty": "advanced",
        "title": "Recursion & Fibonacci",
        "description": "Think recursively and spot exponential blowup.",
        "challenges": [
            {
                "position": 0,
                "title": "Fibonacci (recursive)",
                "statement": (
                    "Read n (1 <= n <= 30) and print the n-th Fibonacci number,\n"
                    "where fib(1)=1, fib(2)=1 and fib(k)=fib(k-1)+fib(k-2)."
                ),
                "input_format": "One integer n.",
                "output_format": "The n-th Fibonacci number.",
                "starter_code": "def fib(n):\n    # your recursion here\n    pass\n\nn = int(input())\nprint(fib(n))\n",
                "points": 70,
                "sample_tests": [{"input": "7", "expected": "13"}],
                "hidden_tests": [
                    {"input": "1", "expected": "1"},
                    {"input": "2", "expected": "1"},
                    {"input": "10", "expected": "55"},
                    {"input": "20", "expected": "6765"},
                ],
            },
            {
                "position": 1,
                "title": "Sum of Digits",
                "statement": (
                    "Read a non-negative integer n and print the sum of its digits.\n"
                    "Try doing it with a while loop."
                ),
                "input_format": "One integer n (0 <= n <= 10^9).",
                "output_format": "Sum of digits as an integer.",
                "starter_code": "n = int(input())\ntotal = 0\n# add each digit of n\nprint(total)\n",
                "points": 70,
                "sample_tests": [{"input": "1234", "expected": "10"}],
                "hidden_tests": [
                    {"input": "0", "expected": "0"},
                    {"input": "999999999", "expected": "81"},
                    {"input": "1000000", "expected": "1"},
                ],
            },
        ],
    },
    {
        "position": 7,
        "band": "advanced",
        "difficulty": "advanced",
        "title": "Dictionaries & Sets",
        "description": "Count, group and find unique things fast.",
        "challenges": [
            {
                "position": 0,
                "title": "Character Frequency",
                "statement": (
                    "Read a lower-case word and print each distinct character\n"
                    "with its count, one per line, in order of first appearance.\n"
                    "Format per line: character followed by a space and the count."
                ),
                "input_format": "One lower-case word.",
                "output_format": "Lines of the form 'x n' for each distinct letter.",
                "starter_code": "w = input().strip()\nfrom collections import Counter\ncounts = Counter(w)\nfor ch in w:\n    if counts[ch] > 0:\n        print(ch, counts[ch])\n        counts[ch] = 0\n",
                "points": 60,
                "sample_tests": [{"input": "hello", "expected": "h 1\ne 1\nl 2\no 1"}],
                "hidden_tests": [
                    {"input": "aabbc", "expected": "a 2\nb 2\nc 1"},
                    {"input": "banana", "expected": "b 1\na 3\nn 2"},
                    {"input": "z", "expected": "z 1"},
                ],
            },
            {
                "position": 1,
                "title": "Unique Elements",
                "statement": (
                    "First line: n. Second line: n integers.\n"
                    "Print only the numbers that appear EXACTLY once, in the order\n"
                    "they appear, each on its own line. If none, print 'none'."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "Each unique-occuring number on its own line, or 'none'.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nfrom collections import Counter\nc = Counter(nums)\nsingles = [x for x in nums if c[x] == 1]\nif singles:\n    print('\\n'.join(map(str, singles)))\nelse:\n    print('none')\n",
                "points": 60,
                "sample_tests": [{"input": "5\n1 2 1 3 2", "expected": "3"}],
                "hidden_tests": [
                    {"input": "3\n1 1 1", "expected": "none"},
                    {"input": "4\n7 7 8 9", "expected": "8\n9"},
                    {"input": "1\n5", "expected": "5"},
                ],
            },
        ],
    },
    {
        "position": 8,
        "band": "advanced",
        "difficulty": "advanced",
        "title": "Sorting & Searching",
        "description": "Order things and find things fast.",
        "challenges": [
            {
                "position": 0,
                "title": "Sort the List",
                "statement": (
                    "First line: n. Second line: n integers.\n"
                    "Print the integers in ascending order, space separated."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "The sorted integers on one line.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nprint(' '.join(map(str, sorted(nums))))\n",
                "points": 60,
                "sample_tests": [{"input": "4\n4 2 3 1", "expected": "1 2 3 4"}],
                "hidden_tests": [
                    {"input": "3\n-1 -5 -3", "expected": "-5 -3 -1"},
                    {"input": "5\n5 5 5 5 5", "expected": "5 5 5 5 5"},
                    {"input": "1\n10", "expected": "10"},
                ],
            },
            {
                "position": 1,
                "title": "Find the Position",
                "statement": (
                    "First line: n. Second line: n SORTED integers.\n"
                    "Third line: integer target.\n"
                    "Print the 1-based index of target, or -1 if not present."
                ),
                "input_format": "n, then sorted n integers, then target (3 lines).",
                "output_format": "1-based index or -1.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nt = int(input())\nif t in nums:\n    print(nums.index(t) + 1)\nelse:\n    print(-1)\n",
                "points": 60,
                "sample_tests": [{"input": "5\n1 3 5 7 9\n7", "expected": "4"}],
                "hidden_tests": [
                    {"input": "4\n2 4 6 8\n5", "expected": "-1"},
                    {"input": "3\n10 20 30\n10", "expected": "1"},
                    {"input": "1\n1\n1", "expected": "1"},
                ],
            },
        ],
    },
    {
        "position": 9,
        "band": "expert",
        "difficulty": "expert",
        "title": "Matrices",
        "description": "Work with 2D lists.",
        "challenges": [
            {
                "position": 0,
                "title": "Matrix Sum",
                "statement": (
                    "First line: r c. Then r lines, each with c integers.\n"
                    "Print the sum of ALL elements in the matrix."
                ),
                "input_format": "r c on line 1, then r lines of c ints.",
                "output_format": "The total sum.",
                "starter_code": "r, c = map(int, input().split())\nmat = [list(map(int, input().split())) for _ in range(r)]\nprint(sum(sum(row) for row in mat))\n",
                "points": 70,
                "sample_tests": [{"input": "2 2\n1 2\n3 4", "expected": "10"}],
                "hidden_tests": [
                    {"input": "1 3\n1 -1 1", "expected": "1"},
                    {"input": "3 3\n5 5 5\n5 5 5\n5 5 5", "expected": "45"},
                    {"input": "2 1\n10\n20", "expected": "30"},
                ],
            },
            {
                "position": 1,
                "title": "Count the Row Sums",
                "statement": (
                    "First line: r c. Then r lines, each with c integers.\n"
                    "Print the sum of EACH row, one per line (top to bottom)."
                ),
                "input_format": "r c on line 1, then r lines of c ints.",
                "output_format": "r lines, each with one row's sum.",
                "starter_code": "r, c = map(int, input().split())\nfor _ in range(r):\n    row = list(map(int, input().split()))\n    print(sum(row))\n",
                "points": 70,
                "sample_tests": [{"input": "2 3\n1 2 3\n4 5 6", "expected": "6\n15"}],
                "hidden_tests": [
                    {"input": "1 1\n9", "expected": "9"},
                    {"input": "3 2\n1 1\n2 2\n3 3", "expected": "2\n4\n6"},
                ],
            },
        ],
    },
    {
        "position": 10,
        "band": "expert",
        "difficulty": "expert",
        "title": "Numbers & Math",
        "description": "Primes, factors and divisibility puzzles.",
        "challenges": [
            {
                "position": 0,
                "title": "Is It Prime?",
                "statement": (
                    "Read an integer n and print 'prime' if it has no divisors other\n"
                    "than 1 and itself, otherwise 'not'."
                ),
                "input_format": "One integer n.",
                "output_format": "The string 'prime' or 'not'.",
                "starter_code": "n = int(input())\ndef is_prime(x):\n    if x < 2:\n        return False\n    for i in range(2, int(x ** 0.5) + 1):\n        if x % i == 0:\n            return False\n    return True\nprint('prime' if is_prime(n) else 'not')\n",
                "points": 80,
                "sample_tests": [{"input": "17", "expected": "prime"}],
                "hidden_tests": [
                    {"input": "1", "expected": "not"},
                    {"input": "2", "expected": "prime"},
                    {"input": "25", "expected": "not"},
                    {"input": "97", "expected": "prime"},
                ],
            },
            {
                "position": 1,
                "title": "GCD",
                "statement": "Read two integers a b and print their greatest common divisor.",
                "input_format": "Two integers a b on one line.",
                "output_format": "The GCD as an integer.",
                "starter_code": "import math\na, b = map(int, input().split())\nprint(math.gcd(a, b))\n",
                "points": 60,
                "sample_tests": [{"input": "12 8", "expected": "4"}],
                "hidden_tests": [
                    {"input": "17 5", "expected": "1"},
                    {"input": "100 75", "expected": "25"},
                    {"input": "0 7", "expected": "7"},
                ],
            },
        ],
    },
    {
        "position": 11,
        "band": "expert",
        "difficulty": "expert",
        "title": "String Algorithms",
        "description": "Manipulate and analyze text.",
        "challenges": [
            {
                "position": 0,
                "title": "Longest Word",
                "statement": (
                    "Read a sentence (lower-case words separated by spaces) and print\n"
                    "the longest word. If several tie, print the FIRST one."
                ),
                "input_format": "One line of lower-case words.",
                "output_format": "The longest word.",
                "starter_code": "s = input().strip().split()\nprint(max(s, key=len))\n",
                "points": 60,
                "sample_tests": [{"input": "the quick brown fox", "expected": "quick"}],
                "hidden_tests": [
                    {"input": "coding practice", "expected": "practice"},
                    {"input": "a aa aaa", "expected": "aaa"},
                    {"input": "hello", "expected": "hello"},
                ],
            },
            {
                "position": 1,
                "title": "Are They Anagrams?",
                "statement": (
                    "Read two lower-case words, one per line, and print 'yes' if they\n"
                    "are anagrams (same letters, different order), otherwise 'no'."
                ),
                "input_format": "Two lines, each one word.",
                "output_format": "The string 'yes' or 'no'.",
                "starter_code": "a = input().strip()\nb = input().strip()\nprint('yes' if sorted(a) == sorted(b) else 'no')\n",
                "points": 70,
                "sample_tests": [{"input": "listen\nsilent", "expected": "yes"}],
                "hidden_tests": [
                    {"input": "cat\nact", "expected": "yes"},
                    {"input": "hello\nhelo", "expected": "no"},
                    {"input": "abc\ncba", "expected": "yes"},
                ],
            },
        ],
    },
    {
        "position": 12,
        "band": "expert",
        "difficulty": "expert",
        "title": "The Grand Finale",
        "description": "Bring every skill together.",
        "challenges": [
            {
                "position": 0,
                "title": "Perfect Number",
                "statement": (
                    "A perfect number equals the sum of its proper divisors\n"
                    "(e.g. 6 = 1+2+3). Read n and print 'perfect' or 'not'."
                ),
                "input_format": "One integer n.",
                "output_format": "The string 'yes' or 'no'.",
                "starter_code": "n = int(input())\ndef is_perfect(x):\n    if x < 2:\n        return False\n    s = sum(d for d in range(1, x) if x % d == 0)\n    return s == x\nprint('yes' if is_perfect(n) else 'no')\n",
                "points": 80,
                "sample_tests": [{"input": "6", "expected": "yes"}],
                "hidden_tests": [
                    {"input": "28", "expected": "yes"},
                    {"input": "12", "expected": "no"},
                    {"input": "496", "expected": "yes"},
                ],
            },
            {
                "position": 1,
                "title": "FizzBuzz Extreme",
                "statement": (
                    "Read two integers n and m (n <= m). Print the numbers from n to m,\n"
                    "but replace multiples of 3 with 'Fizz', multiples of 5 with 'Buzz',\n"
                    "and multiples of both with 'FizzBuzz'."
                ),
                "input_format": "Two integers n m on one line.",
                "output_format": "One result per line, from n to m.",
                "starter_code": "n, m = map(int, input().split())\nfor i in range(n, m + 1):\n    if i % 15 == 0:\n        print('FizzBuzz')\n    elif i % 3 == 0:\n        print('Fizz')\n    elif i % 5 == 0:\n        print('Buzz')\n    else:\n        print(i)\n",
                "points": 80,
                "sample_tests": [{"input": "1 5", "expected": "1\n2\nFizz\n4\nBuzz"}],
                "hidden_tests": [
                    {"input": "10 15", "expected": "Buzz\n11\nFizz\n13\n14\nFizzBuzz"},
                    {"input": "3 3", "expected": "Fizz"},
                ],
            },
        ],
    },
    {
        "position": 13,
        "band": "master",
        "difficulty": "master",
        "title": "Dictionaries in Depth",
        "description": "Use dicts as fast lookup tables.",
        "challenges": [
            {
                "position": 0,
                "title": "Word Counter",
                "statement": (
                    "First line: n. Then n words (one per line).\n"
                    "Print each DISTINCT word and its count, in the order the word\n"
                    "first appears. Format: 'word count'."
                ),
                "input_format": "n, then n lines each with one word.",
                "output_format": "Lines of the form 'word count'.",
                "starter_code": "from collections import Counter\nn = int(input())\nwords = [input().strip() for _ in range(n)]\ncounts = Counter(words)\nfor w in words:\n    if counts[w] > 0:\n        print(w, counts[w])\n        counts[w] = 0\n",
                "points": 70,
                "sample_tests": [{"input": "4\napple\nbanana\napple\ncherry", "expected": "apple 2\nbanana 1\ncherry 1"}],
                "hidden_tests": [
                    {"input": "2\nx\nx", "expected": "x 2"},
                    {"input": "3\na\nb\na", "expected": "a 2\nb 1"},
                ],
            },
            {
                "position": 1,
                "title": "Most Frequent Element",
                "statement": (
                    "First line: n. Second line: n integers.\n"
                    "Print the number that appears most often. If there is a tie,\n"
                    "print the one that appears first."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "The most frequent integer.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nfrom collections import Counter\nprint(Counter(nums).most_common(1)[0][0])\n",
                "points": 70,
                "sample_tests": [{"input": "5\n1 3 3 1 2", "expected": "1"}],
                "hidden_tests": [
                    {"input": "4\n7 7 7 8", "expected": "7"},
                    {"input": "3\n1 2 3", "expected": "1"},
                    {"input": "6\n5 5 5 9 9 9", "expected": "5"},
                ],
            },
        ],
    },
    {
        "position": 14,
        "band": "master",
        "difficulty": "master",
        "title": "Advanced Loops",
        "description": "Nested loops and pattern printing.",
        "challenges": [
            {
                "position": 0,
                "title": "Number Triangle",
                "statement": (
                    "Read n. Print n rows: row i contains the numbers 1..i\n"
                    "space separated."
                ),
                "input_format": "One integer n.",
                "output_format": "n lines, each a row of the triangle.",
                "starter_code": "n = int(input())\nfor i in range(1, n + 1):\n    print(' '.join(map(str, range(1, i + 1))))\n",
                "points": 70,
                "sample_tests": [{"input": "3", "expected": "1\n1 2\n1 2 3"}],
                "hidden_tests": [
                    {"input": "1", "expected": "1"},
                    {"input": "4", "expected": "1\n1 2\n1 2 3\n1 2 3 4"},
                ],
            },
            {
                "position": 1,
                "title": "Multiplication Table",
                "statement": (
                    "Read n and print the multiplication table of n, from\n"
                    "1 to 10, in the format 'n x i = product'."
                ),
                "input_format": "One integer n.",
                "output_format": "10 lines in the format n x i = product.",
                "starter_code": "n = int(input())\nfor i in range(1, 11):\n    print(f'{n} x {i} = {n * i}')\n",
                "points": 70,
                "sample_tests": [{"input": "2", "expected": "2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n2 x 4 = 8\n2 x 5 = 10\n2 x 6 = 12\n2 x 7 = 14\n2 x 8 = 16\n2 x 9 = 18\n2 x 10 = 20"}],
                "hidden_tests": [
                    {"input": "1", "expected": "1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10"},
                    {"input": "5", "expected": "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50"},
                ],
            },
        ],
    },
    {
        "position": 15,
        "band": "master",
        "difficulty": "master",
        "title": "List Mastery",
        "description": "List comprehensions and slices.",
        "challenges": [
            {
                "position": 0,
                "title": "Squares List",
                "statement": (
                    "Read n and print the squares of 1..n space separated,\n"
                    "each on one line."
                ),
                "input_format": "One integer n.",
                "output_format": "n lines, square of each number from 1 to n.",
                "starter_code": "n = int(input())\nfor i in range(1, n + 1):\n    print(i * i)\n",
                "points": 70,
                "sample_tests": [{"input": "3", "expected": "1\n4\n9"}],
                "hidden_tests": [
                    {"input": "1", "expected": "1"},
                    {"input": "5", "expected": "1\n4\n9\n16\n25"},
                ],
            },
            {
                "position": 1,
                "title": "Even Numbers",
                "statement": (
                    "First line: n. Second line: n integers.\n"
                    "Print the even numbers in the SAME order, space separated,\n"
                    "or 'none' if there are none."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "Even integers on one line, or 'none'.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nevens = [x for x in nums if x % 2 == 0]\nprint(' '.join(map(str, evens)) if evens else 'none')\n",
                "points": 70,
                "sample_tests": [{"input": "4\n1 2 3 4", "expected": "2 4"}],
                "hidden_tests": [
                    {"input": "3\n1 3 5", "expected": "none"},
                    {"input": "4\n-2 -1 0 1", "expected": "-2 0"},
                    {"input": "2\n8 8", "expected": "8 8"},
                ],
            },
        ],
    },
    {
        "position": 16,
        "band": "master",
        "difficulty": "master",
        "title": "String Builder",
        "description": "Compose and transform strings.",
        "challenges": [
            {
                "position": 0,
                "title": "Uppercase First Letters",
                "statement": (
                    "Read a line of lower-case words and print them with the first\n"
                    "letter of each word capitalized."
                ),
                "input_format": "One line of lower-case words.",
                "output_format": "The same words with each first letter upper-case.",
                "starter_code": "words = input().strip().split()\nprint(' '.join(w[0].upper() + w[1:] for w in words))\n",
                "points": 70,
                "sample_tests": [{"input": "hello world", "expected": "Hello World"}],
                "hidden_tests": [
                    {"input": "python is fun", "expected": "Python Is Fun"},
                    {"input": "one", "expected": "One"},
                ],
            },
            {
                "position": 1,
                "title": "Remove Vowels",
                "statement": (
                    "Read a line of lower-case text (may contain spaces) and print\n"
                    "it with all vowels (a e i o u) removed."
                ),
                "input_format": "One line of text.",
                "output_format": "The text without vowels.",
                "starter_code": "s = input().strip()\nprint(''.join(c for c in s if c not in 'aeiou'))\n",
                "points": 70,
                "sample_tests": [{"input": "hello world", "expected": "hll wrld"}],
                "hidden_tests": [
                    {"input": "aeiou", "expected": ""},
                    {"input": "rhythm", "expected": "rhythm"},
                ],
            },
        ],
    },
    {
        "position": 17,
        "band": "master",
        "difficulty": "master",
        "title": "Numbers & Digits",
        "description": "Digit games and divisibility.",
        "challenges": [
            {
                "position": 0,
                "title": "Count Digits",
                "statement": "Read an integer n and print how many digits it has.",
                "input_format": "One integer n.",
                "output_format": "The digit count.",
                "starter_code": "n = int(input())\nprint(len(str(abs(n))))\n",
                "points": 70,
                "sample_tests": [{"input": "12345", "expected": "5"}],
                "hidden_tests": [
                    {"input": "0", "expected": "1"},
                    {"input": "-99", "expected": "2"},
                    {"input": "1000000", "expected": "7"},
                ],
            },
            {
                "position": 1,
                "title": "Divisible by 3 and 5",
                "statement": (
                    "Read an integer n and print 'yes' if n is divisible by BOTH\n"
                    "3 and 5, otherwise 'no'."
                ),
                "input_format": "One integer n.",
                "output_format": "The string 'yes' or 'no'.",
                "starter_code": "n = int(input())\nprint('yes' if n % 15 == 0 else 'no')\n",
                "points": 70,
                "sample_tests": [{"input": "30", "expected": "yes"}],
                "hidden_tests": [
                    {"input": "15", "expected": "yes"},
                    {"input": "10", "expected": "no"},
                    {"input": "0", "expected": "yes"},
                ],
            },
        ],
    },
    {
        "position": 18,
        "band": "master",
        "difficulty": "master",
        "title": "Comprehensions",
        "description": "Write clean, dense list logic.",
        "challenges": [
            {
                "position": 0,
                "title": "Filter Positives",
                "statement": (
                    "First line: n. Second line: n integers.\n"
                    "Print the positive integers (x > 0) in order, space separated,\n"
                    "or 'none'."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "Positive ints on one line, or 'none'.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\npos = [x for x in nums if x > 0]\nprint(' '.join(map(str, pos)) if pos else 'none')\n",
                "points": 70,
                "sample_tests": [{"input": "4\n-2 1 -3 4", "expected": "1 4"}],
                "hidden_tests": [
                    {"input": "3\n-1 -2 -3", "expected": "none"},
                    {"input": "2\n0 5", "expected": "5"},
                ],
            },
            {
                "position": 1,
                "title": "First Letters",
                "statement": (
                    "Read a line of words and print the first letter of each word,\n"
                    "concatenated (no spaces)."
                ),
                "input_format": "One line of words.",
                "output_format": "The concatenated first letters.",
                "starter_code": "words = input().strip().split()\nprint(''.join(w[0] for w in words))\n",
                "points": 70,
                "sample_tests": [{"input": "hello world", "expected": "hw"}],
                "hidden_tests": [
                    {"input": "united states of america", "expected": "usoa"},
                    {"input": "ab cd ef", "expected": "ace"},
                ],
            },
        ],
    },
    {
        "position": 19,
        "band": "legend",
        "difficulty": "legend",
        "title": "Two Pointers",
        "description": "Sweep from both ends of a list.",
        "challenges": [
            {
                "position": 0,
                "title": "Pair Sum",
                "statement": (
                    "First line: n and target t. Second line: n integers (SORTED\n"
                    "ascending). Print 'yes' if any two numbers sum to t, else 'no'."
                ),
                "input_format": "n t on line 1, then n sorted ints on line 2.",
                "output_format": "The string 'yes' or 'no'.",
                "starter_code": "n, t = map(int, input().split())\nnums = list(map(int, input().split()))\nl, r = 0, n - 1\nfound = False\nwhile l < r:\n    s = nums[l] + nums[r]\n    if s == t:\n        found = True\n        break\n    elif s < t:\n        l += 1\n    else:\n        r -= 1\nprint('yes' if found else 'no')\n",
                "points": 90,
                "sample_tests": [{"input": "5 7\n1 2 3 4 5", "expected": "yes"}],
                "hidden_tests": [
                    {"input": "4 9\n1 2 3 4", "expected": "no"},
                    {"input": "4 8\n1 2 3 5", "expected": "yes"},
                ],
            },
            {
                "position": 1,
                "title": "Reverse In Place",
                "statement": (
                    "First line: n. Second line: n integers.\n"
                    "Print the list reversed."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "The reversed integers, space separated.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nprint(' '.join(map(str, nums[::-1])))\n",
                "points": 90,
                "sample_tests": [{"input": "4\n1 2 3 4", "expected": "4 3 2 1"}],
                "hidden_tests": [
                    {"input": "1\n9", "expected": "9"},
                    {"input": "3\n-1 -2 -3", "expected": "-3 -2 -1"},
                ],
            },
        ],
    },
    {
        "position": 20,
        "band": "legend",
        "difficulty": "legend",
        "title": "Sliding Window",
        "description": "Track a moving window of values.",
        "challenges": [
            {
                "position": 0,
                "title": "Max Sum Window",
                "statement": (
                    "First line: n and k. Second line: n integers.\n"
                    "Print the maximum sum of any k consecutive numbers."
                ),
                "input_format": "n k on line 1, then n integers on line 2.",
                "output_format": "The max window sum.",
                "starter_code": "n, k = map(int, input().split())\nnums = list(map(int, input().split()))\nprint(max(sum(nums[i:i+k]) for i in range(n - k + 1)))\n",
                "points": 100,
                "sample_tests": [{"input": "6 3\n2 1 5 1 3 2", "expected": "9"}],
                "hidden_tests": [
                    {"input": "4 2\n1 2 3 4", "expected": "7"},
                    {"input": "5 1\n-1 -2 -3 -4 -5", "expected": "-1"},
                    {"input": "3 3\n7 7 7", "expected": "21"},
                ],
            },
            {
                "position": 1,
                "title": "Sliding Average",
                "statement": (
                    "First line: n and k. Second line: n integers.\n"
                    "Print the average of each window of k numbers as an integer\n"
                    "(floor division), one per line."
                ),
                "input_format": "n k on line 1, then n integers on line 2.",
                "output_format": "One integer per window, left to right.",
                "starter_code": "n, k = map(int, input().split())\nnums = list(map(int, input().split()))\nfor i in range(n - k + 1):\n    print(sum(nums[i:i+k]) // k)\n",
                "points": 100,
                "sample_tests": [{"input": "5 2\n10 20 30 40 50", "expected": "15\n25\n35\n45"}],
                "hidden_tests": [
                    {"input": "4 2\n1 2 3 4", "expected": "1\n2\n3"},
                    {"input": "3 1\n5 5 5", "expected": "5\n5\n5"},
                ],
            },
        ],
    },
    {
        "position": 21,
        "band": "legend",
        "difficulty": "legend",
        "title": "Binary Search",
        "description": "Find things in log time.",
        "challenges": [
            {
                "position": 0,
                "title": "First True",
                "statement": (
                    "First line: n. Second line: n integers (0s then 1s, SORTED).\n"
                    "Print the 1-based index of the FIRST 1, or -1 if none."
                ),
                "input_format": "n on line 1, then n sorted 0/1 ints on line 2.",
                "output_format": "1-based index of first 1, or -1.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nlo, hi = 0, n\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] == 1:\n        hi = mid\n    else:\n        lo = mid + 1\nprint(lo + 1 if lo < n and nums[lo] == 1 else -1)\n",
                "points": 100,
                "sample_tests": [{"input": "5\n0 0 1 1 1", "expected": "3"}],
                "hidden_tests": [
                    {"input": "3\n0 0 0", "expected": "-1"},
                    {"input": "2\n1 1", "expected": "1"},
                    {"input": "4\n0 0 0 1", "expected": "4"},
                ],
            },
            {
                "position": 1,
                "title": "Lower Bound",
                "statement": (
                    "First line: n. Second line: n SORTED integers. Third line: target.\n"
                    "Print the 1-based index of the first number >= target, or -1."
                ),
                "input_format": "n, sorted ints, target (3 lines).",
                "output_format": "1-based index of lower bound, or -1.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nt = int(input())\nlo, hi = 0, n\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] >= t:\n        hi = mid\n    else:\n        lo = mid + 1\nprint(lo + 1 if lo < n else -1)\n",
                "points": 100,
                "sample_tests": [{"input": "5\n1 3 5 7 9\n6", "expected": "4"}],
                "hidden_tests": [
                    {"input": "3\n1 2 3\n0", "expected": "1"},
                    {"input": "3\n1 2 3\n10", "expected": "-1"},
                    {"input": "4\n2 4 6 8\n4", "expected": "2"},
                ],
            },
        ],
    },
    {
        "position": 22,
        "band": "legend",
        "difficulty": "legend",
        "title": "Sorting Masters",
        "description": "Custom sorts and stability.",
        "challenges": [
            {
                "position": 0,
                "title": "Sort by Frequency",
                "statement": (
                    "First line: n. Second line: n integers.\n"
                    "Print the numbers sorted by FREQUENCY descending; ties broken\n"
                    "by value ascending. Space separated."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "Sorted numbers on one line.",
                "starter_code": "from collections import Counter\nn = int(input())\nnums = list(map(int, input().split()))\nc = Counter(nums)\nprint(' '.join(map(str, sorted(nums, key=lambda x: (-c[x], x)))))\n",
                "points": 110,
                "sample_tests": [{"input": "6\n2 3 1 3 2 2", "expected": "2 2 2 3 3 1"}],
                "hidden_tests": [
                    {"input": "4\n1 1 2 2", "expected": "1 1 2 2"},
                    {"input": "3\n9 5 1", "expected": "1 5 9"},
                ],
            },
            {
                "position": 1,
                "title": "Sort by Absolute Value",
                "statement": (
                    "First line: n. Second line: n integers.\n"
                    "Print them sorted by absolute value ascending; ties keep\n"
                    "original order."
                ),
                "input_format": "n on line 1, then n integers on line 2.",
                "output_format": "The sorted integers, space separated.",
                "starter_code": "n = int(input())\nnums = list(map(int, input().split()))\nprint(' '.join(map(str, sorted(nums, key=abs))))\n",
                "points": 110,
                "sample_tests": [{"input": "5\n3 -1 2 -4 1", "expected": "-1 1 2 3 -4"}],
                "hidden_tests": [
                    {"input": "3\n-2 2 -2", "expected": "-2 2 -2"},
                    {"input": "4\n10 -5 0 3", "expected": "0 3 -5 10"},
                ],
            },
        ],
    },
    {
        "position": 23,
        "band": "legend",
        "difficulty": "legend",
        "title": "Recursion III",
        "description": "Recursion with branching.",
        "challenges": [
            {
                "position": 0,
                "title": "Sum of Digits (recursive)",
                "statement": (
                    "Read a non-negative integer n and print the sum of its digits\n"
                    "using RECURSION."
                ),
                "input_format": "One integer n.",
                "output_format": "The digit sum.",
                "starter_code": "def digit_sum(n):\n    if n < 10:\n        return n\n    return n % 10 + digit_sum(n // 10)\n\nn = int(input())\nprint(digit_sum(n))\n",
                "points": 100,
                "sample_tests": [{"input": "1234", "expected": "10"}],
                "hidden_tests": [
                    {"input": "0", "expected": "0"},
                    {"input": "999", "expected": "27"},
                ],
            },
            {
                "position": 1,
                "title": "Count Down Even",
                "statement": (
                    "Read an even integer n and print every even number from n down\n"
                    "to 2, one per line, using recursion."
                ),
                "input_format": "One even integer n.",
                "output_format": "Even numbers descending, one per line.",
                "starter_code": "def evens(n):\n    if n < 2:\n        return\n    print(n)\n    evens(n - 2)\n\nn = int(input())\nevens(n)\n",
                "points": 100,
                "sample_tests": [{"input": "6", "expected": "6\n4\n2"}],
                "hidden_tests": [
                    {"input": "2", "expected": "2"},
                    {"input": "10", "expected": "10\n8\n6\n4\n2"},
                ],
            },
        ],
    },
    {
        "position": 24,
        "band": "legend",
        "difficulty": "legend",
        "title": "Number Theory",
        "description": "Primes, factors and divisibility.",
        "challenges": [
            {
                "position": 0,
                "title": "Prime Factors",
                "statement": (
                    "Read an integer n and print all its prime factors, each on its\n"
                    "own line (allow repeats)."
                ),
                "input_format": "One integer n.",
                "output_format": "Prime factors, one per line.",
                "starter_code": "n = int(input())\nd = 2\nwhile d * d <= n:\n    while n % d == 0:\n        print(d)\n        n //= d\n    d += 1\nif n > 1:\n    print(n)\n",
                "points": 110,
                "sample_tests": [{"input": "12", "expected": "2\n2\n3"}],
                "hidden_tests": [
                    {"input": "7", "expected": "7"},
                    {"input": "36", "expected": "2\n2\n3\n3"},
                    {"input": "1", "expected": ""},
                ],
            },
            {
                "position": 1,
                "title": "Sum of Divisors",
                "statement": (
                    "Read an integer n and print the sum of all its POSITIVE\n"
                    "divisors (including 1 and n)."
                ),
                "input_format": "One integer n.",
                "output_format": "The divisor sum.",
                "starter_code": "n = int(input())\nprint(sum(d for d in range(1, n + 1) if n % d == 0))\n",
                "points": 110,
                "sample_tests": [{"input": "6", "expected": "12"}],
                "hidden_tests": [
                    {"input": "1", "expected": "1"},
                    {"input": "28", "expected": "56"},
                    {"input": "10", "expected": "18"},
                ],
            },
        ],
    },
    {
        "position": 25,
        "band": "mythic",
        "difficulty": "mythic",
        "title": "Greedy Algorithms",
        "description": "Make the locally best choice.",
        "challenges": [
            {
                "position": 0,
                "title": "Coin Change Greedy",
                "statement": (
                    "Read two lines: coin denominations (descending) and target amount.\n"
                    "Print the minimum number of coins to make the amount using a\n"
                    "greedy approach, or -1 if impossible."
                ),
                "input_format": "Line 1: denominations space separated. Line 2: amount.",
                "output_format": "Minimum coin count, or -1.",
                "starter_code": "coins = list(map(int, input().split()))\namount = int(input())\ncount = 0\nfor c in coins:\n    count += amount // c\n    amount %= c\nprint(count if amount == 0 else -1)\n",
                "points": 120,
                "sample_tests": [{"input": "25 10 5 1\n47", "expected": "5"}],
                "hidden_tests": [
                    {"input": "10 5 1\n0", "expected": "0"},
                    {"input": "25 10 5 1\n30", "expected": "2"},
                    {"input": "5 2\n3", "expected": "-1"},
                ],
            },
            {
                "position": 1,
                "title": "Max Meetings",
                "statement": (
                    "First line: n. Next n lines: start end (integers).\n"
                    "Print the maximum number of meetings that can be attended without\n"
                    "overlapping, choosing greedily by end time."
                ),
                "input_format": "n, then n lines of start end.",
                "output_format": "The maximum count.",
                "starter_code": "n = int(input())\nmeets = [tuple(map(int, input().split())) for _ in range(n)]\nmeets.sort(key=lambda x: x[1])\ncount = last_end = 0\nfor s, e in meets:\n    if s >= last_end:\n        count += 1\n        last_end = e\nprint(count)\n",
                "points": 120,
                "sample_tests": [{"input": "3\n0 5\n5 10\n1 6", "expected": "2"}],
                "hidden_tests": [
                    {"input": "4\n1 2\n2 3\n3 4\n1 4", "expected": "3"},
                    {"input": "2\n0 10\n1 2", "expected": "1"},
                ],
            },
        ],
    },
    {
        "position": 26,
        "band": "mythic",
        "difficulty": "mythic",
        "title": "Graph Traversal",
        "description": "DFS and BFS on small graphs.",
        "challenges": [
            {
                "position": 0,
                "title": "Reachable Nodes",
                "statement": (
                    "First line: n m (nodes, edges). Next m lines: u v (edges).\n"
                    "Print the number of nodes reachable from node 1 (including itself),\n"
                    "using DFS."
                ),
                "input_format": "n m, then m lines of u v.",
                "output_format": "Reachable count.",
                "starter_code": "n, m = map(int, input().split())\ng = [[] for _ in range(n + 1)]\nfor _ in range(m):\n    u, v = map(int, input().split())\n    g[u].append(v)\n    g[v].append(u)\nseen = set()\nstack = [1]\nwhile stack:\n    x = stack.pop()\n    if x in seen:\n        continue\n    seen.add(x)\n    stack.extend(g[x])\nprint(len(seen))\n",
                "points": 130,
                "sample_tests": [{"input": "5 3\n1 2\n2 3\n4 5", "expected": "3"}],
                "hidden_tests": [
                    {"input": "2 1\n1 2", "expected": "2"},
                    {"input": "3 0", "expected": "1"},
                    {"input": "6 5\n1 2\n2 3\n3 1\n4 5\n5 6", "expected": "3"},
                ],
            },
            {
                "position": 1,
                "title": "Shortest Hops (BFS)",
                "statement": (
                    "First line: n m. Next m lines: u v (undirected edges).\n"
                    "Print the minimum number of edges (hops) to reach node n from node 1,\n"
                    "or -1 if unreachable. Use BFS."
                ),
                "input_format": "n m, then m lines of u v.",
                "output_format": "Hop count, or -1.",
                "starter_code": "from collections import deque\nn, m = map(int, input().split())\ng = [[] for _ in range(n + 1)]\nfor _ in range(m):\n    u, v = map(int, input().split())\n    g[u].append(v)\n    g[v].append(u)\ndist = [-1] * (n + 1)\ndist[1] = 0\nq = deque([1])\nwhile q:\n    x = q.popleft()\n    for y in g[x]:\n        if dist[y] == -1:\n            dist[y] = dist[x] + 1\n            q.append(y)\nprint(dist[n])\n",
                "points": 130,
                "sample_tests": [{"input": "4 4\n1 2\n2 3\n3 4\n1 4", "expected": "1"}],
                "hidden_tests": [
                    {"input": "3 2\n1 2\n2 3", "expected": "2"},
                    {"input": "4 2\n1 2\n3 4", "expected": "-1"},
                ],
            },
        ],
    },
    {
        "position": 27,
        "band": "mythic",
        "difficulty": "mythic",
        "title": "Dynamic Programming I",
        "description": "Solve by combining subproblems.",
        "challenges": [
            {
                "position": 0,
                "title": "Climbing Stairs",
                "statement": (
                    "Read n (1..40). You climb stairs taking 1 or 2 steps at a time.\n"
                    "Print the number of distinct ways to reach the top."
                ),
                "input_format": "One integer n.",
                "output_format": "The number of ways.",
                "starter_code": "n = int(input())\na, b = 1, 2\nfor _ in range(2, n):\n    a, b = b, a + b\nprint(1 if n == 1 else b)\n",
                "points": 130,
                "sample_tests": [{"input": "3", "expected": "3"}],
                "hidden_tests": [
                    {"input": "1", "expected": "1"},
                    {"input": "2", "expected": "2"},
                    {"input": "5", "expected": "8"},
                ],
            },
            {
                "position": 1,
                "title": "Min Cost Path",
                "statement": (
                    "First line: n. Next n lines: n integers each (cost grid).\n"
                    "Print the minimum cost path from top-left to bottom-right moving\n"
                    "only right or down."
                ),
                "input_format": "n, then an n x n grid.",
                "output_format": "The minimum total cost.",
                "starter_code": "n = int(input())\ngrid = [list(map(int, input().split())) for _ in range(n)]\ndp = [[0] * n for _ in range(n)]\ndp[0][0] = grid[0][0]\nfor i in range(n):\n    for j in range(n):\n        if i == 0 and j == 0:\n            continue\n        best = float('inf')\n        if i > 0:\n            best = min(best, dp[i - 1][j])\n        if j > 0:\n            best = min(best, dp[i][j - 1])\n        dp[i][j] = best + grid[i][j]\nprint(dp[n - 1][n - 1])\n",
                "points": 140,
                "sample_tests": [{"input": "2\n1 2\n3 4", "expected": "7"}],
                "hidden_tests": [
                    {"input": "3\n1 1 1\n1 5 1\n1 1 1", "expected": "5"},
                    {"input": "1\n9", "expected": "9"},
                ],
            },
        ],
    },
    {
        "position": 28,
        "band": "mythic",
        "difficulty": "mythic",
        "title": "Dynamic Programming II",
        "description": "Knapsack and subset problems.",
        "challenges": [
            {
                "position": 0,
                "title": "0/1 Knapsack",
                "statement": (
                    "First line: n capacity. Second line: weights. Third line: values.\n"
                    "Print the maximum total value using items at most once, within\n"
                    "capacity."
                ),
                "input_format": "n cap on line 1, weights on line 2, values on line 3.",
                "output_format": "Maximum value.",
                "starter_code": "n, cap = map(int, input().split())\nw = list(map(int, input().split()))\nv = list(map(int, input().split()))\ndp = [0] * (cap + 1)\nfor wi, vi in zip(w, v):\n    for c in range(cap, wi - 1, -1):\n        dp[c] = max(dp[c], dp[c - wi] + vi)\nprint(dp[cap])\n",
                "points": 140,
                "sample_tests": [{"input": "3 5\n2 3 4\n3 4 5", "expected": "7"}],
                "hidden_tests": [
                    {"input": "3 3\n1 2 3\n10 20 30", "expected": "30"},
                    {"input": "2 1\n2 2\n5 5", "expected": "0"},
                ],
            },
            {
                "position": 1,
                "title": "Subset Sum",
                "statement": (
                    "First line: n target. Second line: n integers.\n"
                    "Print 'yes' if some subset sums exactly to target, else 'no'."
                ),
                "input_format": "n target on line 1, then n ints on line 2.",
                "output_format": "'yes' or 'no'.",
                "starter_code": "n, t = map(int, input().split())\nnums = list(map(int, input().split()))\ndp = [False] * (t + 1)\ndp[0] = True\nfor x in nums:\n    for s in range(t, x - 1, -1):\n        dp[s] = dp[s] or dp[s - x]\nprint('yes' if dp[t] else 'no')\n",
                "points": 140,
                "sample_tests": [{"input": "4 9\n2 3 4 5", "expected": "yes"}],
                "hidden_tests": [
                    {"input": "3 7\n2 4 6", "expected": "no"},
                    {"input": "5 0\n1 2 3 4 5", "expected": "yes"},
                ],
            },
        ],
    },
    {
        "position": 29,
        "band": "mythic",
        "difficulty": "mythic",
        "title": "Advanced String Tricks",
        "description": "Palindrome and pattern tricks.",
        "challenges": [
            {
                "position": 0,
                "title": "Longest Palindromic Substring",
                "statement": (
                    "Read one line. Print the longest palindromic substring; if there\n"
                    "is a tie, print the one appearing first."
                ),
                "input_format": "One line of characters.",
                "output_format": "The longest palindrome.",
                "starter_code": "s = input().strip()\nbest = ''\nfor i in range(len(s)):\n    for j in range(i, len(s) + 1):\n        t = s[i:j]\n        if len(t) > len(best) and t == t[::-1]:\n            best = t\nprint(best)\n",
                "points": 140,
                "sample_tests": [{"input": "babad", "expected": "bab"}],
                "hidden_tests": [
                    {"input": "cbbd", "expected": "bb"},
                    {"input": "a", "expected": "a"},
                    {"input": "racecarx", "expected": "racecar"},
                ],
            },
            {
                "position": 1,
                "title": "Anagram Pairs Count",
                "statement": (
                    "Read a string s. Count how many pairs of indices (i,j) with i<j\n"
                    "have substrings s[i:j+1]... Actually count unordered pairs of\n"
                    "NON-EMPTY substrings that are anagrams of each other."
                ),
                "input_format": "One line.",
                "output_format": "The count of anagram substring pairs.",
                "starter_code": "from collections import Counter\ns = input().strip()\nn = len(s)\ncnt = Counter()\nfor i in range(n):\n    for j in range(i, n):\n        cnt[''.join(sorted(s[i:j + 1]))] += 1\nprint(sum(v * (v - 1) // 2 for v in cnt.values()))\n",
                "points": 150,
                "sample_tests": [{"input": "abba", "expected": "4"}],
                "hidden_tests": [
                    {"input": "abcd", "expected": "0"},
                    {"input": "a", "expected": "0"},
                    {"input": "aa", "expected": "1"},
                ],
            },
        ],
    },
    {
        "position": 30,
        "band": "mythic",
        "difficulty": "mythic",
        "title": "Grand Finale",
        "description": "Mixed one-liners and caps.",
        "challenges": [
            {
                "position": 0,
                "title": "FizzBuzz Deluxe",
                "statement": (
                    "Read n. For 1..n print 'Fizz' if divisible by 3, 'Buzz' if by 5,\n"
                    "'FizzBuzz' if both, else the number. One per line."
                ),
                "input_format": "One integer n.",
                "output_format": "n lines of Fizz/Buzz/number.",
                "starter_code": "n = int(input())\nfor i in range(1, n + 1):\n    out = ''\n    if i % 3 == 0:\n        out += 'Fizz'\n    if i % 5 == 0:\n        out += 'Buzz'\n    print(out or i)\n",
                "points": 150,
                "sample_tests": [{"input": "5", "expected": "1\n2\nFizz\n4\nBuzz"}],
                "hidden_tests": [
                    {"input": "1", "expected": "1"},
                    {"input": "15", "expected": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"},
                ],
            },
            {
                "position": 1,
                "title": "Matrix Spiral",
                "statement": (
                    "First line: n m. Next n lines: m integers each.\n"
                    "Print the matrix in spiral order, space separated."
                ),
                "input_format": "n m, then an n x m grid.",
                "output_format": "Spiral order integers.",
                "starter_code": "n, m = map(int, input().split())\ngrid = [list(map(int, input().split())) for _ in range(n)]\nres = []\ntop, bottom, left, right = 0, n - 1, 0, m - 1\nwhile top <= bottom and left <= right:\n    res.extend(grid[top][left:right + 1])\n    top += 1\n    for r in range(top, bottom + 1):\n        res.append(grid[r][right])\n    right -= 1\n    if top <= bottom:\n        res.extend(grid[bottom][left:right + 1][::-1])\n        bottom -= 1\n    if left <= right:\n        for r in range(bottom, top - 1, -1):\n            res.append(grid[r][left])\n        left += 1\nprint(' '.join(map(str, res)))\n",
                "points": 160,
                "sample_tests": [{"input": "3 3\n1 2 3\n4 5 6\n7 8 9", "expected": "1 2 3 6 9 8 7 4 5"}],
                "hidden_tests": [
                    {"input": "1 4\n1 2 3 4", "expected": "1 2 3 4"},
                    {"input": "4 1\n1\n2\n3\n4", "expected": "1 2 3 4"},
                    {"input": "2 2\n1 2\n3 4", "expected": "1 2 4 3"},
                ],
            },
        ],
    },
]


def seed() -> None:
    for level_data in CURRICULUM:
        upsert_level(level_data)
        for ch in level_data["challenges"]:
            upsert_challenge(level_data["position"], ch)