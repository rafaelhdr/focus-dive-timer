import asyncio
import logging
from typing import Any, Dict, Set

from fastapi import WebSocket
from starlette.websockets import WebSocketState

logger = logging.getLogger(__name__)


class TimerConnections:
    def __init__(self) -> None:
        self._by_room: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket, room: str) -> None:
        await ws.accept()
        async with self._lock:
            self._by_room.setdefault(room, set()).add(ws)

    async def disconnect(self, ws: WebSocket, room: str) -> None:
        async with self._lock:
            conns = self._by_room.get(room)
            if not conns:
                return
            conns.discard(ws)
            if not conns:
                self._by_room.pop(room, None)

    async def broadcast(self, room: str, event: str, payload: Any) -> None:
        msg = {"event": event, "data": payload}
        async with self._lock:
            conns = list(self._by_room.get(room, set()))
        dead: list[WebSocket] = []
        for ws in conns:
            try:
                if ws.application_state == WebSocketState.CONNECTED:
                    await ws.send_json(msg)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                room_conns = self._by_room.get(room, set())
                for ws in dead:
                    room_conns.discard(ws)


manager = TimerConnections()
