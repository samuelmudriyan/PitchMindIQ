// ============================================================================
// PITCHMIND STRIPE API ROUTES
// Handles: Checkout, Subscriptions, Webhooks, Tripod Fulfillment
// ============================================================================

const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

// Price ID mapping (set these in your .env OR use direct IDs)
const PRICE_IDS = {
  // Monthly prices
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  elite_monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY,
  club_monthly: process.env.STRIPE_PRICE_CLUB_MONTHLY,
  // Annual prices
  starter_annual: process.env.STRIPE_PRICE_STARTER_ANNUAL,
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  elite_annual: process.env.STRIPE_PRICE_ELITE_ANNUAL,
  club_annual: process.env.STRIPE_PRICE_CLUB_ANNUAL,
  // Legacy names (for backwards compatibility)
  base_monthly: process.env.STRIPE_PRICE_BASE_MONTHLY || process.env.STRIPE_PRICE_STARTER_MONTHLY,
  base_annual: process.env.STRIPE_PRICE_BASE_ANNUAL || process.env.STRIPE_PRICE_STARTER_ANNUAL,
  coach_monthly: process.env.STRIPE_PRICE_COACH_MONTHLY || process.env.STRIPE_PRICE_CLUB_MONTHLY,
  coach_annual: process.env.STRIPE_PRICE_COACH_ANNUAL || process.env.STRIPE_PRICE_CLUB_ANNUAL,
};

// Tripod types by tier (for annual subscribers)
const TRIPOD_TYPES = {
  starter: null,        // No tripod for starter
  base: null,           // Legacy name
  pro: 'basic',         // Basic tripod kit ($30 value)
  elite: 'standard',    // 10ft tripod + mount ($100 value)
  club: 'pro',          // 13ft pro tripod + case ($180 value)
  coach: 'pro',         // Legacy name
};

// Video limits by tier
const VIDEO_LIMITS = {
  starter: 5,
  base: 5,
  pro: 12,
  elite: 25,
  club: 50,
  coach: 50,
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Optional auth - extracts user if token provided, but doesn't require it
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'];
  
  // Try x-user-id header first (simpler method from frontend)
  if (userIdHeader) {
    req.user = { id: userIdHeader };
    return next();
  }
  
  // Try Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.user = {
        id: payload.sub,
        email: payload.email || payload.emailAddresses?.[0]?.emailAddress,
      };
    } catch (error) {
      // Token invalid, but continue without user
      req.user = null;
    }
  }
  
  next();
};

// Required auth - must have valid user
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'];
  
  // Try x-user-id header first
  if (userIdHeader) {
    req.user = { id: userIdHeader };
    return next();
  }
  
  // Try Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
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
// POST /api/stripe/create-checkout-session
// ============================================================================

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { 
      // New format from App.jsx
      priceId: directPriceId,
      userId,
      userEmail,
      planTier,
      billingCycle,
      successUrl,
      cancelUrl,
      // Legacy format
      tierId,
      isAnnual,
      includeTripod,
    } = req.body;

    // Determine the price ID to use
    let priceId = directPriceId;
    let tier = planTier || tierId || 'starter';
    let cycle = billingCycle || (isAnnual ? 'annual' : 'monthly');
    
    // If no direct priceId, look it up from our mapping
    if (!priceId || priceId.startsWith('price_') && priceId.length < 20) {
      const priceKey = `${tier}_${cycle}`;
      priceId = PRICE_IDS[priceKey];
      
      if (!priceId) {
        return res.status(400).json({ 
          error: `Price not configured for ${tier} ${cycle}. Please set STRIPE_PRICE_${tier.toUpperCase()}_${cycle.toUpperCase()} in environment variables.` 
        });
      }
    }

    // Validate we have a user
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Find or create Stripe customer
    let customerId;
    
    if (userEmail) {
      const existingCustomers = await stripe.customers.list({ 
        email: userEmail, 
        limit: 1 
      });
      
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
        // Update metadata if needed
        await stripe.customers.update(customerId, {
          metadata: { clerkUserId: userId, userId },
        });
      } else {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { clerkUserId: userId, userId },
        });
        customerId = customer.id;
      }
    } else {
      // Search by metadata
      const customers = await stripe.customers.search({
        query: `metadata['clerkUserId']:'${userId}'`,
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          metadata: { clerkUserId: userId, userId },
        });
        customerId = customer.id;
      }
    }

    // Determine tripod eligibility
    const isAnnualPlan = cycle === 'annual';
    const tripodType = isAnnualPlan ? TRIPOD_TYPES[tier] : null;
    const shouldIncludeTripod = isAnnualPlan && tripodType && includeTripod !== false;

    // Build success/cancel URLs
    const frontendUrl = process.env.FRONTEND_URL || 'https://pitchmindiq.com';
    const finalSuccessUrl = successUrl || `${frontendUrl}?stripe_success=true`;
    const finalCancelUrl = cancelUrl || `${frontendUrl}?stripe_canceled=true`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        userId,
        clerkUserId: userId,
        planTier: tier,
        tierId: tier,
        billingCycle: cycle,
        isAnnual: isAnnualPlan ? 'true' : 'false',
        includeTripod: shouldIncludeTripod ? 'true' : 'false',
        tripodType: tripodType || 'none',
      },
      subscription_data: {
        metadata: {
          userId,
          clerkUserId: userId,
          planTier: tier,
          tierId: tier,
          billingCycle: cycle,
          isAnnual: isAnnualPlan ? 'true' : 'false',
        },
      },
    });

    console.log(`✅ Checkout session created: ${session.id} for user ${userId} (${tier}/${cycle})`);
    
    res.json({ 
      url: session.url, 
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SUBSCRIPTION STATUS
// GET /api/subscription/status
// ============================================================================

router.get('/subscription/status', optionalAuth, async (req, res) => {
  try {
    // Get user ID from various sources
    const userId = req.user?.id || req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return res.json({ 
        hasActiveSubscription: false, 
        subscription: null,
        usageThisMonth: 0,
      });
    }

    // Find customer by metadata
    let customer = null;
    
    // First try metadata search
    try {
      const customers = await stripe.customers.search({
        query: `metadata['clerkUserId']:'${userId}'`,
      });
      if (customers.data.length > 0) {
        customer = customers.data[0];
      }
    } catch (searchError) {
      // Search might not be available, try listing
      console.log('Customer search failed, trying list method');
    }

    // If no customer found, try by userId metadata
    if (!customer) {
      try {
        const customers = await stripe.customers.search({
          query: `metadata['userId']:'${userId}'`,
        });
        if (customers.data.length > 0) {
          customer = customers.data[0];
        }
      } catch (searchError) {
        console.log('Secondary customer search failed');
      }
    }

    if (!customer) {
      return res.json({ 
        hasActiveSubscription: false, 
        subscription: null,
        usageThisMonth: 0,
      });
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    // Also check for trialing subscriptions
    if (subscriptions.data.length === 0) {
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'trialing',
        limit: 1,
      });
      if (trialingSubscriptions.data.length > 0) {
        subscriptions.data = trialingSubscriptions.data;
      }
    }

    if (subscriptions.data.length === 0) {
      return res.json({ 
        hasActiveSubscription: false, 
        subscription: null,
        usageThisMonth: 0,
      });
    }

    const sub = subscriptions.data[0];
    const tier = sub.metadata.planTier || sub.metadata.tierId || 'starter';
    const isAnnual = sub.metadata.isAnnual === 'true' || sub.metadata.billingCycle === 'annual';

    // TODO: Get usage from your database
    // const usageThisMonth = await getUsageThisMonth(userId);
    const usageThisMonth = 0; // Replace with actual DB query

    res.json({
      hasActiveSubscription: true,
      subscription: {
        id: sub.id,
        status: sub.status,
        planTier: tier,
        tierId: tier,
        billingCycle: isAnnual ? 'annual' : 'monthly',
        interval: isAnnual ? 'year' : 'month',
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        videoLimit: VIDEO_LIMITS[tier] || 5,
      },
      usageThisMonth,
      videoLimit: VIDEO_LIMITS[tier] || 5,
    });
  } catch (error) {
    console.error('Status error:', error);
    // Return safe default instead of error
    res.json({ 
      hasActiveSubscription: false, 
      subscription: null,
      usageThisMonth: 0,
      error: error.message,
    });
  }
});

// ============================================================================
// CUSTOMER PORTAL
// POST /api/stripe/customer-portal
// POST /api/stripe/create-portal-session
// ============================================================================

router.post('/customer-portal', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || req.headers['x-user-id'];
    const returnUrl = req.body.returnUrl || `${process.env.FRONTEND_URL || 'https://pitchmindiq.com'}/dashboard`;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Find customer
    let customer = null;
    
    try {
      const customers = await stripe.customers.search({
        query: `metadata['clerkUserId']:'${userId}'`,
      });
      if (customers.data.length > 0) {
        customer = customers.data[0];
      }
    } catch (searchError) {
      console.log('Customer search failed');
    }

    if (!customer) {
      return res.status(404).json({ error: 'No subscription found for this user' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Alias for create-portal-session
router.post('/create-portal-session', async (req, res) => {
  // Forward to customer-portal handler
  req.url = '/customer-portal';
  router.handle(req, res);
});

// ============================================================================
// INCREMENT VIDEO USAGE
// POST /api/usage/increment
// ============================================================================

router.post('/usage/increment', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || req.headers['x-user-id'];

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // TODO: Implement in your database
    // const usageThisMonth = await incrementUsage(userId);
    
    console.log(`📹 Usage incremented for user ${userId}`);

    res.json({ success: true, usageThisMonth: 1 });
  } catch (error) {
    console.error('Usage increment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// WEBHOOK - Handle Stripe Events
// POST /api/stripe/webhook
// ============================================================================

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📨 Webhook received: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const userId = metadata.userId || metadata.clerkUserId;
      const tier = metadata.planTier || metadata.tierId;
      const cycle = metadata.billingCycle || (metadata.isAnnual === 'true' ? 'annual' : 'monthly');
      const tripodType = metadata.tripodType;
      const includeTripod = metadata.includeTripod === 'true';

      console.log(`✅ Checkout completed: User ${userId}, Tier ${tier}, Cycle ${cycle}`);

      // TODO: Update user subscription in your database
      // await db.subscriptions.upsert({
      //   where: { clerkUserId: userId },
      //   update: {
      //     stripeCustomerId: session.customer,
      //     stripeSubscriptionId: session.subscription,
      //     planTier: tier,
      //     billingCycle: cycle,
      //     status: 'active',
      //     updatedAt: new Date(),
      //   },
      //   create: {
      //     clerkUserId: userId,
      //     stripeCustomerId: session.customer,
      //     stripeSubscriptionId: session.subscription,
      //     planTier: tier,
      //     billingCycle: cycle,
      //     status: 'active',
      //   },
      // });

      // Handle tripod fulfillment for annual subscribers
      if (includeTripod && tripodType && tripodType !== 'none' && tripodType !== 'null') {
        console.log(`📦 Tripod fulfillment needed: ${tripodType} for user ${userId}`);
        
        // TODO: Create tripod fulfillment record
        // await db.tripodOrders.create({
        //   data: {
        //     userId,
        //     tripodType,
        //     status: 'pending',
        //     stripeSessionId: session.id,
        //     customerEmail: session.customer_email,
        //     shippingAddress: session.shipping_details?.address,
        //   },
        // });

        // TODO: Send notification (email, Slack, etc.)
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const metadata = subscription.metadata || {};
      const userId = metadata.userId || metadata.clerkUserId;
      const tier = metadata.planTier || metadata.tierId;
      const cycle = metadata.billingCycle || (metadata.isAnnual === 'true' ? 'annual' : 'monthly');

      console.log(`📝 Subscription ${event.type.split('.')[2]}: User ${userId}, Status ${subscription.status}`);

      // TODO: Update subscription in database
      // await db.subscriptions.update({
      //   where: { stripeSubscriptionId: subscription.id },
      //   data: {
      //     status: subscription.status,
      //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      //     cancelAtPeriodEnd: subscription.cancel_at_period_end,
      //     updatedAt: new Date(),
      //   },
      // });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const metadata = subscription.metadata || {};
      const userId = metadata.userId || metadata.clerkUserId;

      console.log(`❌ Subscription canceled: User ${userId}`);

      // TODO: Mark subscription as canceled
      // await db.subscriptions.update({
      //   where: { stripeSubscriptionId: subscription.id },
      //   data: {
      //     status: 'canceled',
      //     canceledAt: new Date(),
      //   },
      // });
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      console.log(`💰 Payment succeeded: Invoice ${invoice.id}`);

      // Reset monthly usage counter for recurring payments
      if (invoice.billing_reason === 'subscription_cycle') {
        try {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const userId = subscription.metadata?.userId || subscription.metadata?.clerkUserId;
          
          if (userId) {
            console.log(`🔄 Resetting monthly usage for user ${userId}`);
            // TODO: Reset usage counter
            // await db.usage.update({
            //   where: { userId },
            //   data: { videosThisMonth: 0, resetAt: new Date() },
            // });
          }
        } catch (subError) {
          console.error('Error fetching subscription for usage reset:', subError);
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log(`⚠️ Payment failed: Invoice ${invoice.id}`);

      // TODO: Handle failed payment
      // - Send email notification to user
      // - Update subscription status to 'past_due'
      // - Consider grace period before restricting access
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// ============================================================================
// ADMIN: TRIPOD FULFILLMENT ENDPOINTS
// ============================================================================

router.get('/admin/tripod-orders', requireAuth, async (req, res) => {
  // TODO: Check if user is admin
  // TODO: Return list of pending tripod fulfillments from database
  
  res.json({ 
    orders: [],
    message: 'Connect to your database to retrieve tripod orders',
  });
});

router.post('/admin/tripod-shipped', requireAuth, async (req, res) => {
  const { orderId, trackingNumber, carrier } = req.body;
  
  // TODO: Update fulfillment status in database
  // TODO: Send shipping notification email to customer
  
  console.log(`📦 Tripod shipped: Order ${orderId}, Tracking ${trackingNumber}`);
  
  res.json({ success: true });
});

module.exports = router;

// ============================================================================
// ENVIRONMENT VARIABLES NEEDED (.env)
// ============================================================================
/*
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...  (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe Dashboard > Products)
STRIPE_PRICE_STARTER_MONTHLY=price_1Sbxb4AyDeenfxMVEjSXHutj
STRIPE_PRICE_STARTER_ANNUAL=price_1SbxY1AyDeenfxMV8a51qY3s
STRIPE_PRICE_PRO_MONTHLY=price_1SbxYEAyDeenfxMVddoDcMJI
STRIPE_PRICE_PRO_ANNUAL=price_1SbxbLAyDeenfxMV0AqRGaXM
STRIPE_PRICE_ELITE_MONTHLY=price_1SbxbuAyDeenfxMVnJXKcQt5
STRIPE_PRICE_ELITE_ANNUAL=price_1SbxZOAyDeenfxMV3IjHPStJ
STRIPE_PRICE_CLUB_MONTHLY=price_1SbxbcAyDeenfxMVTld8GuVo
STRIPE_PRICE_CLUB_ANNUAL=price_1SbxZsAyDeenfxMVJUARh3da

# Frontend URL
FRONTEND_URL=https://pitchmindiq.com
*/

// ============================================================================
// SERVER.JS SETUP
// ============================================================================
/*
const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./stripe-api');

const app = express();

// ⚠️ IMPORTANT: Webhook needs raw body - MUST come BEFORE express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Regular middleware
app.use(express.json());
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'https://pitchmindiq.com', 
  credentials: true 
}));

// Mount routes
app.use('/api/stripe', stripeRoutes);
app.use('/api', stripeRoutes);  // Also mount at /api for /api/subscription/status

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
*/
