from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cashier import Cashier
from app.schemas.cashier import CashierPublic, CashierCreate, CashierLoginRequest, CashierLoginResponse
from app.services.auth import hash_password, verify_password
from app.services.auth_dependency import require_admin

router = APIRouter(prefix="/cashiers", tags=["cashiers"])

@router.get("/", response_model=list[CashierPublic])
def list_cashiers(db: Session = Depends(get_db)):
    # Public on purpose - the till needs this list before anyone is logged in,
    # and it only exposes names, never PINs.
    return db.query(Cashier).filter(Cashier.is_active == True).order_by(Cashier.name).all()

@router.post("/login", response_model=CashierLoginResponse)
def cashier_login(payload: CashierLoginRequest, db: Session = Depends(get_db)):
    cashier = db.query(Cashier).filter(Cashier.id == payload.cashier_id, Cashier.is_active == True).first()
    if not cashier or not verify_password(payload.pin, cashier.hashed_pin):
        raise HTTPException(status_code=401, detail="Incorrect PIN")
    return cashier

@router.post("/", response_model=CashierPublic, status_code=201)
def create_cashier(payload: CashierCreate, db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    if len(payload.pin) < 4:
        raise HTTPException(status_code=400, detail="PIN must be at least 4 digits")
    cashier = Cashier(name=payload.name, hashed_pin=hash_password(payload.pin))
    db.add(cashier)
    db.commit()
    db.refresh(cashier)
    return cashier

@router.delete("/{cashier_id}", status_code=204)
def deactivate_cashier(cashier_id: int, db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    cashier = db.query(Cashier).filter(Cashier.id == cashier_id).first()
    if not cashier:
        raise HTTPException(status_code=404, detail="Cashier not found")
    cashier.is_active = False
    db.commit()
    return None
