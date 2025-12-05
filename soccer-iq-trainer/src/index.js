import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PitchMindApp from './PitchMindApp';
import LandingPage from './LandingPage';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing REACT_APP_CLERK_PUBLISHABLE_KEY");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <PitchMindApp />
      </SignedIn>
    </ClerkProvider>
  </React.StrictMode>
);
