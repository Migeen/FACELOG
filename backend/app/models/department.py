
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base  # Assume Base from database.py

class DepartmentDB(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    employees = relationship("Employee", back_populates="department")