"""
==========================================
SUITE DE TESTING DE PRODUCCIÓN - SON1KVERS3
Tests de integración contra el entorno desplegado (Fly.io)
==========================================
"""

import unittest
import requests
import time
import os
from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum

# Configuración
BASE_URL = "https://sub-son1k-2-2.fly.dev"
# Usamos un token temporal o esperamos 401 para validar seguridad
TEST_TOKEN = os.getenv("TEST_API_TOKEN", "test-token-placeholder")

class GenerationStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class TestProductionEnvironment(unittest.TestCase):
    """Tests de integración contra el entorno de producción"""
    
    def setUp(self):
        self.base_url = BASE_URL
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TEST_TOKEN}"
        }
        print(f"\nTesting target: {self.base_url}")

    def test_01_health_check(self):
        """Verificar estado de salud del backend"""
        print("Ejecutando Health Check...")
        response = requests.get(f"{self.base_url}/health")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verificar estructura de respuesta
        self.assertIn("status", data)
        self.assertIn("version", data)
        self.assertIn("services", data)
        
        print(f"✓ Health Check: {data['status']}")
        print(f"  Version: {data['version']}")
        print(f"  Services: {data['services']}")

    def test_02_pixel_ai_security(self):
        """Verificar seguridad del endpoint Pixel AI"""
        print("Verificando seguridad de Pixel AI...")
        # Sin token o token inválido debería dar 401
        response = requests.get(
            f"{self.base_url}/api/pixel-memory",
            headers={"Authorization": "Bearer invalid-token"}
        )
        
        # Esperamos 401 Unauthorized
        self.assertEqual(response.status_code, 401)
        print("✓ Pixel AI Endpoint protegido correctamente (401 recibido)")

    def test_03_music_generation_endpoint(self):
        """Verificar existencia del endpoint de generación"""
        print("Verificando endpoint de generación...")
        payload = {
            "prompt": "Test song",
            "style": "pop",
            "duration": 10
        }
        
        response = requests.post(
            f"{self.base_url}/api/generation/create",
            json=payload,
            headers={"Authorization": "Bearer invalid-token"}
        )
        
        # Debería dar 401 (Auth) o 400 (Bad Request) o 429 (Rate Limit)
        # Lo importante es que NO sea 404 (Not Found) o 500 (Server Error)
        self.assertNotEqual(response.status_code, 404)
        self.assertNotEqual(response.status_code, 500)
        
        print(f"✓ Endpoint de generación responde con código: {response.status_code}")

    def test_04_frontend_availability(self):
        """Verificar disponibilidad de los frontends"""
        frontends = [
            ("Web Classic", "https://web-classic-1zcgyavja-son1kvers3s-projects-c805d053.vercel.app"),
            ("Ghost Studio", "https://ghost-studio-7vp0u1zu3-son1kvers3s-projects-c805d053.vercel.app"),
            ("The Generator", "https://the-generator-standalone-dg2ehxkmd.vercel.app"),
            ("Nova Post Pilot", "https://dist-2txtb9wh3-son1kvers3s-projects-c805d053.vercel.app")
        ]
        
        print("Verificando disponibilidad de Frontends...")
        for name, url in frontends:
            try:
                response = requests.get(url, timeout=5)
                # Accept 200 (OK), 401 (Auth required), 403 (Forbidden) as "service alive"
                # Only fail on 404 (Not Found), 500+ (Server Error), or timeout
                self.assertIn(response.status_code, [200, 401, 403])
                status_msg = "ONLINE" if response.status_code == 200 else f"PROTECTED ({response.status_code})"
                print(f"✓ {name}: {status_msg} ({response.elapsed.total_seconds():.2f}s)")
            except requests.Timeout:
                self.fail(f"{name} timeout (no responde en 5s)")
            except Exception as e:
                self.fail(f"{name} no está disponible: {str(e)}")

if __name__ == '__main__':
    unittest.main(verbosity=2)
