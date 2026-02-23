from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class ComplianceEventModel(BaseModel):
    transaction_id: str
    risk_level: str
    detected_fields: List[str]
    remediation_plan: str = "No action needed."
    created_at: datetime = Field(default_factory=datetime.utcnow)
