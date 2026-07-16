from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

class SaleCreate(BaseModel):
    sale_type: str  # "till" or "order"
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    cashier_name: Optional[str] = None

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class SaleItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal

    model_config = ConfigDict(from_attributes=True)

class SaleOut(BaseModel):
    id: int
    sale_type: str
    status: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    total_amount: Decimal
    amount_paid: Decimal
    cashier_name: Optional[str]
    created_at: datetime
    items: List[SaleItemOut] = []

    model_config = ConfigDict(from_attributes=True)

class CheckoutRequest(BaseModel):
    method: str  # "cash" or "mpesa"
    amount: Decimal
    mpesa_ref: Optional[str] = None
    mpesa_phone: Optional[str] = None
