#!/usr/bin/env python3
"""
Script para agregar tokens Suno al pool de The Generator

Uso:
    python3 scripts/add_token_to_pool.py

O con token directamente:
    python3 scripts/add_token_to_pool.py --token "TU_BEARER_TOKEN"
"""

import requests
import sys
import json
import argparse

def add_token_to_pool(token, label, generator_url="https://the-generator.son1kvers3.com"):
    """Agrega un token al pool de The Generator"""
    url = f"{generator_url}/api/token-pool/add"
    
    payload = {
        "token": token,
        "label": label
    }
    
    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ Token agregado exitosamente: {label}")
            return response.json()
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
        return None

def get_pool_metrics(generator_url="https://the-generator.son1kvers3.com"):
    """Obtiene métricas del pool"""
    url = f"{generator_url}/api/token-pool/metrics"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error obteniendo métricas: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Agregar tokens Suno al pool")
    parser.add_argument("--token", help="Bearer token de Suno", required=False)
    parser.add_argument("--label", help="Label para el token", default="manual-add")
    parser.add_argument("--url", help="URL del Generator", default="https://the-generator.son1kvers3.com")
    parser.add_argument("--metrics", help="Solo mostrar métricas", action="store_true")
    
    args = parser.parse_args()
    
    if args.metrics:
        print("📊 Obteniendo métricas del pool...")
        metrics = get_pool_metrics(args.url)
        if metrics:
            print(json.dumps(metrics, indent=2))
        return
    
    token = args.token
    
    if not token:
        print("="*80)
        print("🎵 AGREGAR TOKEN SUNO AL POOL")
        print("="*80)
        print("\n📝 Para obtener tu JWT token:")
        print("   Método 1 (Bookmarklet):")
        print("   1. Ve a https://suno.com (logueado)")
        print("   2. Click en bookmarklet 'Suno Token'")
        print("   3. Copia el token del modal")
        print("\n   Método 2 (Console):")
        print("   1. Ve a https://suno.com")
        print("   2. DevTools (F12) → Console")
        print("   3. Pega script extractor")
        print("   4. Copia el bearer_token")
        print("\n   Ver: scripts/EXTRACT_SUNO_TOKENS.md para más detalles")
        print("\nO usa: python3 scripts/add_token_to_pool.py --token 'TU_TOKEN'")
        
        token = input("\n🔑 Pega tu Bearer token aquí: ").strip()
    
    if not token:
        print("❌ Token vacío. Saliendo...")
        sys.exit(1)
    
    label = args.label
    if label == "manual-add":
        custom_label = input(f"📝 Label para el token (default: {label}): ").strip()
        if custom_label:
            label = custom_label
    
    print(f"\n⏳ Agregando token al pool...")
    print(f"   Label: {label}")
    print(f"   URL: {args.url}")
    
    result = add_token_to_pool(token, label, args.url)
    
    if result:
        print("\n✅ Token agregado exitosamente!")
        
        # Mostrar métricas actualizadas
        print("\n📊 Métricas del pool:")
        metrics = get_pool_metrics(args.url)
        if metrics:
            print(json.dumps(metrics, indent=2))
    else:
        print("\n❌ Error agregando token")
        sys.exit(1)

if __name__ == "__main__":
    main()

