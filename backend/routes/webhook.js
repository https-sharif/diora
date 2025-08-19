import express from 'express';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import Order from '../models/Order.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

router.post('/', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    console.log("Received Stripe webhook event");
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' });
    console.log(`Order ${orderId} marked as paid`);
  }

  res.json({ received: true });
});

export default router;
