from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.employee import Employee
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from sqlalchemy import text

router = APIRouter()


@router.post("/validate")
async def validate_employee(payload: dict, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Validate employee
        query = text("""
            SELECT id 
            FROM employees 
            WHERE email = :email AND password = :password
        """)
        result = await db.execute(query, {
            "email": payload["email"], 
            "password": payload["password"]
        })
        employee = result.first()

        if not employee:
            return {"status": "error", "message": "Invalid email or password"}

        employee_id = employee[0]

        # 2. Check if embedding exists for this employee
        embedding_query = text("""
            SELECT id 
            FROM embeddings 
            WHERE employee_id = :employee_id
            LIMIT 1
        """)
        embedding_result = await db.execute(embedding_query, {"employee_id": employee_id})
        has_embedding = embedding_result.first() is not None

        # 3. Return response with embedding info
        return {
            "status": "success",
            "employee_id": employee_id,
            "has_embedding": has_embedding
        }

    except Exception as e:
        print("DB Error:", str(e))
        raise HTTPException(status_code=500, detail="Database error")