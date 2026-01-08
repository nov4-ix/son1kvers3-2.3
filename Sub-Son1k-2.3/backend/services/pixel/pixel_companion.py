"""
Pixel Companion - Asistente IA que aprende del usuario
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from datetime import datetime
import json
import os
from ...database import get_db, User, Generation

router = APIRouter(prefix="/api/pixel", tags=["pixel"])

# Mock Groq API - replace with actual key
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "mock_key")

class PixelCompanion:
    """
    Pixel - Asistente IA personal que aprende del usuario
    
    Learning Dimensions:
    1. Musical preferences (géneros, tempos, keys)
    2. Usage patterns (horarios, frecuencia)
    3. Skill level assessment
    4. Goals inference
    5. Context detection (mood, energy)
    """
    
    PERSONALITY = {
        "name": "Pixel",
        "role": "AI Music Assistant",
        "tone": "friendly, encouraging, creative",
        "emoji": "🤖"
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_profile(self, user_id: str) -> Dict:
        """Obtener perfil de aprendizaje del usuario"""
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return self._get_default_profile()
        
        # Analizar generaciones del usuario
        generations = self.db.query(Generation).filter(
            Generation.user_id == user_id
        ).order_by(Generation.created_at.desc()).limit(50).all()
        
        profile = self._analyze_user_behavior(user, generations)
        
        return profile
    
    def _get_default_profile(self) -> Dict:
        """Perfil por defecto para nuevos usuarios"""
        return {
            "preferences": {
                "genres": [],
                "qualities": [],
                "typical_prompts": []
            },
            "patterns": {
                "most_active_hours": [],
                "generation_frequency": "new",
                "avg_per_day": 0
            },
            "skill_level": "beginner",
            "goals": "explore",
            "context": {
                "mood": "curious",
                "energy": "medium"
            }
        }
    
    def _analyze_user_behavior(self, user: User, generations: List) -> Dict:
        """Analizar comportamiento del usuario"""
        if not generations:
            return self._get_default_profile()
        
        # Extraer géneros más usados
        genres = {}
        for gen in generations:
            if gen.genre:
                genres[gen.genre] = genres.get(gen.genre, 0) + 1
        
        top_genres = sorted(genres.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Determinar skill level basado en variedad de prompts
        unique_prompts = len(set(gen.prompt[:50] for gen in generations if gen.prompt))
        skill_level = "advanced" if unique_prompts > 20 else "intermediate" if unique_prompts > 5 else "beginner"
        
        return {
            "preferences": {
                "genres": [g[0] for g in top_genres],
                "qualities": [gen.quality for gen in generations[:5]],
                "typical_prompts": [gen.prompt[:100] for gen in generations[:3] if gen.prompt]
            },
            "patterns": {
                "most_active_hours": self._detect_active_hours(generations),
                "generation_frequency": "daily" if len(generations) > 10 else "occasional",
                "avg_per_day": len(generations) / max((datetime.now() - generations[-1].created_at).days, 1)
            },
            "skill_level": skill_level,
            "goals": self._infer_goals(generations),
            "context": {
                "mood": "creative",
                "energy": "high" if len(generations) > 20 else "medium"
            }
        }
    
    def _detect_active_hours(self, generations: List) -> List[int]:
        """Detectar horas más activas del día"""
        hours = {}
        for gen in generations:
            hour = gen.created_at.hour
            hours[hour] = hours.get(hour, 0) + 1
        
        top_hours = sorted(hours.items(), key=lambda x: x[1], reverse=True)[:3]
        return [h[0] for h in top_hours]
    
    def _infer_goals(self, generations: List) -> str:
        """Inferir objetivos del usuario basado en su actividad"""
        if len(generations) > 30:
            return "professional"
        elif len(generations) > 10:
            return "learning"
        else:
            return "explore"
    
    async def get_suggestion(self, user_id: str, context: Optional[str] = None) -> Dict:
        """Generar sugerencia contextual para el usuario"""
        profile = await self.get_user_profile(user_id)
        
        suggestions = self._generate_suggestions(profile, context)
        
        return {
            "message": suggestions["message"],
            "action": suggestions["action"],
            "type": suggestions["type"],
            "emoji": suggestions["emoji"]
        }
    
    def _generate_suggestions(self, profile: Dict, context: Optional[str]) -> Dict:
        """Generar sugerencias basadas en perfil y contexto"""
        skill = profile["skill_level"]
        genres = profile["preferences"]["genres"]
        goals = profile["goals"]
        
        # Context-aware suggestions
        if context == "first_visit":
            return {
                "message": "¡Hola! 👋 Soy Pixel, tu asistente musical. ¿Listo para crear algo increíble?",
                "action": "start_tutorial",
                "type": "welcome",
                "emoji": "🎵"
            }
        
        if context == "limit_reached":
            return {
                "message": "Has alcanzado tu límite diario. ¿Qué tal explorar el Community Pool?",
                "action": "view_pool",
                "type": "suggestion",
                "emoji": "🎁"
            }
        
        if context == "generation_complete":
            return {
                "message": "¡Genial! ¿Quieres intentar una variación o explorar otro género?",
                "action": "suggest_variation",
                "type": "next_step",
                "emoji": "✨"
            }
        
        # Skill-based suggestions
        if skill == "beginner":
            return {
                "message": "Tip: Intenta ser más específico en tus prompts para mejores resultados",
                "action": "show_examples",
                "type": "tip",
                "emoji": "💡"
            }
        
        # Genre-based suggestions
        if genres:
            return {
                "message": f"Noto que te gusta {genres[0]}. ¿Probamos fusionarlo con otro género?",
                "action": "suggest_fusion",
                "type": "creative",
                "emoji": "🎨"
            }
        
        # Default
        return {
            "message": "¿En qué puedo ayudarte hoy?",
            "action": None,
            "type": "greeting",
            "emoji": "🤖"
        }
    
    async def celebrate_milestone(self, user_id: str, milestone: str) -> Dict:
        """Celebrar hitos del usuario"""
        celebrations = {
            "first_generation": {
                "message": "🎉 ¡Tu primera generación! Este es solo el comienzo de tu viaje musical.",
                "reward": "badge_first_track"
            },
            "10_generations": {
                "message": "🔥 ¡10 generaciones! Ya dominas lo básico. Sigue así!",
                "reward": "badge_consistent"
            },
            "week_streak": {
                "message": "⚡ ¡7 días seguidos creando! Tu dedicación es admirable.",
                "reward": "badge_week_streak"
            },
            "upgraded_tier": {
                "message": "👑 ¡Upgrade completado! Ahora tienes acceso a features premium.",
                "reward": "tier_perks_guide"
            }
        }
        
        return celebrations.get(milestone, {
            "message": "¡Sigue creando! 🎵",
            "reward": None
        })

# ==================== ENDPOINTS ====================

@router.get("/profile/{user_id}")
async def get_pixel_profile(user_id: str, db: Session = Depends(get_db)):
    """Obtener perfil de aprendizaje del usuario"""
    pixel = PixelCompanion(db)
    profile = await pixel.get_user_profile(user_id)
    
    return {
        "user_id": user_id,
        "profile": profile,
        "personality": PixelCompanion.PERSONALITY
    }

@router.post("/suggest")
async def get_suggestion(
    request: Request,
    db: Session = Depends(get_db)
):
    """Obtener sugerencia contextual"""
    data = await request.json()
    user_id = data.get("user_id")
    context = data.get("context")
    
    if not user_id:
        raise HTTPException(400, "user_id required")
    
    pixel = PixelCompanion(db)
    suggestion = await pixel.get_suggestion(user_id, context)
    
    return suggestion

@router.post("/celebrate")
async def celebrate(
    request: Request,
    db: Session = Depends(get_db)
):
    """Celebrar milestone del usuario"""
    data = await request.json()
    user_id = data.get("user_id")
    milestone = data.get("milestone")
    
    if not user_id or not milestone:
        raise HTTPException(400, "user_id and milestone required")
    
    pixel = PixelCompanion(db)
    celebration = await pixel.celebrate_milestone(user_id, milestone)
    
    return celebration

@router.get("/greeting/{user_id}")
async def get_greeting(user_id: str, db: Session = Depends(get_db)):
    """Obtener saludo personalizado basado en hora y perfil"""
    pixel = PixelCompanion(db)
    profile = await pixel.get_user_profile(user_id)
    
    hour = datetime.now().hour
    
    if hour < 12:
        time_greeting = "Buenos días"
    elif hour < 18:
        time_greeting = "Buenas tardes"
    else:
        time_greeting = "Buenas noches"
    
    user = db.query(User).filter(User.id == user_id).first()
    name = user.username if user else "Creator"
    
    return {
        "greeting": f"{time_greeting}, {name}! 🤖",
        "suggestion": f"{'Hora perfecta para crear!' if hour in profile['patterns']['most_active_hours'] else 'Veo que estás activo a una hora diferente hoy.'}",
        "energy": profile["context"]["energy"]
    }
