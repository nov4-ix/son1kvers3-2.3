import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import { stripeService } from '@/lib/stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};\n
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);

  try {
    await stripeService.handleWebhookEvent(buf, sig);
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
