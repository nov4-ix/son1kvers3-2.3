from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .services.tiers import tier_manager
from .services.community import pool_manager
from .services.stealth import stealth_manager
from .services.alvae import alvae_system
from .services.pixel import pixel_companion

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Son1kVers3 API", version="2.3.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tier_manager.router)
app.include_router(pool_manager.router)
app.include_router(stealth_manager.router)
app.include_router(alvae_system.router)
app.include_router(pixel_companion.router)

@app.get("/")
def read_root():
    return {
        "status": "online", 
        "version": "2.3.0",
        "ecosystem": "Son1kVers3",
        "services": ["tiers", "community-pool", "stealth", "alvae", "pixel", "ai-local"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": "2026-01-07"}



