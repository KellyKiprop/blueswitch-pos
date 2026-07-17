from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import products, sales, auth

app = FastAPI(title="Blueswitch POS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(sales.router)

@app.get("/")
def root():
    return {"status": "ok", "service": "blueswitch-pos-api"}
