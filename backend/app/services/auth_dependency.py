from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth import decode_access_token

security = HTTPBearer()

def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    username = decode_access_token(credentials.credentials)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return username
