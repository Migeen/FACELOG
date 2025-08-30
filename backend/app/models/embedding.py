from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float  # <-- add Float here
from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from app.core.database import Base


class Embedding(Base):
    __tablename__ = "embeddings"


    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"))
    # For Postgres + pgvector you would use VECTOR type; here we use ARRAY(float) as placeholder
    vector = Column(ARRAY(Float))
    created_at = Column(DateTime, default=datetime.utcnow)
