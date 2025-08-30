# app/api/endpoints/employees.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.employee import EmployeeCreate, EmployeeOut
from app.models.employee import Employee
from app.core.database import get_db

router = APIRouter()

@router.post('/', response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    """
    Create a new employee in the database
    """
    # Check if employee with email already exists
    if payload.email:
        existing_employee = db.query(Employee).filter(Employee.email == payload.email).first()
        if existing_employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee with this email already exists"
            )
    
    # Check if employee with ID already exists
    existing_employee_by_id = db.query(Employee).filter(Employee.id == payload.id).first()
    if existing_employee_by_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this ID already exists"
        )
    
    try:
        # Create new employee instance
        db_employee = Employee(
            # id=payload.id,
            name=payload.name,
            email=payload.email,
            password=payload.password,
            position=payload.position,
            phone=payload.phone,
            salary=payload.salary,
            department=payload.department,
            status=payload.status,
            checkin=payload.checkin,
            checkout=payload.checkout
        )
        
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
        
        return db_employee
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating employee: {str(e)}"
        )

@router.get('/', response_model=List[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    """
    Get all employees from the database
    """
    try:
        employees = db.query(Employee).all()
        return employees
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving employees: {str(e)}"
        )

@router.get('/{employee_id}', response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """
    Get a specific employee by ID
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return employee

@router.put('/{employee_id}', response_model=EmployeeOut)
def update_employee(employee_id: int, payload: EmployeeCreate, db: Session = Depends(get_db)):
    """
    Update an existing employee
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    try:
        # Update employee fields
        for field, value in payload.dict().items():
            if value is not None:
                setattr(employee, field, value)
        
        db.commit()
        db.refresh(employee)
        return employee
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating employee: {str(e)}"
        )

@router.delete('/{employee_id}')
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """
    Delete an employee
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    try:
        db.delete(employee)
        db.commit()
        return {"message": "Employee deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting employee: {str(e)}"
        )