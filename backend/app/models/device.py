from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    serial = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)