"""
CodeLadder runner.

Executes a student's Python program against stdin/stdout test cases inside a
hard timeout + memory cap. This is a *process-level* sandbox (subprocess +
resource limits) — fine for classroom/trusted-adjacent users in the MVP.
Production hardening: gVisor/Firecracker microVMs, per-submission containers,
seccomp, read-only FS. See README "Security notes".
"""
import json
import os
import shutil
import signal
import subprocess
import tempfile
import time
import traceback
from dataclasses import dataclass, field
from typing import Any

from app.core.config import settings

try:
    import resource  # POSIX only
except ImportError:  # pragma: no cover - Windows
    resource = None  # type: ignore


@dataclass
class RunOutcome:
    stdout: str = ""
    stderr: str = ""
    status: str = "ok"  # ok | timeout | error
    runtime_ms: int = 0
    error: str | None = None


def _limit_resources(mem_bytes: int):
    """preexec_fn: drop-limits before exec. POSIX only (no-op on Windows)."""

    if resource is None:

        def _noop() -> None:
            return None

        return _noop

    def _apply() -> None:
        resource.setrlimit(resource.RLIMIT_AS, (mem_bytes, mem_bytes))
        resource.setrlimit(resource.RLIMIT_CPU, (int(settings.RUNNER_TIMEOUT_SECONDS) + 1,) * 2)
        resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))

    return _apply


def run_code(code: str, stdin_data: str = "") -> RunOutcome:
    """
    Write `code` to a temp dir and run `python3 main.py` with stdin_data piped
    in. Returns stdout/stderr + verdict. Never raises on student code errors.
    """
    if len(code) > settings.MAX_CODE_LENGTH:
        return RunOutcome(status="error", error="Code too long")

    tmp_dir = tempfile.mkdtemp(prefix="ladder_")
    main_path = os.path.join(tmp_dir, "main.py")
    try:
        with open(main_path, "w", encoding="utf-8") as f:
            f.write(code)

        mem_bytes = settings.RUNNER_MEMORY_MB * 1024 * 1024
        start = time.perf_counter()
        try:
            proc = subprocess.run(
                [sys_executable(), main_path],
                input=stdin_data.encode("utf-8"),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=settings.RUNNER_TIMEOUT_SECONDS,
                preexec_fn=_limit_resources(mem_bytes) if _is_posix() else None,
            )
            runtime_ms = int((time.perf_counter() - start) * 1000)
            return RunOutcome(
                stdout=proc.stdout.decode("utf-8", errors="replace").replace("\r\n", "\n"),
                stderr=proc.stderr.decode("utf-8", errors="replace"),
                runtime_ms=runtime_ms,
            )
        except subprocess.TimeoutExpired:
            return RunOutcome(status="timeout", error="Time limit exceeded")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def sys_executable() -> str:
    return "python3" if _is_posix() else "python"


def _is_posix() -> bool:
    return os.name == "posix"


def grade(challenge_code: str, testcases: list[dict[str, str]]) -> dict[str, Any]:
    """
    Grade `code` against a list of {input, expected}. Runs the program once per
    test case (simple + safe). Returns per-test results and aggregate verdict.
    """
    results = []
    runtime_ms_total = 0
    hard_error: str | None = None
    status = "ok"

    for tc in testcases:
        outcome = run_code(challenge_code, stdin_data=tc.get("input", ""))
        runtime_ms_total += outcome.runtime_ms

        if outcome.status == "timeout":
            status = "timeout"
            hard_error = outcome.error
            results.append(
                {"input": tc.get("input", ""), "expected": tc.get("expected", ""),
                 "actual": "", "passed": False}
            )
            break

        if outcome.status == "error":
            status = "error"
            hard_error = outcome.error
            results.append(
                {"input": tc.get("input", ""), "expected": tc.get("expected", ""),
                 "actual": "", "passed": False}
            )
            break

        actual = outcome.stdout.strip()
        expected = tc.get("expected", "").strip()
        passed = actual == expected
        results.append(
            {"input": tc.get("input", ""), "expected": expected, "actual": actual, "passed": passed}
        )

        if not passed:
            status = "wrong"

    if status == "ok":
        status = "accepted"

    return {
        "status": status,
        "tests_passed": sum(1 for r in results if r["passed"]),
        "tests_total": len(results),
        "runtime_ms": runtime_ms_total,
        "results": results,
        "error": hard_error,
    }