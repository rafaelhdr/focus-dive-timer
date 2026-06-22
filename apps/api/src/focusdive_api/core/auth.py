from fastapi import Depends, HTTPException, WebSocket
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from focusdive_api.core.jwt import TokenService, get_token_service

bearer = HTTPBearer(auto_error=True)


async def get_current_subject(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    tokens: TokenService = Depends(get_token_service),
) -> str:
    token = creds.credentials

    try:
        payload = tokens.decode_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token") from None

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=401, detail="Invalid token")

    return str(subject)


async def get_current_subject_ws(
    websocket: WebSocket,
    tokens: TokenService = Depends(get_token_service),
) -> str:
    token = websocket.query_params.get("token")

    if not token:
        auth = websocket.headers.get("authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1]

    if not token:
        await websocket.close(code=4401)
        raise RuntimeError("Missing token")

    try:
        payload = tokens.decode_token(token)
        subject = payload.get("sub")
        if not subject:
            await websocket.close(code=4401)
            raise RuntimeError("Missing sub")
        return subject
    except Exception:
        await websocket.close(code=4401)
        raise
