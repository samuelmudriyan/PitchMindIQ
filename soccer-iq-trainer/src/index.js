import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import './index.css';
import PitchMindApp from './PitchMindApp';
import reportWebVitals from './reportWebVitals';

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing REACT_APP_CLERK_PUBLISHABLE_KEY");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <SignedIn>
        <PitchMindApp />
      </SignedIn>
      <SignedOut>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0a0a0a',
          color: 'white'
        }}>
          <h1 style={{ marginBottom: '20px' }}>⚽ PitchMind</h1>
          <p style={{ marginBottom: '30px' }}>Sign in to analyze your game footage</p>
          <SignInButton mode="modal">
            <button style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </ClerkProvider>
  </React.StrictMode>
);

reportWebVitals();
