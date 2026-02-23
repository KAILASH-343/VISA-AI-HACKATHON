from models.transaction import TransactionModel
from models.compliance_event import ComplianceEventModel
from database import db
from datetime import datetime
from services.regulation_service import get_active_rules

async def check_compliance():
    # Fetch real-time regulatory rules from the Agent Service
    rules = get_active_rules()
    
    transactions_cursor = db.transactions.find({})
    transactions = await transactions_cursor.to_list(length=1000)
    
    events = []
    
    for tx in transactions:
        detected_fields = []
        violations = []
        risk_level = "Safe"
        
        # 1. PII Check (Standard Rule)
        if any(r.parameter == "pii_check" and r.is_active for r in rules):
            if tx.get("email"):
                detected_fields.append("email")
            if tx.get("phone"):
                detected_fields.append("phone")
            if tx.get("card_last4"):
                detected_fields.append("card_last4")
            
            if detected_fields:
                violations.append("PII Exposed")

        # 2. Dynamic Rules (Agent Generated)
        for rule in rules:
            if not rule.is_active:
                continue
                
            if rule.parameter == "max_amount":
                limit = float(rule.threshold)
                if tx.get("amount", 0) > limit:
                    violations.append(f"AML Limit Exceeded (> {limit})")
                    
            if rule.parameter == "banned_domain":
                email = tx.get("email", "")
                if email and rule.threshold in email:
                    violations.append(f"Sanctioned Domain ({rule.threshold})")

            # New PCI Check Logic
            if rule.parameter == "pci_check":
                if tx.get("card_last4"):
                    violations.append("PCI DSS Violation (Card Exposed)")

        # Determine Final Risk
        if violations:
            risk_level = "High Risk" if "AML" in str(violations) else "Medium Risk"
            risk_level = "Critical" if "Sanctioned" in str(violations) or "PCI" in str(violations) else risk_level
            
            # If only PII, keep it lower
            if len(violations) == 1 and "PII" in violations[0]:
                risk_level = "PII Detected"
                
        # Agent Remediation Logic
        remediation = "✅ No action required. Transaction appears compliance."
        if risk_level == "PII Detected":
            remediation = "⚠️ ACTION: Mask sensitive fields (Email/Phone) in logs. Notify data privacy team."
        elif risk_level == "High Risk":
            remediation = "🛑 ACTION: Transaction flagged for AML review. Freeze funds temporarily. File Suspicious Activity Report (SAR) within 30 days."
        elif risk_level == "Critical":
            if "PCI" in str(violations):
                remediation = "🛑 SEVERE: Credit Card Data Plaintext Exposure. Breach of PCI DSS. Purge data immediately and audit logs."
            else:
                remediation = "🚨 URGENT: Immediate block required. Entity matches Sanctions List. Escalating to Legal & Compliance Head."
        elif risk_level == "Medium Risk":
            remediation = "⚠️ WARNING: Monitor customer behavior. Request additional KYB (Know Your Business) documents."
        
        event = ComplianceEventModel(
            transaction_id=tx["transaction_id"],
            risk_level=risk_level,
            detected_fields=violations, 
            remediation_plan=remediation,
            created_at=datetime.utcnow()
        )
        
        # Upsert
        await db.compliance_events.update_one(
            {"transaction_id": event.transaction_id},
            {"$set": event.dict()},
            upsert=True
        )
        events.append(event)
        
    return events
