from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "facelog"
    
    # PostgreSQL connection string for asyncpg
    DATABASE_URL: str = "postgresql+asyncpg://facelog:facelog@localhost:5432/facelog"
    
    SECRET_KEY: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # pgvector specific options if needed
    VECTOR_DIMENSION: int = 512  # embedding vector size

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"  # Optional: specifies encoding for .env file
    }

settings = Settings()