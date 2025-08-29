from pydantic import BaseModel
from typing import Optional


class EmployeeBase(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: Optional[str]
    password: Optional[str]
    position: Optional[str]
    phone: Optional[str] = None
    salary: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    checkin: Optional[str] = None
    checkout: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    id: int
    first_name: str
    last_name: str
    email: Optional[str]
    password: Optional[str]
    position: Optional[str]
    phone: Optional[str] = None 
    salary: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    checkin: Optional[str] = None
    checkout: Optional[str] = None

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