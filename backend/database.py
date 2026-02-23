from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL, DB_NAME
import logging

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = []

    async def insert_one(self, document):
        # Simulate MongoDB _id
        if "_id" not in document:
            document["_id"] = str(len(self.data) + 1)
        self.data.append(document)
        return type('obj', (object,), {'inserted_id': document["_id"]})

    def find(self, query=None):
        self.query = query or {}
        return self

    def sort(self, key, direction):
        # Basic sort simulation (only supports simple cases)
        reverse = direction == -1
        self.data.sort(key=lambda x: x.get(key, 0), reverse=reverse)
        return self

    async def count_documents(self, filter_dict):
        # Basic filter count
        count = 0
        for doc in self.data:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                count += 1
        return count

    async def to_list(self, length):
        return self.data[:length]
        
    async def update_one(self, filter_dict, update_dict, upsert=False):
        # Very basic update simulation
        target = None
        for doc in self.data:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                target = doc
                break
        
        if target:
            if "$set" in update_dict:
                target.update(update_dict["$set"])
        elif upsert:
            new_doc = filter_dict.copy()
            if "$set" in update_dict:
                new_doc.update(update_dict["$set"])
            self.data.append(new_doc)

    async def delete_many(self, filter_dict):
        # Simplistic "delete all" if filter is empty, otherwise naive implementation
        if not filter_dict:
            deleted_count = len(self.data)
            self.data = []
            return type('obj', (object,), {'deleted_count': deleted_count})
        
        # Filtered delete (not strictly needed for reset all, but good to have)
        initial_len = len(self.data)
        self.data = [d for d in self.data if not all(d.get(k) == v for k, v in filter_dict.items())]
        return type('obj', (object,), {'deleted_count': initial_len - len(self.data)})

class MockDatabase:
    def __init__(self):
        self.transactions = MockCollection("transactions")
        self.compliance_events = MockCollection("compliance_events")

# Try to connect, but fall back to Mock if it fails (or if we just want to demo)
# For this hackathon demo phase where DB setup is "later", we default to Mock
# Hybrid Database Setup:
# If MONGODB_URL is provided in .env (and not "mock"), we try to connect.
# Otherwise, we use the in-memory MockDatabase.

import os
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = "agentic_compliance_db"

try:
    if MONGODB_URL and "mongodb" in MONGODB_URL:
        print(f"Connecting to MongoDB at: {MONGODB_URL[:25]}...")
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
        # Ping to verify
        # Note: In Async, we can't block here easily at top level without async, 
        # but the first request will fail if bad.
        print("✅ MongoDB Client Initialized")
    else:
        raise Exception("No MONGODB_URL found in .env")
        
except Exception as e:
    print(f"⚠️ Using In-Memory Mock Database for Demo (Reason: {e})")
    db = MockDatabase()
