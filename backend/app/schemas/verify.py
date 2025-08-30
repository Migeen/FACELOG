from pydantic import BaseModel
from typing import Any


class VerifyResponse(BaseModel):
    verified: bool
    score: float
    filename: str