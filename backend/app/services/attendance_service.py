from deepface import DeepFace
import numpy as np
from sqlalchemy import select
from app.models.embedding import Embedding
from app.models.attendance import Attendance
from app.core.database import AsyncSessionLocal
from datetime import datetime


async def extract_embedding(image_path: str):
    """Extract face embedding using DeepFace"""
    try:
        embedding = DeepFace.represent(img_path=image_path, model_name="Facenet")[0]["embedding"]
        return np.array(embedding).tolist()
    except Exception as e:
        raise ValueError(f"Face not detected: {e}")


async def mark_attendance(employee_id: int, image_path: str, status: str):
    """Verify face and mark attendance"""

    new_embedding = await extract_embedding(image_path)

    async with AsyncSessionLocal() as session:
        # get stored embeddings for employee
        result = await session.execute(
            select(Embedding).where(Embedding.employee_id == employee_id)
        )
        stored_embeddings = result.scalars().all()

        if not stored_embeddings:
            return {"success": False, "message": "No enrolled face for this employee"}

        # compare with existing embeddings
        for row in stored_embeddings:
            stored_embedding = np.array(row.embedding)
            dist = np.linalg.norm(np.array(new_embedding) - stored_embedding)

            if dist < 0.6:  # threshold for face match
                # mark attendance
                attendance = Attendance(
                    employee_id=employee_id,
                    timestamp=datetime.utcnow(),
                    status=status
                )
                session.add(attendance)
                await session.commit()
                return {"success": True, "message": f"Face verified, {status} marked"}

        return {"success": False, "message": "Face did not match"}
