from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.face_service import match_face
from app.schemas.verify import VerifyResponse


router = APIRouter()


@router.post('/face', response_model=VerifyResponse)
async def verify(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail='Empty file')
    res = await match_face(content)
    return {"verified": res.get('verified', False), "score": res.get('score', 0.0), "filename": file.filename}

