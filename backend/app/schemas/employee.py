from pydantic import BaseModel
from typing import Optional


class EmployeeBase(BaseModel):
    name: str
    email: Optional[str]
    role: Optional[str]


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeOut(EmployeeBase):
    id: int


class Config:
    orm_mode = True