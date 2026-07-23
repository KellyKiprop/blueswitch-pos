from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, date as date_type

from app.database import get_db
from app.models.payment import Payment
from app.models.sale import Sale
from app.models.product import Product
from app.services.auth_dependency import require_admin

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    today = datetime.now(timezone.utc).date()

    confirmed_payments = (
        db.query(Payment)
        .filter(Payment.status.in_(["confirmed_manual", "confirmed_auto"]))
        .filter(func.date(Payment.created_at) == today)
        .all()
    )

    cash_total = sum(float(p.amount) for p in confirmed_payments if p.method == "cash")
    mpesa_total = sum(float(p.amount) for p in confirmed_payments if p.method == "mpesa")
    total_revenue = cash_total + mpesa_total

    completed_today = (
        db.query(Sale)
        .filter(Sale.status == "completed")
        .filter(func.date(Sale.created_at) == today)
        .count()
    )

    low_stock = (
        db.query(Product)
        .filter(Product.product_type == "stocked")
        .filter(Product.is_active == True)
        .filter(Product.stock_qty <= Product.reorder_threshold)
        .order_by(Product.stock_qty)
        .all()
    )

    return {
        "date": str(today),
        "total_revenue": total_revenue,
        "cash_total": cash_total,
        "mpesa_total": mpesa_total,
        "completed_sales_count": completed_today,
        "low_stock_products": [
            {"id": p.id, "name": p.name, "stock_qty": p.stock_qty, "reorder_threshold": p.reorder_threshold}
            for p in low_stock
        ],
    }
