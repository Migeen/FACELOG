from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()

@router.post("/validate")
async def validate_employee(payload: dict, db: AsyncSession = Depends(get_db)):
    try:
        # Use correct SQLAlchemy text() for raw SQL
        from sqlalchemy import text

        query = text("SELECT id FROM employees WHERE email = :email AND password = :password")
        result = await db.execute(query, {"email": payload["email"], "password": payload["password"]})

        employee = result.first()  # async fetch one row
        if not employee:
            return {"status": "error", "message": "Invalid email or password"}

        return {"status": "success", "employee_id": employee[0]}

    except Exception as e:
        print("DB Error:", str(e))
        raise HTTPException(status_code=500, detail="Database error")
