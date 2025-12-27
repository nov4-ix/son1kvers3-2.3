import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId as string, {
      expand: ['customer', 'subscription'],
    });

    // Verify that this session belongs to the authenticated user
    if (stripeSession.customer !== session.user.stripeCustomerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Return the session details
    return res.status(200).json({
      id: stripeSession.id,
      customer: stripeSession.customer,
      subscription: stripeSession.subscription,
      payment_status: stripeSession.payment_status,
      status: stripeSession.status,
      amount_total: stripeSession.amount_total,
      currency: stripeSession.currency,
    });
  } catch (error: any) {
    console.error('Error verifying session:', error);
    return res.status(500).json({
      error: error.message || 'Error verifying session',
    });
  }
}
