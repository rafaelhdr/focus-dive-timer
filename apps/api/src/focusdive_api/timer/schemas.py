from __future__ import annotations

from typing import Literal, TypedDict

TimerMode = Literal["focus", "break"]


class TimerState(TypedDict):
    isRunning: bool
    endsAt: int | None
    mode: TimerMode
    remainingTime: int | None


DEFAULT_TIMER: TimerState = {
    "isRunning": False,
    "endsAt": None,
    "mode": "focus",
    "remainingTime": None,
}
