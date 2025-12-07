// ============================================================================
// PITCHMIND STRIPE API ROUTES
// Handles: Checkout, Subscriptions, Webhooks, Tripod Fulfillment
// ============================================================================

const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

// Price ID mapping (set these in your .env)
const PRICE_IDS = {
  base_monthly: process.env.STRIPE_PRICE_BASE_MONTHLY,
  base_annual: process.env.STRIPE_PRICE_BASE_ANNUAL,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  elite_monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY,
  elite_annual: process.env.STRIPE_PRICE_ELITE_ANNUAL,
  coach_monthly: process.env.STRIPE_PRICE_COACH_MONTHLY,
  coach_annual: process.env.STRIPE_PRICE_COACH_ANNUAL,
};

// Tripod types by tier
const TRIPOD_TYPES = {
  base: null, // discount code only
  pro: 'basic', // Basic tripod kit ($30 value)
  elite: 'standard', // 10ft tripod + mount ($100 value)
  coach: 'pro', // 13ft pro tripod + case ($180 value)
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // TODO: Verify JWT token with Clerk
    // const token = authHeader.split(' ')[1];
    // const decoded = await verifyToken(token);
    // req.user = decoded;
    
    // For now, extract user from token payload
    const token = authHeader.split(' ')[1];
    // Decode JWT payload (you should verify this properly with Clerk)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    req.user = {
      id: payload.sub,
      email: payload.email || payload.emailAddresses?.[0]?.emailAddress,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================================================
// CREATE CHECKOUT SESSION
// ============================================================================

router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { priceId, tierId, isAnnual, includeTripod } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Find or create Stripe customer
    let customerId;
    const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId, clerkUserId: userId },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        userId,
        tierId,
        isAnnual: isAnnual ? 'true' : 'false',
        includeTripod: includeTripod ? 'true' : 'false',
        tripodType: isAnnual ? TRIPOD_TYPES[tierId] : null,
      },
      subscription_data: {
        metadata: {
          userId,
          tierId,
          isAnnual: isAnnual ? 'true' : 'false',
        },
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// CUSTOMER PORTAL
// ============================================================================

router.post('/customer-portal', requireAuth, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SUBSCRIPTION STATUS
// ============================================================================

router.get('/subscription/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Find customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

    if (customers.data.length === 0) {
      return res.json({ user: req.user, subscription: null, usageThisMonth: 0 });
    }

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.json({ user: req.user, subscription: null, usageThisMonth: 0 });
    }

    const sub = subscriptions.data[0];
    const tierId = sub.metadata.tierId || 'base';
    const isAnnual = sub.metadata.isAnnual === 'true';

    // TODO: Get usage from your database
    // const usageThisMonth = await getUsageThisMonth(userId);
    const usageThisMonth = 0; // Replace with actual DB query

    res.json({
      user: req.user,
      subscription: {
        id: sub.id,
        status: sub.status,
        tierId,
        interval: isAnnual ? 'year' : 'month',
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
      usageThisMonth,
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// INCREMENT VIDEO USAGE
// ============================================================================

router.post('/usage/increment', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Increment usage in your database
    // await incrementUsage(userId);
    
    // TODO: Get updated usage count
    // const usageThisMonth = await getUsageThisMonth(userId);

    res.json({ success: true, usageThisMonth: 1 });
  } catch (error) {
    console.error('Usage increment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// WEBHOOK - Handle Stripe Events
// ============================================================================

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { userId, tierId, isAnnual, includeTripod, tripodType } = session.metadata;

      console.log(`✅ Checkout completed: User ${userId}, Tier ${tierId}, Annual: ${isAnnual}`);

      // TODO: Update user subscription in database
      // await updateUserSubscription(userId, tierId, isAnnual);

      // Handle tripod fulfillment for annual subscribers
      if (includeTripod === 'true' && tripodType && tripodType !== 'null') {
        console.log(`📦 Tripod fulfillment needed: ${tripodType} for user ${userId}`);
        
        // TODO: Create tripod fulfillment record
        // await createTripodFulfillment({
        //   userId,
        //   tripodType,
        //   status: 'pending',
        //   stripeSessionId: session.id,
        //   customerEmail: session.customer_email,
        // });

        // TODO: Send notification to fulfillment system/yourself
        // await sendTripodFulfillmentNotification(userId, tripodType, session.customer_email);
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const { userId, tierId, isAnnual } = subscription.metadata;

      console.log(`📝 Subscription ${event.type}: User ${userId}, Status ${subscription.status}`);

      // TODO: Update subscription status in database
      // await updateUserSubscription(userId, {
      //   stripeSubscriptionId: subscription.id,
      //   tierId,
      //   status: subscription.status,
      //   isAnnual: isAnnual === 'true',
      //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      // });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const { userId } = subscription.metadata;

      console.log(`❌ Subscription canceled: User ${userId}`);

      // TODO: Downgrade user to free tier
      // await downgradeToFree(userId);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      console.log(`💰 Payment succeeded: Invoice ${invoice.id}`);

      // Reset monthly usage counter if this is a recurring payment
      if (invoice.billing_reason === 'subscription_cycle') {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const { userId } = subscription.metadata;
        
        console.log(`🔄 Resetting monthly usage for user ${userId}`);
        // TODO: Reset usage counter
        // await resetMonthlyUsage(userId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log(`⚠️ Payment failed: Invoice ${invoice.id}`);

      // TODO: Send email notification to user
      // TODO: Consider grace period before restricting access
      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
});

// ============================================================================
// TRIPOD FULFILLMENT ENDPOINTS (Admin)
// ============================================================================

router.get('/admin/tripod-orders', requireAuth, async (req, res) => {
  // TODO: Check if user is admin
  // TODO: Return list of pending tripod fulfillments
  res.json({ orders: [] });
});

router.post('/admin/tripod-shipped', requireAuth, async (req, res) => {
  const { orderId, trackingNumber } = req.body;
  // TODO: Update fulfillment status
  // TODO: Send shipping notification email to customer
  res.json({ success: true });
});

module.exports = router;

// ============================================================================
// ENVIRONMENT VARIABLES NEEDED (.env)
// ============================================================================
/*
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_BASE_MONTHLY=price_...
STRIPE_PRICE_BASE_ANNUAL=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_ELITE_MONTHLY=price_...
STRIPE_PRICE_ELITE_ANNUAL=price_...
STRIPE_PRICE_COACH_MONTHLY=price_...
STRIPE_PRICE_COACH_ANNUAL=price_...

# App
FRONTEND_URL=http://localhost:3000
*/

// ============================================================================
// EXPRESS APP SETUP EXAMPLE
// ============================================================================
/*
const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./stripe-api');

const app = express();

// Webhook needs raw body - MUST come before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.use('/api/stripe', stripeRoutes);
app.use('/api', stripeRoutes);

app.listen(3001, () => console.log('Server on port 3001'));
*/
