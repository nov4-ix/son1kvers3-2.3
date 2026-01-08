"""
Script para inicializar la base de datos con todas las tablas necesarias
del ecosistema Son1kVers3.
"""

import sys
import os

# Agregar el directorio padre al path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import Base, engine, SessionLocal, User

def init_db():
    """Crear todas las tablas en la base de datos"""
    print("🚀 Inicializando base de datos...")
    
 # Crear todas las tablas definidas en Base
    Base.metadata.create_all(bind=engine)
    
    print("✅ Tablas creadas:")
    for table in Base.metadata.sorted_tables:
        print(f"   - {table.name}")
    
    # Crear usuario de prueba si no existe
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.id == "test_user_1").first()
        if not existing_user:
            test_user = User(
                id="test_user_1",
                email="test@son1k.com",
                username="TestCreator",
                tier="FREE"
            )
            db.add(test_user)
            db.commit()
            print("\n✅ Usuario de prueba creado: test@son1k.com (tier: FREE)")
        else:
            print(f"\n✅ Usuario de prueba ya existe: {existing_user.email} (tier: {existing_user.tier})")
    finally:
        db.close()
    
    print("\n🎉 Base de datos inicializada correctamente!")
    print("\n📊 Para verificar, puedes usar:")
    print("   python -c 'from backend.database import SessionLocal, User; db = SessionLocal(); print(db.query(User).all()); db.close()'")

if __name__ == "__main__":
    init_db()
