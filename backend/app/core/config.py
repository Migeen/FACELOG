from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    PROJECT_NAME: str = "facelog"
    DATABASE_URL: str = "postgresql+asyncpg://facelog:facelog@localhost:5432/facelog"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    VECTOR_DIMENSION: int = 512

    model_config = BaseSettings.model_config.copy()
    model_config.update({
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    })


settings = Settings()