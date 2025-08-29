import os, asyncio, numpy as np
from deepface import DeepFace
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.embedding import Embedding
from app.models.attendance import Attendance
from fastapi import HTTPException
from datetime import datetime

async def generate_embedding(image_path: str):
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: DeepFace.represent(img_path=image_path, model_name="Facenet")[0]["embedding"]
    )
    embedding = np.array(result)
    embedding = embedding / np.linalg.norm(embedding)
    return embedding.tolist()

def cosine_similarity(vec1, vec2):
    v1, v2 = np.array(vec1), np.array(vec2)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

async def mark_attendance(employee_id: int, image_path: str, status: str, db: AsyncSession):
    if not employee_id:
        raise HTTPException(status_code=400, detail="Employee ID is required")

    # Generate embedding
    new_embedding = await generate_embedding(image_path)

    # Get stored embeddings
    result = await db.execute(select(Embedding).where(Embedding.employee_id == employee_id))
    embeddings = result.scalars().all()

    if not embeddings:
        raise HTTPException(status_code=404, detail="No enrolled face found for this employee")

    # Compare embeddings
    threshold = 0.7
    recognized = False
    similarity_score = 0.0

    for emb in embeddings:
        similarity = cosine_similarity(new_embedding, emb.vector)
        if similarity >= threshold:
            recognized = True
            similarity_score = float(similarity)
            break

    if not recognized:
        raise HTTPException(status_code=401, detail="Face not recognized ❌")

    # Save attendance log
    attendance = Attendance(
        employee_id=employee_id,
        type=status,
        timestamp=datetime.utcnow()
    )
    db.add(attendance)
    await db.commit()
    await db.refresh(attendance)

    return {
        "message": f"{status.capitalize()} successful ✅",
        "employee_id": employee_id,
        "status": status,
        "similarity": similarity_score,
        "timestamp": attendance.timestamp
    }
