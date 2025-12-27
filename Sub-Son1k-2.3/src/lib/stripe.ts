import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Stripe Configuration
const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_mock',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock',
};

// Pricing Plans Configuration
export const PRICING_PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    currency: 'usd',
    interval: 'month',
    features: [
      'The Generator: 5 canciones/mes',
      '1 generación por día',
      'Calidad estándar (60s)',
      'Soporte por email'
    ],
    limits: {
      monthly_generations: 5,
      daily_generations: 1,
      max_duration: 60,
      quality: 'standard'
    },
    stripePriceId: null
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 9.99,
    yearlyPrice: 99.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'The Generator: 50 canciones/mes',
      '5 generaciones por día',
      'Alta calidad (120s)',
      'Soporte prioritario',
      'Acceso temprano a nuevas funciones'
    ],
    limits: {
      monthly_generations: 50,
      daily_generations: 5,
      max_duration: 120,
      quality: 'high'
    },
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    price: 29.99,
    yearlyPrice: 299.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'The Generator: 200 canciones/mes',
      '10 generaciones por día',
      'Calidad premium (300s)',
      'Soporte 24/7',
      'Acceso temprano a nuevas funciones',
      'Sesiones de entrenamiento'
    ],
    limits: {
      monthly_generations: 200,
      daily_generations: 10,
      max_duration: 300,
      quality: 'premium'
    },
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID
  }
};

// Stripe Service Class
class StripeService {
  private isMockMode: boolean;

  constructor() {
    this.isMockMode = !process.env.STRIPE_SECRET_KEY || 
                     process.env.STRIPE_SECRET_KEY.includes('mock');
  }

  // Create checkout session
  async createCheckoutSession(userId: string, planId: string, interval: 'monthly' | 'yearly' = 'monthly') {
    if (this.isMockMode) {
      return { url: '/payment/success?mock=true' };
    }

    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan) {
      throw new Error('Plan no válido');
    }

    const priceId = interval === 'yearly' && plan.yearlyPrice ? 
                   plan.stripePriceId?.replace('monthly', 'yearly') : 
                   plan.stripePriceId;

    if (!priceId) {
      throw new Error('No se pudo determinar el precio del plan');
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      client_reference_id: userId,
      metadata: {
        plan_id: planId,
        interval
      }
    });

    return { url: session.url };
  }

  // Handle webhook events
  async handleWebhookEvent(payload: any, signature: string) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
      }

      return { success: true };
    } catch (err) {
      console.error('Error processing webhook:', err);
      throw new Error('Webhook Error');
    }
  }

  private async handleCheckoutCompleted(session: any) {
    const userId = session.client_reference_id;
    const { plan_id: planId, interval } = session.metadata;
    
    // Update user's subscription in your database
    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan: planId,
        status: 'active',
        current_period_end: new Date(session.subscription.current_period_end * 1000).toISOString(),
        interval,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription
      });
  }

  private async handleSubscriptionUpdated(subscription: any) {
    // Update subscription status in your database
    await supabase
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  private async handlePaymentSucceeded(invoice: any) {
    // Handle successful payment (e.g., send receipt)
    console.log('Payment succeeded:', invoice.id);
  }

  private async handlePaymentFailed(invoice: any) {
    // Handle failed payment (e.g., send notification to user)
    console.log('Payment failed:', invoice.id);
  }
}

export const stripeService = new StripeService();
