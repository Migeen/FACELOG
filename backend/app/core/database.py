# Updated backend/app/core/database.py for PostgreSQL + pgvector
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL  # e.g., postgres+asyncpg://user:password@localhost:5432/facelog

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Session maker for async DB sessions
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency to get async session
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

# Initialize DB (create tables)
async def init_db():
    from app.models import employee, attendance, embedding, device  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
