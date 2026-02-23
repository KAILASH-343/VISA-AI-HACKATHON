from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import health, transactions, compliance, simulation, regulation, audit

app = FastAPI(title="Agentic AI Compliance Platform")

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Security Note: Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(health.router)
app.include_router(transactions.router)
app.include_router(compliance.router)
app.include_router(simulation.router)
app.include_router(regulation.router)
app.include_router(audit.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
