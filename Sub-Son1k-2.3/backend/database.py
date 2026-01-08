from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Float, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    tier = Column(String, default="FREE")
    subscription_id = Column(String, nullable=True)
    subscription_status = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Generation(Base):
    """Registro de generaciones musicales"""
    __tablename__ = "generations"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    prompt = Column(Text)
    genre = Column(String, nullable=True)
    quality = Column(String, default="standard")  # standard, high, ultra
    audio_url = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    metadata = Column(JSON, nullable=True)

class UserGenerationStats(Base):
    """Tracking de generaciones diarias y mensuales por usuario"""
    __tablename__ = "user_generation_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)  # Fecha del día
    count = Column(Integer, default=0)  # Número de generaciones ese día
    month_year = Column(String, index=True)  # "2026-01" para queries mensuales

class UserPoolStats(Base):
    """Stats de contribuciones al pool comunitario"""
    __tablename__ = "user_pool_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    total_contributions = Column(Integer, default=0)
    total_points = Column(Integer, default=0)
    last_contribution = Column(DateTime, nullable=True)

class PoolContribution(Base):
    """Contribuciones individuales al pool"""
    __tablename__ = "pool_contributions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    generation_id = Column(String, ForeignKey("generations.id"), index=True)
    quality = Column(String)
    contributed_at = Column(DateTime, default=datetime.utcnow)
    points = Column(Integer, default=1)
    plays = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)

class PoolClaim(Base):
    """Registro de claims del pool por usuarios FREE"""
    __tablename__ = "pool_claims"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    contribution_id = Column(Integer, ForeignKey("pool_contributions.id"))
    claimed_at = Column(DateTime, default=datetime.utcnow, index=True)

class AnalyticsEvent(Base):
    """Eventos de analytics en tiempo real"""
    __tablename__ = "analytics_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=True)
    event_type = Column(String, index=True)  # generation, upgrade, claim, etc.
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    metadata = Column(JSON, nullable=True)

class ALVAEMember(Base):
    """
    ALVAE: Alpha Level Visionary Access Elite
    Sistema de badges exclusivos para founding team y early adopters
    """
    __tablename__ = "alvae_members"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True)
    alvae_id = Column(String, unique=True, index=True)  # "ALVAE-001", "ALVAE-002", etc.
    tier = Column(String, index=True)  # FOUNDER, TESTER, EARLY_ADOPTER
    granted_at = Column(DateTime, default=datetime.utcnow)
    granted_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Privilegios (stored as JSON for flexibility)
    privileges = Column(JSON, default={})
    
    # Metadata
    notes = Column(Text, nullable=True)  # Optional notes about why this person got ALVAE
    is_active = Column(Boolean, default=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
