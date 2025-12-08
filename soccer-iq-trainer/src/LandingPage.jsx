import React, { useState, useEffect } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import logo from './assets/logo.png';

// ============================================================================
// PITCHMIND LANDING PAGE
// Green theme matching dashboard, with Clerk auth
// ============================================================================

// Inline pricing data (no PaymentGate dependency)
const PRICING_TIERS = [
  {
    id: 'base',
    name: 'Base',
    price: 10,
    annualPrice: 100,
    launchPrice: 5,
    launchAnnualPrice: 50,
    tagline: 'Perfect for getting started',
    features: ['5 video analyses/month', 'Single player tracking', 'Basic drill library', 'Decision quiz', 'Performance scores'],
    tripod: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 20,
    annualPrice: 200,
    launchPrice: 10,
    launchAnnualPrice: 100,
    tagline: 'Most popular for serious players',
    popular: true,
    features: ['12 video analyses/month', 'Unlimited player tracking', 'Full drill library', 'Performance trends', 'Compare to pros', 'Priority processing'],
    tripod: { annual: 'basic', description: 'FREE Basic Tripod Kit' },
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 30,
    annualPrice: 300,
    launchPrice: 15,
    launchAnnualPrice: 150,
    tagline: 'For dedicated development',
    features: ['25 video analyses/month', 'Everything in Pro', 'Downloadable clips', 'Formation maker', 'Advanced analytics', 'PDF reports'],
    tripod: { annual: 'standard', description: 'FREE 10ft Tripod + Mount' },
  },
  {
    id: 'coach',
    name: 'Coach',
    price: 40,
    annualPrice: 400,
    launchPrice: 25,
    launchAnnualPrice: 250,
    tagline: 'Complete team management',
    features: ['50 video analyses/month', 'Everything in Elite', 'Team dashboard', 'Roster (25 players)', 'Multi-player compare', 'Parent sharing portal'],
    tripod: { annual: 'pro', description: 'FREE 13ft Pro Tripod' },
  },
];

const LandingPage = () => {
  const { isSignedIn } = useUser();
  const [showAuth, setShowAuth] = useState(null); // 'signin' | 'signup' | null
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isLaunchPricing] = useState(true);

  // Redirect if signed in (handled by App.jsx, but safety check)
  useEffect(() => {
    if (isSignedIn) {
      window.location.reload();
    }
  }, [isSignedIn]);

  // Auth Modal
  if (showAuth) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4">
        <div className="relative bg-[#1a2332] rounded-2xl p-8 max-w-md w-full border border-white/10">
          {/* Close button */}
          <button
            onClick={() => setShowAuth(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>

          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">PM</span>
              </div>
              <span className="text-2xl font-bold text-emerald-400">PitchMind</span>
            </div>
            <p className="text-gray-400">
              {showAuth === 'signin' ? 'Welcome back!' : 'Create your free account'}
            </p>
          </div>

          {/* Clerk Auth */}
          {showAuth === 'signin' ? (
            <SignIn
              routing="hash"
              appearance={{
                elements: {
                  rootBox: { width: '100%' },
                  card: { background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 },
                  headerTitle: { display: 'none' },
                  headerSubtitle: { display: 'none' },
                  formFieldInput: {
                    background: '#0f1419',
                    border: '1px solid #2a3744',
                    color: '#fff',
                    borderRadius: '8px',
                  },
                  formButtonPrimary: {
                    background: '#10b981',
                    borderRadius: '8px',
                  },
                  footerActionLink: { color: '#10b981' },
                  formFieldLabel: { color: '#9ca3af' },
                  dividerLine: { background: '#2a3744' },
                  dividerText: { color: '#9ca3af' },
                  socialButtonsBlockButton: {
                    background: '#0f1419',
                    border: '1px solid #2a3744',
                    color: '#fff',
                  },
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              appearance={{
                elements: {
                  rootBox: { width: '100%' },
                  card: { background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 },
                  headerTitle: { display: 'none' },
                  headerSubtitle: { display: 'none' },
                  formFieldInput: {
                    background: '#0f1419',
                    border: '1px solid #2a3744',
                    color: '#fff',
                    borderRadius: '8px',
                  },
                  formButtonPrimary: {
                    background: '#10b981',
                    borderRadius: '8px',
                  },
                  footerActionLink: { color: '#10b981' },
                  formFieldLabel: { color: '#9ca3af' },
                  dividerLine: { background: '#2a3744' },
                  dividerText: { color: '#9ca3af' },
                  socialButtonsBlockButton: {
                    background: '#0f1419',
                    border: '1px solid #2a3744',
                    color: '#fff',
                  },
                },
              }}
            />
          )}

          {/* Switch mode */}
          <div className="text-center mt-4">
            <span className="text-gray-400 text-sm">
              {showAuth === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => setShowAuth(showAuth === 'signin' ? 'signup' : 'signin')}
              className="text-emerald-400 text-sm font-semibold hover:underline"
            >
              {showAuth === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PM</span>
          </div>
          <span className="text-xl font-bold text-emerald-400">PitchMind</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {['Features', 'How It Works', 'About', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => setShowAuth('signin')} className="text-white text-sm font-medium hover:text-emerald-400 transition-colors">
            Sign In
          </button>
          <button onClick={() => setShowAuth('signup')} className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-[#1a2332] border border-white/10 rounded-full px-4 py-2 mb-6">
              <span>✨</span>
              <span className="text-gray-400 text-sm">AI-Powered Soccer Analysis</span>
              <span className="bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded">New</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Train Your<br />
              <span className="text-emerald-400">Soccer IQ</span><br />
              Like The Pros
            </h1>

            {/* Subheadline */}
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Upload your game footage and let AI analyze every decision. Compare your choices to elite players and unlock your tactical potential.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <button onClick={() => setShowAuth('signup')} className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black px-7 py-4 rounded-xl text-lg font-semibold transition-colors">
                <span>Start Analyzing Free</span>
                <span>→</span>
              </button>
              <button className="flex items-center space-x-2 border border-white/20 hover:border-white/40 text-white px-7 py-4 rounded-xl text-lg font-medium transition-colors">
                <span>▷</span>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {['JM', 'KT', 'AS', 'RB', 'LC'].map((initials, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-[#232f3e] border-2 border-[#0f1419] flex items-center justify-center text-xs font-semibold text-gray-400">
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-amber-400 text-sm">★★★★★</div>
                <div className="text-gray-400 text-sm">Trusted by <strong className="text-white">500+</strong> coaches & players</div>
              </div>
            </div>
          </div>

          {/* Right Content - Demo Card */}
          <div className="flex-1 max-w-lg relative">
            {/* AI Badge */}
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1 z-10">
              <span>✦</span>
              <span>AI Powered</span>
            </div>

            <div className="bg-[#1a2332] rounded-2xl border border-white/10 overflow-hidden">
              {/* Video Preview */}
              <div className="bg-[#232f3e] h-60 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
                  <span className="text-3xl ml-1">▷</span>
                </div>
                <div className="absolute bottom-4 text-gray-400 text-sm">AI Analysis Demo</div>
              </div>

              {/* Analysis Result */}
              <div className="p-4">
                <div className="flex items-center justify-between bg-[#0f1419] rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 text-lg">◎</span>
                    </div>
                    <div>
                      <div className="font-semibold">Decision Analyzed</div>
                      <div className="text-emerald-400 text-sm">Optimal: Through ball to striker</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400">92</div>
                    <div className="text-gray-500 text-xs">IQ Score</div>
                  </div>
                </div>
              </div>

              {/* Track Player Button */}
              <div className="px-4 pb-4 flex justify-center">
                <div className="inline-flex items-center space-x-2 bg-[#232f3e] rounded-full px-5 py-2.5 text-gray-400 text-sm">
                  <span className="text-emerald-400">◉</span>
                  <span>Track Any Player</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-t border-white/10 py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm mb-6">Trusted by coaches from</p>
          <div className="flex flex-wrap justify-center gap-8">
            {['Premier League', 'La Liga', 'MLS', 'Youth Academies'].map(league => (
              <span key={league} className="text-gray-400 font-medium">{league}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to better coaching</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📱', title: 'Record Your Game', desc: "Set up your phone on a tripod at midfield. We'll send you one free with annual plans!" },
              { step: '2', icon: '🤖', title: 'AI Analyzes Everything', desc: 'Our AI tracks every player, identifies key moments, and evaluates every decision made.' },
              { step: '3', icon: '📈', title: 'Get Actionable Insights', desc: 'Receive specific coaching points, compare to pro players, and track improvement over time.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#1a2332] rounded-2xl p-8 border border-white/10 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {item.step}
                </div>
                <div className="text-5xl mb-4 mt-2">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tripod Offer */}
      <section className="bg-[#1a2332] border-y border-white/10 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 px-4 py-2 rounded-full mb-6">
            <span>🎁</span>
            <span className="text-emerald-400 font-semibold text-sm">Annual Subscriber Bonus</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            We'll Send You a <span className="text-emerald-400">Free Tripod</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Good footage = better analysis. Sign up for an annual plan and we'll ship you professional filming equipment at no extra cost.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 text-lg mb-6">Start free. Upgrade when you're ready.</p>

            {/* Billing Toggle */}
            <div className="inline-flex bg-[#1a2332] rounded-xl p-1 border border-white/10">
              {['monthly', 'annual'].map(cycle => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 ${
                    billingCycle === cycle ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{cycle.charAt(0).toUpperCase() + cycle.slice(1)}</span>
                  {cycle === 'annual' && (
                    <span className={`text-xs px-2 py-0.5 rounded ${billingCycle === 'annual' ? 'bg-black text-emerald-400' : 'bg-emerald-500 text-black'}`}>
                      +TRIPOD
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map(tier => {
              const price = billingCycle === 'annual'
                ? (isLaunchPricing ? tier.launchAnnualPrice : tier.annualPrice)
                : (isLaunchPricing ? tier.launchPrice : tier.price);
              const originalPrice = billingCycle === 'annual' ? tier.annualPrice : tier.price;

              return (
                <div
                  key={tier.id}
                  className={`bg-[#1a2332] rounded-2xl p-6 border relative ${
                    tier.popular ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-white/10'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{tier.tagline}</p>

                  <div className="mb-4">
                    {isLaunchPricing && (
                      <span className="text-gray-500 line-through text-lg mr-2">${originalPrice}</span>
                    )}
                    <span className="text-4xl font-extrabold text-emerald-400">${price}</span>
                    <span className="text-gray-400 text-sm">/{billingCycle === 'annual' ? 'year' : 'mo'}</span>
                  </div>

                  {billingCycle === 'annual' && tier.tripod && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
                      <span className="text-emerald-400 text-sm font-semibold">🎁 {tier.tripod.description}</span>
                    </div>
                  )}

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-2 text-gray-300 text-sm">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setShowAuth('signup')}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                      tier.popular
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                        : 'border border-white/20 text-white hover:border-white/40'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#0f1419]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Coaches <span className="text-emerald-400">Love</span> PitchMind
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "I've been coaching rec league for 5 years. PitchMind made me feel like I finally know what I'm doing.", name: 'Mike R.', role: 'U12 Coach, Ohio', avatar: '👨‍🦰' },
              { quote: "My son's travel team improved so much after I started using this. The decision quiz is genius.", name: 'Jennifer T.', role: 'U10 Parent & Assistant Coach', avatar: '👩' },
              { quote: "Worth every penny. I used to spend Sunday nights watching game tape. Now AI does it in 10 minutes.", name: 'David K.', role: 'Club Coach, Texas', avatar: '👨' },
            ].map((t, i) => (
              <div key={i} className="bg-[#1a2332] rounded-2xl p-6 border border-white/10">
                <div className="text-amber-400 mb-4">★★★★★</div>
                <p className="text-gray-300 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{t.avatar}</div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-gray-500 text-sm">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Coach<br /><span className="text-emerald-400">Like You Mean It?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">Start with a free trial. No credit card required.</p>
          <button
            onClick={() => setShowAuth('signup')}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-4 rounded-xl text-lg font-bold transition-colors"
          >
            Get Started Free →
          </button>
          <p className="text-gray-500 text-sm mt-4">Join 500+ coaches already improving their game</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">PM</span>
            </div>
            <span className="text-lg font-semibold text-emerald-400">PitchMind</span>
          </div>
          <div className="text-gray-500 text-sm">© 2025 PitchMind. All rights reserved.</div>
          <div className="flex space-x-6">
            {['Privacy', 'Terms', 'Support'].map(link => (
              <a key={link} href="#" className="text-gray-500 hover:text-white text-sm transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
