from fastapi import APIRouter, UploadFile, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.attendance_service import mark_attendance
import shutil, uuid, os

router = APIRouter(tags=["Attendance"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/clockin")
async def clockin(
    employee_id: int = Form(...),
    file: UploadFile = None,
    db: AsyncSession = Depends(get_db)
):
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.jpg")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = await mark_attendance(employee_id, file_path, "clock-in", db)

    os.remove(file_path)
    return result


@router.post("/clockout")
async def clockout(
    employee_id: int = Form(...),
    file: UploadFile = None,
    db: AsyncSession = Depends(get_db)
):
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.jpg")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = await mark_attendance(employee_id, file_path, "clock-out", db)

    os.remove(file_path)
    return result
