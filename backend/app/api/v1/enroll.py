from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.embedding import Embedding
from datetime import datetime
import base64
import numpy as np
from deepface import DeepFace
import asyncio

router = APIRouter()


async def generate_embedding(image_path: str):
    """
    Run DeepFace.represent in a thread to avoid blocking the async loop
    """
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: DeepFace.represent(img_path=image_path, model_name="Facenet")[0]["embedding"])
    return result


@router.post("/")
async def enroll_face(data: dict, db: AsyncSession = Depends(get_db)):    
    employee_id = data.get("employee_id")
    image_base64 = data.get("image_base64")

    if not employee_id:
        raise HTTPException(status_code=400, detail="Employee ID is required")
    if not image_base64:
        raise HTTPException(status_code=400, detail="No image provided")

    # Decode image
    image_bytes = base64.b64decode(image_base64)
    temp_path = "temp.jpg"
    with open(temp_path, "wb") as f:
        f.write(image_bytes)

    # Generate embedding
    try:
        embedding_result = await generate_embedding(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {e}")

    # Store in DB
    db_embedding = Embedding(
        employee_id=employee_id,
        vector=np.array(embedding_result).tolist(),
        created_at=datetime.utcnow()
    )

    try:
        db.add(db_embedding)
        await db.commit()
        await db.refresh(db_embedding)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB error: {e}")

    return {"message": "Face enrolled successfully", "embedding_id": db_embedding.id}
