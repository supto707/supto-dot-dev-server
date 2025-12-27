const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// Map plan names to Stripe Price IDs (or amounts for custom checkout)
// IMPORTANT: In production, use Stripe Price IDs (e.g., 'price_H5ggYJ...')
// For development/demo, we can use `price_data` with raw amounts.
const PLAN_PRICES = {
    starter: { amount: 10000, name: 'Starter Plan' },      // $100.00
    growth: { amount: 15000, name: 'Growth Plan' },        // $150.00
    pro: { amount: 18000, name: 'Pro Plan' },              // $180.00
    enterprise: { amount: 20000, name: 'Enterprise Plan' }, // $200.00
};

// POST /api/checkout - Create a Checkout Session
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { plan } = req.body;
        const planDetails = PLAN_PRICES[plan];

        if (!planDetails) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: planDetails.name,
                            description: `Subscription to Supto.dev ${planDetails.name}`,
                        },
                        unit_amount: planDetails.amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // Use 'subscription' if recurring
            success_url: `${process.env.CLIENT_URL}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}?payment=cancelled`,
            client_reference_id: req.user.id,
            metadata: {
                plan: plan,
                userId: req.user.id
            }
        });

        res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ message: 'Error creating checkout session', error: error.message });
    }
});

// Webhook to handle successful payments (Optional but recommended for fulfillment)
// You would typically expose this as a separate non-protected route, e.g., /api/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // Basic verification and handling logic would go here
    // Verify signature using stripe.webhooks.constructEvent...
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const plan = session.metadata.plan;

        // Fulfill the purchase...
        try {
            await User.findByIdAndUpdate(userId, {
                plan: plan,
                $push: {
                    purchaseHistory: {
                        plan: plan,
                        amount: session.amount_total,
                        sessionId: session.id
                    }
                }
            });
            console.log(`User ${userId} upgraded to ${plan}`);
        } catch (error) {
            console.error('Error updating user plan:', error);
        }
    }

    res.json({ received: true });
});

module.exports = router;
