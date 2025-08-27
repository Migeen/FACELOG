from fastapi import APIRouter, HTTPException
from app.schemas.attendance import CheckInOut
from app.services.attendance_service import record_attendance


router = APIRouter()


@router.post('/check')
async def check(payload: CheckInOut):
    if payload.type not in ("checkin", "checkout"):
        raise HTTPException(status_code=400, detail="type must be 'checkin' or 'checkout'")
    rec = await record_attendance(payload.employee_id, payload.type)
    return {"status": "ok", "record": rec}


@router.get('/reports/{employee_id}')
async def report(employee_id: int):
# placeholder: return empty list
    return {"employee_id": employee_id, "records": []}