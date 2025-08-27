from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginIn, Token
from app.core.security import create_access_token


router = APIRouter()


@router.post('/login', response_model=Token)
def login(payload: LoginIn):
# placeholder: accept anything
    if not payload.username or not payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    token = create_access_token({"sub": payload.username})
    return {"access_token": token, "token_type": "bearer"}