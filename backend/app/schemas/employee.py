from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .department import DepartmentBase

class EmployeeBase(BaseModel):
<<<<<<< HEAD
    id: int
    name: str
=======
    first_name: str
    last_name: str
>>>>>>> 91bddce016bbdb332e016d3e527117971c22bd89
    email: Optional[str]
    position: Optional[str]
    hire_date: Optional[datetime] = None
    phone: Optional[str] = None
    salary: Optional[str] = None
    status: Optional[str] = "active"
    checkin: Optional[str] = None
    checkout: Optional[str] = None

class EmployeeCreate(EmployeeBase):
<<<<<<< HEAD
    id: int
    name: str
    email: Optional[str]
    password: Optional[str]
    position: Optional[str]
    phone: Optional[str] = None 
    salary: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    checkin: Optional[str] = None
    checkout: Optional[str] = None
=======
    password: str
    department_id: Optional[int] = None 
>>>>>>> 91bddce016bbdb332e016d3e527117971c22bd89

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