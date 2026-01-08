from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import Optional, Dict
from datetime import datetime, timedelta
import stripe
import os
from sqlalchemy import func
from ...database import get_db, User, UserGenerationStats, Generation

router = APIRouter(prefix="/api/tiers", tags=["tiers"])

# Configurar Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")

class TierManager:
    """
    Gestor de tiers y límites de usuario.
    """
    
    TIER_CONFIGS = {
        "FREE": {
            "generations_per_day": 3,
            "generations_per_month": None,
            "quality": ["standard"],
            "storage_gb": 1,
            "features": ["basic-generation", "simple-editing"],
            "price": 0
        },
        "CREATOR": {
            "generations_per_day": None,
            "generations_per_month": 50,
            "quality": ["standard", "high"],
            "storage_gb": 10,
            "features": [
                "advanced-editing",
                "ghost-studio-lite",
                "looper",
                "adaptive-pixels"
            ],
            "price": 9.99,
            "stripe_price_id": "price_creator_monthly"
        },
        "PRO": {
            "generations_per_day": None,
            "generations_per_month": 200,
            "quality": ["standard", "high", "ultra"],
            "storage_gb": 100,
            "features": [
                "all-features",
                "ghost-studio-full",
                "nova-pilot",
                "ml-features",
                "api-limited"
            ],
            "price": 29.99,
            "stripe_price_id": "price_pro_monthly"
        },
        "STUDIO": {
            "generations_per_day": None,
            "generations_per_month": 1000,
            "quality": ["standard", "high", "ultra"],
            "storage_gb": -1,  # unlimited
            "features": [
                "enterprise-features",
                "white-label",
                "api-full",
                "priority-support"
            ],
            "price": 99.99,
            "stripe_price_id": "price_studio_monthly"
        }
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_tier(self, user_id: str) -> str:
        """Obtener tier actual del usuario"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(404, "User not found")
        return user.tier
    
    def _get_today_generations(self, user_id: str) -> int:
        """Obtener número de generaciones del día actual"""
        today = datetime.now().date()
        
        # Buscar stats del día actual
        stats = self.db.query(UserGenerationStats).filter(
            UserGenerationStats.user_id == user_id,
            func.date(UserGenerationStats.date) == today
        ).first()
        
        return stats.count if stats else 0

    def _get_month_generations(self, user_id: str) -> int:
        """Obtener número de generaciones del mes actual"""
        current_month_year = datetime.now().strftime("%Y-%m")
        
        # Sumar todas las generaciones del mes
        result = self.db.query(func.sum(UserGenerationStats.count)).filter(
            UserGenerationStats.user_id == user_id,
            UserGenerationStats.month_year == current_month_year
        ).scalar()
        
        return result if result else 0
        
    def _get_next_day_reset(self) -> datetime:
        """Calcular hora del próximo reset diario (medianoche)"""
        tomorrow = datetime.now().date() + timedelta(days=1)
        return datetime.combine(tomorrow, datetime.min.time())
        
    def _get_next_month_reset(self) -> datetime:
        """Calcular fecha del próximo reset mensual (primer día del mes siguiente)"""
        today = datetime.now().date()
        if today.month == 12:
            return datetime(today.year + 1, 1, 1)
        return datetime(today.year, today.month + 1, 1)
        
    def _get_next_reset(self, tier: str) -> datetime:
        if self.TIER_CONFIGS[tier]["generations_per_day"]:
            return self._get_next_day_reset()
        return self._get_next_month_reset()
    
    async def record_generation(self, user_id: str, generation_id: str, quality: str = "standard"):
        """
        Registrar una nueva generación y actualizar stats.
        DEBE ser llamado después de cada generación exitosa.
        """
        today = datetime.now().date()
        current_month_year = datetime.now().strftime("%Y-%m")
        
        # Buscar o crear stats del día
        stats = self.db.query(UserGenerationStats).filter(
            UserGenerationStats.user_id == user_id,
            func.date(UserGenerationStats.date) == today
        ).first()
        
        if not stats:
            stats = UserGenerationStats(
                user_id=user_id,
                date=datetime.now(),
                count=1,
                month_year=current_month_year
            )
            self.db.add(stats)
        else:
            stats.count += 1
        
        # Registrar la generación
        generation = Generation(
            id=generation_id,
            user_id=user_id,
            quality=quality,
            created_at=datetime.now(),
            status="completed"
        )
        self.db.add(generation)
        
        self.db.commit()
        return {"recorded": True, "total_today": stats.count}

    async def check_generation_limit(
        self,
        user_id: str,
        quality: str = "standard"
    ) -> Dict[str, any]:
        """
        Verificar si usuario puede generar.
        
        Returns:
            Dict con can_generate, remaining, reset_at
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
             # Fallback for dev/test without auth
             return {"can_generate": True, "remaining": 100, "reset_at": datetime.now()}

        tier_config = self.TIER_CONFIGS.get(user.tier, self.TIER_CONFIGS["FREE"])
        
        # Verificar límite diario
        if tier_config["generations_per_day"]:
            today_count = self._get_today_generations(user_id)
            if today_count >= tier_config["generations_per_day"]:
                return {
                    "can_generate": False,
                    "remaining": 0,
                    "reset_at": self._get_next_day_reset(),
                    "reason": "daily_limit_reached"
                }
            remaining = tier_config["generations_per_day"] - today_count
        
        # Verificar límite mensual
        elif tier_config["generations_per_month"]:
            month_count = self._get_month_generations(user_id)
            if month_count >= tier_config["generations_per_month"]:
                return {
                    "can_generate": False,
                    "remaining": 0,
                    "reset_at": self._get_next_month_reset(),
                    "reason": "monthly_limit_reached"
                }
            
            remaining = tier_config["generations_per_month"] - month_count
        else:
            remaining = 0 # Should not happen based on config
        
        # Verificar calidad permitida
        if quality not in tier_config["quality"]:
            return {
                "can_generate": False,
                "remaining": remaining,
                "reason": f"quality_{quality}_not_available_in_{user.tier}"
            }
        
        return {
            "can_generate": True,
            "remaining": remaining,
            "reset_at": self._get_next_reset(user.tier)
        }
    
    async def create_checkout_session(
        self,
        user_id: str,
        tier: str,
        success_url: str,
        cancel_url: str
    ) -> str:
        """
        Crear sesión de checkout de Stripe.
        
        Returns:
            Checkout session URL
        """
        if tier not in ["CREATOR", "PRO", "STUDIO"]:
            raise HTTPException(400, "Invalid tier for checkout")
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
             raise HTTPException(404, "User not found")

        tier_config = self.TIER_CONFIGS[tier]
        
        # Mock Stripe for dev if no key
        if stripe.api_key == "sk_test_placeholder":
             return f"{success_url}?session_id=mock_session_123"

        session = stripe.checkout.Session.create(
            customer_email=user.email,
            payment_method_types=['card'],
            line_items=[{
                'price': tier_config['stripe_price_id'],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': user_id,
                'tier': tier
            }
        )
        
        return session.url
    
    async def handle_webhook(self, event: dict):
        """Manejar webhooks de Stripe"""
        event_type = event['type']
        
        if event_type == 'checkout.session.completed':
            await self._handle_checkout_completed(event['data']['object'])
        
        elif event_type == 'customer.subscription.updated':
            await self._handle_subscription_updated(event['data']['object'])
        
        elif event_type == 'customer.subscription.deleted':
            await self._handle_subscription_deleted(event['data']['object'])
        
        elif event_type == 'invoice.payment_failed':
            await self._handle_payment_failed(event['data']['object'])
    
    async def _handle_checkout_completed(self, session):
        """Activar suscripción tras checkout exitoso"""
        user_id = session['metadata'].get('user_id')
        tier = session['metadata'].get('tier')
        
        if user_id:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                user.tier = tier
                user.subscription_id = session.get('subscription')
                user.subscription_status = 'active'
                self.db.commit()

    async def _handle_subscription_updated(self, subscription):
        pass

    async def _handle_subscription_deleted(self, subscription):
        pass

    async def _handle_payment_failed(self, invoice):
        pass

@router.post("/checkout")
async def create_checkout(
    request: Request,
    db: Session = Depends(get_db)
):
    """Crear sesión de checkout"""
    data = await request.json()
    user_id = data.get("user_id")
    tier = data.get("tier")
    
    manager = TierManager(db)
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    
    checkout_url = await manager.create_checkout_session(
        user_id,
        tier,
        success_url=f"{frontend_url}/checkout/success",
        cancel_url=f"{frontend_url}/pricing"
    )
    return {"checkout_url": checkout_url}

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Endpoint para webhooks de Stripe"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    if webhook_secret:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError:
            raise HTTPException(400, "Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(400, "Invalid signature")
    else:
        # Dev mode without secret verification
        import json
        event = json.loads(payload)

    manager = TierManager(db)
    await manager.handle_webhook(event)
    
    return {"status": "success"}

@router.get("/limits/{user_id}")
async def get_user_limits(user_id: str, db: Session = Depends(get_db)):
    """Obtener límites actuales del usuario"""
    manager = TierManager(db)
    try:
        tier = await manager.get_user_tier(user_id)
        limits = await manager.check_generation_limit(user_id)
        config = manager.TIER_CONFIGS[tier]
    except HTTPException:
        # Fallback for now
        tier = "FREE"
        limits = {"can_generate": True, "remaining": 3, "reset_at": datetime.now()}
        config = manager.TIER_CONFIGS["FREE"]
    
    return {
        "tier": tier,
        "limits": limits,
        "config": config
    }

@router.post("/record-generation")
async def record_generation(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Registrar una generación completada.
    Llamar DESPUÉS de que la generación se complete exitosamente.
    """
    data = await request.json()
    user_id = data.get("user_id")
    generation_id = data.get("generation_id")
    quality = data.get("quality", "standard")
    
    if not user_id or not generation_id:
        raise HTTPException(400, "user_id and generation_id required")
    
    manager = TierManager(db)
    result = await manager.record_generation(user_id, generation_id, quality)
    
    return {
        "status": "recorded",
        "generation_id": generation_id,
        "total_today": result["total_today"]
    }

