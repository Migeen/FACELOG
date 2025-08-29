
from sqlalchemy import Column, Integer, String
from app.core.database import Base  # Assume Base from database.py

class DepartmentDB(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)