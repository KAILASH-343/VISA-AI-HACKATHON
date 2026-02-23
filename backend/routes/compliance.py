from fastapi import APIRouter
from services.compliance_service import check_compliance
from database import db
from models.compliance_event import ComplianceEventModel
from typing import List

router = APIRouter()

@router.post("/compliance/check")
async def trigger_compliance_check():
    """
    Trigger the compliance check logic on all transactions.
    """
    events = await check_compliance()
    return {"message": "Compliance check completed", "events_processed": len(events)}

@router.get("/compliance/events", response_model=List[ComplianceEventModel])
async def get_compliance_events():
    """
    Return all compliance events.
    """
    events = await db.compliance_events.find().sort("created_at", -1).to_list(100)
    return events
