from models.regulation import RegulationRule
import uuid

# In-memory store for active rules (simulating Agent's knowledge base)
active_rules = [
    # Default rule
    RegulationRule(
        rule_id="rule_default_1",
        name="Standard PII Check",
        description="Flag if PII (Phone/Email) is visible",
        parameter="pii_check",
        threshold="true"
    )
]

def parse_natural_language_policy(text: str) -> RegulationRule:
    """
    Simulates an AI Agent reading a policy doc and converting it to code.
    Simple keyword matching for the hackathon demo.
    """
    text = text.lower()
    
    if "amount" in text and "over" in text:
        # eff. extraction of number
        words = text.split()
        amount = 0
        for w in words:
            if w.isdigit():
                amount = w
                break
        
        return RegulationRule(
            rule_id=str(uuid.uuid4())[:8],
            name="AML Threshold Limit",
            description=f"Flag transactions over ${amount}",
            parameter="max_amount",
            threshold=str(amount)
        )
    
    if "domain" in text or "email" in text:
        # extraction of domain
        words = text.split()
        domain = ".xyz" # default fallback
        for w in words:
            if "." in w and "@" not in w:
                domain = w
                break
                
        return RegulationRule(
            rule_id=str(uuid.uuid4())[:8],
            name="Sanctioned Entity Check",
            description=f"Flag emails from domain {domain}",
            parameter="banned_domain",
            threshold=domain
        )
        
    if "card" in text or "pci" in text:
        return RegulationRule(
            rule_id=str(uuid.uuid4())[:8],
            name="PCI DSS Card Check",
            description="Flag transactions with exposed Credit Card numbers",
            parameter="pci_check",
            threshold="true"
        )
        
    return None

def get_active_rules():
    return active_rules

def add_rule(rule: RegulationRule):
    active_rules.append(rule)
    return rule

def delete_rule(rule_id: str):
    global active_rules
    active_rules = [r for r in active_rules if r.rule_id != rule_id]
    return True
