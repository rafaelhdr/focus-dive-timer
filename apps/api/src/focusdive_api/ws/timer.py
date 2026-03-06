import asyncio
import json
import logging

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from focusdive_api.core.auth import get_current_subject_ws
from focusdive_api.timer.schemas import DEFAULT_TIMER, TimerState
from focusdive_api.users.repo import UserRepo, get_user_repo

from .connections import manager
from .timer_service import load_timer, on_trigger, persist_timer

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/timer")
async def ws_timer(
    ws: WebSocket,
    subject: str = Depends(get_current_subject_ws),
    repo: UserRepo = Depends(get_user_repo),
):
    user = await repo.get_user(subject)
    room = user.email if user else f"guest:{id(ws)}"
    await manager.connect(ws, room)
    logger.info(f"WS connected to room {room}")

    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)

            event = msg.get("event")
            data: TimerState = msg.get("data") or DEFAULT_TIMER

            if event == "get_timer":
                timer_state = await load_timer(user)
                await ws.send_json({"event": "timer_state", "data": timer_state})
                continue

            if event == "timer_data":
                logger.info(f"Received timer update from {room}: {data}")
                timer: TimerState = {
                    "isRunning": data.get("isRunning"),
                    "endsAt": data.get("endsAt"),
                    "mode": data.get("mode"),
                    "remainingTime": data.get("remainingTime"),
                }

                await persist_timer(repo, user, timer)
                await manager.broadcast(room, "timer_updated", timer)

                mode = timer["mode"]
                if user and mode in ("focus", "break"):
                    asyncio.create_task(
                        on_trigger(
                            user=user,
                            ends_at=timer["endsAt"],
                            mode=mode,
                        )
                    )
                continue

            logger.warning(f"Unknown event received: {event}")
            await ws.send_json({"event": "error", "data": {"message": "unknown_event"}})

    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(ws, room)
