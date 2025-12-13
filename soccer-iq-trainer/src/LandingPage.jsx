import React, { useState, useEffect } from 'react';

// Demo Video Component with Simulated Tracking
// Real Video Demo Component with Actual Tracking
const DemoVideoWithTracking = () => {
  const videoRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Auto-play when loaded (muted for browser policies)
    video.play().catch(() => {
      // Auto-play blocked, user will need to click play
      console.log('Auto-play prevented');
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#000',
    }}>
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      >
        {/* Using a temporary public demo URL - replace with your hosted video */}
        <source 
  src="https://res.cloudinary.com/dpj4qupyk/video/upload/v1765608000/demo_ve9du6.mp4" 
  type="video/mp4" 
/>
        Your browser does not support the video tag.
      </video>
      
      {/* Play/Pause overlay */}
      <button
        onClick={togglePlayPause}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(16, 185, 129, 0.9)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 1)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.9)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '16px' }}>{isPlaying ? '⏸' : '▶'}</span>
        {isPlaying ? 'Pause' : 'Play'} Demo
      </button>

      {/* Time indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        color: '#10b981',
        fontFamily: 'monospace',
        fontWeight: '600',
      }}>
        {Math.floor(currentTime)}s
      </div>
    </div>
  );
};
// ============================================================================
// PITCHMIND LANDING PAGE - Professional, Clean Design
// ============================================================================

const LandingPage = ({ onGetStarted, onLogin, onSelectPlan, isSignedIn, logoUrl }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [showModal, setShowModal] = useState(null); // 'privacy' | 'about' | null
  const [billingCycle, setBillingCycle] = useState('annual');
  const [scrolled, setScrolled] = useState(false);

  // Debug: Log props on mount
  useEffect(() => {
    console.log('LandingPage mounted with props:', { 
      hasOnGetStarted: !!onGetStarted, 
      hasOnLogin: !!onLogin, 
      hasOnSelectPlan: !!onSelectPlan,
      isSignedIn 
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'features', 'how-it-works', 'pricing'];
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Pricing tiers
  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: 5, annual: 48 },
      originalPrice: { monthly: 10, annual: 96 },
      description: 'Perfect for individual coaches getting started',
      features: ['5 video analyses/month', 'Basic AI insights', 'Player profiles', 'Email support'],
      tripod: null
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 10, annual: 96 },
      originalPrice: { monthly: 20, annual: 192 },
      description: 'For serious coaches building winning teams',
      features: ['12 video analyses/month', 'Advanced AI coaching', 'Team analytics', 'Drill library access', 'Priority support'],
      tripod: 'Basic Phone Tripod',
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      price: { monthly: 15, annual: 144 },
      originalPrice: { monthly: 30, annual: 288 },
      description: 'Complete toolkit for competitive programs',
      features: ['25 video analyses/month', 'Full AI coach access', 'Custom reports', 'Session planner', 'Multi-team support'],
      tripod: '10ft Professional Tripod'
    },
    {
      id: 'club',
      name: 'Club',
      price: { monthly: 25, annual: 240 },
      originalPrice: { monthly: 40, annual: 384 },
      description: 'Enterprise solution for clubs & academies',
      features: ['50 video analyses/month', 'Unlimited teams', 'API access', 'White-label reports', 'Dedicated account manager'],
      tripod: '13ft Pro Tripod + Carry Case'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0e0d',
      color: '#f8fafc',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Fonts & Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        html { scroll-behavior: smooth; }
        
        ::selection { background: rgba(16, 185, 129, 0.3); }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-in { animation: fadeIn 0.6s ease-out forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }
        
        .gradient-text {
          background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '0 48px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(10, 14, 13, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => scrollTo('home')}
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="PitchMind Logo" 
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          ) : (
            <>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}>
                ⚽
              </div>
              <span style={{ 
                fontSize: '22px', 
                fontWeight: '700',
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}>
                Pitch<span style={{ color: '#10b981' }}>Mind</span>
              </span>
            </>
          )}
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[
            { id: 'features', label: 'Features' },
            { id: 'how-it-works', label: 'How It Works' },
            { id: 'pricing', label: 'Pricing' },
          ].map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: activeSection === item.id ? '#10b981' : '#94a3b8',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '8px 0',
                position: 'relative',
                transition: 'color 0.2s',
              }}
            >
              {item.label}
              {activeSection === item.id && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#10b981',
                  borderRadius: '1px',
                }} />
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowModal('about')}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '8px 0',
              transition: 'color 0.2s',
            }}
          >
            About
          </button>
        </div>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 999 }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('=== SIGN IN BUTTON CLICKED ===');
              console.log('onLogin type:', typeof onLogin);
              if (typeof onLogin === 'function') {
                onLogin();
              } else {
                alert('Sign In handler not connected. Please refresh the page.');
              }
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '10px 20px',
              zIndex: 999,
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('=== GET STARTED BUTTON CLICKED ===');
              console.log('onGetStarted type:', typeof onGetStarted);
              if (typeof onGetStarted === 'function') {
                onGetStarted();
              } else {
                alert('Get Started handler not connected. Please refresh the page.');
              }
            }}
            style={{
              background: '#10b981',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '10px 24px',
              transition: 'all 0.2s',
              zIndex: 999,
              position: 'relative',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 48px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Elements */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1100px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div className="animate-in" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '100px',
            marginBottom: '32px',
          }}>
            <span style={{ 
              width: '6px', 
              height: '6px', 
              background: '#10b981', 
              borderRadius: '50%',
              animation: 'float 2s ease-in-out infinite',
            }} />
            <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '500' }}>
              Launch Pricing — 50% Off Limited Time
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-in delay-1" style={{
            fontSize: 'clamp(42px, 6vw, 72px)',
            fontWeight: '700',
            lineHeight: '1.1',
            letterSpacing: '-0.03em',
            marginBottom: '24px',
          }}>
            AI-Powered Video Analysis
            <br />
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
              for <span className="gradient-text">Smarter</span> Coaching
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-in delay-2" style={{
            fontSize: '18px',
            color: '#94a3b8',
            maxWidth: '560px',
            margin: '0 auto 40px',
            lineHeight: '1.7',
          }}>
            Upload game footage. Our AI identifies every decision point, 
            tracks player development, and gives you pro-level tactical insights.
          </p>

          {/* CTA Buttons */}
          <div className="animate-in delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('Hero Start Free Trial clicked');
                if (typeof onGetStarted === 'function') onGetStarted();
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                zIndex: 10,
                position: 'relative',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
              }}
            >
              Start Free Trial
              <span style={{ fontSize: '18px' }}>→</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('how-it-works');
              }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#e2e8f0',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '16px 32px',
                transition: 'all 0.2s',
                zIndex: 10,
                position: 'relative',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              See How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="animate-in delay-4" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '64px',
            marginTop: '80px',
            paddingTop: '40px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {[
              { value: '500+', label: 'Active Coaches' },
              { value: '15K+', label: 'Videos Analyzed' },
              { value: '4.9', label: 'Average Rating', suffix: '★' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#fff',
                  letterSpacing: '-0.02em',
                }}>
                  {stat.value}{stat.suffix && <span style={{ color: '#10b981' }}>{stat.suffix}</span>}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '120px 48px',
        background: 'linear-gradient(180deg, #0a0e0d 0%, #0d1210 100%)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ 
              color: '#10b981', 
              fontSize: '13px', 
              fontWeight: '600', 
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              Features
            </p>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}>
              Everything You Need to
              <br />
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                Coach with <span className="gradient-text">Confidence</span>
              </span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            {[
              {
                icon: '🎯',
                title: 'Decision Point Analysis',
                description: 'AI identifies every critical moment—passes, shots, defensive choices—and rates player decision-making quality.'
              },
              {
                icon: '📊',
                title: 'Player Development Tracking',
                description: 'Build individual profiles with jersey numbers, track progress over time, and generate professional PDF reports.'
              },
              {
                icon: '🤖',
                title: 'AI Coaching Assistant',
                description: 'Get personalized tactical advice, drill recommendations, and training plans based on your team\'s actual data.'
              },
              {
                icon: '📋',
                title: 'Session Planner',
                description: 'Plan training sessions, add drills from our library, and organize your coaching schedule in one place.'
              },
              {
                icon: '📹',
                title: '10-Second Clip Playback',
                description: 'Click any decision point to instantly watch the 10-second clip. Perfect for player reviews and team meetings.'
              },
              {
                icon: '📈',
                title: 'Team Analytics',
                description: 'Compare your team against elite benchmarks. See position distribution, decision IQ trends, and improvement areas.'
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="hover-lift"
                style={{
                  padding: '32px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  cursor: 'default',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '20px',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#f1f5f9',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: '1.7',
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '120px 48px',
        background: '#0a0e0d',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ 
              color: '#10b981', 
              fontSize: '13px', 
              fontWeight: '600', 
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              How It Works
            </p>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '700',
              letterSpacing: '-0.02em',
            }}>
              From Footage to <span className="gradient-text">Insights</span>
              <br />in Minutes
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {[
              {
                step: '01',
                title: 'Upload Your Game Footage',
                description: 'Record from midfield with your phone on a tripod. Upload the video to PitchMind—we handle files up to 10 minutes.',
                detail: 'Annual subscribers get a free tripod shipped to them.',
              },
              {
                step: '02',
                title: 'Select the Player to Track',
                description: 'Choose a player from your roster or add a new one. Click on them in the video to tell our AI who to follow.',
                detail: 'Track jersey numbers and colors for easy identification.',
              },
              {
                step: '03',
                title: 'AI Analyzes Every Decision',
                description: 'Our AI processes the footage, identifies key decision moments, and rates the quality of each choice.',
                detail: 'Results ready in minutes, not hours.',
              },
              {
                step: '04',
                title: 'Review, Coach, Improve',
                description: 'Watch 10-second clips of each decision point. Use insights in team meetings. Track progress over time.',
                detail: 'Export professional PDF reports for players and parents.',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '40px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: 'rgba(16, 185, 129, 0.2)',
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: '1',
                  minWidth: '80px',
                }}>
                  {item.step}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#f1f5f9',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#94a3b8',
                    lineHeight: '1.7',
                    marginBottom: '8px',
                  }}>
                    {item.description}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#10b981',
                  }}>
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
{/* Live Demo Section - Tracking Visualization */}
<section style={{
  padding: '120px 48px',
  background: 'linear-gradient(180deg, #0a0e0d 0%, #0d1210 100%)',
  position: 'relative',
  overflow: 'hidden',
}}>
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
      <p style={{ 
        color: '#10b981', 
        fontSize: '13px', 
        fontWeight: '600', 
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '16px',
      }}>
        Live Demo
      </p>
      <h2 style={{
        fontSize: 'clamp(32px, 4vw, 48px)',
        fontWeight: '700',
        letterSpacing: '-0.02em',
        marginBottom: '16px',
      }}>
        See <span className="gradient-text">AI Tracking</span> in Action
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#94a3b8',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        Watch how our AI automatically tracks player movement and identifies decision points
      </p>
    </div>

    {/* Video Demo Container */}
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      {/* Placeholder for demo - replace with actual video */}
      <div style={{
        position: 'relative',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        background: 'linear-gradient(135deg, #1a1f1e 0%, #0d1210 100%)',
      }}>
        <DemoVideoWithTracking />
      </div>

      {/* Demo Controls/Info */}
      <div style={{
        padding: '20px 24px',
        background: 'rgba(16, 185, 129, 0.05)',
        borderTop: '1px solid rgba(16, 185, 129, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#10b981',
            borderRadius: '50%',
            animation: 'float 2s ease-in-out infinite',
          }} />
          <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
            AI Tracking Active
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          fontSize: '13px',
          color: '#94a3b8',
        }}>
          <span>
            <strong style={{ color: '#10b981' }}>12</strong> Players Detected
          </span>
          <span>
            <strong style={{ color: '#10b981' }}>3</strong> Decision Points
          </span>
        </div>
      </div>
    </div>

    {/* Feature highlights below demo */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      maxWidth: '900px',
      margin: '40px auto 0',
    }}>
      {[
        { icon: '🎯', label: 'Real-time player tracking', color: '#10b981' },
        { icon: '📊', label: 'Automatic decision detection', color: '#3b82f6' },
        { icon: '⚡', label: 'Instant AI analysis', color: '#f59e0b' },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px' }}>{item.icon}</span>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
</section>
      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '120px 48px',
        background: 'linear-gradient(180deg, #0d1210 0%, #0a0e0d 100%)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ 
              color: '#10b981', 
              fontSize: '13px', 
              fontWeight: '600', 
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              Pricing
            </p>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              marginBottom: '24px',
            }}>
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h2>

            {/* Billing Toggle */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              padding: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['monthly', 'annual'].map(cycle => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  style={{
                    padding: '10px 24px',
                    background: billingCycle === cycle ? '#10b981' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: billingCycle === cycle ? '#fff' : '#94a3b8',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  {cycle === 'monthly' ? 'Monthly' : 'Annual'}
                  {cycle === 'annual' && (
                    <span style={{
                      padding: '2px 8px',
                      background: billingCycle === 'annual' ? 'rgba(255,255,255,0.2)' : 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: billingCycle === 'annual' ? '#fff' : '#10b981',
                    }}>
                      + Free Tripod
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}>
            {tiers.map(tier => {
              const price = billingCycle === 'annual' ? tier.price.annual : tier.price.monthly;
              const originalPrice = billingCycle === 'annual' ? tier.originalPrice.annual : tier.originalPrice.monthly;
              
              return (
                <div
                  key={tier.id}
                  className="hover-lift"
                  style={{
                    padding: '32px 24px',
                    background: tier.popular 
                      ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)'
                      : 'rgba(255,255,255,0.02)',
                    border: tier.popular 
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    position: 'relative',
                  }}
                >
                  {tier.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '4px 12px',
                      background: '#10b981',
                      borderRadius: '100px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#fff',
                    }}>
                      Most Popular
                    </div>
                  )}

                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#f1f5f9',
                  }}>
                    {tier.name}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#64748b',
                    marginBottom: '20px',
                  }}>
                    {tier.description}
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <span style={{
                      fontSize: '14px',
                      color: '#64748b',
                      textDecoration: 'line-through',
                      marginRight: '8px',
                    }}>
                      ${originalPrice}
                    </span>
                    <span style={{
                      fontSize: '36px',
                      fontWeight: '700',
                      color: '#10b981',
                    }}>
                      ${price}
                    </span>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>
                      /{billingCycle === 'annual' ? 'yr' : 'mo'}
                    </span>
                  </div>

                  {billingCycle === 'annual' && tier.tripod && (
                    <div style={{
                      padding: '10px 12px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}>
                      <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '500' }}>
                        🎁 Free: {tier.tripod}
                      </span>
                    </div>
                  )}

                  <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
                    {tier.features.map((feature, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: '14px',
                          color: '#94a3b8',
                          padding: '8px 0',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                        }}
                      >
                        <span style={{ color: '#10b981', fontSize: '14px' }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Pricing button clicked:', tier.id, billingCycle);
                      if (typeof onSelectPlan === 'function') {
                        onSelectPlan(tier.id, billingCycle);
                      } else if (typeof onGetStarted === 'function') {
                        onGetStarted();
                      } else {
                        console.error('No handler available for pricing button');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: tier.popular ? '#10b981' : 'transparent',
                      border: tier.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: tier.popular ? '#fff' : '#e2e8f0',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      zIndex: 10,
                      position: 'relative',
                    }}
                    onMouseOver={e => {
                      if (!tier.popular) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      }
                    }}
                    onMouseOut={e => {
                      if (!tier.popular) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>

          <p style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '14px',
            color: '#64748b',
          }}>
            All plans include 7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '120px 48px',
        background: '#0a0e0d',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            marginBottom: '20px',
          }}>
            Ready to Transform
            <br />
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
              Your <span className="gradient-text">Coaching</span>?
            </span>
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#94a3b8',
            marginBottom: '32px',
          }}>
            Join 500+ coaches already using AI to develop smarter players.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('Bottom CTA clicked');
              if (typeof onGetStarted === 'function') onGetStarted();
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '16px 40px',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s',
              zIndex: 10,
              position: 'relative',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
            }}
          >
            Start Your Free Trial →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px',
        background: '#080a09',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>⚽</div>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>PitchMind</span>
          </div>

          <div style={{ display: 'flex', gap: '32px' }}>
            <button
              type="button"
              onClick={() => setShowModal('privacy')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => e.target.style.color = '#94a3b8'}
              onMouseOut={e => e.target.style.color = '#64748b'}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setShowModal('about')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => e.target.style.color = '#94a3b8'}
              onMouseOut={e => e.target.style.color = '#64748b'}
            >
              About
            </button>
            <a
              href="mailto:support@pitchmind.io"
              style={{
                color: '#64748b',
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => e.target.style.color = '#94a3b8'}
              onMouseOut={e => e.target.style.color = '#64748b'}
            >
              Contact
            </a>
          </div>

          <p style={{ fontSize: '14px', color: '#475569' }}>
            © 2025 PitchMind. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modal: Privacy Policy */}
      {showModal === 'privacy' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div
            onClick={() => setShowModal(null)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
            }}
          />
          <div style={{
            position: 'relative',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '80vh',
            background: '#0d1210',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Privacy Policy</h2>
              <button
                onClick={() => setShowModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{
              padding: '32px',
              overflowY: 'auto',
              maxHeight: 'calc(80vh - 80px)',
              color: '#94a3b8',
              fontSize: '14px',
              lineHeight: '1.8',
            }}>
              <p style={{ marginBottom: '20px' }}>
                <strong style={{ color: '#f1f5f9' }}>Last Updated:</strong> January 2025
              </p>
              
              <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>
                1. Information We Collect
              </h3>
              <p style={{ marginBottom: '16px' }}>
                PitchMind collects information you provide directly, including account information (name, email, password), 
                player profiles (names, jersey numbers, positions), and video content uploaded for analysis. We also 
                automatically collect usage data, device information, and analytics to improve our service.
              </p>

              <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>
                2. How We Use Your Information
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We use your information to provide and improve our AI video analysis service, process payments, 
                communicate with you about your account, and develop new features. Video content is processed by 
                our AI systems to generate tactical insights and is not shared with third parties.
              </p>

              <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>
                3. Data Storage & Security
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Your data is stored securely using industry-standard encryption. Videos are processed on secure 
                servers and can be deleted at any time from your account. We retain account data for the duration 
                of your subscription plus 30 days after cancellation.
              </p>

              <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>
                4. Third-Party Services
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We use Clerk for authentication, Stripe for payment processing, and cloud infrastructure providers 
                for hosting. These services have their own privacy policies governing their use of your data.
              </p>

              <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>
                5. Your Rights
              </h3>
              <p style={{ marginBottom: '16px' }}>
                You can access, update, or delete your personal information at any time through your account settings. 
                You may also request a complete export of your data or permanent deletion by contacting support@pitchmind.io.
              </p>

              <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>
                6. Children's Privacy
              </h3>
              <p style={{ marginBottom: '16px' }}>
                PitchMind is designed for coaches and does not knowingly collect personal information from children 
                under 13. Player profiles are created by coaches/guardians, and we recommend not including sensitive 
                personal information beyond what's necessary for the service.
              </p>

              <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>
                7. Contact Us
              </h3>
              <p style={{ marginBottom: '16px' }}>
                For any privacy-related questions or concerns, please contact us at support@pitchmind.io.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: About the Founder */}
      {showModal === 'about' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div
            onClick={() => setShowModal(null)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
            }}
          />
          <div style={{
            position: 'relative',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '85vh',
            background: '#0d1210',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>About PitchMind</h2>
              <button
                onClick={() => setShowModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{
              padding: '32px',
              overflowY: 'auto',
              maxHeight: 'calc(85vh - 80px)',
            }}>
              {/* Founder Section */}
              <div style={{
                display: 'flex',
                gap: '24px',
                marginBottom: '32px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  flexShrink: 0,
                }}>
                  ⚽
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                    Samuel Mudriyan
                  </h3>
                  <p style={{ color: '#10b981', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
                    Founder & Developer
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7' }}>
                    Engineering student at Boise State University with a passion for soccer and technology. 
                    After years of playing and coaching, I saw how youth coaches lacked access to the same 
                    video analysis tools that professional teams use. PitchMind was born from a simple idea: 
                    every coach deserves AI-powered insights, not just the ones with big budgets.
                  </p>
                </div>
              </div>

              {/* The Story */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  color: '#f1f5f9', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ color: '#10b981' }}>📖</span> The Story
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8', marginBottom: '16px' }}>
                  PitchMind started in 2024 with a simple question: "Why do professional teams have AI 
                  video analysis while youth coaches have nothing?"
                </p>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Existing solutions like Hudl cost $150+/month and require complex setups. Veo cameras 
                  cost $2,000 upfront. Most recreational and travel coaches are volunteers or part-time—they 
                  can't justify these costs, so they rely on memory and gut instinct.
                </p>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>
                  PitchMind was built to change that. Using modern AI, we analyze smartphone footage and 
                  deliver insights that used to require expensive equipment and dedicated analysts. Starting 
                  at just $5/month, any coach can now give their players the feedback they deserve.
                </p>
              </div>

              {/* The Process */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  color: '#f1f5f9', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ color: '#10b981' }}>⚙️</span> How We Built It
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8', marginBottom: '16px' }}>
                  The technology behind PitchMind combines computer vision for player tracking with 
                  large language models for tactical analysis. When you click on a player, our system:
                </p>
                <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8', marginLeft: '20px' }}>
                  <li style={{ marginBottom: '8px' }}>Tracks player movement throughout the video</li>
                  <li style={{ marginBottom: '8px' }}>Identifies key decision moments (passes, shots, defensive actions)</li>
                  <li style={{ marginBottom: '8px' }}>Analyzes what options were available at each moment</li>
                  <li style={{ marginBottom: '8px' }}>Rates decision quality and suggests alternatives</li>
                  <li style={{ marginBottom: '8px' }}>Compiles everything into actionable coaching insights</li>
                </ul>
              </div>

              {/* Mission */}
              <div style={{
                padding: '24px',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                borderRadius: '12px',
              }}>
                <h3 style={{ 
                  color: '#10b981', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                }}>
                  Our Mission
                </h3>
                <p style={{ 
                  color: '#f1f5f9', 
                  fontSize: '16px', 
                  lineHeight: '1.7',
                  fontStyle: 'italic',
                }}>
                  "To give every soccer coach—regardless of budget or experience—the tools to develop 
                  smarter, more confident players."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
