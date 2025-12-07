import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================================================
// PITCHMIND PAYMENT SYSTEM
// Tiers: Base $10 | Pro $20 | Elite $30 | Coach $40
// Annual subscribers get FREE tripods
// ============================================================================

const PaymentContext = createContext(null);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

// ============================================================================
// SUBSCRIPTION TIERS
// ============================================================================

export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    annualPrice: 0,
    tagline: 'Try before you buy',
    features: ['1 video analysis', 'Basic drill library', 'See how it works'],
    limits: { videoAnalyses: 1, drillAccess: 'basic', formationMaker: false, playerProfiles: 1, teamDashboard: false, proComparisons: false, downloadClips: false },
    tripod: null,
  },
  base: {
    id: 'base',
    name: 'Base',
    price: 10,
    annualPrice: 100,
    launchPrice: 5,
    launchAnnualPrice: 50,
    stripePriceIdMonthly: 'price_base_monthly',
    stripePriceIdAnnual: 'price_base_annual',
    tagline: 'Perfect for getting started',
    features: ['5 video analyses/month', 'Single player tracking', 'Basic drill library', 'Decision quiz feature', 'Performance scores'],
    limits: { videoAnalyses: 5, drillAccess: 'basic', formationMaker: false, playerProfiles: 1, teamDashboard: false, proComparisons: false, downloadClips: false },
    tripod: { annual: 'discount', description: '10% off tripod purchase' },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 20,
    annualPrice: 200,
    launchPrice: 10,
    launchAnnualPrice: 100,
    stripePriceIdMonthly: 'price_pro_monthly',
    stripePriceIdAnnual: 'price_pro_annual',
    tagline: 'Most popular for serious players',
    popular: true,
    features: ['12 video analyses/month', 'Unlimited player tracking', 'Full drill library', 'Performance trends', 'Compare to pro players', 'Priority processing'],
    limits: { videoAnalyses: 12, drillAccess: 'full', formationMaker: false, playerProfiles: 5, teamDashboard: false, proComparisons: true, downloadClips: false },
    tripod: { annual: 'basic', value: 30, description: 'FREE Basic Tripod Kit' },
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: 30,
    annualPrice: 300,
    launchPrice: 15,
    launchAnnualPrice: 150,
    stripePriceIdMonthly: 'price_elite_monthly',
    stripePriceIdAnnual: 'price_elite_annual',
    tagline: 'For dedicated development',
    features: ['25 video analyses/month', 'Everything in Pro', 'Downloadable clips', 'Formation maker', 'Advanced analytics', 'PDF reports'],
    limits: { videoAnalyses: 25, drillAccess: 'full', formationMaker: true, playerProfiles: 10, teamDashboard: false, proComparisons: true, downloadClips: true },
    tripod: { annual: 'standard', value: 100, description: 'FREE 10ft Tripod + Mount' },
  },
  coach: {
    id: 'coach',
    name: 'Coach',
    price: 40,
    annualPrice: 400,
    launchPrice: 25,
    launchAnnualPrice: 250,
    stripePriceIdMonthly: 'price_coach_monthly',
    stripePriceIdAnnual: 'price_coach_annual',
    tagline: 'Complete team management',
    features: ['50 video analyses/month', 'Everything in Elite', 'Team dashboard', 'Roster (25 players)', 'Multi-player compare', 'Parent sharing portal'],
    limits: { videoAnalyses: 50, drillAccess: 'full', formationMaker: true, playerProfiles: 25, teamDashboard: true, proComparisons: true, downloadClips: true, parentPortal: true },
    tripod: { annual: 'pro', value: 180, description: 'FREE 13ft Pro Tripod + Case' },
  },
};

// ============================================================================
// PAYMENT PROVIDER
// ============================================================================

export const PaymentProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usageThisMonth, setUsageThisMonth] = useState(0);

  useEffect(() => { checkSubscriptionStatus(); }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { setLoading(false); return; }
      const response = await fetch('/api/subscription/status', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setSubscription(data.subscription);
        setUsageThisMonth(data.usageThisMonth || 0);
      }
    } catch (error) { console.error('Subscription check failed:', error); }
    finally { setLoading(false); }
  };

  const createCheckoutSession = async (tierId, isAnnual = false) => {
    const tier = SUBSCRIPTION_TIERS[tierId];
    if (!tier) throw new Error('Invalid tier');
    const priceId = isAnnual ? tier.stripePriceIdAnnual : tier.stripePriceIdMonthly;
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ priceId, tierId, isAnnual, includeTripod: isAnnual && tier.tripod?.annual }),
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) { console.error('Checkout failed:', error); throw error; }
  };

  const openCustomerPortal = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) { console.error('Portal failed:', error); throw error; }
  };

  const getCurrentTier = () => (!subscription || subscription.status !== 'active') ? SUBSCRIPTION_TIERS.free : (SUBSCRIPTION_TIERS[subscription.tierId] || SUBSCRIPTION_TIERS.free);
  const canAnalyzeVideo = () => usageThisMonth < getCurrentTier().limits.videoAnalyses;
  const getRemainingAnalyses = () => Math.max(0, getCurrentTier().limits.videoAnalyses - usageThisMonth);
  const canAccess = (feature) => {
    const tier = getCurrentTier();
    const map = { videoAnalysis: canAnalyzeVideo(), fullDrills: tier.limits.drillAccess === 'full', formationMaker: tier.limits.formationMaker, teamDashboard: tier.limits.teamDashboard, proComparisons: tier.limits.proComparisons, downloadClips: tier.limits.downloadClips, parentPortal: tier.limits.parentPortal };
    return map[feature] || false;
  };

  return (
    <PaymentContext.Provider value={{ user, subscription, loading, usageThisMonth, getCurrentTier, canAccess, canAnalyzeVideo, getRemainingAnalyses, incrementUsage: () => setUsageThisMonth(p => p + 1), createCheckoutSession, openCustomerPortal, checkSubscriptionStatus, isSubscribed: subscription?.status === 'active', isPro: ['pro', 'elite', 'coach'].includes(subscription?.tierId), isAnnual: subscription?.interval === 'year' }}>
      {children}
    </PaymentContext.Provider>
  );
};

// ============================================================================
// PAYMENT GATE
// ============================================================================

export const PaymentGate = ({ children, requiredTier = 'pro', feature = null, fallback = null }) => {
  const { loading, getCurrentTier, canAccess } = usePayment();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: '#94a3b8' }}>Loading...</div>;
  if (feature && !canAccess(feature)) return fallback || <UpgradePrompt feature={feature} />;
  const tierOrder = ['free', 'base', 'pro', 'elite', 'coach'];
  if (tierOrder.indexOf(getCurrentTier().id) < tierOrder.indexOf(requiredTier)) return fallback || <UpgradePrompt requiredTier={requiredTier} />;
  return children;
};

// ============================================================================
// VIDEO LIMIT GATE
// ============================================================================

export const VideoLimitGate = ({ children }) => {
  const { canAnalyzeVideo, getRemainingAnalyses, getCurrentTier } = usePayment();
  if (!canAnalyzeVideo()) return <VideoLimitReached tier={getCurrentTier()} />;
  return children;
};

const VideoLimitReached = ({ tier }) => {
  const { createCheckoutSession } = usePayment();
  const tierOrder = ['free', 'base', 'pro', 'elite', 'coach'];
  const nextTier = SUBSCRIPTION_TIERS[tierOrder[tierOrder.indexOf(tier.id) + 1]];
  return (
    <div style={{ minHeight: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', background: '#0f172a' }}>
      <div style={{ maxWidth: '480px', textAlign: 'center', padding: '40px', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#f1f5f9' }}>Monthly Limit Reached</h2>
        <p style={{ margin: '0 0 24px 0', color: '#94a3b8' }}>You've used all <strong style={{ color: '#f59e0b' }}>{tier.limits.videoAnalyses}</strong> video analyses this month.</p>
        {nextTier && (
          <>
            <div style={{ padding: '20px', background: 'rgba(245,158,11,0.1)', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{nextTier.limits.videoAnalyses} videos/month</p>
            </div>
            <button onClick={() => createCheckoutSession(nextTier.id, false)} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#000', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
              Upgrade to {nextTier.name} — ${nextTier.price}/mo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const UpgradePrompt = ({ requiredTier, feature }) => {
  const { createCheckoutSession } = usePayment();
  const tier = SUBSCRIPTION_TIERS[requiredTier] || SUBSCRIPTION_TIERS.pro;
  const featureNames = { formationMaker: 'Formation Maker', teamDashboard: 'Team Dashboard', proComparisons: 'Pro Comparisons', downloadClips: 'Downloadable Clips', parentPortal: 'Parent Portal' };
  return (
    <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', background: '#0f172a' }}>
      <div style={{ maxWidth: '480px', textAlign: 'center', padding: '40px', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#f1f5f9' }}>{feature ? featureNames[feature] : 'Premium Feature'}</h2>
        <p style={{ margin: '0 0 24px 0', color: '#94a3b8' }}>Requires <strong style={{ color: '#f59e0b' }}>{tier.name}</strong> subscription.</p>
        <button onClick={() => createCheckoutSession(tier.id, false)} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#000', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          Upgrade to {tier.name} — ${tier.price}/mo
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// USAGE INDICATOR
// ============================================================================

export const UsageIndicator = ({ compact = false }) => {
  const { usageThisMonth, getCurrentTier, getRemainingAnalyses } = usePayment();
  const tier = getCurrentTier();
  const remaining = getRemainingAnalyses();
  const pct = (usageThisMonth / tier.limits.videoAnalyses) * 100;
  const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e';
  if (compact) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#1e293b', borderRadius: '8px', fontSize: '13px' }}><span style={{ color: barColor, fontWeight: '600' }}>{remaining}</span><span style={{ color: '#64748b' }}>left</span></div>;
  return (
    <div style={{ padding: '16px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Video Analyses</span>
        <span style={{ fontSize: '13px', color: '#f1f5f9' }}><strong>{usageThisMonth}</strong> / {tier.limits.videoAnalyses}</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: barColor, borderRadius: '4px' }} />
      </div>
    </div>
  );
};

export default PaymentProvider;
