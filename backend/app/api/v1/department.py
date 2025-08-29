from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.department import DepartmentDB
from app.schemas.department import DepartmentCreate, Department

router = APIRouter()

# Create Department
@router.post("/", response_model=Department, status_code=status.HTTP_201_CREATED)
async def create_department(
    department: DepartmentCreate,
    db: AsyncSession = Depends(get_db)
):
    new_department = DepartmentDB(**department.dict())
    db.add(new_department)
    try:
        await db.commit()
        await db.refresh(new_department)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating department: {str(e)}"
        )
    return new_department


# Get all Departments
@router.get("/", response_model=List[Department])
async def get_departments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DepartmentDB))
    return result.scalars().all()


# Get Department by ID
@router.get("/{department_id}", response_model=Department)
async def get_department(department_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DepartmentDB).where(DepartmentDB.id == department_id))
    department = result.scalar_one_or_none()
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return department


# Delete Department
@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(department_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DepartmentDB).where(DepartmentDB.id == department_id))
    department = result.scalar_one_or_none()
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    await db.delete(department)
    await db.commit()
    return None


# Update Department
# @router.put("/{department_id}", response_model=Department)
# async def update_department(department_id: int, update: DepartmentCreate, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(DepartmentDB).where(DepartmentDB.id == department_id))
#     department = result.scalar_one_or_none()
#     if not department:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

#     department.name = update.name
#     await db.commit()
#     await db.refresh(department)
#     return department
