from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base

class Cashier(Base):
    __tablename__ = "cashiers"
    __table_args__ = {"schema": "pos"}

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    hashed_pin = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
