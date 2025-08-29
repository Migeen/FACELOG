from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=True, unique=True)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=True)
    position = Column(String, nullable=True)
    status = Column(String, default="active")
    password = Column(String, nullable=True)
    checkin = Column(String, nullable=True)
    checkout = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    salary = Column(String, nullable=True)
    hire_date = Column(DateTime, default=datetime.utcnow)