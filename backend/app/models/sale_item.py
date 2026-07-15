from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SaleItem(Base):
    __tablename__ = "sale_items"
    __table_args__ = {"schema": "pos"}

    id = Column(Integer, primary_key=True)
    sale_id = Column(Integer, ForeignKey("pos.sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("pos.products.id"), nullable=False)

    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)  # snapshot at time of sale
    line_total = Column(Numeric(10, 2), nullable=False)

    sale = relationship("Sale", back_populates="items")
