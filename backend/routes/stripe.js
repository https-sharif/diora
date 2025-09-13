import express from 'express';
import Stripe from 'stripe';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyToken);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

router.post('/create-account-link', async (req, res) => {
  try {
    const user = req.userDetails;
    if (!user || user.type !== 'shop') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let stripeAccountId = user.shop.stripeAccountId;
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
      });
      stripeAccountId = account.id;
      user.shop.stripeAccountId = stripeAccountId;
      await user.save();
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: 'https://example.com/stripe-onboarding/refresh',
      return_url: 'https://example.com/stripe-onboarding/complete',
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error('Stripe onboarding link error', err);
    res
      .status(500)
      .json({ message: 'Failed to create Stripe onboarding link' });
  }
});

router.get('/check-onboarding-status', async (req, res) => {
  try {
    const user = req.userDetails;
    if (!user || user.type !== 'shop')
      return res.status(403).json({ message: 'Unauthorized' });

    if (!user.shop.stripeAccountId) return res.json({ onboarded: false });

    const account = await stripe.accounts.retrieve(user.shop.stripeAccountId);
    res.json({ onboarded: account.charges_enabled });
  } catch (err) {
    console.error('Stripe onboarding status error', err);
    res.status(500).json({ message: 'Failed to check onboarding status' });
  }
});

export default router;
