from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from models.regulation import RegulationRule
from services.regulation_service import get_active_rules, parse_natural_language_policy, add_rule

router = APIRouter()

class PolicyRequest(BaseModel):
    text: str

@router.get("/regulations", response_model=List[RegulationRule])
async def get_regulations():
    """
    Get all active compliance rules currently known by the agent.
    """
    return get_active_rules()

@router.post("/regulations/ingest")
async def ingest_policy(policy: PolicyRequest):
    """
    Simulate the Agent reading a new policy document.
    """
    new_rule = parse_natural_language_policy(policy.text)
    if not new_rule:
        raise HTTPException(status_code=400, detail="Agent could not understand this policy. Try keywords like 'amount over 5000' or 'domain .xy'.")
    
    add_rule(new_rule)
    return new_rule

from fastapi import UploadFile, File
import json
import uuid

@router.post("/regulations/upload")
async def upload_policy(file: UploadFile = File(...)):
    """
    Simulate uploading a Government/Regulatory JSON file.
    """
    try:
        content = await file.read()
        data = json.loads(content)
        
        # Expecting a list of rules or a single rule object
        if isinstance(data, dict):
            rules_list = [data]
        else:
            rules_list = data
            
        added_rules = []
        for r in rules_list:
            # Basic validation/mapping to internal model
            new_rule = RegulationRule(
                rule_id=str(uuid.uuid4())[:8],
                name=r.get("name", "Imported Rule"),
                description=r.get("description", "Imported from file"),
                parameter=r.get("parameter", "unknown"),
                threshold=str(r.get("threshold", "true"))
            )
            add_rule(new_rule)
            added_rules.append(new_rule)
            
        return {"message": f"Successfully imported {len(added_rules)} rules.", "rules": added_rules}
        
    except Exception as e:
         raise HTTPException(status_code=400, detail=f"Invalid JSON file: {str(e)}")

@router.delete("/regulations/{rule_id}")
async def delete_regulation(rule_id: str):
    from services.regulation_service import delete_rule
    delete_rule(rule_id)
    return {"status": "deleted"}
