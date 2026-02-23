from pydantic import BaseModel
from typing import List, Optional

class RegulationRule(BaseModel):
    rule_id: str
    name: str # e.g. "Anti-Money Laundering Limit"
    description: str # "Flag transactions over $5000"
    parameter: str # "max_amount" or "banned_domain"
    threshold: str # "5000" or ".xyz"
    is_active: bool = True
