from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"
    __table_args__ = {"schema": "pos"}

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
