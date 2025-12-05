import React, { useState, useEffect, useRef } from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import {
  Play, Brain, Target, TrendingUp, Video, Zap, Users,
  ChevronRight, Star, Check, ArrowRight, Menu, X,
  Shield, Clock, BarChart3, Award, Sparkles
} from 'lucide-react';
import logo from './assets/logo.png';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const Logo = ({ size = 'md' }) => {
    const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
    return <img src={logo} alt="PitchMind" className={`${sizes[size]} object-contain`} />;
  };

  const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !isVisible) setIsVisible(true);
      }, { threshold: 0.5 });
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, [isVisible]);

    useEffect(() => {
      if (!isVisible) return;
      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white overflow-x-hidden">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); } 50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes particle { 0%, 100% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 50% { transform: translateY(-100px) translateX(50px); } }
        .scroll-animate { opacity: 0; transform: translateY(40px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .scroll-animate.animate-in { opacity: 1; transform: translateY(0); }
        .gradient-text { background: linear-gradient(90deg, #10b981, #34d399, #fbbf24, #10b981); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradient-shift 4s ease infinite; }
        .card-hover { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15); }
        .btn-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-marquee { animation: marquee 25s linear infinite; }
        .stagger-1 { transition-delay: 0.1s; } .stagger-2 { transition-delay: 0.2s; } .stagger-3 { transition-delay: 0.3s; }
        .stagger-4 { transition-delay: 0.4s; } .stagger-5 { transition-delay: 0.5s; } .stagger-6 { transition-delay: 0.6s; }
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" style={{ transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)` }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px]" style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-emerald-400/40 rounded-full" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `particle ${8 + Math.random() * 10}s ease-in-out infinite`, animationDelay: `${Math.random() * 5}s` }} />
        ))}
      </div>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-[#0a0f0d]/90 backdrop-blur-xl border-b border-white/10 py-3' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-110"><Logo size="md" /></div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">PitchMind</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How It Works', 'About', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="relative text-gray-300 hover:text-white transition-colors group">
                  {item}<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <SignInButton mode="modal"><button className="px-5 py-2.5 text-gray-300 hover:text-white transition-all font-medium hover:bg-white/5 rounded-full">Sign In</button></SignInButton>
              <SignUpButton mode="modal"><button className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105">Get Started Free</button></SignUpButton>
            </div>
            <button className="md:hidden p-2 text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0f0d]/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-4">
            {['Features', 'How It Works', 'About', 'Pricing'].map((item) => (<a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="block text-gray-300 hover:text-white py-2">{item}</a>))}
            <div className="pt-4 space-y-3">
              <SignInButton mode="modal"><button className="w-full py-3 border border-white/20 rounded-lg text-white font-medium">Sign In</button></SignInButton>
              <SignUpButton mode="modal"><button className="w-full py-3 bg-emerald-500 rounded-lg text-white font-semibold">Get Started Free</button></SignUpButton>
            </div>
          </div>
        )}
      </nav>

      <section ref={heroRef} className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-sm text-gray-300">AI-Powered Soccer Analysis</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">New</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Train Your<span className="block gradient-text">Soccer IQ</span>Like The Pros
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                Upload your game footage and let AI analyze every decision. Compare your choices to elite players and unlock your tactical potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <SignUpButton mode="modal">
                  <button className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full font-semibold text-lg transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center space-x-2 btn-glow hover:scale-105">
                    <span>Start Analyzing Free</span><ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </SignUpButton>
                <button className="group px-8 py-4 border border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-white rounded-full font-semibold text-lg transition-all flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5 group-hover:scale-125 transition-transform" /><span>Watch Demo</span>
                </button>
              </div>
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-3">
                  {['JM', 'KT', 'AS', 'RB', 'LC'].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0f0d] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold hover:scale-110 hover:z-10 transition-transform cursor-pointer">{initials}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center space-x-1">{[1,2,3,4,5].map((i) => (<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />))}</div>
                  <p className="text-sm text-gray-400">Trusted by <span className="text-white font-semibold">500+</span> coaches & players</p>
                </div>
              </div>
            </div>

            <div className="relative" style={{ transform: `perspective(1000px) rotateY(${mousePosition.x * 0.3}deg) rotateX(${-mousePosition.y * 0.3}deg)` }}>
              <div className="relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-2 shadow-2xl hover:border-emerald-500/30 transition-colors duration-500">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 animate-[float_3s_ease-in-out_infinite]">
                        <Play className="w-8 h-8 text-emerald-400 ml-1" />
                      </div>
                      <p className="text-gray-400">AI Analysis Demo</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Decision Analyzed</p>
                          <p className="text-emerald-400 text-xs">Optimal: Through ball to striker</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-400">92</p>
                        <p className="text-xs text-gray-400">IQ Score</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-[float_4s_ease-in-out_infinite]">
                <span className="flex items-center space-x-1"><Zap className="w-4 h-4" /><span>AI Powered</span></span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full animate-[float_5s_ease-in-out_infinite]">
                <span className="flex items-center space-x-2 text-sm"><Target className="w-4 h-4 text-emerald-400" /><span>Track Any Player</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-12 opacity-50">
            <p className="text-gray-400 text-sm">Trusted by coaches from</p>
            {['Premier League', 'La Liga', 'MLS', 'Youth Academies'].map((league) => (
              <span key={league} className="text-gray-500 font-semibold">{league}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">Everything You Need to<br /><span className="gradient-text">Elevate Your Game</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Professional-grade analysis tools that were once only available to elite clubs, now in your hands.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Video, title: 'Video Upload & Analysis', desc: 'Upload any match footage and our AI will track player movements and identify key decision moments.', color: 'emerald' },
              { icon: Brain, title: 'AI Decision Analysis', desc: 'Get instant feedback on every decision with detailed explanations of optimal plays.', color: 'amber' },
              { icon: Target, title: 'Player Tracking', desc: 'Click on any player to track their movements and analyze their decision-making throughout the game.', color: 'blue' },
              { icon: BarChart3, title: 'Performance Metrics', desc: 'Track your Decision IQ score over time and see measurable improvement in your tactical understanding.', color: 'purple' },
              { icon: Users, title: 'Elite Comparisons', desc: 'Compare your decisions to what top professionals would do in the same situations.', color: 'pink' },
              { icon: Award, title: 'Training Drills', desc: 'Access a library of drills designed to improve specific aspects of your tactical awareness.', color: 'orange' },
            ].map((feature, i) => (
              <div key={i} className={`scroll-animate stagger-${i + 1} card-hover bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-${feature.color}-500/30`}>
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">Three Steps to<br /><span className="gradient-text">Smarter Play</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Your Footage', desc: 'Upload any match video - from professional broadcasts to phone recordings.', icon: Video },
              { step: '02', title: 'Select a Player', desc: 'Click on the player you want to analyze. Our AI will track them throughout the video.', icon: Target },
              { step: '03', title: 'Learn & Improve', desc: 'Review decision points, see what elite players would do, and track your improvement.', icon: TrendingUp },
            ].map((item, i) => (
              <div key={i} className={`scroll-animate stagger-${i + 1} text-center`}>
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="scroll-animate">
              <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Stats That Matter</span>
              <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-8">Real Results from<br /><span className="gradient-text">Real Players</span></h2>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: 500, suffix: '+', label: 'Active Users' },
                  { value: 10000, suffix: '+', label: 'Videos Analyzed' },
                  { value: 23, suffix: '%', label: 'Avg. IQ Improvement' },
                  { value: 4.9, suffix: '', label: 'User Rating' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-4xl font-bold text-emerald-400"><AnimatedCounter end={stat.value} suffix={stat.suffix} /></p>
                    <p className="text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="scroll-animate stagger-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex items-center space-x-1 mb-4">{[1,2,3,4,5].map((i) => (<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />))}</div>
                <p className="text-lg text-gray-300 mb-6">"PitchMind has completely changed how I analyze my game. The AI insights are incredibly accurate and have helped me make better decisions on the pitch. My coach has noticed a real improvement in my positioning and awareness."</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold">JM</div>
                  <div>
                    <p className="font-semibold text-white">James Miller</p>
                    <p className="text-gray-400 text-sm">Youth Academy Player, U17</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">Start Free,<br /><span className="gradient-text">Upgrade Anytime</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['3 video uploads/month', 'Basic AI analysis', 'Decision IQ tracking', 'Community access'], cta: 'Get Started', popular: false },
              { name: 'Pro', price: '$19', period: '/month', features: ['Unlimited uploads', 'Advanced AI insights', 'Elite player comparisons', 'Priority support', 'Export reports'], cta: 'Start Pro Trial', popular: true },
              { name: 'Team', price: '$49', period: '/month', features: ['Everything in Pro', 'Team management', 'Multi-player analysis', 'Custom drills', 'API access'], cta: 'Contact Sales', popular: false },
            ].map((plan, i) => (
              <div key={i} className={`scroll-animate stagger-${i + 1} relative bg-white/5 border rounded-2xl p-8 ${plan.popular ? 'border-emerald-500/50 scale-105' : 'border-white/10'}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm font-semibold px-4 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline space-x-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center space-x-3 text-gray-300">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" /><span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <SignUpButton mode="modal">
                  <button className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'border border-white/20 hover:border-emerald-500/50 text-white'}`}>{plan.cta}</button>
                </SignUpButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center scroll-animate">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Play<br /><span className="gradient-text">Smarter?</span></h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of players and coaches using AI to elevate their game.</p>
          <SignUpButton mode="modal">
            <button className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full font-semibold text-xl transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center space-x-3 mx-auto btn-glow hover:scale-105">
              <span>Start Your Free Trial</span><ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </SignUpButton>
          <p className="text-gray-500 mt-4">No credit card required • Free forever plan available</p>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo size="sm" />
                <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">PitchMind</span>
              </div>
              <p className="text-gray-400 text-sm">AI-powered soccer analysis to help players and coaches make better decisions.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Demo', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (<li key={link}><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">{link}</a></li>))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">© 2024 PitchMind. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors text-sm">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}