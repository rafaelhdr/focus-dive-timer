from fastapi import Depends, HTTPException
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
        raise HTTPException(status_code=401, detail="Invalid token")

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=401, detail="Invalid token")

    return str(subject)
