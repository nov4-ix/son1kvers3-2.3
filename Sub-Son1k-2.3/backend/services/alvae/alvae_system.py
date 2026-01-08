"""
ALVAE System: Alpha Level Visionary Access Elite
Sistema de badges exclusivos para founding team y early adopters
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import Dict, Optional
from datetime import datetime
from ...database import get_db, User, ALVAEMember

router = APIRouter(prefix="/api/alvae", tags=["alvae"])

class ALVAESystem:
    """
    Gestor del sistema ALVAE - Badges exclusivos
    
    Tiers:
    - FOUNDER: Tú (unlimited everything, revenue share, full control)
    - TESTER: Invitados por ti (unlimited, 0% fees, direct feedback)
    - EARLY_ADOPTER: Primeros 100 usuarios (1000 gen/mes, early access, voting)
    """
    
    TIER_PRIVILEGES = {
        "FOUNDER": {
            "unlimited_generations": True,
            "all_features_unlocked": True,
            "early_access_to_features": True,
            "custom_avatar_border": "#FFD700",  # Gold
            "special_badge": True,
            "profile_highlight": True,
            "alvae_only_channel": True,
            "direct_feedback": True,
            "vote_on_features": True,
            "veto_power": True,
            "no_fees": True,
            "revenue_share": 5.0,  # 5%
            "priority_support": True,
            "white_label_access": True
        },
        "TESTER": {
            "unlimited_generations": True,
            "all_features_unlocked": True,
            "early_access_to_features": True,
            "custom_avatar_border": "#00FFE7",  # Cyan
            "special_badge": True,
            "profile_highlight": True,
            "alvae_only_channel": True,
            "direct_feedback": True,
            "vote_on_features": True,
            "veto_power": False,
            "no_fees": True,
            "revenue_share": 0.0,
            "priority_support": True,
            "white_label_access": False
        },
        "EARLY_ADOPTER": {
            "unlimited_generations": False,  # 1000/month
            "monthly_generation_bonus": 1000,
            "all_features_unlocked": True,
            "early_access_to_features": True,
            "custom_avatar_border": "#B84DFF",  # Magenta
            "special_badge": True,
            "profile_highlight": True,
            "alvae_only_channel": True,
            "direct_feedback": False,
            "vote_on_features": True,
            "veto_power": False,
            "no_fees": False,
            "revenue_share": 0.0,
            "priority_support": False,
            "white_label_access": False
        }
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    async def is_alvae_holder(self, user_id: str) -> bool:
        """Verificar si un usuario es ALVAE holder"""
        member = self.db.query(ALVAEMember).filter(
            ALVAEMember.user_id == user_id,
            ALVAEMember.is_active == True
        ).first()
        return member is not None
    
    async def get_alvae_member(self, user_id: str) -> Optional[ALVAEMember]:
        """Obtener datos de ALVAE member"""
        return self.db.query(ALVAEMember).filter(
            ALVAEMember.user_id == user_id,
            ALVAEMember.is_active == True
        ).first()
    
    async def grant_alvae(
        self,
        target_user_id: str,
        granted_by_user_id: str,
        tier: str,
        notes: Optional[str] = None
    ) -> ALVAEMember:
        """
        Otorgar ALVAE a un usuario.
        Solo FOUNDERs pueden otorgar ALVAE.
        """
        # Verificar que quien otorga sea FOUNDER
        granter = await self.get_alvae_member(granted_by_user_id)
        
        if not granter or granter.tier != "FOUNDER":
            raise HTTPException(403, "Only FOUNDERs can grant ALVAE status")
        
        # Verificar que el tier sea válido
        if tier not in ["TESTER", "EARLY_ADOPTER"]:
            raise HTTPException(400, "Invalid tier. Use TESTER or EARLY_ADOPTER")
        
        # Verificar que el usuario objetivo existe
        target_user = self.db.query(User).filter(User.id == target_user_id).first()
        if not target_user:
            raise HTTPException(404, "Target user not found")
        
        # Verificar que no sea ya ALVAE
        existing = await self.get_alvae_member(target_user_id)
        if existing:
            raise HTTPException(400, f"User is already ALVAE ({existing.alvae_id})")
        
        # Generar ALVAE ID único
        count = self.db.query(ALVAEMember).count()
        alvae_id = f"ALVAE-{str(count + 1).zfill(3)}"
        
        # Crear member
        member = ALVAEMember(
            user_id=target_user_id,
            alvae_id=alvae_id,
            tier=tier,
            granted_at=datetime.now(),
            granted_by=granted_by_user_id,
            privileges=self.TIER_PRIVILEGES[tier],
            notes=notes,
            is_active=True
        )
        
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        
        return member
    
    async def revoke_alvae(
        self,
        target_user_id: str,
        revoked_by_user_id: str
    ):
        """
        Revocar ALVAE status.
        Solo FOUNDERs pueden revocar.
        """
        # Verificar que quien revoca sea FOUNDER
        revoker = await self.get_alvae_member(revoked_by_user_id)
        
        if not revoker or revoker.tier != "FOUNDER":
            raise HTTPException(403, "Only FOUNDERs can revoke ALVAE status")
        
        # Obtener member
        member = await self.get_alvae_member(target_user_id)
        if not member:
            raise HTTPException(404, "User is not ALVAE")
        
        # No se puede auto-revocar si eres FOUNDER
        if member.tier == "FOUNDER":
            raise HTTPException(403, "Cannot revoke FOUNDER status")
        
        # Desactivar
        member.is_active = False
        self.db.commit()
        
        return {"revoked": True, "alvae_id": member.alvae_id}
    
    async def get_all_alvae_members(self) -> list:
        """Obtener todos los ALVAE members activos"""
        members = self.db.query(ALVAEMember, User).join(
            User, ALVAEMember.user_id == User.id
        ).filter(
            ALVAEMember.is_active == True
        ).order_by(
            ALVAEMember.granted_at
        ).all()
        
        return [
            {
                "alvae_id": member.alvae_id,
                "tier": member.tier,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "avatar": user.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.id}"
                },
                "granted_at": member.granted_at.isoformat(),
                "privileges": member.privileges
            }
            for member, user in members
        ]
    
    async def check_privilege(self, user_id: str, privilege_name: str) -> bool:
        """Verificar si un usuario tiene un privilegio específico"""
        member = await self.get_alvae_member(user_id)
        
        if not member:
            return False
        
        return member.privileges.get(privilege_name, False)

# ==================== ENDPOINTS ====================

@router.get("/status/{user_id}")
async def check_alvae_status(user_id: str, db: Session = Depends(get_db)):
    """Verificar si un usuario es ALVAE holder"""
    system = ALVAESystem(db)
    
    is_holder = await system.is_alvae_holder(user_id)
    
    if not is_holder:
        return {
            "is_alvae": False,
            "tier": None,
            "alvae_id": None
        }
    
    member = await system.get_alvae_member(user_id)
    
    return {
        "is_alvae": True,
        "tier": member.tier,
        "alvae_id": member.alvae_id,
        "privileges": member.privileges,
        "granted_at": member.granted_at.isoformat()
    }

@router.post("/grant")
async def grant_alvae_status(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Otorgar ALVAE status a un usuario.
    Solo FOUNDERs pueden hacer esto.
    """
    data = await request.json()
    
    target_user_id = data.get("target_user_id")
    granted_by_user_id = data.get("granted_by_user_id")
    tier = data.get("tier")
    notes = data.get("notes")
    
    if not target_user_id or not granted_by_user_id or not tier:
        raise HTTPException(400, "target_user_id, granted_by_user_id and tier required")
    
    system = ALVAESystem(db)
    member = await system.grant_alvae(target_user_id, granted_by_user_id, tier, notes)
    
    return {
        "status": "granted",
        "alvae_id": member.alvae_id,
        "tier": member.tier,
        "privileges": member.privileges
    }

@router.post("/revoke")
async def revoke_alvae_status(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Revocar ALVAE status.
    Solo FOUNDERs pueden hacer esto.
    """
    data = await request.json()
    
    target_user_id = data.get("target_user_id")
    revoked_by_user_id = data.get("revoked_by_user_id")
    
    if not target_user_id or not revoked_by_user_id:
        raise HTTPException(400, "target_user_id and revoked_by_user_id required")
    
    system = ALVAESystem(db)
    result = await system.revoke_alvae(target_user_id, revoked_by_user_id)
    
    return result

@router.get("/members")
async def get_alvae_members(db: Session = Depends(get_db)):
    """Obtener lista de todos los ALVAE members"""
    system = ALVAESystem(db)
    members = await system.get_all_alvae_members()
    
    return {
        "members": members,
        "total": len(members)
    }

@router.get("/privilege/{user_id}/{privilege_name}")
async def check_privilege(
    user_id: str,
    privilege_name: str,
    db: Session = Depends(get_db)
):
    """Verificar si un usuario tiene un privilegio específico"""
    system = ALVAESystem(db)
    has_privilege = await system.check_privilege(user_id, privilege_name)
    
    return {
        "user_id": user_id,
        "privilege": privilege_name,
        "has_privilege": has_privilege
    }
