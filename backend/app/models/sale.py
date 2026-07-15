from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Sale(Base):
    __tablename__ = "sales"
    __table_args__ = {"schema": "pos"}

    id = Column(Integer, primary_key=True)
    sale_type = Column(String, nullable=False)  # "till" or "order"
    status = Column(String, nullable=False, default="open")  
    # open -> paid -> completed  (till)
    # open -> deposit_paid -> procuring -> ready -> completed  (order)

    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)

    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    amount_paid = Column(Numeric(10, 2), nullable=False, default=0)

    cashier_name = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    items = relationship("SaleItem", back_populates="sale")
    payments = relationship("Payment", back_populates="sale")
