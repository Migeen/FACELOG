from fastapi import APIRouter, File, HTTPException, UploadFile,status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.schemas.employee import EmployeeCreate, EmployeeOut
from app.core.database import get_db
from app.models.employee import Employee
from app.models.department import DepartmentDB
# from app.services.attendance_service import enroll_embedding

router = APIRouter()

# temporary in-memory store
EMPLOYEES = {}
NEXT_ID = 1

# Create employee
@router.post("/", response_model=EmployeeOut)
async def create_employee(employee: dict, db: AsyncSession = Depends(get_db)):
    data = employee.copy()
    if "department_name" in data:
        result = await db.execute(select(DepartmentDB).where(DepartmentDB.name == data["department_name"]))
        dept = result.scalar_one_or_none()
        if not dept:
            raise HTTPException(400, "Department not found")
        data["department_id"] = dept.id
    new_employee = Employee(**data)
    db.add(new_employee)
    await db.commit()
    await db.refresh(new_employee)
    out = EmployeeOut.from_orm(new_employee)
    if new_employee.department:
        out.department_name = new_employee.department.name
    return out


    
    # Assign department name for output


# Get all employees
@router.get("/", response_model=List[EmployeeOut])
async def get_employees(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee))
    employees = (await result.scalars().all())
    out_list = []
    for emp in employees:
        out = EmployeeOut.from_orm(emp)
        if emp.department:
            out.department_name = emp.department.name
        out_list.append(out)
    return out_list


# Get employee by ID
@router.get("/{employee_id}", response_model=EmployeeOut)
async def get_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    out = EmployeeOut.from_orm(emp)
    if emp.department:
        out.department_name = emp.department.name
    return out


# Delete employee
@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    await db.delete(emp)
    await db.commit()
    return None

# # Create employee
# @router.post("/", response_model=EmployeeOut)
# async def create_employee(employee: EmployeeCreate, db: AsyncSession = Depends(get_db)):
#     new_employee = Employee(**employee.dict())
#     db.add(new_employee)
#     await db.commit()
#     await db.refresh(new_employee)
#     return new_employee

# # Get all employees
# @router.get("/", response_model=list[EmployeeOut])
# async def get_employees(db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(Employee))
#     return result.scalars().all()

# #Get employee by id
# @router.get("/{employee_id}", response_model=EmployeeOut)
# async def get_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(Employee).where(Employee.id == employee_id))
#     employee = result.scalar_one_or_none()
#     if not employee:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
#     return employee

# #Delete employee
# @router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(Employee).where(Employee.id == employee_id))
#     employee = result.scalar_one_or_none()
#     if not employee:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
#     await db.delete(employee)
#     await db.commit()
#     return None
