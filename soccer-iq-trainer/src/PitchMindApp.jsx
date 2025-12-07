import React, { useState, useEffect } from 'react';
import { SignIn, SignUp, useUser, useClerk, UserButton } from '@clerk/clerk-react';
import { PaymentProvider, PaymentGate, usePayment, UsageIndicator, VideoLimitGate, SUBSCRIPTION_TIERS } from './PaymentGate';
import LandingPage from './LandingPage';
import DrillsPage from './DrillsPage';
import FormationMaker from './FormationMaker';
// Import your other components as needed
// import VideoAnalysis from './VideoAnalysis';
// import Dashboard from './Dashboard';

// ============================================================================
// MAIN APP - PitchMind
// ============================================================================

const App = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [showAuth, setShowAuth] = useState(null); // 'signin' | 'signup' | null

  // Show loading while Clerk loads
  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0e17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: '#f1f5f9' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚽</div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>Loading PitchMind...</div>
        </div>
      </div>
    );
  }

  // Show auth modal if requested
  if (showAuth) {
    return (
      <AuthModal
        mode={showAuth}
        onClose={() => setShowAuth(null)}
        onSwitch={(mode) => setShowAuth(mode)}
      />
    );
  }

  // Show landing page if not signed in
  if (!isSignedIn) {
    return (
      <LandingPage
        onGetStarted={() => setShowAuth('signup')}
        onLogin={() => setShowAuth('signin')}
      />
    );
  }

  // Show main app if signed in
  return (
    <PaymentProvider>
      <MainApp />
    </PaymentProvider>
  );
};

// ============================================================================
// AUTH MODAL
// ============================================================================

const AuthModal = ({ mode, onClose, onSwitch }) => {
  const c = {
    bg: '#0a0e17',
    card: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    accent: '#f59e0b',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: c.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '300px',
        height: '300px',
        background: `radial-gradient(circle, ${c.accent}20 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(60px)',
      }} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        background: c.card,
        borderRadius: '20px',
        border: `1px solid ${c.border}`,
        padding: '32px',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            background: 'transparent',
            border: 'none',
            color: c.textMuted,
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px' }}>⚽</span>
            <span style={{
              fontSize: '24px',
              fontWeight: '800',
              background: `linear-gradient(135deg, ${c.accent}, #fbbf24)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              PitchMind
            </span>
          </div>
          <p style={{ color: c.textMuted, fontSize: '14px', margin: 0 }}>
            {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Clerk Auth Component */}
        <div style={{
          '--clerk-color-primary': c.accent,
          '--clerk-color-primary-hover': '#fbbf24',
        }}>
          {mode === 'signin' ? (
            <SignIn
              appearance={{
                elements: {
                  rootBox: { width: '100%' },
                  card: { background: 'transparent', boxShadow: 'none', border: 'none' },
                  headerTitle: { display: 'none' },
                  headerSubtitle: { display: 'none' },
                  socialButtonsBlockButton: {
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    color: c.text,
                  },
                  formFieldInput: {
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    color: c.text,
                  },
                  formButtonPrimary: {
                    background: `linear-gradient(135deg, ${c.accent}, #fbbf24)`,
                    color: '#000',
                    fontWeight: '600',
                  },
                  footerActionLink: { color: c.accent },
                },
              }}
              routing="hash"
            />
          ) : (
            <SignUp
              appearance={{
                elements: {
                  rootBox: { width: '100%' },
                  card: { background: 'transparent', boxShadow: 'none', border: 'none' },
                  headerTitle: { display: 'none' },
                  headerSubtitle: { display: 'none' },
                  socialButtonsBlockButton: {
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    color: c.text,
                  },
                  formFieldInput: {
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    color: c.text,
                  },
                  formButtonPrimary: {
                    background: `linear-gradient(135deg, ${c.accent}, #fbbf24)`,
                    color: '#000',
                    fontWeight: '600',
                  },
                  footerActionLink: { color: c.accent },
                },
              }}
              routing="hash"
            />
          )}
        </div>

        {/* Switch mode */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ color: c.textMuted, fontSize: '14px' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => onSwitch(mode === 'signin' ? 'signup' : 'signin')}
            style={{
              background: 'none',
              border: 'none',
              color: c.accent,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP (Authenticated)
// ============================================================================

const MainApp = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getCurrentTier, isPro, isSubscribed, openCustomerPortal, createCheckoutSession } = usePayment();
  const [activeTab, setActiveTab] = useState('dashboard');
  const currentTier = getCurrentTier();

  const c = {
    bg: '#0a0e17',
    bgAlt: '#0f172a',
    sidebar: '#1e293b',
    card: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    accent: '#f59e0b',
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', protected: false },
    { id: 'analysis', label: 'Video Analysis', icon: '🎥', protected: false }, // Free tier gets 1
    { id: 'drills', label: 'Drill Library', icon: '⚽', protected: false },
    { id: 'formations', label: 'Formation Maker', icon: '🎯', protected: true, requiredTier: 'elite' },
    { id: 'sessions', label: 'Training Sessions', icon: '📋', protected: true, requiredTier: 'pro' },
    { id: 'team', label: 'Team', icon: '👥', protected: true, requiredTier: 'coach' },
    { id: 'pricing', label: 'Upgrade', icon: '⭐', protected: false, highlight: !isPro },
  ];

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'analysis':
        return (
          <VideoLimitGate>
            <VideoAnalysisPlaceholder />
          </VideoLimitGate>
        );
      case 'drills':
        return <DrillsPage />;
      case 'formations':
        return (
          <PaymentGate requiredTier="elite" feature="formationMaker">
            <FormationMaker />
          </PaymentGate>
        );
      case 'sessions':
        return (
          <PaymentGate requiredTier="pro">
            <SessionsPlaceholder />
          </PaymentGate>
        );
      case 'team':
        return (
          <PaymentGate requiredTier="coach" feature="teamDashboard">
            <TeamPlaceholder />
          </PaymentGate>
        );
      case 'pricing':
        return <PricingPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: c.bg,
      fontFamily: "'Outfit', 'DM Sans', -apple-system, sans-serif",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: c.sidebar,
        borderRight: `1px solid ${c.border}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>⚽</span>
            <span style={{
              fontSize: '22px',
              fontWeight: '800',
              background: `linear-gradient(135deg, ${c.accent}, #fbbf24)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              PitchMind
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const tierOrder = ['free', 'base', 'pro', 'elite', 'coach'];
            const isLocked = item.requiredTier && tierOrder.indexOf(currentTier.id) < tierOrder.indexOf(item.requiredTier);

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '4px',
                  borderRadius: '10px',
                  border: item.highlight && !isActive ? `1px solid ${c.accent}44` : 'none',
                  background: isActive
                    ? `linear-gradient(135deg, ${c.accent}22, ${c.accent}11)`
                    : item.highlight ? `${c.accent}11` : 'transparent',
                  color: isActive ? c.accent : item.highlight ? c.accent : c.text,
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  borderLeft: isActive ? `3px solid ${c.accent}` : '3px solid transparent',
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isLocked && <span style={{ fontSize: '12px' }}>🔒</span>}
              </button>
            );
          })}
        </nav>

        {/* Usage & Subscription */}
        <div style={{ padding: '16px', borderTop: `1px solid ${c.border}` }}>
          <UsageIndicator />
          
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: `${c.accent}11`,
            borderRadius: '10px',
            border: `1px solid ${c.accent}22`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: c.textMuted }}>Current Plan</span>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                background: isPro ? c.accent : c.border,
                color: isPro ? '#000' : c.textMuted,
                fontSize: '11px',
                fontWeight: '700',
              }}>
                {currentTier.name}
              </span>
            </div>
            
            {!isPro ? (
              <button
                onClick={() => setActiveTab('pricing')}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${c.accent}, #fbbf24)`,
                  color: '#000',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🚀 Upgrade Now
              </button>
            ) : (
              <button
                onClick={openCustomerPortal}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${c.border}`,
                  background: 'transparent',
                  color: c.textMuted,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: '40px', height: '40px' },
              },
            }}
          />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Coach'}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.emailAddresses?.[0]?.emailAddress || ''}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh' }}>
        {renderPage()}
      </main>
    </div>
  );
};

// ============================================================================
// DASHBOARD PAGE
// ============================================================================

const DashboardPage = () => {
  const { usageThisMonth, getCurrentTier, getRemainingAnalyses } = usePayment();
  const tier = getCurrentTier();
  const remaining = getRemainingAnalyses();

  const c = {
    bg: '#0a0e17',
    card: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    accent: '#f59e0b',
    success: '#22c55e',
  };

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: c.text, margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
        Welcome to PitchMind 👋
      </h1>
      <p style={{ color: c.textMuted, margin: '0 0 32px 0' }}>
        Upload your game footage to get AI-powered tactical analysis.
      </p>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Analyses This Month', value: usageThisMonth, icon: '📊', color: c.accent },
          { label: 'Remaining', value: remaining, icon: '🎥', color: c.success },
          { label: 'Monthly Limit', value: tier.limits.videoAnalyses, icon: '📈', color: '#3b82f6' },
          { label: 'Current Plan', value: tier.name, icon: '⭐', color: '#8b5cf6' },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '24px',
            background: c.card,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{stat.icon}</div>
            <p style={{ margin: '0 0 4px 0', color: c.textMuted, fontSize: '14px' }}>{stat.label}</p>
            <p style={{ margin: 0, color: stat.color, fontSize: '28px', fontWeight: '700' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Getting Started */}
      <div style={{
        padding: '32px',
        background: `linear-gradient(135deg, ${c.card} 0%, ${c.accent}11 100%)`,
        borderRadius: '16px',
        border: `1px solid ${c.border}`,
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: c.text }}>
          🚀 Getting Started
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}>
          {[
            { step: '1', title: 'Set up your tripod', desc: 'Place at midfield, elevated if possible' },
            { step: '2', title: 'Record the game', desc: 'Wide angle, fixed position, full match' },
            { step: '3', title: 'Upload & analyze', desc: 'Our AI processes in ~10 minutes' },
            { step: '4', title: 'Review insights', desc: 'Get specific, actionable coaching points' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              background: c.bg,
              borderRadius: '12px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: c.accent,
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                flexShrink: 0,
              }}>
                {item.step}
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: c.text }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: '13px', color: c.textMuted }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PRICING PAGE
// ============================================================================

const PricingPage = () => {
  const { createCheckoutSession, getCurrentTier, isAnnual } = usePayment();
  const [billingCycle, setBillingCycle] = useState('annual');
  const currentTier = getCurrentTier();

  const c = {
    bg: '#0a0e17',
    card: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    accent: '#f59e0b',
    success: '#22c55e',
  };

  const tiers = ['base', 'pro', 'elite', 'coach'].map(id => SUBSCRIPTION_TIERS[id]);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: c.text, margin: '0 0 12px 0', fontSize: '32px', fontWeight: '700' }}>
          Upgrade Your Plan
        </h1>
        <p style={{ color: c.textMuted, margin: '0 0 24px 0' }}>
          Unlock more video analyses and premium features
        </p>

        {/* Billing Toggle */}
        <div style={{
          display: 'inline-flex',
          background: c.card,
          borderRadius: '12px',
          padding: '4px',
          border: `1px solid ${c.border}`,
        }}>
          {['monthly', 'annual'].map(cycle => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              style={{
                padding: '10px 24px',
                background: billingCycle === cycle ? c.accent : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: billingCycle === cycle ? '#000' : c.textMuted,
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {cycle === 'monthly' ? 'Monthly' : 'Annual'}
              {cycle === 'annual' && (
                <span style={{
                  padding: '2px 8px',
                  background: billingCycle === 'annual' ? '#000' : c.success,
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: billingCycle === 'annual' ? c.accent : '#fff',
                }}>
                  + FREE Tripod
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
      }}>
        {tiers.map(tier => {
          const price = billingCycle === 'annual' ? tier.launchAnnualPrice : tier.launchPrice;
          const isCurrentPlan = currentTier.id === tier.id;
          const isPopular = tier.popular;

          return (
            <div key={tier.id} style={{
              padding: '32px',
              background: isPopular ? `linear-gradient(135deg, ${c.card} 0%, ${c.accent}11 100%)` : c.card,
              borderRadius: '20px',
              border: isPopular ? `2px solid ${c.accent}` : `1px solid ${c.border}`,
              position: 'relative',
            }}>
              {isPopular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '6px 16px',
                  background: c.accent,
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#000',
                }}>
                  ⭐ MOST POPULAR
                </div>
              )}

              <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0', color: c.text }}>{tier.name}</h3>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 20px 0' }}>{tier.tagline}</p>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800', color: c.accent }}>${price}</span>
                <span style={{ fontSize: '16px', color: c.textMuted }}>/{billingCycle === 'annual' ? 'year' : 'mo'}</span>
              </div>

              {billingCycle === 'annual' && tier.tripod?.description && (
                <div style={{
                  padding: '10px 12px',
                  background: `${c.success}22`,
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: `1px solid ${c.success}33`,
                }}>
                  <span style={{ fontSize: '14px', color: c.success, fontWeight: '600' }}>
                    🎁 {tier.tripod.description}
                  </span>
                </div>
              )}

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                {tier.features.map((f, i) => (
                  <li key={i} style={{
                    padding: '8px 0',
                    fontSize: '14px',
                    color: c.text,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}>
                    <span style={{ color: c.success, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrentPlan && createCheckoutSession(tier.id, billingCycle === 'annual')}
                disabled={isCurrentPlan}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: isCurrentPlan ? c.border : isPopular ? `linear-gradient(135deg, ${c.accent}, #fbbf24)` : 'transparent',
                  border: isCurrentPlan || isPopular ? 'none' : `1px solid ${c.border}`,
                  borderRadius: '10px',
                  color: isCurrentPlan ? c.textMuted : isPopular ? '#000' : c.text,
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isCurrentPlan ? 'default' : 'pointer',
                }}
              >
                {isCurrentPlan ? 'Current Plan' : 'Choose Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// PLACEHOLDER COMPONENTS
// ============================================================================

const VideoAnalysisPlaceholder = () => (
  <div style={{ padding: '32px' }}>
    <h1 style={{ color: '#f1f5f9', margin: '0 0 24px 0' }}>🎥 Video Analysis</h1>
    <p style={{ color: '#94a3b8' }}>Upload a video to get AI-powered tactical analysis.</p>
    {/* Your video analysis component goes here */}
  </div>
);

const SessionsPlaceholder = () => (
  <div style={{ padding: '32px' }}>
    <h1 style={{ color: '#f1f5f9', margin: '0 0 24px 0' }}>📋 Training Sessions</h1>
    <p style={{ color: '#94a3b8' }}>Plan and manage your training sessions.</p>
  </div>
);

const TeamPlaceholder = () => (
  <div style={{ padding: '32px' }}>
    <h1 style={{ color: '#f1f5f9', margin: '0 0 24px 0' }}>👥 Team Management</h1>
    <p style={{ color: '#94a3b8' }}>Manage your team roster and player profiles.</p>
  </div>
);

export default App;
