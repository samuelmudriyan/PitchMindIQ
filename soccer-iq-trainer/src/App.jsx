import React, { useState } from 'react';
import { useUser, SignIn, SignUp } from '@clerk/clerk-react';
import PitchMindApp from './PitchMindApp';
import LandingPage from './LandingPage';

// Simple wrapper that shows Landing Page or Dashboard based on auth
export default function App() {
  const { isSignedIn, isLoaded } = useUser();
  const [showAuth, setShowAuth] = useState(null); // 'signin' | 'signup' | null

  // Loading state
  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0f0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            ⚽
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading PitchMind...</p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // Signed in = show dashboard
  if (isSignedIn) {
    return <PitchMindApp />;
  }

  // Not signed in = show landing page with auth modals
  return (
    <>
      <LandingPage 
        onGetStarted={() => setShowAuth('signup')}
        onLogin={() => setShowAuth('signin')}
      />
      
      {/* Auth Modal */}
      {showAuth && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          {/* Backdrop */}
          <div 
            onClick={() => setShowAuth(null)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
            }}
          />
          
          {/* Modal Content */}
          <div style={{
            position: 'relative',
            background: '#0f1419',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px',
            maxWidth: '440px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowAuth(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: '18px',
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px',
              }}>
                ⚽
              </div>
              <h2 style={{
                color: '#fff',
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 8px 0',
              }}>
                {showAuth === 'signin' ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                {showAuth === 'signin' 
                  ? 'Sign in to access your dashboard' 
                  : 'Create your free account'}
              </p>
            </div>

            {/* Clerk Component */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
            }}>
              {showAuth === 'signin' ? (
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: { width: '100%' },
                      card: { 
                        background: 'transparent', 
                        boxShadow: 'none',
                        border: 'none',
                      },
                      headerTitle: { display: 'none' },
                      headerSubtitle: { display: 'none' },
                      socialButtonsBlockButton: {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      },
                      formFieldInput: {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      },
                      formButtonPrimary: {
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                      },
                      footerActionLink: {
                        color: '#10b981',
                      },
                    },
                  }}
                />
              ) : (
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: { width: '100%' },
                      card: { 
                        background: 'transparent', 
                        boxShadow: 'none',
                        border: 'none',
                      },
                      headerTitle: { display: 'none' },
                      headerSubtitle: { display: 'none' },
                      socialButtonsBlockButton: {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      },
                      formFieldInput: {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      },
                      formButtonPrimary: {
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                      },
                      footerActionLink: {
                        color: '#10b981',
                      },
                    },
                  }}
                />
              )}
            </div>

            {/* Toggle */}
            <div style={{
              textAlign: 'center',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                {showAuth === 'signin' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                onClick={() => setShowAuth(showAuth === 'signin' ? 'signup' : 'signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {showAuth === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
