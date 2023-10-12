from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
from chainflow_pycamunda.user import User
from pydantic import ValidationError, BaseModel

from chainflow_api.config import config
from chainflow_api.utils.logger import get_logger

ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days
ALGORITHM = "HS256"

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = get_logger(__name__)


def get_hashed_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)


def create_access_token(user: User, password: str, expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expires_delta, "username": user.id_, "password": password,
                 "first_name": user.first_name, "last_name": user.last_name,
                 "email": user.email, "display_name": user.display_name
                 }
    encoded_jwt = jwt.encode(to_encode, config.JWT_SECRET_KEY, ALGORITHM)
    return encoded_jwt


def create_refresh_token(username: str, password: str, expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expires_delta, "username": username, "password": password}
    encoded_jwt = jwt.encode(to_encode, config.JWT_REFRESH_SECRET_KEY, ALGORITHM)
    return encoded_jwt


reuseable_oauth = OAuth2PasswordBearer(
    tokenUrl="/login",
    scheme_name="JWT"
)


class SystemUser(BaseModel):
    username: str
    password: str
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    display_name: Optional[str]


class TokenPayload(BaseModel):
    exp: int
    username: str
    password: str
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    display_name: Optional[str]


async def get_current_user(token: str = Depends(reuseable_oauth)) -> SystemUser:
    logger.error(f"Token: {token}")
    try:
        payload = jwt.decode(
            token, config.JWT_SECRET_KEY, algorithms=[ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        logger.error(f"Token data: {token_data}")
        if datetime.fromtimestamp(token_data.exp) < datetime.now():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except(jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return SystemUser(username=token_data.username, password=token_data.password,
                      first_name=token_data.first_name, last_name=token_data.last_name,
                      email=token_data.email, display_name=token_data.display_name)
