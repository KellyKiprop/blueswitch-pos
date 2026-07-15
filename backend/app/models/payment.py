from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = {"schema": "pos"}

    id = Column(Integer, primary_key=True)
    sale_id = Column(Integer, ForeignKey("pos.sales.id"), nullable=False)

    method = Column(String, nullable=False)  # "cash" or "mpesa"
    amount = Column(Numeric(10, 2), nullable=False)

    status = Column(String, nullable=False, default="pending")
    # pending -> confirmed_auto   (Daraja webhook matched it)
    # pending -> confirmed_manual (cashier marked it, no webhook yet)
    # confirmed_manual -> reconciled  (later matched against Daraja record)

    mpesa_ref = Column(String, nullable=True)  # Safaricom transaction code, once known
    mpesa_phone = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

    sale = relationship("Sale", back_populates="payments")
