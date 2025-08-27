from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: int | None = None) -> str:
to_encode = data.copy()
expire = datetime.utcnow() + timedelta(minutes=(expires_delta or settings.ACCESS_TOKEN_EXPIRE_MINUTES))
to_encode.update({"exp": expire})
encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
return encoded_jwt




def decode_token(token: str) -> dict:
return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])