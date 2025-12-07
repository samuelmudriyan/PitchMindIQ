import React, { useState, useEffect } from 'react';
import { SUBSCRIPTION_TIERS } from './PaymentGate';

// ============================================================================
// PITCHMIND LANDING PAGE
// Target: Passionate but inexperienced coaches
// Key offer: Annual subscription = FREE tripod
// ============================================================================

const LandingPage = ({ onGetStarted, onLogin }) => {
  const [billingCycle, setBillingCycle] = useState('annual');
  const [isLaunchPricing] = useState(true); // Toggle for launch pricing
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Colors
  const c = {
    bg: '#0a0e17',
    bgAlt: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    accent: '#f59e0b',
    accentHover: '#fbbf24',
    success: '#22c55e',
    field: '#166534',
  };

  const tiers = ['base', 'pro', 'elite', 'coach'].map(id => SUBSCRIPTION_TIERS[id]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: c.bg, 
      color: c.text,
      fontFamily: "'Outfit', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: 'hidden',
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.6); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slide-up 0.6s ease-out forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: scrollY > 50 ? 'rgba(10, 14, 23, 0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? `1px solid ${c.border}` : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>⚽</span>
          <span style={{ 
            fontSize: '24px', 
            fontWeight: '800',
            background: `linear-gradient(135deg, ${c.accent}, ${c.accentHover})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            PitchMind
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onLogin} style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: c.textMuted,
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}>
            Sign In
          </button>
          <button onClick={onGetStarted} style={{
            padding: '10px 24px',
            background: `linear-gradient(135deg, ${c.accent}, ${c.accentHover})`,
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 32px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${c.accent}15 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${c.success}10 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }} />

        <div style={{ maxWidth: '1200px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Launch Badge */}
          {isLaunchPricing && (
            <div className="slide-up" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: `${c.accent}22`,
              border: `1px solid ${c.accent}44`,
              borderRadius: '50px',
              marginBottom: '24px',
            }}>
              <span style={{ fontSize: '14px' }}>🚀</span>
              <span style={{ fontSize: '14px', color: c.accent, fontWeight: '600' }}>
                Launch Pricing — 50% Off (Limited Time)
              </span>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="slide-up delay-1" style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
            fontWeight: '900',
            lineHeight: '1.1',
            margin: '0 0 24px 0',
            letterSpacing: '-0.02em',
          }}>
            Coach Like a Pro.
            <br />
            <span style={{
              background: `linear-gradient(135deg, ${c.accent}, ${c.accentHover}, ${c.success})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              No Experience Required.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="slide-up delay-2" style={{
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            color: c.textMuted,
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: '1.6',
          }}>
            AI-powered video analysis that shows you exactly what to coach.
            <br />
            Upload game footage. Get tactical insights in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="slide-up delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onGetStarted} style={{
              padding: '18px 40px',
              background: `linear-gradient(135deg, ${c.accent}, ${c.accentHover})`,
              border: 'none',
              borderRadius: '12px',
              color: '#000',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}>
              Start Free Trial
              <span style={{ fontSize: '20px' }}>→</span>
            </button>
            <button style={{
              padding: '18px 40px',
              background: 'transparent',
              border: `2px solid ${c.border}`,
              borderRadius: '12px',
              color: c.text,
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ fontSize: '20px' }}>▶</span>
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="slide-up delay-4" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginTop: '60px',
            flexWrap: 'wrap',
          }}>
            {[
              { value: '500+', label: 'Coaches' },
              { value: '10K+', label: 'Videos Analyzed' },
              { value: '4.9★', label: 'Rating' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: c.accent }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: c.textMuted }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section style={{
        padding: '100px 32px',
        background: c.bgAlt,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '800', margin: '0 0 16px 0' }}>
              You Know Soccer. Now <span style={{ color: c.accent }}>See It.</span>
            </h2>
            <p style={{ fontSize: '18px', color: c.textMuted, maxWidth: '600px', margin: '0 auto' }}>
              You've watched a thousand games. But do you see what De Bruyne sees? PitchMind shows you.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px',
          }}>
            {/* Before Card */}
            <div style={{
              padding: '40px',
              background: '#1a1a2e',
              borderRadius: '20px',
              border: `1px solid #ef444433`,
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>😓</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0', color: '#ef4444' }}>
                Without PitchMind
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Spend hours rewatching game footage',
                  '"I know something\'s wrong but can\'t explain it"',
                  'Kids repeat the same mistakes every game',
                  'Parents ask why Johnny isn\'t improving',
                  'Feel like a volunteer, not a coach',
                ].map((item, i) => (
                  <li key={i} style={{
                    padding: '12px 0',
                    borderBottom: i < 4 ? `1px solid ${c.border}` : 'none',
                    color: c.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <span style={{ color: '#ef4444' }}>✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After Card */}
            <div style={{
              padding: '40px',
              background: `linear-gradient(135deg, ${c.field}22 0%, ${c.success}11 100%)`,
              borderRadius: '20px',
              border: `1px solid ${c.success}33`,
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏆</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0', color: c.success }}>
                With PitchMind
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'AI analyzes footage in minutes, not hours',
                  '"Sarah, you had 3 passing options here"',
                  'Players learn WHY, not just what',
                  'Show parents real improvement data',
                  'Coach with confidence and credibility',
                ].map((item, i) => (
                  <li key={i} style={{
                    padding: '12px 0',
                    borderBottom: i < 4 ? `1px solid ${c.border}` : 'none',
                    color: c.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <span style={{ color: c.success }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '100px 32px', background: c.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '800', margin: '0 0 16px 0' }}>
              Three Steps to <span style={{ color: c.accent }}>Better Coaching</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
          }}>
            {[
              { step: '1', icon: '📱', title: 'Record the Game', desc: 'Set up your phone on a tripod at midfield. Press record. That\'s it.' },
              { step: '2', icon: '🤖', title: 'AI Does the Work', desc: 'Upload the video. Our AI tracks every player, every pass, every decision.' },
              { step: '3', icon: '📊', title: 'Coach with Clarity', desc: 'Get specific insights: "At 23:15, Marcus had 3 options. He chose the worst one."' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '40px',
                background: c.card,
                borderRadius: '20px',
                border: `1px solid ${c.border}`,
                textAlign: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '40px',
                  background: `linear-gradient(135deg, ${c.accent}, ${c.accentHover})`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: '#000',
                }}>
                  {item.step}
                </div>
                <div style={{ fontSize: '56px', marginBottom: '20px', marginTop: '10px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 12px 0' }}>{item.title}</h3>
                <p style={{ fontSize: '16px', color: c.textMuted, margin: 0, lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tripod Offer Section */}
      <section style={{
        padding: '100px 32px',
        background: `linear-gradient(135deg, ${c.accent}15 0%, ${c.bgAlt} 50%, ${c.success}10 100%)`,
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: `${c.success}22`,
            border: `1px solid ${c.success}44`,
            borderRadius: '50px',
            marginBottom: '24px',
          }}>
            <span style={{ fontSize: '14px' }}>🎁</span>
            <span style={{ fontSize: '14px', color: c.success, fontWeight: '600' }}>
              Annual Subscribers Only
            </span>
          </div>

          <h2 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 20px 0' }}>
            We'll Send You a <span style={{ color: c.accent }}>Free Tripod</span>
          </h2>
          <p style={{ fontSize: '20px', color: c.textMuted, maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            The #1 problem with game footage? Shaky, low-angle video that's impossible to analyze.
            <br /><strong style={{ color: c.text }}>We solve that by shipping you the right equipment.</strong>
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}>
            {[
              { tier: 'Pro Annual', tripod: 'Basic Tripod Kit', value: '$30', icon: '📷' },
              { tier: 'Elite Annual', tripod: '10ft Tripod + Mount', value: '$100', icon: '📹' },
              { tier: 'Coach Annual', tripod: '13ft Pro Tripod + Case', value: '$180', icon: '🎬' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '24px',
                background: c.card,
                borderRadius: '16px',
                border: `1px solid ${c.border}`,
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{item.icon}</div>
                <div style={{ fontSize: '14px', color: c.textMuted, marginBottom: '4px' }}>{item.tier}</div>
                <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{item.tripod}</div>
                <div style={{ fontSize: '14px', color: c.success }}>FREE (${item.value} value)</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '14px', color: c.textMuted }}>
            Tripod ships within 5-7 business days of subscription confirmation.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '100px 32px', background: c.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '800', margin: '0 0 16px 0' }}>
              Simple, <span style={{ color: c.accent }}>Affordable</span> Pricing
            </h2>
            <p style={{ fontSize: '18px', color: c.textMuted, marginBottom: '24px' }}>
              Start free. Upgrade when you're ready.
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
                  {cycle === 'annual' && <span style={{
                    padding: '2px 8px',
                    background: billingCycle === 'annual' ? '#000' : c.success,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: billingCycle === 'annual' ? c.accent : '#fff',
                  }}>
                    + FREE Tripod
                  </span>}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {tiers.map(tier => {
              const price = billingCycle === 'annual'
                ? (isLaunchPricing ? tier.launchAnnualPrice : tier.annualPrice)
                : (isLaunchPricing ? tier.launchPrice : tier.price);
              const originalPrice = billingCycle === 'annual' ? tier.annualPrice : tier.price;
              const isPopular = tier.popular;

              return (
                <div key={tier.id} style={{
                  padding: '32px',
                  background: isPopular ? `linear-gradient(135deg, ${c.card} 0%, ${c.accent}11 100%)` : c.card,
                  borderRadius: '20px',
                  border: isPopular ? `2px solid ${c.accent}` : `1px solid ${c.border}`,
                  position: 'relative',
                  transform: isPopular ? 'scale(1.02)' : 'scale(1)',
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

                  <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>{tier.name}</h3>
                  <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 20px 0' }}>{tier.tagline}</p>

                  <div style={{ marginBottom: '20px' }}>
                    {isLaunchPricing && (
                      <span style={{
                        fontSize: '18px',
                        color: c.textMuted,
                        textDecoration: 'line-through',
                        marginRight: '8px',
                      }}>
                        ${originalPrice}
                      </span>
                    )}
                    <span style={{ fontSize: '48px', fontWeight: '800', color: c.accent }}>${price}</span>
                    <span style={{ fontSize: '16px', color: c.textMuted }}>
                      /{billingCycle === 'annual' ? 'year' : 'mo'}
                    </span>
                  </div>

                  {/* Tripod Badge */}
                  {billingCycle === 'annual' && tier.tripod?.annual && tier.tripod.annual !== 'discount' && (
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

                  <button onClick={onGetStarted} style={{
                    width: '100%',
                    padding: '14px',
                    background: isPopular ? `linear-gradient(135deg, ${c.accent}, ${c.accentHover})` : 'transparent',
                    border: isPopular ? 'none' : `1px solid ${c.border}`,
                    borderRadius: '10px',
                    color: isPopular ? '#000' : c.text,
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}>
                    {isPopular ? 'Get Started' : 'Choose Plan'}
                  </button>
                </div>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: c.textMuted }}>
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section style={{ padding: '100px 32px', background: c.bgAlt }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 16px 0' }}>
              Why Coaches Choose <span style={{ color: c.accent }}>PitchMind</span>
            </h2>
          </div>

          <div style={{
            background: c.card,
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${c.border}`,
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: c.bgAlt }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: c.textMuted }}>Feature</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '700', color: c.accent }}>PitchMind</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '600', color: c.textMuted }}>Hudl</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '600', color: c.textMuted }}>Veo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Starting Price', pitchmind: '$10/mo', hudl: '$150/mo', veo: '$2,000 + $100/mo' },
                  { feature: 'AI Tactical Analysis', pitchmind: '✓', hudl: '✗', veo: 'Basic' },
                  { feature: 'Decision Training Quiz', pitchmind: '✓', hudl: '✗', veo: '✗' },
                  { feature: 'Compare to Pro Players', pitchmind: '✓', hudl: '✗', veo: '✗' },
                  { feature: 'Hardware Required', pitchmind: 'Your Phone', hudl: 'Your Phone', veo: '$2,000 Camera' },
                  { feature: 'Free Tripod', pitchmind: '✓ (Annual)', hudl: '✗', veo: '✗' },
                  { feature: 'Setup Time', pitchmind: '5 min', hudl: '30 min', veo: '30 min' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${c.border}` }}>
                    <td style={{ padding: '14px 20px', fontWeight: '500' }}>{row.feature}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', color: row.pitchmind.includes('✓') ? c.success : c.accent, fontWeight: '600' }}>{row.pitchmind}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', color: row.hudl === '✗' ? '#ef4444' : c.textMuted }}>{row.hudl}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', color: row.veo === '✗' ? '#ef4444' : c.textMuted }}>{row.veo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 32px', background: c.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '800', margin: 0 }}>
              Coaches <span style={{ color: c.accent }}>Love</span> PitchMind
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px',
          }}>
            {[
              { quote: "I've been coaching rec league for 5 years. PitchMind made me feel like I finally know what I'm doing.", name: 'Mike R.', role: 'U12 Coach, Ohio', avatar: '👨‍🦰' },
              { quote: "My son's travel team improved so much after I started using this. The decision quiz is genius.", name: 'Jennifer T.', role: 'U10 Parent & Assistant Coach', avatar: '👩' },
              { quote: "Worth every penny. I used to spend Sunday nights watching game tape. Now AI does it in 10 minutes.", name: 'David K.', role: 'Club Coach, Texas', avatar: '👨' },
            ].map((t, i) => (
              <div key={i} style={{
                padding: '32px',
                background: c.card,
                borderRadius: '16px',
                border: `1px solid ${c.border}`,
              }}>
                <div style={{ display: 'flex', marginBottom: '16px' }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: c.accent, fontSize: '20px' }}>★</span>)}
                </div>
                <p style={{ fontSize: '16px', color: c.text, lineHeight: '1.7', margin: '0 0 24px 0', fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '36px' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{t.name}</div>
                    <div style={{ fontSize: '14px', color: c.textMuted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '100px 32px',
        background: `linear-gradient(135deg, ${c.accent}22 0%, ${c.bg} 50%, ${c.success}11 100%)`,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 20px 0' }}>
            Ready to Coach<br /><span style={{ color: c.accent }}>Like You Mean It?</span>
          </h2>
          <p style={{ fontSize: '20px', color: c.textMuted, marginBottom: '40px' }}>
            Start with a free trial. No credit card required.
          </p>
          <button onClick={onGetStarted} style={{
            padding: '20px 48px',
            background: `linear-gradient(135deg, ${c.accent}, ${c.accentHover})`,
            border: 'none',
            borderRadius: '14px',
            color: '#000',
            fontSize: '20px',
            fontWeight: '700',
            cursor: 'pointer',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>
            Get Started Free →
          </button>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '20px' }}>
            Join 500+ coaches already improving their game
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 32px 40px',
        background: c.bgAlt,
        borderTop: `1px solid ${c.border}`,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>⚽</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: c.accent }}>PitchMind</span>
            </div>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {['Privacy', 'Terms', 'Support', 'Contact'].map(link => (
                <a key={link} href="#" style={{ color: c.textMuted, textDecoration: 'none', fontSize: '14px' }}>
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: `1px solid ${c.border}`,
            textAlign: 'center',
            color: c.textMuted,
            fontSize: '14px',
          }}>
            © 2025 PitchMind. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
