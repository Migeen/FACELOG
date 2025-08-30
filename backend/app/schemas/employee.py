from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .department import DepartmentBase

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str]
    position: Optional[str]
    hire_date: Optional[datetime] = None
    phone: Optional[str] = None
    salary: Optional[str] = None
    status: Optional[str] = "active"
    checkin: Optional[str] = None
    checkout: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    password: str
    department_id: Optional[int] = None 

class EmployeeLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token:str

class EmployeeOut(EmployeeBase):
    id: int
    department_name: Optional[str] = None


class Config:
    orm_mode = True