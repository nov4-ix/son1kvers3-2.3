from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import datetime, timedelta
from ...database import (
    get_db, User, UserPoolStats, PoolContribution, 
    PoolClaim, Generation
)

router = APIRouter(prefix="/api/community", tags=["community"])

class CommunityPoolManager:
    """
    Gestor del pool comunitario.
    5% de cada tier pagado va al pool.
    """
    
    CONTRIBUTION_RATES = {
        "FREE": 0.0,      # No contribuye, solo consume
        "CREATOR": 0.05,  # 5% de 50 = 2.5 → pool
        "PRO": 0.05,      # 5% de 200 = 10 → pool
        "STUDIO": 0.05    # 5% de 1000 = 50 → pool
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def _calculate_points(self, quality: str) -> int:
        """Calcular puntos según calidad"""
        points_map = {
            "standard": 1,
            "high": 2,
            "ultra": 3
        }
        return points_map.get(quality, 1)
    
    async def contribute_to_pool(
        self,
        user_id: str,
        generation_id: str,
        quality: str
    ):
        """
        Registrar contribución al pool.
        Automático al generar música (5% de usuarios pagados).
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return  # Usuario no existe
        
        contribution_rate = self.CONTRIBUTION_RATES.get(user.tier, 0.0)
        
        if contribution_rate == 0:
            return  # FREE users no contribuyen
        
        # Verificar si la generación existe
        generation = self.db.query(Generation).filter(
            Generation.id == generation_id
        ).first()
        
        if not generation:
            return  # Generación no existe
        
        # Determinar si esta generación va al pool (5% de probabilidad)
        import random
        if random.random() > contribution_rate:
            return  # No seleccionada para el pool
        
        # Registrar contribución
        contribution = PoolContribution(
            user_id=user_id,
            generation_id=generation_id,
            quality=quality,
            contributed_at=datetime.now(),
            points=self._calculate_points(quality),
            plays=0,
            likes=0,
            is_available=True
        )
        
        self.db.add(contribution)
        
        # Actualizar stats del usuario
        stats = self.db.query(UserPoolStats).filter(
            UserPoolStats.user_id == user_id
        ).first()
        
        if not stats:
            stats = UserPoolStats(
                user_id=user_id,
                total_contributions=1,
                total_points=contribution.points,
                last_contribution=datetime.now()
            )
            self.db.add(stats)
        else:
            stats.total_contributions += 1
            stats.total_points += contribution.points
            stats.last_contribution = datetime.now()
        
        self.db.commit()
        
        return {
            "contributed": True,
            "generation_id": generation_id,
            "points": contribution.points
        }
    
    async def get_pool_content(
        self,
        limit: int = 50,
        genre: str = None,
        sort_by: str = "recent"
    ) -> List[Dict]:
        """
        Obtener contenido del pool comunitario.
        FREE users acceden aquí.
        """
        query = self.db.query(PoolContribution, Generation, User).join(
            Generation, PoolContribution.generation_id == Generation.id
        ).join(
            User, PoolContribution.user_id == User.id
        ).filter(
            PoolContribution.is_available == True
        )
        
        # Filtrar por género si se especifica
        if genre:
            query = query.filter(Generation.genre == genre)
        
        # Ordenar según criterio
        if sort_by == "recent":
            query = query.order_by(PoolContribution.contributed_at.desc())
        elif sort_by == "popular":
            query = query.order_by(PoolContribution.plays.desc())
        elif sort_by == "quality":
            query = query.order_by(PoolContribution.points.desc())
        
        results = query.limit(limit).all()
        
        return [
            {
                "id": contrib.id,
                "generation_id": contrib.generation_id,
                "quality": contrib.quality,
                "genre": gen.genre,
                "plays": contrib.plays,
                "likes": contrib.likes,
                "audio_url": gen.audio_url,
                "contributed_at": contrib.contributed_at.isoformat(),
                "contributor": {
                    "user_id": user.id,
                    "username": user.username,
                    "avatar": user.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.id}"
                }
            }
            for contrib, gen, user in results
        ]
    
    def _get_today_claims(self, user_id: str) -> int:
        """Obtener número de claims del día actual"""
        today = datetime.now().date()
        
        count = self.db.query(func.count(PoolClaim.id)).filter(
            PoolClaim.user_id == user_id,
            func.date(PoolClaim.claimed_at) == today
        ).scalar()
        
        return count or 0
    
    async def claim_from_pool(self, user_id: str) -> Dict:
        """
        Usuario FREE reclama generación del pool.
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(404, "User not found")
        
        if user.tier != "FREE":
            raise HTTPException(400, "Only FREE users can claim from pool")
        
        # Verificar límite diario de reclamos (3 por día, igual que generaciones)
        today_claims = self._get_today_claims(user_id)
        if today_claims >= 3:
            raise HTTPException(429, "Daily claim limit reached (3/day)")
        
        # Obtener contenido aleatorio del pool
        pool_item = self.db.query(PoolContribution, Generation).join(
            Generation, PoolContribution.generation_id == Generation.id
        ).filter(
            PoolContribution.is_available == True
        ).order_by(func.random()).first()
        
        if not pool_item:
            raise HTTPException(404, "Pool is empty")
        
        contribution, generation = pool_item
        
        # Registrar claim
        claim = PoolClaim(
            user_id=user_id,
            contribution_id=contribution.id,
            claimed_at=datetime.now()
        )
        
        self.db.add(claim)
        
        # Incrementar stats de plays
        contribution.plays += 1
        
        self.db.commit()
        
        return {
            "generation_id": generation.id,
            "quality": contribution.quality,
            "audio_url": generation.audio_url,
            "genre": generation.genre,
            "claimed_at": claim.claimed_at.isoformat(),
            "claims_remaining": 3 - (today_claims + 1)
        }
    
    async def get_ranking(self, timeframe: str = "all_time") -> List[Dict]:
        """
        Obtener ranking de contribuidores.
        """
        if timeframe == "week":
            since = datetime.now() - timedelta(days=7)
        elif timeframe == "month":
            since = datetime.now() - timedelta(days=30)
        else:
            since = None
        
        query = self.db.query(
            UserPoolStats,
            User
        ).join(User, UserPoolStats.user_id == User.id)
        
        if since:
            query = query.filter(UserPoolStats.last_contribution >= since)
        
        ranking = query.order_by(
            UserPoolStats.total_points.desc()
        ).limit(100).all()
        
        return [
            {
                "rank": idx + 1,
                "user_id": stats.user_id,
                "username": user.username,
                "avatar": user.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.id}",
                "tier": user.tier,
                "contributions": stats.total_contributions,
                "points": stats.total_points,
                "last_contribution": stats.last_contribution.isoformat() if stats.last_contribution else None
            }
            for idx, (stats, user) in enumerate(ranking)
        ]
    
    async def like_contribution(self, contribution_id: int, user_id: str):
        """Dar like a una contribución del pool"""
        contrib = self.db.query(PoolContribution).filter(
            PoolContribution.id == contribution_id
        ).first()
        
        if not contrib:
            raise HTTPException(404, "Contribution not found")
        
        contrib.likes += 1
        self.db.commit()
        
        return {"likes": contrib.likes}

@router.get("/pool")
async def get_pool_content(
    limit: int = 50,
    genre: str = None,
    sort_by: str = "recent",
    db: Session = Depends(get_db)
):
    """Obtener contenido del pool"""
    manager = CommunityPoolManager(db)
    content = await manager.get_pool_content(limit, genre, sort_by)
    return {"items": content, "total": len(content)}

@router.post("/pool/claim")
async def claim_from_pool(
    request: Request,
    db: Session = Depends(get_db)
):
    """FREE user reclama del pool"""
    data = await request.json()
    user_id = data.get("user_id")
    
    if not user_id:
        raise HTTPException(400, "user_id required")
    
    manager = CommunityPoolManager(db)
    generation = await manager.claim_from_pool(user_id)
    return generation

@router.get("/ranking")
async def get_ranking(
    timeframe: str = "all_time",
    db: Session = Depends(get_db)
):
    """Obtener ranking de contribuidores"""
    manager = CommunityPoolManager(db)
    ranking = await manager.get_ranking(timeframe)
    return {"ranking": ranking, "timeframe": timeframe}

@router.post("/contribute")
async def contribute_to_pool(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Contribuir generación al pool (automático tras generación exitosa).
    Solo para tiers pagados (CREATOR, PRO, STUDIO).
    """
    data = await request.json()
    user_id = data.get("user_id")
    generation_id = data.get("generation_id")
    quality = data.get("quality", "standard")
    
    if not user_id or not generation_id:
        raise HTTPException(400, "user_id and generation_id required")
    
    manager = CommunityPoolManager(db)
    result = await manager.contribute_to_pool(user_id, generation_id, quality)
    
    if result:
        return result
    else:
        return {"contributed": False, "reason": "not_selected_or_free_tier"}

@router.post("/pool/like/{contribution_id}")
async def like_contribution(
    contribution_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Dar like a una contribución del pool"""
    data = await request.json()
    user_id = data.get("user_id")
    
    if not user_id:
        raise HTTPException(400, "user_id required")
    
    manager = CommunityPoolManager(db)
    result = await manager.like_contribution(contribution_id, user_id)
    return result

