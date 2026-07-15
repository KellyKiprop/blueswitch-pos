from pydantic import BaseModel, ConfigDict
from typing import Optional
from decimal import Decimal
from datetime import datetime

class ProductBase(BaseModel):
    sku: Optional[str] = None
    name: str
    category: str
    product_type: str  # "stocked" or "order_based"
    cost_price: Optional[Decimal] = None
    sell_price: Decimal
    stock_qty: int = 0
    reorder_threshold: int = 5
    lead_time_days: Optional[int] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    product_type: Optional[str] = None
    cost_price: Optional[Decimal] = None
    sell_price: Optional[Decimal] = None
    stock_qty: Optional[int] = None
    reorder_threshold: Optional[int] = None
    lead_time_days: Optional[int] = None
    is_active: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
