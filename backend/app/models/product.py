from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, func
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    __table_args__ = {"schema": "pos"}

    id = Column(Integer, primary_key=True)
    sku = Column(String, unique=True, nullable=True)  # optional for order-based items
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # laptops, CCTV, networking, accessories
    product_type = Column(String, nullable=False)  # "stocked" or "order_based"

    cost_price = Column(Numeric(10, 2), nullable=True)  # may be unknown until procured
    sell_price = Column(Numeric(10, 2), nullable=False)

    stock_qty = Column(Integer, default=0)  # only meaningful for stocked items
    reorder_threshold = Column(Integer, default=5)

    lead_time_days = Column(Integer, nullable=True)  # only for order-based items
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
