<<<<<<< HEAD
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
=======
from sqlalchemy import Column, Integer, String, DateTime
>>>>>>> e5459df6b595e09a610cca8c546843802ffa2ea1
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
    position = Column(String, nullable=True)
    status = Column(String, default="active")
    password = Column(String, nullable=True)
    checkin = Column(String, nullable=True)
    checkout = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    salary = Column(String, nullable=True)
<<<<<<< HEAD
=======
<<<<<<< HEAD
    hire_date = Column(DateTime, default=datetime.utcnow)

    department_id = Column(Integer, ForeignKey("departments.id"))  
    department = relationship("Department", back_populates="employees")
=======
<<<<<<< HEAD
    hire_date = Column(DateTime, default=datetime.utcnow)
=======
>>>>>>> 91bddce016bbdb332e016d3e527117971c22bd89
    department = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="employee")
<<<<<<< HEAD
=======
>>>>>>> parent of 621dd61 (done)
>>>>>>> e5459df6b595e09a610cca8c546843802ffa2ea1
>>>>>>> 91bddce016bbdb332e016d3e527117971c22bd89
