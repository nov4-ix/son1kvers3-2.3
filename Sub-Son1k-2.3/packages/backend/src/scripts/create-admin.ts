import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdminUser() {
  const adminEmail = 'nov4-ix@son1kvers3.com'
  // Usaremos un ID fijo para evitar problemas con Supabase Auth
  const adminUserId = 'admin-nov4-ix-son1kvers3'

  console.log('🚀 Creando usuario administrador:', adminEmail)

  try {
    // 1. Crear usuario directamente en Prisma (sin depender de Supabase Auth por ahora)
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        isAdmin: true,
        alvaeEnabled: true,
        tier: 'ENTERPRISE',
        username: 'nov4-ix',
        metadata: {
          symbol: 'ALVAE',
          role: 'administrator',
          created_by_system: true,
          admin_override: true
        }
      },
      create: {
        id: adminUserId,
        email: adminEmail,
        username: 'nov4-ix',
        tier: 'ENTERPRISE',
        isAdmin: true,
        alvaeEnabled: true,
        metadata: {
          symbol: 'ALVAE',
          role: 'administrator',
          created_by_system: true,
          admin_override: true
        }
      }
    })

    console.log('✅ Usuario creado/actualizado en Prisma:', user.id)

    // 2. Crear UserTier con permisos ilimitados
    const userTier = await prisma.userTier.upsert({
      where: { userId: user.id },
      update: {
        tier: 'ENTERPRISE',
        monthlyGenerations: 999999,
        dailyGenerations: 999999,
        usedThisMonth: 0,
        usedToday: 0,
        maxDuration: 600,
        quality: 'premium',
        features: 'unlimited_generation,premium_quality,alvae_system,admin_tools,all_extensions,instant_generation,priority_queue,advanced_analytics,collaboration_tools,nft_creation,commercial_license,god_mode'
      },
      create: {
        userId: user.id,
        tier: 'ENTERPRISE',
        monthlyGenerations: 999999,
        dailyGenerations: 999999,
        maxDuration: 600,
        quality: 'premium',
        features: 'unlimited_generation,premium_quality,alvae_system,admin_tools,all_extensions,instant_generation,priority_queue,advanced_analytics,collaboration_tools,nft_creation,commercial_license,god_mode'
      }
    })

    console.log('✅ UserTier creado con permisos ILIMITADOS')

    // 3. Crear UserCredits con créditos ilimitados
    const userCredits = await prisma.userCredits.upsert({
      where: { userId: user.id },
      update: {
        totalCredits: 999999999,
        usedCredits: 0,
        bonusCredits: 999999999
      },
      create: {
        userId: user.id,
        totalCredits: 999999999,
        usedCredits: 0,
        bonusCredits: 999999999
      }
    })

    console.log('✅ UserCredits: CRÉDITOS ILIMITADOS')

    // 4. Crear UserExtension con ALVAE MASTER
    const userExtension = await prisma.userExtension.upsert({
      where: { userId: user.id },
      update: {
        alvaeEnabled: true,
        alvaeLevel: 'MASTER',
        extensionVersion: '2.2',
        features: 'full_access,admin_override,debug_mode,advanced_controls,god_mode,unlimited_power'
      },
      create: {
        userId: user.id,
        alvaeEnabled: true,
        alvaeLevel: 'MASTER',
        extensionVersion: '2.2',
        features: 'full_access,admin_override,debug_mode,advanced_controls,god_mode,unlimited_power'
      }
    })

    console.log('✅ ALVAE MASTER ACTIVADO')

    // 5. Crear suscripción ENTERPRISE
    const subscription = await prisma.subscription.upsert({
      where: {
        userId_plan: {
          userId: user.id,
          plan: 'ENTERPRISE'
        }
      },
      update: {
        status: 'ACTIVE',
        metadata: {
          admin_override: true,
          unlimited: true,
          alvae_symbol: 'ALVAE',
          god_mode: true
        }
      },
      create: {
        userId: user.id,
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        paymentProvider: 'SYSTEM',
        metadata: {
          admin_override: true,
          unlimited: true,
          alvae_symbol: 'ALVAE',
          god_mode: true,
          created_by_system: true
        }
      }
    })

    console.log('✅ Suscripción ENTERPRISE GOD MODE activada')

    console.log('\n🎉 ¡USUARIO ADMINISTRADOR CREADO CON ÉXITO!')
    console.log('=====================================')
    console.log('👑 USUARIO: ADMINISTRADOR SUPREMO')
    console.log('🎭 SÍMBOLO: ALVAE MASTER')
    console.log('⚡ PERMISOS: ILIMITADOS (GOD MODE)')
    console.log('🚀 ESTADO: ACTIVADO')
    console.log('')
    console.log('🔐 CREDENCIALES DE ACCESO:')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: iloveMusic!90`)
    console.log('')
    console.log('💎 PERMISOS ESPECIALES:')
    console.log('• Generación ilimitada de música')
    console.log('• Acceso a todas las herramientas premium')
    console.log('• Sistema ALVAE completamente activado')
    console.log('• Controles administrativos avanzados')
    console.log('• Prioridad máxima en colas')
    console.log('• Análisis y métricas avanzadas')
    console.log('• Creación y venta de NFTs')
    console.log('• Licencias comerciales')
    console.log('')
    console.log('🔥 ¡BIENVENIDO AL PANTHEON, MAESTRO!')

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error)
    throw error
  }
}

// Ejecutar el script
createAdminUser()
  .catch((e) => {
    console.error('❌ Error fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })