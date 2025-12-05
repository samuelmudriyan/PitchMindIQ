import React, { useState, useEffect, useRef } from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { 
  Play, Brain, Target, TrendingUp, Video, Zap, Users, 
  ChevronRight, Star, Check, ArrowRight, Menu, X,
  Shield, Clock, BarChart3, Award, Sparkles
} from 'lucide-react';

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
    return (
      <div className={`${sizes[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldGradientLanding)" strokeWidth="2"/>
          <path d="M50 10 L60 35 L85 35 L65 50 L75 75 L50 60 L25 75 L35 50 L15 35 L40 35 Z" fill="none" stroke="url(#goldGradientLanding)" strokeWidth="1.5"/>
          <text x="50" y="63" textAnchor="middle" fontSize="40" fontWeight="bold" fill="url(#goldGradientLanding)" fontFamily="serif">PM</text>
          <defs>
            <linearGradient id="goldGradientLanding" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#F4E5B2" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
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

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" style={{ transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)` }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px]" style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-emerald-400/40 rounded-full" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `particle ${8 + Math.random() * 10}s ease-in-out infinite`, animationDelay: `${Math.random() * 5}s` }} />
        ))}
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-[#0a0f0d]/90 backdrop-blur-xl border-b border-white/10 py-3' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"><Logo size="md" /></div>
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

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 animate-[fadeIn_0.6s_ease-out]">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-sm text-gray-300">AI-Powered Soccer Analysis</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">New</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight animate-[fadeIn_0.6s_ease-out_0.1s_both]">
                Train Your<span className="block gradient-text">Soccer IQ</span>Like The Pros
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed max-w-lg animate-[fadeIn_0.6s_ease-out_0.2s_both]">
                Upload your game footage and let AI analyze every decision. Compare your choices to elite players and unlock your tactical potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-[fadeIn_0.6s_ease-out_0.3s_both]">
                <SignUpButton mode="modal">
                  <button className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full font-semibold text-lg transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center space-x-2 btn-glow hover:scale-105">
                    <span>Start Analyzing Free</span><ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </SignUpButton>
                <button className="group px-8 py-4 border border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-white rounded-full font-semibold text-lg transition-all flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5 group-hover:scale-125 transition-transform" /><span>Watch Demo</span>
                </button>
              </div>
              <div className="flex items-center space-x-6 pt-4 animate-[fadeIn_0.6s_ease-out_0.4s_both]">
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

            {/* Hero Visual */}
            <div className="relative animate-[fadeIn_0.8s_ease-out_0.3s_both]" style={{ transform: `perspective(1000px) rotateY(${mousePosition.x * 0.3}deg) rotateX(${-mousePosition.y * 0.3}deg)` }}>
              <div className="relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-2 shadow-2xl hover:border-emerald-500/30 transition-colors duration-500">
                <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-emerald-900/20 to-gray-900 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 group cursor-pointer hover:bg-emerald-500/30 hover:scale-110 transition-all">
                          <Play className="w-8 h-8 text-emerald-400 ml-1" />
                        </div>
                        <p className="text-gray-400 text-sm">AI Analysis in Action</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/30" style={{ animation: 'float 3s ease-in-out infinite' }}>
                      <div className="flex items-center space-x-2"><Brain className="w-5 h-5 text-emerald-400 animate-pulse" /><span className="text-sm font-medium">Decision Point Found</span></div>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-amber-500/30" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1.5s' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center"><span className="text-xs font-bold text-black">KDB</span></div>
                        <div><p className="text-xs text-gray-400">Elite Comparison</p><p className="text-sm font-medium">78% Pass Forward</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">TRUSTED BY COACHES AND ACADEMIES WORLDWIDE</p>
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee space-x-12">
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex space-x-12 min-w-max">
                  {['Youth Academy Pro', 'Soccer IQ Labs', 'Elite Training Co', 'NextGen Football', 'Tactical Edge', 'Premier Skills', 'Football Minds'].map((name) => (
                    <span key={name} className="text-xl font-bold text-gray-600 hover:text-gray-400 transition-colors whitespace-nowrap">{name}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">Everything You Need to<span className="block gradient-text">Develop Elite Decision-Making</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Powered by cutting-edge AI technology used by professional clubs worldwide.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'AI Video Analysis', description: 'YOLOv11 object detection combined with Claude AI identifies every tactical decision moment.', gradient: 'from-emerald-500 to-teal-500' },
              { icon: Target, title: 'Player Tracking', description: 'Deep SORT + TorchReID tracks any player throughout the entire video with elite accuracy.', gradient: 'from-amber-500 to-orange-500' },
              { icon: Users, title: 'Elite Comparisons', description: 'Compare your decisions to world-class players like De Bruyne, Messi, and Busquets.', gradient: 'from-purple-500 to-pink-500' },
              { icon: BarChart3, title: 'Decision Analytics', description: 'Track your decision-making patterns over time and identify areas for improvement.', gradient: 'from-blue-500 to-cyan-500' },
              { icon: Clock, title: 'Instant Processing', description: 'GPU-powered analysis delivers results in seconds, not hours. Train smarter, faster.', gradient: 'from-red-500 to-rose-500' },
              { icon: Shield, title: 'Secure & Private', description: 'Your footage stays private. Enterprise-grade security protects your tactical insights.', gradient: 'from-indigo-500 to-violet-500' }
            ].map((feature, index) => (
              <div key={index} className={`scroll-animate stagger-${index + 1} group relative bg-white/5 border border-white/10 rounded-2xl p-8 card-hover hover:border-emerald-500/30`}>
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 scroll-animate">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">Three Steps to<span className="block text-emerald-400">Tactical Mastery</span></h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 relative">
            <div className="hidden lg:block absolute top-20 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-emerald-500/20" />
            {[
              { step: '01', title: 'Upload Your Video', description: 'Drop any match footage — phone recordings, GoPro, broadcast clips. We handle all formats.', icon: Video },
              { step: '02', title: 'Select Your Player', description: 'Click on any player in the video. Our AI locks onto them and tracks every movement.', icon: Target },
              { step: '03', title: 'Review & Learn', description: 'Analyze each decision point, quiz yourself, and see how elite players would respond.', icon: TrendingUp }
            ].map((item, index) => (
              <div key={index} className={`scroll-animate stagger-${index + 1}`}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-full card-hover hover:border-emerald-500/30 relative">
                  <div className="absolute -top-5 left-6 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/30">{item.step}</div>
                  <div className="mt-6">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4"><item.icon className="w-6 h-6 text-emerald-400" /></div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="scroll-animate">
              <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">About PitchMind</span>
              <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">Built by Players,<span className="block text-emerald-400">For Players</span></h2>
              <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                <p>PitchMind was born from a simple frustration: watching elite players make split-second decisions that seem impossible to teach. We asked — what if AI could break down those moments?</p>
                <p>Our team combines former professional players, AI researchers, and sports scientists to build technology that actually improves how you see the game.</p>
                <p className="text-white font-medium">We're not just tracking stats. We're training minds.</p>
              </div>
              <div className="grid grid-cols-3 gap-8 mt-12">
                {[{ value: 10, suffix: 'K+', label: 'Videos Analyzed' }, { value: 500, suffix: '+', label: 'Active Users' }, { value: 95, suffix: '%', label: 'Accuracy Rate' }].map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-emerald-400"><AnimatedCounter end={stat.value} suffix={stat.suffix} /></div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative scroll-animate">
              <div className="bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-white/10 rounded-3xl p-8 card-hover">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-amber-500/30 transition-colors">
                    <Award className="w-10 h-10 text-amber-400 mb-4" />
                    <h4 className="font-bold mb-2">Our Mission</h4>
                    <p className="text-sm text-gray-400">Democratize elite-level tactical training for every player.</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-colors">
                    <Zap className="w-10 h-10 text-emerald-400 mb-4" />
                    <h4 className="font-bold mb-2">Our Tech</h4>
                    <p className="text-sm text-gray-400">YOLOv11, Deep SORT, TorchReID, and Claude AI.</p>
                  </div>
                  <div className="col-span-2 bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="hover:scale-110 transition-transform"><Logo size="lg" /></div>
                      <div><h4 className="font-bold text-lg">PitchMind IQ</h4><p className="text-sm text-gray-400">The future of soccer intelligence training</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6">Simple, Transparent<span className="block text-emerald-400">Pricing</span></h2>
            <p className="text-xl text-gray-400">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '$0', period: 'forever', description: 'Perfect for trying out PitchMind', features: ['3 video analyses/month', 'Basic decision tracking', 'Email support'], cta: 'Get Started', popular: false },
              { name: 'Pro', price: '$19', period: '/month', description: 'For serious players and coaches', features: ['Unlimited analyses', 'Elite player comparisons', 'Advanced analytics', 'Priority support', 'Export reports'], cta: 'Start Pro Trial', popular: true },
              { name: 'Team', price: '$99', period: '/month', description: 'For academies and clubs', features: ['Everything in Pro', 'Up to 25 players', 'Team dashboards', 'Custom branding', 'API access'], cta: 'Contact Sales', popular: false }
            ].map((plan, index) => (
              <div key={index} className={`scroll-animate stagger-${index + 1} relative bg-white/5 border rounded-2xl p-8 card-hover ${plan.popular ? 'border-emerald-500 scale-105 shadow-xl shadow-emerald-500/20' : 'border-white/10'}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">Most Popular</span></div>}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center"><span className="text-5xl font-bold">{plan.price}</span><span className="text-gray-400 ml-1">{plan.period}</span></div>
                  <p className="text-sm text-gray-400 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3"><div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-400" /></div><span className="text-gray-300">{feature}</span></li>
                  ))}
                </ul>
                <SignUpButton mode="modal">
                  <button className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105' : 'bg-white/10 hover:bg-white/20 text-white hover:scale-105'}`}>{plan.cta}</button>
                </SignUpButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4">What Coaches<span className="block text-emerald-400">Are Saying</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "PitchMind changed how I teach the game. My U-17 players now see passes they never would have considered before.", author: "James Mitchell", role: "Youth Academy Director", avatar: "JM" },
              { quote: "The AI analysis is incredibly accurate. It picks up decision moments I miss on first viewing every single time.", author: "Sarah Chen", role: "Performance Analyst", avatar: "SC" },
              { quote: "Worth every penny. My son improved his positioning awareness dramatically in just 2 months of using this.", author: "Roberto Martinez", role: "Parent & Coach", avatar: "RM" }
            ].map((testimonial, index) => (
              <div key={index} className={`scroll-animate stagger-${index + 1} bg-white/5 border border-white/10 rounded-2xl p-8 card-hover hover:border-emerald-500/30`}>
                <div className="flex items-center space-x-1 mb-4">{[1,2,3,4,5].map((i) => (<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />))}</div>
                <p className="text-gray-300 leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold shadow-lg">{testimonial.avatar}</div>
                  <div><div className="font-semibold">{testimonial.author}</div><div className="text-sm text-gray-400">{testimonial.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center scroll-animate">
          <div className="bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-white/10 rounded-3xl p-12 relative overflow-hidden card-hover">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)]" />
            <div className="relative">
              <div className="inline-block hover:scale-110 transition-transform"><Logo size="lg" /></div>
              <h2 className="text-4xl lg:text-5xl font-bold mt-6 mb-4">Ready to Train Smarter?</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Join hundreds of players and coaches already developing elite decision-making with PitchMind.</p>
              <SignUpButton mode="modal">
                <button className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full font-semibold text-lg transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 btn-glow">Start Your Free Trial</button>
              </SignUpButton>
              <p className="text-sm text-gray-500 mt-4">No credit card required • Free forever plan available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4 group cursor-pointer">
                <div className="transition-transform group-hover:scale-110 group-hover:rotate-12"><Logo size="md" /></div>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">PitchMind</span>
              </div>
              <p className="text-gray-400 max-w-sm mb-6">AI-powered soccer analysis platform helping players and coaches develop elite-level tactical intelligence.</p>
              <div className="flex space-x-4">
                {['T', 'L', 'I'].map((s, i) => (<a key={i} href="#" className="w-10 h-10 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-400 transition-all hover:scale-110">{s}</a>))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">{['Features', 'Pricing', 'Changelog', 'Roadmap'].map((item) => (<li key={item}><a href="#" className="hover:text-emerald-400 transition-colors">{item}</a></li>))}</ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">{['About', 'Blog', 'Careers', 'Contact'].map((item) => (<li key={item}><a href="#" className="hover:text-emerald-400 transition-colors">{item}</a></li>))}</ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 PitchMind. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
