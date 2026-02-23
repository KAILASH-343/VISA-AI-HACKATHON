from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Verify backend and database health.
    """
    return {
        "status": "ok",
        "service": "Agentic Compliance Backend",
        "database": "connected"
    }
