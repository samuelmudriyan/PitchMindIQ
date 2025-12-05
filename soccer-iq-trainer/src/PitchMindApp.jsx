import React, { useState, useRef } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { 
  Upload, Play, Pause, RotateCcw, CheckCircle, AlertCircle, 
  Loader2, X, ChevronRight, Target, Clock, MapPin, Brain,
  TrendingUp, Award, Video, Home, Users, FileVideo, Lightbulb,
  Clipboard, FileText, BookOpen, BarChart3, Settings, Bell,
  Search, Star, Share2, Download, Zap, MousePointer, ArrowRight,
  ChevronLeft, Sparkles, Plus, Filter, Calendar, Edit, Trash2,
  Eye, MoreVertical, PlayCircle, FileCheck, MessageSquare,
  Dumbbell, Clock3, ChevronDown, User, Mail, Phone, Trophy,
  Activity, PieChart, ArrowUp, ArrowDown, Percent, Timer
} from 'lucide-react';

const API_BASE = 'https://pitchmind-backend-production-483d.up.railway.app';

export default function PitchMindApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [uploadState, setUploadState] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Logo Component
  const Logo = ({ size = 'md' }) => {
    const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
    return (
      <div className={`${sizes[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldGradient)" strokeWidth="2"/>
          <path d="M50 10 L60 35 L85 35 L65 50 L75 75 L50 60 L25 75 L35 50 L15 35 L40 35 Z" 
                fill="none" stroke="url(#goldGradient)" strokeWidth="1.5"/>
          <text x="50" y="63" textAnchor="middle" fontSize="40" fontWeight="bold" fill="url(#goldGradient)" fontFamily="serif">PM</text>
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#F4E5B2" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  // Sidebar
  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-screen bg-[#0d1210] border-r border-white/10 flex flex-col z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 border-b border-white/10 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-3">
          <Logo size="md" />
          {!sidebarCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              PitchMind
            </span>
          )}
        </div>
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <SidebarItem icon={Home} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={Users} label="Player Profiles" active={currentPage === 'players'} onClick={() => setCurrentPage('players')} count={18} collapsed={sidebarCollapsed} />
        <SidebarItem icon={FileVideo} label="Video Library" active={currentPage === 'videos'} onClick={() => setCurrentPage('videos')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={Lightbulb} label="AI Coach" active={currentPage === 'assistant'} onClick={() => setCurrentPage('assistant')} badge="New" collapsed={sidebarCollapsed} />
        <SidebarItem icon={Clipboard} label="Session Planner" active={currentPage === 'planner'} onClick={() => setCurrentPage('planner')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={FileText} label="Auto Reports" active={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={BookOpen} label="Drill Library" active={currentPage === 'drills'} onClick={() => setCurrentPage('drills')} collapsed={sidebarCollapsed} />
        
        {!sidebarCollapsed && (
          <div className="pt-4 pb-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Analytics</div>
          </div>
        )}
        
        <SidebarItem icon={BarChart3} label="Team Stats" active={currentPage === 'stats'} onClick={() => setCurrentPage('stats')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={TrendingUp} label="Progress" active={currentPage === 'progress'} onClick={() => setCurrentPage('progress')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={Target} label="Benchmarks" active={currentPage === 'benchmarks'} onClick={() => setCurrentPage('benchmarks')} collapsed={sidebarCollapsed} />
      </nav>

      <div className="p-3 border-t border-white/10">
        <button 
          onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }}
          className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] ${sidebarCollapsed ? 'px-2' : 'px-4'}`}
        >
          <Upload className="w-5 h-5" />
          {!sidebarCollapsed && <span>Upload Video</span>}
        </button>
      </div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick, count, badge, collapsed }) => (
    <button
      onClick={onClick}
      title={collapsed ? label : ''}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium group ${
        active 
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'group-hover:text-emerald-400'} transition-colors`} />
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && count && <span className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
      {!collapsed && badge && <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{badge}</span>}
    </button>
  );

  // Top Bar
  const TopBar = ({ title, showSearch = false }) => (
    <div className={`fixed top-0 right-0 h-16 bg-[#0a0f0d]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-40 transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
      <div className="flex items-center space-x-4">
        {currentPage !== 'dashboard' && (
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="text-gray-400 hover:text-white font-medium flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>

      <div className="flex items-center space-x-3">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
        )}
        <button className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
        </button>
        <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Settings className="w-5 h-5" />
        </button>
        <div className="pl-2 border-l border-white/10">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );

  // Page Wrapper
  const PageWrapper = ({ children, title, showSearch = false }) => (
    <div className={`pt-16 min-h-screen bg-[#0a0f0d] transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <TopBar title={title} showSearch={showSearch} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]" />
      </div>
      <div className="relative p-8">{children}</div>
    </div>
  );

  // ============================================
  // PLAYER PROFILES PAGE
  // ============================================
  const PlayersPage = () => {
    const players = [
      { id: 1, name: 'Marcus Johnson', position: 'Midfielder', age: 17, rating: 85, trend: 'up', avatar: 'MJ' },
      { id: 2, name: 'Alex Rivera', position: 'Forward', age: 16, rating: 82, trend: 'up', avatar: 'AR' },
      { id: 3, name: 'Jordan Smith', position: 'Defender', age: 18, rating: 78, trend: 'down', avatar: 'JS' },
      { id: 4, name: 'Chris Lee', position: 'Goalkeeper', age: 17, rating: 80, trend: 'up', avatar: 'CL' },
      { id: 5, name: 'Sam Williams', position: 'Midfielder', age: 16, rating: 76, trend: 'same', avatar: 'SW' },
      { id: 6, name: 'Taylor Brown', position: 'Forward', age: 17, rating: 84, trend: 'up', avatar: 'TB' },
    ];

    return (
      <PageWrapper title="Player Profiles" showSearch>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Players</h2>
            <p className="text-gray-400 mt-1">Manage and track your team's development</p>
          </div>
          <button className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
            <Plus className="w-5 h-5" />
            <span>Add Player</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <div key={player.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-lg font-bold text-white">
                    {player.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{player.name}</h3>
                    <p className="text-gray-400 text-sm">{player.position} • Age {player.age}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Decision IQ</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold text-white">{player.rating}</span>
                    {player.trend === 'up' && <ArrowUp className="w-4 h-4 text-emerald-400" />}
                    {player.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                <div className="w-16 h-16">
                  <div className="relative w-full h-full">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={`${player.rating * 1.76} 176`} strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // VIDEO LIBRARY PAGE
  // ============================================
  const VideosPage = () => {
    const videos = [
      { id: 1, title: 'Match vs Riverside FC', date: '2024-01-15', duration: '12:34', decisions: 8, thumbnail: '🎬' },
      { id: 2, title: 'Training Session #42', date: '2024-01-14', duration: '08:22', decisions: 5, thumbnail: '🎬' },
      { id: 3, title: 'Quarter Finals Highlights', date: '2024-01-12', duration: '15:47', decisions: 12, thumbnail: '🎬' },
      { id: 4, title: 'Defensive Drills', date: '2024-01-10', duration: '06:18', decisions: 4, thumbnail: '🎬' },
    ];

    return (
      <PageWrapper title="Video Library" showSearch>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Video Library</h2>
            <p className="text-gray-400 mt-1">All your analyzed footage in one place</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all"
            >
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group cursor-pointer">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                  <PlayCircle className="w-8 h-8 text-white group-hover:text-emerald-400" />
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white">
                  {video.duration}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{video.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{video.date}</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
                    {video.decisions} decisions
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // AI COACH PAGE
  // ============================================
  const AICoachPage = () => {
    const [message, setMessage] = useState('');
    const suggestions = [
      "How can I improve my team's passing accuracy?",
      "What drills help with decision-making under pressure?",
      "Analyze my team's defensive positioning",
      "Create a training plan for midfielders"
    ];

    return (
      <PageWrapper title="AI Coach Assistant">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Brain className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">AI Coach Assistant</h2>
            <p className="text-gray-400 text-lg">Get personalized tactical advice and training recommendations</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Suggestions</h3>
                <p className="text-gray-500 text-sm">Click any suggestion or type your own question</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(suggestion)}
                  className="text-left p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask the AI Coach anything about tactics, training, or player development..."
              className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-all"
            />
            <button 
              className="absolute bottom-4 right-4 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Coach</span>
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // SESSION PLANNER PAGE
  // ============================================
  const SessionPlannerPage = () => {
    const sessions = [
      { id: 1, title: 'Morning Training', date: 'Today, 9:00 AM', type: 'Technical', players: 12, status: 'upcoming' },
      { id: 2, title: 'Tactical Session', date: 'Tomorrow, 2:00 PM', type: 'Tactical', players: 18, status: 'scheduled' },
      { id: 3, title: 'Match Preparation', date: 'Jan 20, 10:00 AM', type: 'Match Prep', players: 18, status: 'scheduled' },
    ];

    return (
      <PageWrapper title="Session Planner">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Training Sessions</h2>
            <p className="text-gray-400 mt-1">Plan and organize your training schedule</p>
          </div>
          <button className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
            <Plus className="w-5 h-5" />
            <span>New Session</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{session.title}</h3>
                      <p className="text-gray-400 text-sm">{session.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="bg-white/10 text-gray-300 text-xs font-medium px-3 py-1 rounded-lg">{session.type}</span>
                    <span className="text-gray-400 text-sm">{session.players} players</span>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400">This Week</span>
                <span className="font-bold text-white">5 sessions</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400">Total Hours</span>
                <span className="font-bold text-white">12.5 hrs</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400">Avg. Attendance</span>
                <span className="font-bold text-emerald-400">94%</span>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // AUTO REPORTS PAGE
  // ============================================
  const ReportsPage = () => {
    const reports = [
      { id: 1, title: 'Weekly Performance Report', date: 'Jan 15, 2024', type: 'Team', status: 'ready' },
      { id: 2, title: 'Marcus Johnson - Progress Report', date: 'Jan 14, 2024', type: 'Individual', status: 'ready' },
      { id: 3, title: 'Match Analysis - vs Riverside', date: 'Jan 12, 2024', type: 'Match', status: 'ready' },
      { id: 4, title: 'Monthly Summary - December', date: 'Jan 1, 2024', type: 'Team', status: 'ready' },
    ];

    return (
      <PageWrapper title="Auto Reports">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Generated Reports</h2>
            <p className="text-gray-400 mt-1">AI-generated insights and analysis reports</p>
          </div>
          <button className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
            <FileCheck className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{report.title}</h3>
                    <p className="text-gray-400 text-sm">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-white/10 text-gray-300 text-xs font-medium px-3 py-1 rounded-lg">{report.type}</span>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all">
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-all">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // DRILL LIBRARY PAGE
  // ============================================
  const DrillsPage = () => {
    const drills = [
      { id: 1, name: 'Rondo 4v2', category: 'Passing', difficulty: 'Medium', duration: '15 min', icon: '⚽' },
      { id: 2, name: 'Box Possession', category: 'Possession', difficulty: 'Hard', duration: '20 min', icon: '🎯' },
      { id: 3, name: '1v1 Defending', category: 'Defending', difficulty: 'Medium', duration: '12 min', icon: '🛡️' },
      { id: 4, name: 'Finishing Circuit', category: 'Shooting', difficulty: 'Easy', duration: '18 min', icon: '🥅' },
      { id: 5, name: 'Pressing Triggers', category: 'Tactical', difficulty: 'Hard', duration: '25 min', icon: '📍' },
      { id: 6, name: 'Quick Transitions', category: 'Transition', difficulty: 'Medium', duration: '15 min', icon: '⚡' },
    ];

    const getDifficultyColor = (diff) => {
      if (diff === 'Easy') return 'text-emerald-400 bg-emerald-500/20';
      if (diff === 'Medium') return 'text-amber-400 bg-amber-500/20';
      return 'text-red-400 bg-red-500/20';
    };

    return (
      <PageWrapper title="Drill Library" showSearch>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Training Drills</h2>
            <p className="text-gray-400 mt-1">Browse and add drills to your sessions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
              <Plus className="w-5 h-5" />
              <span>Add Drill</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drills.map((drill) => (
            <div key={drill.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{drill.icon}</div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getDifficultyColor(drill.difficulty)}`}>
                  {drill.difficulty}
                </span>
              </div>
              <h3 className="font-bold text-white text-lg mb-1 group-hover:text-emerald-400 transition-colors">{drill.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{drill.category}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Timer className="w-4 h-4" />
                  <span>{drill.duration}</span>
                </div>
                <button className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-all">
                  Add to Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // TEAM STATS PAGE
  // ============================================
  const TeamStatsPage = () => {
    const stats = [
      { label: 'Avg Decision IQ', value: '78', change: '+3.2%', positive: true },
      { label: 'Pass Success Rate', value: '84%', change: '+1.5%', positive: true },
      { label: 'Pressing Efficiency', value: '71%', change: '-2.1%', positive: false },
      { label: 'Transition Speed', value: '4.2s', change: '-0.3s', positive: true },
    ];

    return (
      <PageWrapper title="Team Stats">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Team Statistics</h2>
          <p className="text-gray-400 mt-1">Overall team performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-gray-500 text-sm mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white">{stat.value}</span>
                <span className={`flex items-center text-sm font-medium ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.positive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Decision Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'Pass Forward', value: 45, color: 'bg-emerald-500' },
                { label: 'Dribble', value: 25, color: 'bg-amber-500' },
                { label: 'Pass Back', value: 20, color: 'bg-blue-500' },
                { label: 'Shoot', value: 10, color: 'bg-purple-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white font-medium">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Top Performers</h3>
            <div className="space-y-4">
              {[
                { name: 'Taylor Brown', score: 92, pos: 'FW' },
                { name: 'Marcus Johnson', score: 88, pos: 'MF' },
                { name: 'Alex Rivera', score: 85, pos: 'FW' },
              ].map((player, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-amber-400">#{i + 1}</span>
                    <div>
                      <p className="font-medium text-white">{player.name}</p>
                      <p className="text-gray-500 text-xs">{player.pos}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-emerald-400">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // PROGRESS TRACKING PAGE
  // ============================================
  const ProgressPage = () => {
    const weeklyData = [
      { week: 'W1', score: 72 },
      { week: 'W2', score: 74 },
      { week: 'W3', score: 73 },
      { week: 'W4', score: 78 },
      { week: 'W5', score: 76 },
      { week: 'W6', score: 82 },
    ];

    return (
      <PageWrapper title="Progress Tracking">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Team Progress</h2>
          <p className="text-gray-400 mt-1">Track improvement over time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-400 text-sm">Overall Improvement</p>
                <p className="text-3xl font-bold text-white">+14%</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Since last month</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Videos Analyzed</p>
                <p className="text-3xl font-bold text-white">47</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">This month</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Decisions Reviewed</p>
                <p className="text-3xl font-bold text-white">312</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">This month</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-6">Weekly Decision IQ Trend</h3>
          <div className="flex items-end justify-between h-48 px-4">
            {weeklyData.map((data, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div 
                  className="w-12 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-400 hover:to-emerald-300"
                  style={{ height: `${data.score * 1.5}px` }}
                />
                <span className="text-gray-400 text-sm">{data.week}</span>
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // BENCHMARKS PAGE
  // ============================================
  const BenchmarksPage = () => {
    const benchmarks = [
      { category: 'Pass Accuracy', team: 78, elite: 92, icon: Target },
      { category: 'Decision Speed', team: 82, elite: 95, icon: Zap },
      { category: 'Spatial Awareness', team: 71, elite: 88, icon: Eye },
      { category: 'Under Pressure', team: 68, elite: 85, icon: Activity },
    ];

    return (
      <PageWrapper title="Benchmarks">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Elite Benchmarks</h2>
          <p className="text-gray-400 mt-1">Compare your team against elite standards</p>
        </div>

        <div className="space-y-6">
          {benchmarks.map((benchmark, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <benchmark.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="font-bold text-white">{benchmark.category}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Your Team</p>
                    <p className="text-xl font-bold text-white">{benchmark.team}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Elite Level</p>
                    <p className="text-xl font-bold text-amber-400">{benchmark.elite}%</p>
                  </div>
                </div>
              </div>
              <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${benchmark.team}%` }}
                />
                <div 
                  className="absolute h-full w-1 bg-amber-400"
                  style={{ left: `${benchmark.elite}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-emerald-400 text-sm">{benchmark.team}% - Your Team</span>
                <span className="text-amber-400 text-sm">{benchmark.elite}% - Elite Target</span>
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // UPLOAD PAGE (existing)
  // ============================================
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setUploadState('selecting');
      setClickPosition(null);
      setError(null);
    }
  };

  const handleVideoClick = (e) => {
    if (uploadState !== 'selecting') return;
    const video = videoRef.current;
    const rect = video.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * video.videoWidth;
    const y = ((e.clientY - rect.top) / rect.height) * video.videoHeight;
    const timestamp = video.currentTime;
    setClickPosition({ x, y, timestamp, displayX: e.clientX - rect.left, displayY: e.clientY - rect.top });
  };

  const startAnalysis = async () => {
    if (videoRef.current) videoRef.current.pause();
    if (!videoFile || !clickPosition) return;
    
    setUploadState('uploading');
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('clickX', Math.round(clickPosition.x));
      formData.append('clickY', Math.round(clickPosition.y));
      formData.append('clickTimestamp', clickPosition.timestamp || 0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 10);
      }, 200);

      setUploadState('analyzing');

      const response = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: formData });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error('Analysis failed');

      const results = await response.json();
      setAnalysisResults(results);
      setUploadState('complete');
      setCurrentDecisionIndex(0);
      setQuizAnswers([]);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setUploadState('selecting');
    }
  };

  const resetUpload = () => {
    setUploadState('idle');
    setVideoFile(null);
    setVideoUrl(null);
    setClickPosition(null);
    setAnalysisResults(null);
    setCurrentDecisionIndex(0);
    setQuizAnswers([]);
    setError(null);
    setUploadProgress(0);
  };

  const UploadPage = () => (
    <PageWrapper title="Video Analysis">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center space-x-3">
          {[
            { step: 1, label: 'Upload', state: uploadState === 'idle', complete: uploadState !== 'idle' },
            { step: 2, label: 'Select Player', state: uploadState === 'selecting', complete: ['uploading', 'analyzing', 'complete'].includes(uploadState) },
            { step: 3, label: 'Analyze', state: ['uploading', 'analyzing'].includes(uploadState), complete: uploadState === 'complete' },
            { step: 4, label: 'Results', state: uploadState === 'complete', complete: false }
          ].map((item, index) => (
            <React.Fragment key={item.step}>
              <StepIndicator {...item} />
              {index < 3 && <div className={`w-16 h-0.5 ${item.complete ? 'bg-emerald-500' : 'bg-white/10'} transition-colors`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {uploadState === 'idle' && (
          <div onClick={() => fileInputRef.current?.click()} className="group bg-white/5 border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-3xl p-16 text-center cursor-pointer transition-all hover:bg-emerald-500/5">
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
            <div className="inline-flex p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <Upload className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upload Match Footage</h2>
            <p className="text-gray-400 mb-8">Drag and drop or click to select a video file</p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <span className="flex items-center space-x-2"><Video className="w-4 h-4 text-emerald-400" /><span>MP4, MOV, AVI</span></span>
              <span className="flex items-center space-x-2"><Clock className="w-4 h-4 text-emerald-400" /><span>Up to 10 minutes</span></span>
              <span className="flex items-center space-x-2"><Zap className="w-4 h-4 text-emerald-400" /><span>~30 sec processing</span></span>
            </div>
          </div>
        )}

        {uploadState === 'selecting' && videoUrl && (
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-b border-emerald-500/20 px-6 py-4">
              <div className="flex items-center space-x-2 text-emerald-400">
                <MousePointer className="w-5 h-5" />
                <h2 className="text-lg font-bold">Click on the player you want to track</h2>
              </div>
              <p className="text-gray-400 text-sm mt-1">Pause the video and click directly on the player</p>
            </div>
            <div className="relative bg-black">
              <video ref={videoRef} src={videoUrl} className="w-full cursor-crosshair" controls onClick={handleVideoClick} />
              {clickPosition && (
                <div className="absolute w-14 h-14 border-4 border-emerald-400 rounded-full animate-pulse pointer-events-none" style={{ left: clickPosition.displayX - 28, top: clickPosition.displayY - 28 }}>
                  <div className="absolute inset-2 bg-emerald-400/30 rounded-full" />
                </div>
              )}
            </div>
            <div className="p-6 bg-white/5 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  {clickPosition ? (
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Player selected!</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Click on a player to select them</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button onClick={resetUpload} className="px-5 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button>
                  <button onClick={startAnalysis} disabled={!clickPosition} className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${clickPosition ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}>
                    <Brain className="w-5 h-5" /><span>Start Analysis</span>
                  </button>
                </div>
              </div>
              {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center space-x-2"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            </div>
          </div>
        )}

        {['uploading', 'analyzing'].includes(uploadState) && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <div className="inline-flex p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{uploadState === 'uploading' ? 'Uploading Video...' : 'AI Analyzing Footage...'}</h2>
            <p className="text-gray-400 mb-8">{uploadState === 'uploading' ? 'Sending video to GPU servers' : 'Tracking player and identifying decision moments'}</p>
            <div className="max-w-md mx-auto">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 rounded-full" style={{ width: `${uploadState === 'analyzing' ? 100 : uploadProgress}%` }} />
              </div>
            </div>
          </div>
        )}

        {uploadState === 'complete' && analysisResults && (
          <AnalysisResults results={analysisResults} videoUrl={videoUrl} videoRef={videoRef} currentIndex={currentDecisionIndex} setCurrentIndex={setCurrentDecisionIndex} quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers} onReset={resetUpload} />
        )}

        {uploadState === 'complete' && !analysisResults && (
          <DemoResults videoUrl={videoUrl} videoRef={videoRef} onReset={resetUpload} />
        )}
      </div>
    </PageWrapper>
  );

  const StepIndicator = ({ step, label, state, complete }) => (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${complete ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : state ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110' : 'bg-white/10 text-gray-500'}`}>
        {complete ? <CheckCircle className="w-5 h-5" /> : step}
      </div>
      <span className={`mt-2 text-xs font-medium ${state ? 'text-emerald-400' : 'text-gray-500'}`}>{label}</span>
    </div>
  );

  const AnalysisResults = ({ results, videoUrl, videoRef, currentIndex, setCurrentIndex, quizAnswers, setQuizAnswers, onReset }) => {
    const decisions = results.decision_points || [];
    const currentDecision = decisions[currentIndex];
    const handleAnswer = (answer) => { const newAnswers = [...quizAnswers]; newAnswers[currentIndex] = answer; setQuizAnswers(newAnswers); };
    const goToDecision = (index) => { setCurrentIndex(index); if (videoRef.current && decisions[index]) videoRef.current.currentTime = decisions[index].timestamp; };

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2"><Sparkles className="w-5 h-5 text-emerald-400" /><h2 className="text-xl font-bold text-white">Analysis Complete!</h2></div>
              <p className="text-gray-400">Found {decisions.length} key decision moments to review</p>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center"><div className="text-3xl font-bold text-emerald-400">{decisions.length}</div><div className="text-gray-500 text-sm">Decisions</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-emerald-400">{Math.round((quizAnswers.filter(Boolean).length / decisions.length) * 100) || 0}%</div><div className="text-gray-500 text-sm">Reviewed</div></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <video ref={videoRef} src={videoUrl} className="w-full" controls />
            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="flex items-center space-x-2 mb-3"><Target className="w-4 h-4 text-emerald-400" /><span className="text-sm font-medium text-gray-300">Decision Points</span></div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {decisions.map((decision, idx) => (
                  <button key={idx} onClick={() => goToDecision(idx)} className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${idx === currentIndex ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : quizAnswers[idx] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {formatTime(decision.timestamp)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {currentDecision ? (
              <>
                <div className="flex items-center space-x-2 mb-4"><div className="bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-lg">{currentIndex + 1}/{decisions.length}</div><span className="text-gray-500 text-sm">{currentDecision.zone}</span></div>
                <h3 className="text-lg font-bold text-white mb-4">What should the player do here?</h3>
                <div className="space-y-3 mb-6">
                  {['Pass Forward', 'Dribble', 'Pass Back', 'Shoot'].map((option) => (
                    <button key={option} onClick={() => handleAnswer(option)} className={`w-full p-4 rounded-xl font-medium text-left transition-all ${quizAnswers[currentIndex] === option ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/5 border border-white/10 text-gray-300 hover:border-emerald-500/30 hover:bg-emerald-500/5'}`}>{option}</button>
                  ))}
                </div>
                {quizAnswers[currentIndex] && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2"><Award className="w-5 h-5" /><span>Elite Comparison</span></div>
                    <p className="text-sm text-gray-300">Kevin De Bruyne would choose <strong className="text-white">Pass Forward</strong> in this situation 78% of the time.</p>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button onClick={() => goToDecision(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="flex-1 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium disabled:opacity-30 hover:bg-white/5 transition-all">Previous</button>
                  <button onClick={() => goToDecision(Math.min(decisions.length - 1, currentIndex + 1))} disabled={currentIndex === decisions.length - 1} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-medium disabled:opacity-30 hover:bg-emerald-400 transition-all">Next</button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500"><Target className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No decision points found</p></div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
          <button onClick={onReset} className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white font-medium transition-all"><RotateCcw className="w-4 h-4" /><span>Analyze Another Video</span></button>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-5 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all"><Share2 className="w-4 h-4" /><span>Share</span></button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/20 transition-all"><Download className="w-4 h-4" /><span>Export Report</span></button>
          </div>
        </div>
      </div>
    );
  };

  const DemoResults = ({ videoUrl, videoRef, onReset }) => {
    const demoDecisions = [{ timestamp: 5.2, zone: 'Middle Third' }, { timestamp: 12.8, zone: 'Attacking Third' }, { timestamp: 23.1, zone: 'Defensive Third' }, { timestamp: 31.5, zone: 'Attacking Third' }];
    return <AnalysisResults results={{ decision_points: demoDecisions }} videoUrl={videoUrl} videoRef={videoRef} currentIndex={0} setCurrentIndex={() => {}} quizAnswers={[]} setQuizAnswers={() => {}} onReset={onReset} />;
  };

  // Dashboard
  const Dashboard = () => (
    <PageWrapper title="Dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Good morning, Coach! 👋</h1>
        <p className="text-gray-400">Upload a video to get started with AI-powered analysis.</p>
      </div>

      <div onClick={() => setCurrentPage('upload')} className="group bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-3xl p-8 cursor-pointer hover:border-emerald-500/50 hover:from-emerald-500/30 hover:to-emerald-600/20 transition-all mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3"><Brain className="w-6 h-6 text-emerald-400" /><span className="font-bold text-lg text-emerald-400">AI Video Analysis</span></div>
            <h2 className="text-2xl font-bold text-white mb-3">Analyze player decisions with AI</h2>
            <p className="text-gray-400 mb-6 max-w-lg">Upload match footage, select a player, and get instant tactical insights compared to elite players.</p>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/25"><Upload className="w-5 h-5" /><span>Upload Video Now</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
          </div>
          <div className="hidden lg:block">
            <div className="w-40 h-40 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform"><Video className="w-16 h-16 text-emerald-400" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Videos Analyzed', value: '24', icon: Video, color: 'emerald' },
          { label: 'Decision Points', value: '156', icon: Target, color: 'amber' },
          { label: 'Improvement', value: '+12%', icon: TrendingUp, color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color === 'emerald' ? 'bg-emerald-500/20' : stat.color === 'amber' ? 'bg-amber-500/20' : 'bg-purple-500/20'}`}>
                <stat.icon className={`w-6 h-6 ${stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'amber' ? 'text-amber-400' : 'text-purple-400'}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // MAIN RENDER
  const renderPage = () => {
    switch(currentPage) {
      case 'players': return <PlayersPage />;
      case 'videos': return <VideosPage />;
      case 'assistant': return <AICoachPage />;
      case 'planner': return <SessionPlannerPage />;
      case 'reports': return <ReportsPage />;
      case 'drills': return <DrillsPage />;
      case 'stats': return <TeamStatsPage />;
      case 'progress': return <ProgressPage />;
      case 'benchmarks': return <BenchmarksPage />;
      case 'upload': return <UploadPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      <Sidebar />
      {renderPage()}
    </div>
  );
}
