from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
def status():
    return {"message": "API v1 is running"}