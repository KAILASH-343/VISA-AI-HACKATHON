from fastapi import APIRouter
from database import db
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter()

class AuditReportModel(BaseModel):
    report_id: str
    generated_at: datetime
    compliance_score: str # Safe/Low/High
    total_alerts: int
    auditor_name: str
    pdf_url: Optional[str] = None 
    events_summary: Optional[List[dict]] = [] # Stores top 50 critical events for the report 

@router.get('/audit/history', response_model=List[AuditReportModel])
async def get_audit_history():
    """
    Fetch the last 20 saved audit reports.
    """
    try:
        cursor = db.audit_reports.find({}).sort("generated_at", -1).limit(20)
        reports = await cursor.to_list(length=20)
        return reports
    except Exception as e:
        # If collection doesn't exist yet or mock db error
        return []

@router.post('/audit/save')
async def save_audit_report(report: AuditReportModel):
    """
    Save a new audit snapshot.
    """
    await db.audit_reports.insert_one(report.dict())
    return {"status": "saved", "id": report.report_id}
