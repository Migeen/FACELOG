from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime


class Attendance(Base):
    __tablename__ = "attendance"


    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"))
    type = Column(String, nullable=False) # checkin / checkout
    timestamp = Column(DateTime, default=datetime.utcnow)