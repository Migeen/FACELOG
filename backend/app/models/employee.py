from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True, unique=True)
    password = Column(String, nullable=True)
    role = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    salary = Column(String, nullable=True)
    department = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="employee")
