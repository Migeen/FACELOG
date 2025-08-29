
from pydantic import BaseModel

class DepartmentBase(BaseModel):
    name: str

    class Config:
        from_attributes = True  # Previously 'orm_mode'

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int

    class Config:
        from_attributes = True