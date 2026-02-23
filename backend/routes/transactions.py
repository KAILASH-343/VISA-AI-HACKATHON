from fastapi import APIRouter, HTTPException
from models.transaction import TransactionModel
from database import db
from typing import List

router = APIRouter()

@router.post("/transactions", response_model=TransactionModel)
async def create_transaction(transaction: TransactionModel):
    """
    Ingest a new transaction.
    """
    new_tx = transaction.dict()
    await db.transactions.insert_one(new_tx)
    return transaction

@router.get("/transactions/count")
async def get_transaction_count():
    """
    Get total number of transactions.
    """
    count = await db.transactions.count_documents({})
    return {"count": count}

@router.get("/transactions", response_model=List[TransactionModel])
async def get_transactions():
    """
    Fetch all transactions sorted by latest timestamp.
    """
    transactions = await db.transactions.find().sort("timestamp", -1).to_list(100)
    return transactions
