from pydantic import BaseModel
from typing import Optional


class EmployeeBase(BaseModel):
    name: str
    email: Optional[str]
    role: Optional[str]
    phone: Optional[str] = None
    salary: Optional[str] = None
    department: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    password: str

class EmployeeLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token:str

class EmployeeOut(EmployeeBase):
    id: int


class Config:
    orm_mode = True