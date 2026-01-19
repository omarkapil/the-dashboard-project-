from fastapi import APIRouter
from app.api.v1.endpoints import scans, reports, network, targets, vulnerabilities

api_router = APIRouter()

# Core PentesterFlow endpoints
api_router.include_router(targets.router, prefix="/targets", tags=["targets"])
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(vulnerabilities.router, prefix="/vulnerabilities", tags=["vulnerabilities"])

# Legacy endpoints
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(network.router, prefix="/network", tags=["network"])

@api_router.get("/")
def root():
    return {"message": "PentesterFlow API is running", "version": "2.0"}
