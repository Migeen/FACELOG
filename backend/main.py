from fastapi import FastAPI
from app.api.v1 import router as api_v1_router
from app.core.database import init_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FaceLog Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(api_v1_router, prefix="/api/v1")

@app.get('/')
def root():
    return {"message": "FaceLog Backend is running"}