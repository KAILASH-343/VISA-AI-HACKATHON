from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class TransactionModel(BaseModel):
    transaction_id: str
    amount: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    card_last4: Optional[str] = None
    description: Optional[str] = "General Purchase"

    class Config:
        json_schema_extra = {
            "example": {
                "transaction_id": "tx_12345",
                "amount": 100.50,
                "email": "user@example.com",
                "phone": "+1234567890",
                "card_last4": "4242"
            }
        }
