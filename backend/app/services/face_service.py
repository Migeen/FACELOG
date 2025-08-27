from typing import List


async def enroll_embedding(employee_id: int, bytes_image: bytes) -> dict:
# In production: run your embedding model and store vector in pgvector/postgres
# Placeholder: return fake vector length
    return {"employee_id": employee_id, "vector_len": len(bytes_image)}


async def match_face(bytes_image: bytes) -> dict:
# Placeholder matching
    return {"verified": False, "score": 0.0}