from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=True, unique=True)
<<<<<<< HEAD
=======
    password = Column(String, nullable=True)
    role = Column(String, nullable=True)
>>>>>>> parent of 621dd61 (done)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=True)
    position = Column(String, nullable=True)
    status = Column(String, default="active")
    password = Column(String, nullable=True)
    checkin = Column(String, nullable=True)
    checkout = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    salary = Column(String, nullable=True)
<<<<<<< HEAD
    hire_date = Column(DateTime, default=datetime.utcnow)
=======
    department = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="employee")
>>>>>>> parent of 621dd61 (done)
