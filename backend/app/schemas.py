from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Auth ----------
class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class XpPoint(BaseModel):
    xp: int
    ts: datetime


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    xp: int
    current_level: int
    solved_challenges: int = 0
    submission_count: int = 0
    streak: int = 0
    xp_history: list[XpPoint] = []
    rank: int = 0
    coins: int = 0
    completed_levels: dict[str, dict] = {}


# ---------- Challenges ----------
class TestCase(BaseModel):
    input: str = ""
    expected: str = ""


class ChallengeSummary(BaseModel):
    id: int
    title: str
    position: int
    points: int
    solved: bool = False


class LevelOut(BaseModel):
    id: int
    position: int
    title: str
    description: str
    band: str = "beginner"  # beginner | intermediate | advanced
    difficulty: str = "easy"  # easy | medium | hard
    unlocked: bool = False
    solved_count: int = 0
    challenges: list[ChallengeSummary] = []


class ChallengeOut(BaseModel):
    id: int
    title: str
    level_id: int
    position: int
    statement: str
    input_format: str
    output_format: str
    starter_code: str
    points: int
    solved: bool


class CodeRunRequest(BaseModel):
    challenge_id: int
    code: str


class TestResult(BaseModel):
    input: str
    expected: str
    actual: str
    passed: bool


class RunResponse(BaseModel):
    results: list[TestResult]
    all_passed: bool
    runtime_ms: int
    error: Optional[str] = None


class SubmitResponse(BaseModel):
    status: str  # accepted | wrong | error | timeout
    tests_passed: int
    tests_total: int
    runtime_ms: int
    error: Optional[str] = None
    xp_awarded: int = 0
    message: str
    level_completed: bool = False
    level_position: Optional[int] = None
    level_title: Optional[str] = None
    coins: Optional[int] = None


# ---------- Submissions ----------
class SubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    challenge_id: int
    status: str
    runtime_ms: int
    tests_passed: int
    tests_total: int
    created_at: datetime


class ProgressOut(BaseModel):
    total_xp: int
    current_level: int
    levels: list[LevelOut]


# ---------- Leaderboard ----------
class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    xp: int
    solved_challenges: int
    current_level: int


# ---------- Submission history ----------
class SubmissionHistoryRow(BaseModel):
    id: int
    challenge_id: int
    challenge_title: str
    status: str
    runtime_ms: int
    tests_passed: int
    tests_total: int
    created_at: datetime


# ---------- Quiz ----------
class QuizLevelOut(BaseModel):
    level: int
    title: str
    description: str
    total: int
    attempts: int
    attempts_left: int
    best_score: int
    badge: bool
    rank: Optional[int]
    participants: int


class QuizQuestionOut(BaseModel):
    id: int
    question: str
    options: list[str]


class QuizLevelDetailOut(BaseModel):
    level: int
    title: str
    description: str
    total: int
    attempts_left: int
    max_attempts: int
    questions: list[QuizQuestionOut]


class QuizSubmitRequest(BaseModel):
    answers: dict[int, int]


class QuizReviewItem(BaseModel):
    question_id: int
    question: str
    options: list[str]
    selected: Optional[int]
    correct: int


class QuizSubmitResult(BaseModel):
    level: int
    title: str
    score: int
    total: int
    percentage: int
    attempts: int
    attempts_left: int
    badge: bool
    rank: int
    participants: int
    review: list[QuizReviewItem] = []