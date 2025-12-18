from fastapi import APIRouter
from app.api.v1.endpoints import scans, reports, network

api_router = APIRouter()

# We will implement these endpoints next
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(network.router, prefix="/network", tags=["network"])

@api_router.get("/")
def root():
    return {"message": "API is running"}
