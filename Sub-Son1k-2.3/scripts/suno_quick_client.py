"""
Cliente súper simple para Suno API

Solo necesitas: pip install requests

Uso rápido:
1. Ejecuta el script
2. Pega tu Bearer token cuando te lo pida
3. ¡Listo!
"""

import requests
import json

class SunoQuickClient:
    def __init__(self, bearer_token, device_id="default-device"):
        self.base_url = "https://studio-api.prod.suno.com/api"
        self.headers = {
            'authorization': f'Bearer {bearer_token}',
            'device-id': device_id,
            'Content-Type': 'application/json',
            'origin': 'https://suno.com',
            'referer': 'https://suno.com/'
        }
    
    def get_feed(self, limit=10):
        """Obtener tu feed de canciones"""
        data = {
            "cursor": None,
            "limit": limit,
            "filters": {
                "disliked": "False",
                "trashed": "False",
                "fromStudioProject": {"presence": "False"},
                "stem": {"presence": "False"},
                "workspace": {"presence": "True", "workspaceId": "default"}
            }
        }
        
        response = requests.post(
            f"{self.base_url}/feed/v3",
            headers=self.headers,
            json=data
        )
        return response.json()
    
    def get_user_config(self):
        """Obtener configuración de usuario"""
        response = requests.post(
            f"{self.base_url}/user/user_config/",
            headers=self.headers,
            json={}
        )
        return response.json()
    
    def get_credits(self):
        """Ver créditos disponibles"""
        response = requests.get(
            f"{self.base_url}/billing/info/",
            headers=self.headers
        )
        return response.json()
    
    def get_projects(self, page=1):
        """Ver tus proyectos"""
        response = requests.get(
            f"{self.base_url}/project/me?page={page}&sort=created_at&show_trashed=false",
            headers=self.headers
        )
        return response.json()
    
    def recommend_tags(self, existing_tags=[]):
        """Obtener recomendaciones de tags/géneros"""
        response = requests.post(
            f"{self.base_url}/tags/recommend",
            headers=self.headers,
            json={"tags": existing_tags}
        )
        return response.json()
    
    def generate_song(self, prompt, tags="", instrumental=False):
        """Generar una canción nueva"""
        data = {
            "prompt": prompt,
            "tags": tags,
            "make_instrumental": instrumental,
            "wait_audio": False
        }
        
        response = requests.post(
            f"{self.base_url}/generate/v2/",
            headers=self.headers,
            json=data
        )
        return response.json()


def main():
    print("="*80)
    print("🎵 SUNO API - QUICK CLIENT")
    print("="*80)
    
    print("\n📝 Necesitas tu Bearer token de Suno")
    print("   Para obtenerlo:")
    print("   1. Ve a https://suno.com")
    print("   2. Abre DevTools (F12) → Console")
    print("   3. Pega el script extractor (te lo di antes)")
    print("   4. Copia el Bearer token")
    
    bearer = input("\n🔑 Pega tu Bearer token aquí: ").strip()
    
    if not bearer:
        print("❌ Token vacío. Saliendo...")
        return
    
    device_id = input("📱 Device ID (opcional, Enter para usar default): ").strip()
    if not device_id:
        device_id = "default-device-id"
    
    print("\n✅ Conectando a Suno API...")
    client = SunoQuickClient(bearer, device_id)
    
    # Menú
    while True:
        print("\n" + "="*80)
        print("MENÚ")
        print("="*80)
        print("1. Ver mi feed")
        print("2. Ver mis créditos")
        print("3. Ver mis proyectos")
        print("4. Recomendar tags/géneros")
        print("5. Mi configuración")
        print("6. Generar canción")
        print("0. Salir")
        
        opcion = input("\nOpción: ").strip()
        
        try:
            if opcion == "1":
                print("\n📻 Obteniendo feed...")
                limit = input("¿Cuántas canciones? (default: 10): ").strip()
                limit = int(limit) if limit else 10
                
                result = client.get_feed(limit)
                print(json.dumps(result, indent=2))
                
            elif opcion == "2":
                print("\n💳 Obteniendo créditos...")
                result = client.get_credits()
                print(json.dumps(result, indent=2))
                
            elif opcion == "3":
                print("\n📁 Obteniendo proyectos...")
                result = client.get_projects()
                print(json.dumps(result, indent=2))
                
            elif opcion == "4":
                print("\n🎸 Recomendando tags...")
                result = client.recommend_tags([])
                print(json.dumps(result, indent=2))
                
            elif opcion == "5":
                print("\n⚙️ Obteniendo configuración...")
                result = client.get_user_config()
                print(json.dumps(result, indent=2))
                
            elif opcion == "6":
                print("\n🎵 Generar canción")
                prompt = input("Describe la canción: ")
                tags = input("Géneros/tags (ej: rock, electronic): ")
                instrumental = input("¿Instrumental? (s/n): ").lower() == 's'
                
                print("\n⏳ Generando...")
                result = client.generate_song(prompt, tags, instrumental)
                print(json.dumps(result, indent=2))
                
            elif opcion == "0":
                print("\n👋 ¡Hasta luego!")
                break
                
            else:
                print("❌ Opción inválida")
                
        except requests.exceptions.RequestException as e:
            print(f"\n❌ Error en la petición: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Status: {e.response.status_code}")
                print(f"Respuesta: {e.response.text}")
        except Exception as e:
            print(f"\n❌ Error: {e}")
        
        input("\nPresiona Enter para continuar...")


if __name__ == "__main__":
    main()

