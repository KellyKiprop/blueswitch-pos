from fastapi import FastAPI
from app.routers import products

app = FastAPI(title="Blueswitch POS API")

app.include_router(products.router)

@app.get("/")
def root():
    return {"status": "ok", "service": "blueswitch-pos-api"}
