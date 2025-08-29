from fastapi import APIRouter, File, HTTPException, UploadFile,status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.schemas.employee import EmployeeCreate, EmployeeOut
from app.core.database import get_db
from app.models.employee import Employee
# from app.services.attendance_service import enroll_embedding

router = APIRouter()

# temporary in-memory store
EMPLOYEES = {}
NEXT_ID = 1

# Create employee
@router.post("/", response_model=EmployeeOut)
async def create_employee(employee: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    new_employee = Employee(**employee.dict())
    db.add(new_employee)
    await db.commit()
    await db.refresh(new_employee)
    return new_employee

# Get all employees
@router.get("/", response_model=list[EmployeeOut])
async def get_employees(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee))
    return result.scalars().all()

#Get employee by id
@router.get("/{employee_id}", response_model=EmployeeOut)
async def get_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee

#Delete employee
@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    await db.delete(employee)
    await db.commit()
    return None

    #Update employee
# @router.put("/{employee_id}", response_model=EmployeeOut)
# async def update_employee(employee_id: int, update: EmployeeUpdate, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(Employee).where(Employee.id == employee_id))
#     employee = result.scalar_one_or_none()
#     if not employee:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
#     for key, value in update.dict(exclude_unset=True).items():
#         setattr(employee, key, value)
#     await db.commit()
#     await db.refresh(employee)
#     return employee