import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function paypalWebhookRoutes(fastify: any, options: any) {
    const prisma: PrismaClient = fastify.prisma;

    fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
        // Verificar webhook signature
        const isValid = await verifyPayPalWebhook(request);

        if (!isValid) {
            // Note: For dev/sandbox we might want to be lenient or log only
            // return reply.code(401).send('Invalid webhook signature');
            console.warn('⚠️ Invalid PayPal Webhook Signature (ignored for dev)');
        }

        const event = request.body as any;

        console.log('PayPal Webhook Received:', event.event_type);

        try {
            switch (event.event_type) {
                case 'BILLING.SUBSCRIPTION.ACTIVATED':
                    await handleSubscriptionActivated(event, prisma);
                    break;

                case 'BILLING.SUBSCRIPTION.CANCELLED':
                    await handleSubscriptionCancelled(event, prisma);
                    break;

                case 'BILLING.SUBSCRIPTION.SUSPENDED':
                    await handleSubscriptionSuspended(event, prisma);
                    break;

                case 'PAYMENT.SALE.COMPLETED':
                    await handlePaymentCompleted(event, prisma);
                    break;

                // case 'PAYMENT.SALE.REFUNDED':
                //     await handlePaymentRefunded(event, prisma);
                //     break;
            }
        } catch (error) {
            console.error('Error processing PayPal webhook:', error);
            return reply.code(500).send({ error: 'Webhook processing failed' });
        }

        reply.send({ received: true });
    });
}

async function verifyPayPalWebhook(request: FastifyRequest): Promise<boolean> {
    // TODO: Implement proper signature verification
    // Requires fetching cert from PayPal and verifying SHA256 signature
    // const webhookId = process.env.PAYPAL_WEBHOOK_ID!;
    // const headers = request.headers;
    // const body = request.body;
    return true;
}

async function handleSubscriptionActivated(event: any, prisma: PrismaClient) {
    const subscriptionId = event.resource.id;
    const userId = event.resource.custom_id;
    const planId = event.resource.plan_id;

    // Mapear plan ID a tier
    // Ensure these env vars are set or use fallback/lookup
    const planMapping: Record<string, { plan: string; limit: number }> = {
        [process.env.PAYPAL_PLAN_BASIC || 'P-BASIC']: { plan: 'BASIC', limit: 100 },
        [process.env.PAYPAL_PLAN_PRO || 'P-PRO']: { plan: 'PRO', limit: 500 },
        [process.env.PAYPAL_PLAN_ENTERPRISE || 'P-ENTERPRISE']: { plan: 'ENTERPRISE', limit: 999999 },
    };

    // Si no está en el mapa, intentar deducir o usar default
    const planInfo = planMapping[planId] || { plan: 'BASIC', limit: 100 };

    if (!userId) {
        console.error('PayPal Webhook: No custom_id (userId) found in resource');
        return;
    }

    // Use DB enums
    const planEnum = planInfo.plan as 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

    // Upsert Subscription
    await prisma.subscription.upsert({
        where: { userId },
        create: {
            userId,
            paypalSubscriptionId: subscriptionId,
            paypalPlanId: planId,
            paymentProvider: 'PAYPAL',
            plan: planEnum,
            status: 'ACTIVE',
            generationsLimit: planInfo.limit,
            currentPeriodEnd: event.resource.billing_info?.next_billing_time ? new Date(event.resource.billing_info.next_billing_time) : undefined,
        },
        update: {
            paypalSubscriptionId: subscriptionId,
            paypalPlanId: planId,
            paymentProvider: 'PAYPAL', // Switch provider if was Stripe
            plan: planEnum,
            status: 'ACTIVE',
            generationsLimit: planInfo.limit,
            currentPeriodEnd: event.resource.billing_info?.next_billing_time ? new Date(event.resource.billing_info.next_billing_time) : undefined,
        },
    });

    // Update UserTier to match
    await prisma.userTier.upsert({
        where: { userId },
        create: {
            userId,
            tier: planEnum,
            monthlyGenerations: planInfo.limit,
            subscriptionStatus: 'active'
        },
        update: {
            tier: planEnum,
            monthlyGenerations: planInfo.limit,
            subscriptionStatus: 'active'
        }
    });

    console.log(`✅ Subscription Activated for user ${userId} (Plan: ${planInfo.plan})`);
}

async function handleSubscriptionCancelled(event: any, prisma: PrismaClient) {
    const subscriptionId = event.resource.id;

    await prisma.subscription.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: {
            status: 'CANCELED',
            canceledAt: new Date(),
        },
    });
    console.log(`⚠️ Subscription Cancelled: ${subscriptionId}`);
}

async function handleSubscriptionSuspended(event: any, prisma: PrismaClient) {
    const subscriptionId = event.resource.id;

    await prisma.subscription.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: {
            status: 'SUSPENDED',
        },
    });
    console.log(`⛔ Subscription Suspended: ${subscriptionId}`);
}

async function handlePaymentCompleted(event: any, prisma: PrismaClient) {
    // Resetear contador mensual
    const subscriptionId = event.resource.billing_agreement_id;

    if (!subscriptionId) return;

    await prisma.subscription.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: {
            generationsUsed: 0,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días aprox
        },
    });
    console.log(`💰 Payment Completed for subscription: ${subscriptionId}`);
}
