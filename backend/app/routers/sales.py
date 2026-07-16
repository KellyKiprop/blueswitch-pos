from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.product import Product
from app.models.payment import Payment
from app.schemas.sale import SaleCreate, SaleItemCreate, SaleOut, CheckoutRequest

router = APIRouter(prefix="/sales", tags=["sales"])

@router.post("/", response_model=SaleOut, status_code=201)
def create_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    if payload.sale_type not in ("till", "order"):
        raise HTTPException(status_code=400, detail="sale_type must be 'till' or 'order'")
    sale = Sale(
        sale_type=payload.sale_type,
        status="open",
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        cashier_name=payload.cashier_name,
        total_amount=0,
        amount_paid=0,
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale

@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.post("/{sale_id}/items", response_model=SaleOut)
def add_item(sale_id: int, payload: SaleItemCreate, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.status != "open":
        raise HTTPException(status_code=400, detail=f"Cannot add items to a sale with status '{sale.status}'")

    product = db.query(Product).filter(Product.id == payload.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or inactive")

    # For stocked items, check availability before adding to cart
    if product.product_type == "stocked" and product.stock_qty < payload.quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock for '{product.name}' (available: {product.stock_qty})")

    line_total = product.sell_price * payload.quantity
    item = SaleItem(
        sale_id=sale.id,
        product_id=product.id,
        quantity=payload.quantity,
        unit_price=product.sell_price,
        line_total=line_total,
    )
    db.add(item)

    # Recalculate sale total from all items
    sale.total_amount = sale.total_amount + line_total
    db.commit()
    db.refresh(sale)
    return sale

@router.delete("/{sale_id}/items/{item_id}", response_model=SaleOut)
def remove_item(sale_id: int, item_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.status != "open":
        raise HTTPException(status_code=400, detail=f"Cannot modify a sale with status '{sale.status}'")

    item = db.query(SaleItem).filter(SaleItem.id == item_id, SaleItem.sale_id == sale_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found on this sale")

    sale.total_amount = sale.total_amount - item.line_total
    db.delete(item)
    db.commit()
    db.refresh(sale)
    return sale

@router.post("/{sale_id}/checkout", response_model=SaleOut)
def checkout(sale_id: int, payload: CheckoutRequest, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.status != "open":
        raise HTTPException(status_code=400, detail=f"Sale already has status '{sale.status}'")
    if not sale.items:
        raise HTTPException(status_code=400, detail="Cannot check out an empty sale")

    if payload.method not in ("cash", "mpesa"):
        raise HTTPException(status_code=400, detail="method must be 'cash' or 'mpesa'")

    # Cash is confirmed instantly. M-Pesa starts pending until confirmed
    # (manually by cashier, or automatically via Daraja webhook later).
    payment_status = "confirmed_manual" if payload.method == "cash" else "pending"

    payment = Payment(
        sale_id=sale.id,
        method=payload.method,
        amount=payload.amount,
        status=payment_status,
        mpesa_ref=payload.mpesa_ref,
        mpesa_phone=payload.mpesa_phone,
        confirmed_at=datetime.now(timezone.utc) if payment_status != "pending" else None,
    )
    db.add(payment)

    sale.amount_paid = sale.amount_paid + payload.amount

    # Only mark the sale complete and deduct stock once it's actually paid.
    # Cash: instant. M-Pesa: only when this endpoint is called after manual/auto confirmation.
    if payment_status != "pending" and sale.amount_paid >= sale.total_amount:
        sale.status = "completed"
        for item in sale.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product.product_type == "stocked":
                product.stock_qty = product.stock_qty - item.quantity
    elif payment_status == "pending":
        sale.status = "paid"  # awaiting M-Pesa confirmation

    db.commit()
    db.refresh(sale)
    return sale

@router.post("/{sale_id}/confirm-payment", response_model=SaleOut)
def confirm_payment(sale_id: int, mpesa_ref: str = None, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.status != "paid":
        raise HTTPException(status_code=400, detail=f"No pending payment to confirm (sale status: '{sale.status}')")

    payment = (
        db.query(Payment)
        .filter(Payment.sale_id == sale_id, Payment.status == "pending")
        .order_by(Payment.id.desc())
        .first()
    )
    if not payment:
        raise HTTPException(status_code=400, detail="No pending payment found for this sale")

    payment.status = "confirmed_manual"
    payment.confirmed_at = datetime.now(timezone.utc)
    if mpesa_ref:
        payment.mpesa_ref = mpesa_ref

    sale.status = "completed"
    for item in sale.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product.product_type == "stocked":
            product.stock_qty = product.stock_qty - item.quantity

    db.commit()
    db.refresh(sale)
    return sale

from fastapi.responses import Response
from app.services.receipt import generate_receipt_pdf

@router.get("/{sale_id}/receipt")
def get_receipt(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.status != "completed":
        raise HTTPException(status_code=400, detail="Receipt only available for completed sales")

    pdf_bytes = generate_receipt_pdf(sale, db)
    return Response(content=pdf_bytes, media_type="application/pdf")
