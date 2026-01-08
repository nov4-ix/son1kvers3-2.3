"""
Sistema Stealth para rotación de cuentas y evasión de rate limits.
Inspirado en son1k_ready pero optimizado para el ecosistema Son1kVers3.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import random
import asyncio
import json
from pathlib import Path

router = APIRouter(prefix="/api/stealth", tags=["stealth"])

@dataclass
class AccountCredentials:
    """Credenciales de una cuenta del servicio externo (ej: Suno)"""
    id: str
    email: str
    cookie: str
    session_id: str
    is_active: bool = True
    last_used: Optional[datetime] = None
    request_count: int = 0
    cooldown_until: Optional[datetime] = None
    health_status: str = "healthy"  # healthy, degraded, banned

@dataclass
class ProxyConfig:
    """Configuración de un proxy"""
    id: str
    url: str
    is_active: bool = True
    success_rate: float =1.0
    last_used: Optional[datetime] = None

class StealthManager:
    """
    Gestor del sistema stealth para escalabilidad infinita.
    
    Features:
    - Rotación automática de cuentas
    - Pool de proxies
    - User-agent rotation
    - Cooldown management
    - Health checking
    - Rate limit detection
    """
    
    def __init__(self, config_path: str = "./backend/config"):
        self.config_path = Path(config_path)
        self.accounts: List[AccountCredentials] = []
        self.proxies: List[ProxyConfig] = []
        self.current_account_index = 0
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        ]
        
        # Configuración
        self.max_requests_per_account = 50
        self.cooldown_duration = timedelta(minutes=30)
        self.rotation_strategy = "round-robin"  # round-robin, random, least-used
        
        # Cargar configuración
        self._load_accounts()
        self._load_proxies()
    
    def _load_accounts(self):
        """Cargar cuentas desde archivo de configuración"""
        accounts_file = self.config_path / "stealth_accounts.json"
        
        if not accounts_file.exists():
            # Crear archivo de ejemplo
            example_accounts = [
                {
                    "id": "account_1",
                    "email": "example1@email.com",
                    "cookie": "your_cookie_here",
                    "session_id": "your_session_id_here"
                }
            ]
            accounts_file.parent.mkdir(parents=True, exist_ok=True)
            with open(accounts_file, 'w') as f:
                json.dump(example_accounts, f, indent=2)
            print(f"⚠️  Created example accounts file at {accounts_file}")
            print("   Please update with real credentials")
            return
        
        with open(accounts_file, 'r') as f:
            accounts_data = json.load(f)
        
        for acc_data in accounts_data:
            account = AccountCredentials(
                id=acc_data['id'],
                email=acc_data['email'],
                cookie=acc_data['cookie'],
                session_id=acc_data['session_id'],
                is_active=acc_data.get('is_active', True)
            )
            self.accounts.append(account)
        
        print(f"✅ Loaded {len(self.accounts)} accounts")
    
    def _load_proxies(self):
        """Cargar proxies desde archivo de configuración"""
        proxies_file = self.config_path / "proxies.json"
        
        if not proxies_file.exists():
            # Sin proxies por defecto (opcional)
            print(" No proxies configured (optional)")
            return
        
        with open(proxies_file, 'r') as f:
            proxies_data = json.load(f)
        
        for proxy_data in proxies_data:
            proxy = ProxyConfig(
                id=proxy_data['id'],
                url=proxy_data['url'],
                is_active=proxy_data.get('is_active', True)
            )
            self.proxies.append(proxy)
        
        print(f"✅ Loaded {len(self.proxies)} proxies")
    
    async def get_account(self) -> AccountCredentials:
        """Obtener cuenta disponible según estrategia de rotación"""
        available_accounts = [
            acc for acc in self.accounts
            if acc.is_active
            and (acc.cooldown_until is None or acc.cooldown_until < datetime.now())
            and acc.health_status != "banned"
        ]
        
        if not available_accounts:
            raise HTTPException(503, "No available accounts (all in cooldown or banned)")
        
        # Seleccionar según estrategia
        if self.rotation_strategy == "round-robin":
            account = available_accounts[self.current_account_index % len(available_accounts)]
            self.current_account_index = (self.current_account_index + 1) % len(available_accounts)
        
        elif self.rotation_strategy == "random":
            account = random.choice(available_accounts)
        
        elif self.rotation_strategy == "least-used":
            account = min(available_accounts, key=lambda acc: acc.request_count)
        
        else:
            account = available_accounts[0]
        
        # Actualizar metadata
        account.last_used = datetime.now()
        account.request_count += 1
        
        # Verificar si necesita cooldown
        if account.request_count >= self.max_requests_per_account:
            account.cooldown_until = datetime.now() + self.cooldown_duration
            account.request_count = 0
            print(f"⏸️  Account {account.id} entered cooldown until {account.cooldown_until}")
        
        return account
    
    async def get_proxy(self) -> Optional[ProxyConfig]:
        """Obtener proxy disponible (si hay configurados)"""
        if not self.proxies:
            return None
        
        available_proxies = [p for p in self.proxies if p.is_active and p.success_rate > 0.5]
        
        if not available_proxies:
            return None
        
        # Seleccionar basado en success rate
        proxy = max(available_proxies, key=lambda p: p.success_rate)
        proxy.last_used = datetime.now()
        
        return proxy
    
    def get_user_agent(self) -> str:
        """Obtener user agent aleatorio"""
        return random.choice(self.user_agents)
    
    async def mark_account_health(self, account_id: str, status: str, reason: str = ""):
        """Marcar el estado de salud de una cuenta"""
        account = next((acc for acc in self.accounts if acc.id == account_id), None)
        
        if not account:
            return
        
        account.health_status = status
        
        if status == "banned":
            account.is_active = False
            print(f"🚫 Account {account_id} marked as BANNED: {reason}")
        elif status == "degraded":
            print(f"⚠️  Account {account_id} degraded: {reason}")
        else:
            print(f"✅ Account {account_id} healthy")
    
    async def get_request_headers(self, account: AccountCredentials, proxy: Optional[ProxyConfig] = None) -> Dict:
        """Generar headers para request con rotación de user-agent"""
        headers = {
            "User-Agent": self.get_user_agent(),
            "Cookie": account.cookie,
            "Session-ID": account.session_id,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
        }
        
        return headers
    
    async def detect_rate_limit(self, response_status: int, response_body: str) -> bool:
        """Detectar si recibimos un rate limit"""
        # Códigos comunes de rate limit
        if response_status in [429, 503]:
            return True
        
        # Palabras clave en el body
        rate_limit_keywords = ["rate limit", "too many requests", "try again later"]
        for keyword in rate_limit_keywords:
            if keyword.lower() in response_body.lower():
                return True
        
        return False
    
    def get_stats(self) -> Dict:
        """Obtener estadísticas del sistema stealth"""
        total_accounts = len(self.accounts)
        active_accounts = len([acc for acc in self.accounts if acc.is_active])
        in_cooldown = len([acc for acc in self.accounts if acc.cooldown_until and acc.cooldown_until > datetime.now()])
        banned = len([acc for acc in self.accounts if acc.health_status == "banned"])
        
        return {
            "total_accounts": total_accounts,
            "active_accounts": active_accounts,
            "in_cooldown": in_cooldown,
            "banned": banned,
            "available": active_accounts - in_cooldown - banned,
            "proxies": len(self.proxies),
            "rotation_strategy": self.rotation_strategy
        }

# Singleton instance
_stealth_manager: Optional[StealthManager] = None

def get_stealth_manager() -> StealthManager:
    """Obtener instancia singleton del StealthManager"""
    global _stealth_manager
    if _stealth_manager is None:
        _stealth_manager = StealthManager()
    return _stealth_manager

# ==================== ENDPOINTS ====================

@router.get("/health")
async def stealth_health():
    """Check stealth system health"""
    manager = get_stealth_manager()
    stats = manager.get_stats()
    
    return {
        "status": "healthy" if stats["available"] > 0 else "degraded",
        "stats": stats
    }

@router.post("/rotate")
async def rotate_account():
    """Rotar a la siguiente cuenta disponible"""
    manager = get_stealth_manager()
    
    try:
        account = await manager.get_account()
        proxy = await manager.get_proxy()
        
        # No retornar credenciales sensibles
        return {
            "account_id": account.id,
            "account_email": account.email[:3] + "***",  # Ofuscar
            "proxy_active": proxy is not None,
            "request_count": account.request_count,
            "health_status": account.health_status,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException as e:
        raise e

@router.get("/stats")
async def get_stealth_stats():
    """Obtener estadísticas del sistema stealth"""
    manager = get_stealth_manager()
    return manager.get_stats()

@router.post("/mark-health")
async def mark_account_health(account_id: str, status: str, reason: str = ""):
    """
    Marcar estado de salud de una cuenta.
    Status: healthy, degraded, banned
    """
    manager = get_stealth_manager()
    await manager.mark_account_health(account_id, status, reason)
    
    return {"status": "updated", "account_id": account_id, "new_status": status}

@router.post("/request-headers")
async def get_request_headers():
    """
    Obtener headers preparados para un request externo.
    Incluye rotación de cuenta, proxy y user-agent.
    """
    manager = get_stealth_manager()
    
    try:
        account = await manager.get_account()
        proxy = await manager.get_proxy()
        headers = await manager.get_request_headers(account, proxy)
        
        return {
            "headers": {
                k: v[:10] + "..." if len(v) > 10 else v
                for k, v in headers.items()
            },
            "account_id": account.id,
            "proxy_url": proxy.url if proxy else None
        }
    except HTTPException as e:
        raise e
