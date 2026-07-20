from pydantic import BaseModel

class CashierPublic(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class CashierCreate(BaseModel):
    name: str
    pin: str

class CashierLoginRequest(BaseModel):
    cashier_id: int
    pin: str

class CashierLoginResponse(BaseModel):
    id: int
    name: str
