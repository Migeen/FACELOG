from fastapi import APIRouter, File, HTTPException, UploadFile,status
from typing import List
from app.schemas.employee import EmployeeCreate, EmployeeOut
from app.services.face_service import enroll_embedding


router = APIRouter()


# temporary in-memory store
EMPLOYEES = {}
NEXT_ID = 1


@router.post('/', response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate):
    global NEXT_ID
    emp = payload.dict()
    emp_id = NEXT_ID
    NEXT_ID += 1
    emp_record = {"id": emp_id, **emp}
    EMPLOYEES[emp_id] = emp_record
    return emp_record


@router.get('/', response_model=List[EmployeeOut])
def list_employees():
    return list(EMPLOYEES.values())


@router.post('/{employee_id}/enroll-embedding')
async def enroll(employee_id: int, file: UploadFile = File(...)):
    if employee_id not in EMPLOYEES:
        raise HTTPException(status_code=404, detail='Employee not found')
    content = await file.read()
    res = await enroll_embedding(employee_id, content)
    return {"employee_id": employee_id, "filename": file.filename, **res}