# app/models/reports.py
from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(Date, nullable=False)
    weekday = Column(String(10), nullable=False)
    last_checkin = Column(DateTime(timezone=False), nullable=True)  # Explicitly timezone-naive
    last_checkout = Column(DateTime(timezone=False), nullable=True)  # Explicitly timezone-naive
    total_hours_today = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=False), default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at = Column(DateTime(timezone=False), default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    employee = relationship("Employee", back_populates="reports")