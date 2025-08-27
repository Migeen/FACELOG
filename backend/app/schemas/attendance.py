from pydantic import BaseModel
from datetime import datetime


class CheckInOut(BaseModel):
    employee_id: int
    type: str