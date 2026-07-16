from fastapi import FastAPI
from app.routers import products, sales

app = FastAPI(title="Blueswitch POS API")

app.include_router(products.router)
app.include_router(sales.router)

@app.get("/")
def root():
    return {"status": "ok", "service": "blueswitch-pos-api"}
