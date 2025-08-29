from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class ReportCreate(BaseModel):
    employee_id: int
    date: date
    weekday: str
    last_checkin: Optional[datetime]
    last_checkout: Optional[datetime]
    total_hours_today: float

class ReportResponse(ReportCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
