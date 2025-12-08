import React, { useState, useEffect } from 'react';
import { useUser, SignIn, SignUp } from '@clerk/clerk-react';
import LandingPage from './LandingPage';
import PitchMindApp from './PitchMindApp';

// ============================================================================
// APP WRAPPER - Handles authentication + Stripe payment routing
// ============================================================================

// Your backend URL (Railway)
const API_BASE = 'https://pitchmind-backend-production-483d.up.railway.app';

// GOD MODE - Add your Clerk user ID here to bypass payment
const GOD_MODE_USERS = [
  // Add your Clerk user ID here (find it in Clerk Dashboard > Users)
  // Example: 'user_2abc123def456'
];

// Custom Clerk appearance
const clerkAppearance = {
  variables: {
    colorPrimary: '#10b981',
    colorBackground: '#1a2332',
    colorInputBackground: '#0d1117',
    colorInputText: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: '#94a3b8',
    colorTextOnPrimaryBackground: '#ffffff',
    colorDanger: '#ef4444',
    colorSuccess: '#22c55e',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    borderRadius: '10px',
  },
  elements: {
    card: {
      backgroundColor: '#1a2332',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    headerTitle: { color: '#ffffff', fontSize: '24px', fontWeight: '700' },
    headerSubtitle: { color: '#94a3b8' },
    socialButtonsBlockButton: {
      backgroundColor: '#0d1117',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
    },
    socialButtonsBlockButtonText: { color: '#ffffff' },
    dividerLine: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    dividerText: { color: '#64748b' },
    formFieldLabel: { color: '#e2e8f0', fontWeight: '500' },
    formFieldInput: {
      backgroundColor: '#0d1117',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
    },
    formButtonPrimary: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      fontWeight: '600',
    },
    footerActionLink: { color: '#10b981' },
    footerActionText: { color: '#94a3b8' },
  },
  layout: {
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
  },
};

function App() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signUp');
  const [selectedPlan, setSelectedPlan] = useState(null); // { tier: 'pro', cycle: 'annual' }
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(null); // null = loading, true/false
  const GOD_MODE_USERS = [
  'user_36YF20ErXqkS9KY1OHRgFAFUMdk', 
];
  // Check for Stripe success/cancel URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeSuccess = urlParams.get('stripe_success');
    const stripeCanceled = urlParams.get('stripe_canceled');
    
    if (stripeSuccess === 'true') {
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
      // Subscription successful - the webhook will handle updating the database
    }
    
    if (stripeCanceled === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
      // User canceled - clear selected plan
      setSelectedPlan(null);
    }
  }, []);

  // Check subscription status when user signs in
  useEffect(() => {
    if (isSignedIn && user) {
      checkSubscriptionStatus();
    }
  }, [isSignedIn, user]);

  // After sign-in, if a plan was selected, redirect to Stripe (skip for god mode)
  useEffect(() => {
    const isGodModeUser = user && GOD_MODE_USERS.includes(user.id);
    if (isSignedIn && selectedPlan && !isRedirectingToStripe && hasActiveSubscription === false && !isGodModeUser) {
      redirectToStripeCheckout();
    }
  }, [isSignedIn, selectedPlan, hasActiveSubscription, user]);

  // Check if user has active subscription
  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/subscription/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasActiveSubscription(data.hasActiveSubscription);
      } else {
        // If endpoint doesn't exist yet, assume no subscription
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    }
  };

  // Redirect to Stripe Checkout
  const redirectToStripeCheckout = async () => {
    if (!selectedPlan || isRedirectingToStripe) return;
    
    setIsRedirectingToStripe(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          planTier: selectedPlan.tier,
          billingCycle: selectedPlan.cycle,
          successUrl: `${window.location.origin}?stripe_success=true`,
          cancelUrl: `${window.location.origin}?stripe_canceled=true`,
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      alert('Unable to start checkout. Please try again.');
      setIsRedirectingToStripe(false);
      setSelectedPlan(null);
    }
  };

  // Handle plan selection from landing page
  const handleSelectPlan = (tier, cycle) => {
    setSelectedPlan({ tier, cycle });
    
    if (isSignedIn) {
      // Already signed in - go straight to Stripe
      if (hasActiveSubscription) {
        // Already has subscription - go to billing portal or show message
        alert('You already have an active subscription. Go to Settings to manage your plan.');
        setSelectedPlan(null);
      } else {
        redirectToStripeCheckout();
      }
    } else {
      // Not signed in - show auth modal
      setAuthMode('signUp');
      setShowAuth(true);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0f0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          ⚽
        </div>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading PitchMind...</p>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}</style>
      </div>
    );
  }

  // Redirecting to Stripe
  if (isRedirectingToStripe) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0f0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          💳
        </div>
        <p style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: '500' }}>
          Redirecting to secure checkout...
        </p>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          You'll be taken to Stripe to complete your payment
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}</style>
      </div>
    );
  }

  // Check if user is in god mode
  const isGodMode = isSignedIn && user && GOD_MODE_USERS.includes(user.id);

  // Signed in with active subscription OR god mode - show main app
  if (isSignedIn && (hasActiveSubscription === true || isGodMode)) {
    return <PitchMindApp />;
  }

  // Signed in but checking subscription or no subscription yet
  if (isSignedIn && hasActiveSubscription === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0f0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          ⚽
        </div>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Checking subscription...</p>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}</style>
      </div>
    );
  }

  // Signed in but no subscription - show landing page to pick a plan
  // OR not signed in - show landing page
  return (
    <>
      <LandingPage 
        onGetStarted={() => {
          console.log('App.jsx: onGetStarted called, setting showAuth=true, authMode=signUp');
          setAuthMode('signUp');
          setShowAuth(true);
        }}
        onLogin={() => {
          console.log('App.jsx: onLogin called, setting showAuth=true, authMode=signIn');
          setAuthMode('signIn');
          setShowAuth(true);
        }}
        onSelectPlan={handleSelectPlan}
        isSignedIn={isSignedIn}
        logoUrl="/logo.png"  // Add your logo to public folder, or use a full URL
      />

      {/* Auth Modal */}
      {showAuth && !isSignedIn && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div 
            onClick={() => {
              setShowAuth(false);
              if (!isSignedIn) setSelectedPlan(null);
            }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
            }}
          />
          
          <div style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '440px',
          }}>
            <button
              onClick={() => {
                setShowAuth(false);
                if (!isSignedIn) setSelectedPlan(null);
              }}
              style={{
                position: 'absolute',
                top: '-48px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: '20px',
              }}
            >
              ✕
            </button>

            {/* Show selected plan info */}
            {selectedPlan && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <p style={{ color: '#10b981', fontSize: '14px', margin: 0 }}>
                  Selected: <strong>{selectedPlan.tier.charAt(0).toUpperCase() + selectedPlan.tier.slice(1)}</strong> ({selectedPlan.cycle})
                </p>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>
                  You'll complete payment after signing up
                </p>
              </div>
            )}

            {authMode === 'signUp' ? (
              <SignUp 
                appearance={clerkAppearance}
                routing="virtual"
                signInUrl="#"
                afterSignUpUrl="/"
                redirectUrl="/"
              />
            ) : (
              <SignIn 
                appearance={clerkAppearance}
                routing="virtual"
                signUpUrl="#"
                afterSignInUrl="/"
                redirectUrl="/"
              />
            )}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              {authMode === 'signUp' ? (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthMode('signIn')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#10b981',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('signUp')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#10b981',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
