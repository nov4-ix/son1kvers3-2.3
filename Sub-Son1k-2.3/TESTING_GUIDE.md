# 🧪 Guía de Testing - Sistema de Monetización

## Tarjetas de Prueba Stripe

### ✅ Tarjeta Exitosa
```
Número: 4242 4242 4242 4242
Fecha: cualquier fecha futura (ej: 12/25)
CVC: cualquier 3 dígitos (ej: 123)
ZIP: cualquier código (ej: 12345)
```

### 🔐 Tarjeta con Autenticación 3D Secure
```
Número: 4000 0027 6000 3184
```

### ❌ Tarjeta Declinada
```
Número: 4000 0000 0000 0002
```

### 💳 Tarjeta con Fondos Insuficientes
```
Número: 4000 0000 0000 9995
```

## Flujo de Testing Completo

### 1. Crear Usuario de Prueba
- [ ] Ir a http://localhost:3000/signup
- [ ] Crear cuenta con email: test@son1kvers3.com
- [ ] Verificar que plan FREE está activo

### 2. Probar Límites FREE
- [ ] Intentar generar 10 tracks
- [ ] Verificar que el track #11 muestra mensaje de upgrade
- [ ] Confirmar límite en dashboard

### 3. Upgrade a Plan BASIC
- [ ] Ir a /pricing
- [ ] Seleccionar plan BASIC
- [ ] Usar tarjeta 4242 4242 4242 4242
- [ ] Completar checkout
- [ ] Verificar redirección a /dashboard?success=true
- [ ] Confirmar plan BASIC activo
- [ ] Verificar límite de 100 generaciones

### 4. Verificar Webhooks
- [ ] Revisar logs de Stripe CLI
- [ ] Confirmar evento checkout.session.completed
- [ ] Verificar registro en base de datos
```sql
SELECT * FROM "Subscription" WHERE "userId" = 'test-user-id';
```

### 5. Portal de Cliente
- [ ] Ir a /dashboard/billing
- [ ] Click en "Gestionar Suscripción"
- [ ] Verificar apertura de Stripe Portal
- [ ] Cambiar método de pago
- [ ] Cancelar suscripción
- [ ] Verificar webhook subscription.deleted

### 6. Reseteo Mensual (Simular)
```bash
# Trigger manual del evento de pago exitoso
stripe trigger invoice.payment_succeeded
```
- [ ] Verificar que generationsUsed vuelve a 0

## Checklist de Seguridad

- [ ] Webhooks validados con signature
- [ ] API keys nunca expuestas en frontend
- [ ] Rate limiting activo en endpoints de pago
- [ ] Logs de todas las transacciones
- [ ] Manejo de errores de pago
- [ ] Mensajes de error claros para usuarios

## Monitoreo

### Métricas a Trackear
```bash
# En Stripe Dashboard > Developers > Logs
- Webhooks exitosos vs fallidos
- Tipos de eventos más comunes
- Tiempo de respuesta del webhook

# En tu base de datos
SELECT 
  plan,
  COUNT(*) as total_users,
  SUM(generationsUsed) as total_generations
FROM "Subscription"
GROUP BY plan;
```

## Comandos Útiles

```bash
# Ver logs del backend
tail -f logs/backend.log

# Ver logs de Stripe
tail -f logs/stripe.log

# Trigger eventos de prueba
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed

# Ver eventos recientes en Stripe
stripe events list --limit 10

# Ver detalles de un evento
stripe events retrieve evt_xxx
```

## Casos Edge a Probar

1. **Usuario cancela durante checkout**
   - Iniciar checkout y cerrar ventana
   - Verificar que no se crea suscripción

2. **Pago falla después de creado**
   - Usar tarjeta declinada
   - Verificar manejo de error

3. **Usuario hace downgrade**
   - Upgrade a PRO
   - Downgrade a BASIC
   - Verificar límites ajustados correctamente

4. **Usuario alcanza límite exacto**
   - Generar exactamente 100 tracks en BASIC
   - Intentar generar track 101
   - Verificar mensaje apropiado

## Transición a Producción

Cuando estés listo para producción:

1. **Cambiar a Live Mode en Stripe**
```bash
# Actualizar .env con keys de producción
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

2. **Configurar Webhook en Producción**
```
URL: https://tu-dominio.com/api/webhooks/stripe
Eventos: [los mismos del testing]
```

3. **Actualizar Price IDs**
```bash
# Usar price IDs de productos LIVE
NEXT_PUBLIC_PRICE_BASIC="price_live_..."
```

4. **Activar Monitoreo**
- Configurar alertas en Stripe
- Activar Sentry para errores
- Configurar logs centralizados

¡Buena suerte! 🚀
