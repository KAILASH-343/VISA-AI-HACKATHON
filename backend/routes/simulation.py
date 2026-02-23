from fastapi import APIRouter
from models.transaction import TransactionModel
from database import db
from datetime import datetime, timedelta
import random
import uuid

router = APIRouter()

@router.post("/simulate/traffic")
async def simulate_traffic():
    """
    Generates realistic dummy data for the hackathon demo.
    """
    
    sample_users = [
        {"email": "alice@example.com", "phone": "+15550101", "card": None, "desc": "Safe Purchase"},
        # PCI Risk scenarios (Debit Cards)
        {"email": None, "phone": None, "card": "4242", "desc": "Debit Card - Unmasked PCI"}, 
        {"email": "bob@work.org", "phone": None, "card": "1234", "desc": "Debit POS - Safe"},
        
        # PII Risk scenarios
        {"email": None, "phone": "+15550199", "card": None, "desc": "Wire Transfer - PII Leak"}, 
        
        # High Value Debit Logs
        {"email": "corp@finance.com", "phone": None, "card": "9988", "amount": 9500.00, "desc": "Corporate Debit - High Value"},
        {"email": "vendor@supply.io", "phone": "+15559988", "card": "5678", "desc": "Vendor Payment - PII + PCI"}
    ]
    
    new_transactions = []
    
    for _ in range(5):
        user = random.choice(sample_users)
        
        amount = user.get("amount", round(random.uniform(10.0, 5000.0), 2))
        
        tx = TransactionModel(
            transaction_id=f"tx_{uuid.uuid4().hex[:8]}",
            amount=amount,
            timestamp=datetime.utcnow() - timedelta(minutes=random.randint(1, 60)),
            email=user["email"],
            phone=user["phone"],
            card_last4=user["card"],
            description=user.get("desc", "General Purchase")
        )
        
        # Insert into mock/real DB
        await db.transactions.insert_one(tx.dict())
        new_transactions.append(tx)
    
    # Trigger the Monitoring Agent immediately (Simulating Real-time agent)
    from services.compliance_service import check_compliance
    await check_compliance()
        
    return {
        "message": "Generated 5 new transactions",
        "transactions": new_transactions
    }

@router.delete("/reset")
async def reset_data():
    """
    Clears all data for a fresh demo.
    """
    await db.transactions.delete_many({})
    await db.compliance_events.delete_many({})
    return {"message": "System reset successfully"}
