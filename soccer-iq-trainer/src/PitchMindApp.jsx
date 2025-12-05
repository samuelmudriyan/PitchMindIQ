import React, { useState, useRef, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { 
  Upload, Play, Pause, RotateCcw, CheckCircle, AlertCircle, 
  Loader2, X, ChevronRight, Target, Clock, MapPin, Brain,
  TrendingUp, Award, Video, Home, Users, FileVideo, Lightbulb,
  Clipboard, FileText, BookOpen, BarChart3, Settings, Bell,
  Search, Star, Share2, Download, Zap, MousePointer, ArrowRight,
  ChevronLeft, Sparkles, Plus, Filter, Calendar, Edit, Trash2,
  Eye, MoreVertical, PlayCircle, FileCheck, MessageSquare,
  Dumbbell, Clock3, ChevronDown, User, Mail, Phone, Trophy,
  Activity, PieChart, ArrowUp, ArrowDown, Percent, Timer, Send,
  Save, Check, AlertTriangle
} from 'lucide-react';

const API_BASE = 'https://pitchmind-backend-production-483d.up.railway.app';

// Local Storage Keys
const STORAGE_KEYS = {
  PLAYERS: 'pitchmind_players',
  VIDEOS: 'pitchmind_videos',
  SESSIONS: 'pitchmind_sessions',
  REPORTS: 'pitchmind_reports',
  DRILLS: 'pitchmind_drills',
  CHAT_HISTORY: 'pitchmind_chat_history'
};

// Helper to load from localStorage
const loadFromStorage = (key, defaultValue = []) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper to save to localStorage
const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export default function PitchMindApp() {
  const { user } = useUser();
  
  // Navigation
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload state
  const [uploadState, setUploadState] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [error, setError] = useState(null);
  
  // Data state - loaded from localStorage
  const [players, setPlayers] = useState(() => loadFromStorage(STORAGE_KEYS.PLAYERS, []));
  const [videos, setVideos] = useState(() => loadFromStorage(STORAGE_KEYS.VIDEOS, []));
  const [sessions, setSessions] = useState(() => loadFromStorage(STORAGE_KEYS.SESSIONS, []));
  const [reports, setReports] = useState(() => loadFromStorage(STORAGE_KEYS.REPORTS, []));
  const [userDrills, setUserDrills] = useState(() => loadFromStorage(STORAGE_KEYS.DRILLS, []));
  const [chatHistory, setChatHistory] = useState(() => loadFromStorage(STORAGE_KEYS.CHAT_HISTORY, []));
  
  // Modal state
  const [showModal, setShowModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDrill, setSelectedDrill] = useState(null);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Save to localStorage when data changes
  useEffect(() => { saveToStorage(STORAGE_KEYS.PLAYERS, players); }, [players]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.VIDEOS, videos); }, [videos]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SESSIONS, sessions); }, [sessions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.REPORTS, reports); }, [reports]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.DRILLS, userDrills); }, [userDrills]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CHAT_HISTORY, chatHistory); }, [chatHistory]);

  // Default drill library (templates)
  const drillTemplates = [
    { id: 'd1', name: 'Rondo 4v2', category: 'Passing', difficulty: 'Medium', duration: '15 min', icon: '⚽', description: 'Classic possession drill focusing on quick passing and movement.' },
    { id: 'd2', name: 'Box Possession', category: 'Possession', difficulty: 'Hard', duration: '20 min', icon: '🎯', description: 'Advanced possession drill in tight spaces.' },
    { id: 'd3', name: '1v1 Defending', category: 'Defending', difficulty: 'Medium', duration: '12 min', icon: '🛡️', description: 'Individual defending technique and positioning.' },
    { id: 'd4', name: 'Finishing Circuit', category: 'Shooting', difficulty: 'Easy', duration: '18 min', icon: '🥅', description: 'Various finishing scenarios and techniques.' },
    { id: 'd5', name: 'Pressing Triggers', category: 'Tactical', difficulty: 'Hard', duration: '25 min', icon: '📍', description: 'Team pressing patterns and trigger recognition.' },
    { id: 'd6', name: 'Quick Transitions', category: 'Transition', difficulty: 'Medium', duration: '15 min', icon: '⚡', description: 'Fast transition play from defense to attack.' },
    { id: 'd7', name: 'Crossing & Finishing', category: 'Attacking', difficulty: 'Medium', duration: '20 min', icon: '🎯', description: 'Wide play and finishing from crosses.' },
    { id: 'd8', name: 'Build-up Play', category: 'Tactical', difficulty: 'Hard', duration: '25 min', icon: '📐', description: 'Playing out from the back patterns.' },
  ];

  // Logo Component
  const Logo = ({ size = 'md' }) => {
    const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
    return (
      <div className={`${sizes[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldGradient)" strokeWidth="2"/>
          <path d="M50 10 L60 35 L85 35 L65 50 L75 75 L50 60 L25 75 L35 50 L15 35 L40 35 Z" fill="none" stroke="url(#goldGradient)" strokeWidth="1.5"/>
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

  // ============================================
  // MODAL COMPONENT
  // ============================================
  const Modal = ({ title, children, onClose, size = 'md' }) => {
    const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative ${sizes[size]} w-full bg-[#0d1210] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    );
  };

  // ============================================
  // EMPTY STATE COMPONENT
  // ============================================
  const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mb-6">{description}</p>
      {actionLabel && (
        <button onClick={onAction} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
          <Plus className="w-5 h-5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );

  // ============================================
  // SIDEBAR
  // ============================================
  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-screen bg-[#0d1210] border-r border-white/10 flex flex-col z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 border-b border-white/10 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-3">
          <Logo size="md" />
          {!sidebarCollapsed && <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">PitchMind</span>}
        </div>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <SidebarItem icon={Home} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={Users} label="Player Profiles" active={currentPage === 'players'} onClick={() => setCurrentPage('players')} count={players.length || null} collapsed={sidebarCollapsed} />
        <SidebarItem icon={FileVideo} label="Video Library" active={currentPage === 'videos'} onClick={() => setCurrentPage('videos')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={Lightbulb} label="AI Coach" active={currentPage === 'assistant'} onClick={() => setCurrentPage('assistant')} badge="New" collapsed={sidebarCollapsed} />
        <SidebarItem icon={Clipboard} label="Session Planner" active={currentPage === 'planner'} onClick={() => setCurrentPage('planner')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={FileText} label="Auto Reports" active={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={BookOpen} label="Drill Library" active={currentPage === 'drills'} onClick={() => setCurrentPage('drills')} collapsed={sidebarCollapsed} />
        
        {!sidebarCollapsed && <div className="pt-4 pb-2"><div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Analytics</div></div>}
        
        <SidebarItem icon={BarChart3} label="Team Stats" active={currentPage === 'stats'} onClick={() => setCurrentPage('stats')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={TrendingUp} label="Progress" active={currentPage === 'progress'} onClick={() => setCurrentPage('progress')} collapsed={sidebarCollapsed} />
        <SidebarItem icon={Target} label="Benchmarks" active={currentPage === 'benchmarks'} onClick={() => setCurrentPage('benchmarks')} collapsed={sidebarCollapsed} />
      </nav>

      <div className="p-3 border-t border-white/10">
        <button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <Upload className="w-5 h-5" />
          {!sidebarCollapsed && <span>Upload Video</span>}
        </button>
      </div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick, count, badge, collapsed }) => (
    <button onClick={onClick} title={collapsed ? label : ''} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium group ${active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'group-hover:text-emerald-400'} transition-colors`} />
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && count && <span className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
      {!collapsed && badge && <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{badge}</span>}
    </button>
  );

  // ============================================
  // TOP BAR
  // ============================================
  const TopBar = ({ title, showSearch = false }) => (
    <div className={`fixed top-0 right-0 h-16 bg-[#0a0f0d]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-40 transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
      <div className="flex items-center space-x-4">
        {currentPage !== 'dashboard' && (
          <button onClick={() => setCurrentPage('dashboard')} className="text-gray-400 hover:text-white font-medium flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
            <ChevronLeft className="w-4 h-4" /><span>Back</span>
          </button>
        )}
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex items-center space-x-3">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
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
  // ADD PLAYER MODAL
  // ============================================
  const AddPlayerModal = () => {
    const [form, setForm] = useState(editingItem || { name: '', position: 'Midfielder', age: '', email: '', phone: '' });
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.name || !form.age) return;
      
      const newPlayer = {
        id: editingItem?.id || Date.now(),
        ...form,
        age: parseInt(form.age),
        rating: editingItem?.rating || Math.floor(Math.random() * 20) + 60,
        trend: 'same',
        avatar: form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        createdAt: editingItem?.createdAt || new Date().toISOString()
      };
      
      if (editingItem) {
        setPlayers(players.map(p => p.id === editingItem.id ? newPlayer : p));
      } else {
        setPlayers([...players, newPlayer]);
      }
      
      setShowModal(null);
      setEditingItem(null);
    };

    return (
      <Modal title={editingItem ? 'Edit Player' : 'Add New Player'} onClose={() => { setShowModal(null); setEditingItem(null); }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Enter player name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Position *</label>
              <select value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50">
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Age *</label>
              <input type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} placeholder="Age" min="5" max="50" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email (optional)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="player@email.com" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+1 234 567 8900" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={() => { setShowModal(null); setEditingItem(null); }} className="flex-1 py-3 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2">
              <Save className="w-4 h-4" /><span>{editingItem ? 'Save Changes' : 'Add Player'}</span>
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  // ============================================
  // ADD SESSION MODAL
  // ============================================
  const AddSessionModal = () => {
    const [form, setForm] = useState(editingItem || { title: '', date: '', time: '', type: 'Technical', notes: '', drills: [] });
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.title || !form.date || !form.time) return;
      
      const newSession = {
        id: editingItem?.id || Date.now(),
        ...form,
        players: players.length,
        status: 'scheduled',
        createdAt: editingItem?.createdAt || new Date().toISOString()
      };
      
      if (editingItem) {
        setSessions(sessions.map(s => s.id === editingItem.id ? newSession : s));
      } else {
        setSessions([...sessions, newSession]);
      }
      
      setShowModal(null);
      setEditingItem(null);
    };

    return (
      <Modal title={editingItem ? 'Edit Session' : 'New Training Session'} onClose={() => { setShowModal(null); setEditingItem(null); }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Session Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="e.g., Morning Training" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Time *</label>
              <input type="time" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Session Type</label>
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50">
              <option value="Technical">Technical</option>
              <option value="Tactical">Tactical</option>
              <option value="Physical">Physical</option>
              <option value="Match Prep">Match Prep</option>
              <option value="Recovery">Recovery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Session notes..." rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none" />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={() => { setShowModal(null); setEditingItem(null); }} className="flex-1 py-3 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">{editingItem ? 'Save Changes' : 'Create Session'}</button>
          </div>
        </form>
      </Modal>
    );
  };

  // ============================================
  // GENERATE REPORT MODAL
  // ============================================
  const GenerateReportModal = () => {
    const [form, setForm] = useState({ type: 'Team', title: '', player: '' });
    const [generating, setGenerating] = useState(false);
    
    const handleGenerate = async (e) => {
      e.preventDefault();
      setGenerating(true);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportTitle = form.type === 'Individual' && form.player 
        ? `${form.player} - ${form.title || 'Progress Report'}`
        : form.title || `${form.type} Performance Report`;
      
      const newReport = {
        id: Date.now(),
        title: reportTitle,
        type: form.type,
        date: new Date().toISOString().split('T')[0],
        status: 'ready',
        createdAt: new Date().toISOString()
      };
      
      setReports([newReport, ...reports]);
      setGenerating(false);
      setShowModal(null);
    };

    return (
      <Modal title="Generate Report" onClose={() => setShowModal(null)}>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Report Type</label>
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50">
              <option value="Team">Team Report</option>
              <option value="Individual">Individual Player Report</option>
              <option value="Match">Match Analysis</option>
              <option value="Weekly">Weekly Summary</option>
              <option value="Monthly">Monthly Summary</option>
            </select>
          </div>
          {form.type === 'Individual' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Player</label>
              <select value={form.player} onChange={(e) => setForm({...form, player: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" required>
                <option value="">Choose a player...</option>
                {players.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Report Title (optional)</label>
            <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Custom report title..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-3 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={generating || (form.type === 'Individual' && !form.player)} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating...</span></> : <><FileCheck className="w-4 h-4" /><span>Generate Report</span></>}
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  // ============================================
  // ADD TO SESSION MODAL
  // ============================================
  const AddToSessionModal = ({ drill }) => {
    const handleAddToSession = (sessionId) => {
      setSessions(sessions.map(s => {
        if (s.id === sessionId) {
          const drills = s.drills || [];
          if (!drills.find(d => d.id === drill.id)) {
            return { ...s, drills: [...drills, drill] };
          }
        }
        return s;
      }));
      setShowModal(null);
    };

    return (
      <Modal title="Add Drill to Session" onClose={() => setShowModal(null)}>
        <div className="mb-4 p-4 bg-white/5 rounded-xl">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{drill.icon}</span>
            <div>
              <h4 className="font-bold text-white">{drill.name}</h4>
              <p className="text-gray-400 text-sm">{drill.category} • {drill.duration}</p>
            </div>
          </div>
        </div>
        
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No sessions created yet.</p>
            <button onClick={() => { setShowModal('session'); }} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium">Create a Session First</button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-400 mb-3">Select a session:</p>
            {sessions.map(session => (
              <button key={session.id} onClick={() => handleAddToSession(session.id)} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white group-hover:text-emerald-400">{session.title}</h4>
                    <p className="text-gray-500 text-sm">{session.date} at {session.time}</p>
                  </div>
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    );
  };

  // ============================================
  // PLAYER PROFILES PAGE
  // ============================================
  const PlayersPage = () => {
    const deletePlayer = (id) => {
      if (window.confirm('Are you sure you want to delete this player?')) {
        setPlayers(players.filter(p => p.id !== id));
      }
    };

    const filteredPlayers = players.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.position.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <PageWrapper title="Player Profiles" showSearch>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Players</h2>
            <p className="text-gray-400 mt-1">{players.length} player{players.length !== 1 ? 's' : ''} on your roster</p>
          </div>
          <button onClick={() => setShowModal('player')} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
            <Plus className="w-5 h-5" /><span>Add Player</span>
          </button>
        </div>

        {players.length === 0 ? (
          <EmptyState icon={Users} title="No players yet" description="Add your first player to start tracking their development and decision-making skills." actionLabel="Add Your First Player" onAction={() => setShowModal('player')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-lg font-bold text-white">{player.avatar}</div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{player.name}</h3>
                      <p className="text-gray-400 text-sm">{player.position} • Age {player.age}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-[#0d1210] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button onClick={() => { setEditingItem(player); setShowModal('player'); }} className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/5 flex items-center space-x-2">
                        <Edit className="w-4 h-4" /><span>Edit</span>
                      </button>
                      <button onClick={() => deletePlayer(player.id)} className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/5 flex items-center space-x-2">
                        <Trash2 className="w-4 h-4" /><span>Delete</span>
                      </button>
                    </div>
                  </div>
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
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={`${player.rating * 1.76} 176`} strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageWrapper>
    );
  };

  // ============================================
  // VIDEO LIBRARY PAGE
  // ============================================
  const VideosPage = () => {
    const deleteVideo = (id) => {
      if (window.confirm('Are you sure you want to delete this video?')) {
        setVideos(videos.filter(v => v.id !== id));
      }
    };

    return (
      <PageWrapper title="Video Library" showSearch>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Video Library</h2>
            <p className="text-gray-400 mt-1">{videos.length} video{videos.length !== 1 ? 's' : ''} analyzed</p>
          </div>
          <button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
            <Upload className="w-5 h-5" /><span>Upload</span>
          </button>
        </div>

        {videos.length === 0 ? (
          <EmptyState icon={FileVideo} title="No videos yet" description="Upload your first match footage to start analyzing player decisions with AI." actionLabel="Upload Your First Video" onAction={() => { setCurrentPage('upload'); setUploadState('idle'); }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                    <PlayCircle className="w-8 h-8 text-white group-hover:text-emerald-400" />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white">{video.duration}</div>
                  <button onClick={() => deleteVideo(video.id)} className="absolute top-3 right-3 p-2 bg-black/60 text-gray-400 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{video.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{video.date}</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">{video.decisions} decisions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageWrapper>
    );
  };

  // ============================================
  // AI COACH PAGE
  // ============================================
  const AICoachPage = () => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const suggestions = [
      "How can I improve my team's passing accuracy?",
      "What drills help with decision-making under pressure?",
      "Create a training plan for midfielders",
      "How should we defend against counter-attacks?"
    ];

    const sendMessage = async (text) => {
      if (!text.trim()) return;
      
      const userMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
      setChatHistory(prev => [...prev, userMessage]);
      setMessage('');
      setIsLoading(true);

      try {
        // Call your backend AI endpoint
        const response = await fetch(`${API_BASE}/api/coach`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: text,
            context: {
              playerCount: players.length,
              players: players.map(p => ({ name: p.name, position: p.position, rating: p.rating })),
              recentSessions: sessions.slice(0, 3)
            }
          })
        });

        let aiResponse;
        if (response.ok) {
          const data = await response.json();
          aiResponse = data.response || data.message;
        } else {
          // Fallback response if backend doesn't have /api/coach endpoint
          aiResponse = generateFallbackResponse(text);
        }

        setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }]);
      } catch (err) {
        // Fallback for offline/error
        const fallbackResponse = generateFallbackResponse(text);
        setChatHistory(prev => [...prev, { role: 'assistant', content: fallbackResponse, timestamp: new Date().toISOString() }]);
      }

      setIsLoading(false);
    };

    const generateFallbackResponse = (query) => {
      const q = query.toLowerCase();
      if (q.includes('passing') || q.includes('pass')) {
        return "To improve passing accuracy, I recommend:\n\n1. **Rondo Drills** - Start with 4v2, progress to 5v2\n2. **One-touch passing circuits** - Focus on body positioning before receiving\n3. **Pressure scenarios** - Practice with defenders closing down\n\nWould you like me to add any of these drills to your next session?";
      }
      if (q.includes('decision') || q.includes('pressure')) {
        return "Decision-making under pressure improves with:\n\n1. **Small-sided games** - 3v3 or 4v4 with quick transitions\n2. **Time constraints** - 2-touch maximum rules\n3. **Video analysis** - Review decisions post-training\n\nThe key is creating game-realistic pressure in training.";
      }
      if (q.includes('training plan') || q.includes('midfielder')) {
        return `Here's a weekly plan for midfielders:\n\n**Monday:** Technical - Passing patterns, first touch\n**Tuesday:** Tactical - Positioning, scanning\n**Wednesday:** Physical - Endurance, agility\n**Thursday:** Match scenarios - Decision-making drills\n**Friday:** Recovery + Video analysis\n\nShall I create sessions for any of these?`;
      }
      if (q.includes('defend') || q.includes('counter')) {
        return "Against counter-attacks:\n\n1. **Compact shape** - Reduce space between lines\n2. **Pressing triggers** - When to press vs. drop\n3. **Recovery runs** - Track runners, don't ball-watch\n\nI'd recommend the 'Pressing Triggers' drill from your library.";
      }
      return `Great question! Based on your team of ${players.length} players, here are my thoughts:\n\n${query.length > 50 ? 'This is a detailed topic.' : 'Let me help you with that.'}\n\nI'd recommend focusing on fundamentals first, then building complexity. Would you like specific drill recommendations or a structured training plan?`;
    };

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    return (
      <PageWrapper title="AI Coach Assistant">
        <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
          {chatHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Brain className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">AI Coach Assistant</h2>
              <p className="text-gray-400 text-lg mb-8 text-center max-w-lg">Get personalized tactical advice, training recommendations, and answers to your coaching questions.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestions.map((suggestion, i) => (
                  <button key={i} onClick={() => sendMessage(suggestion)} className="text-left p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-gray-200'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(message); } }}
              placeholder="Ask the AI Coach anything..."
              rows={2}
              className="w-full p-4 pr-24 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
            <button 
              onClick={() => sendMessage(message)}
              disabled={!message.trim() || isLoading}
              className="absolute right-3 bottom-3 p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white rounded-xl transition-all disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {chatHistory.length > 0 && (
            <button onClick={() => setChatHistory([])} className="mt-3 text-gray-500 hover:text-gray-300 text-sm">
              Clear conversation
            </button>
          )}
        </div>
      </PageWrapper>
    );
  };

  // ============================================
  // SESSION PLANNER PAGE
  // ============================================
  const SessionPlannerPage = () => {
    const deleteSession = (id) => {
      if (window.confirm('Delete this session?')) {
        setSessions(sessions.filter(s => s.id !== id));
      }
    };

    const removeDrillFromSession = (sessionId, drillId) => {
      setSessions(sessions.map(s => {
        if (s.id === sessionId) {
          return { ...s, drills: (s.drills || []).filter(d => d.id !== drillId) };
        }
        return s;
      }));
    };

    const formatSessionDate = (date, time) => {
      const d = new Date(date + 'T' + time);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
      if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
      return `${date}, ${time}`;
    };

    return (
      <PageWrapper title="Session Planner">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Training Sessions</h2>
            <p className="text-gray-400 mt-1">{sessions.length} session{sessions.length !== 1 ? 's' : ''} planned</p>
          </div>
          <button onClick={() => setShowModal('session')} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
            <Plus className="w-5 h-5" /><span>New Session</span>
          </button>
        </div>

        {sessions.length === 0 ? (
          <EmptyState icon={Clipboard} title="No sessions planned" description="Create your first training session to start organizing your team's schedule." actionLabel="Create First Session" onAction={() => setShowModal('session')} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {sessions.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time)).map((session) => (
                <div key={session.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{session.title}</h3>
                        <p className="text-gray-400 text-sm">{formatSessionDate(session.date, session.time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-white/10 text-gray-300 text-xs font-medium px-3 py-1 rounded-lg">{session.type}</span>
                      <span className="text-gray-400 text-sm">{players.length} players</span>
                      <button onClick={() => { setEditingItem(session); setShowModal('session'); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSession(session.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {session.drills && session.drills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400 mb-2">Drills ({session.drills.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {session.drills.map(drill => (
                          <div key={drill.id} className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg">
                            <span>{drill.icon}</span>
                            <span className="text-sm text-gray-300">{drill.name}</span>
                            <button onClick={() => removeDrillFromSession(session.id, drill.id)} className="text-gray-500 hover:text-red-400">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {session.notes && <p className="mt-3 text-gray-400 text-sm">{session.notes}</p>}
                </div>
              ))}
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
              <h3 className="font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">This Week</span>
                  <span className="font-bold text-white">{sessions.filter(s => {
                    const d = new Date(s.date);
                    const now = new Date();
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return d >= now && d <= weekFromNow;
                  }).length} sessions</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">Total Drills</span>
                  <span className="font-bold text-white">{sessions.reduce((acc, s) => acc + (s.drills?.length || 0), 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">Players</span>
                  <span className="font-bold text-emerald-400">{players.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    );
  };

  // ============================================
  // AUTO REPORTS PAGE
  // ============================================
  const ReportsPage = () => {
    const deleteReport = (id) => {
      if (window.confirm('Delete this report?')) {
        setReports(reports.filter(r => r.id !== id));
      }
    };

    return (
      <PageWrapper title="Auto Reports">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Generated Reports</h2>
            <p className="text-gray-400 mt-1">{reports.length} report{reports.length !== 1 ? 's' : ''} available</p>
          </div>
          <button onClick={() => setShowModal('report')} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
            <FileCheck className="w-5 h-5" /><span>Generate Report</span>
          </button>
        </div>

        {reports.length === 0 ? (
          <EmptyState icon={FileText} title="No reports yet" description="Generate AI-powered reports to track team and player progress over time." actionLabel="Generate First Report" onAction={() => setShowModal('report')} />
        ) : (
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
                      <Eye className="w-4 h-4" /><span>View</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-all">
                      <Download className="w-4 h-4" /><span>Download</span>
                    </button>
                    <button onClick={() => deleteReport(report.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageWrapper>
    );
  };

  // ============================================
  // DRILL LIBRARY PAGE
  // ============================================
  const DrillsPage = () => {
    const getDifficultyColor = (diff) => {
      if (diff === 'Easy') return 'text-emerald-400 bg-emerald-500/20';
      if (diff === 'Medium') return 'text-amber-400 bg-amber-500/20';
      return 'text-red-400 bg-red-500/20';
    };

    const filteredDrills = drillTemplates.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddToSession = (drill) => {
      setSelectedDrill(drill);
      setShowModal('addToSession');
    };

    return (
      <PageWrapper title="Drill Library" showSearch>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Training Drills</h2>
            <p className="text-gray-400 mt-1">Browse and add drills to your sessions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrills.map((drill) => (
            <div key={drill.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{drill.icon}</div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getDifficultyColor(drill.difficulty)}`}>{drill.difficulty}</span>
              </div>
              <h3 className="font-bold text-white text-lg mb-1 group-hover:text-emerald-400 transition-colors">{drill.name}</h3>
              <p className="text-gray-500 text-sm mb-2">{drill.category}</p>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{drill.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Timer className="w-4 h-4" /><span>{drill.duration}</span>
                </div>
                <button 
                  onClick={() => handleAddToSession(drill)}
                  disabled={sessions.length === 0}
                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Session
                </button>
              </div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <p className="text-amber-200 text-sm">Create a session first to add drills. <button onClick={() => setShowModal('session')} className="underline font-medium">Create Session</button></p>
          </div>
        )}
      </PageWrapper>
    );
  };

  // ============================================
  // TEAM STATS PAGE
  // ============================================
  const TeamStatsPage = () => {
    const avgRating = players.length > 0 ? Math.round(players.reduce((acc, p) => acc + p.rating, 0) / players.length) : 0;
    
    return (
      <PageWrapper title="Team Stats">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Team Statistics</h2>
          <p className="text-gray-400 mt-1">Overall team performance metrics</p>
        </div>

        {players.length === 0 ? (
          <EmptyState icon={BarChart3} title="No data yet" description="Add players and analyze videos to start seeing team statistics." actionLabel="Add Players" onAction={() => setCurrentPage('players')} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Avg Decision IQ', value: avgRating, change: '+3.2%', positive: true },
                { label: 'Total Players', value: players.length, change: null },
                { label: 'Videos Analyzed', value: videos.length, change: null },
                { label: 'Sessions Planned', value: sessions.length, change: null },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-gray-500 text-sm mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                    {stat.change && (
                      <span className={`flex items-center text-sm font-medium ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stat.positive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {stat.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Position Distribution</h3>
                <div className="space-y-4">
                  {['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((pos, i) => {
                    const count = players.filter(p => p.position === pos).length;
                    const pct = players.length > 0 ? Math.round((count / players.length) * 100) : 0;
                    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                    return (
                      <div key={pos}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{pos}</span>
                          <span className="text-white font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[i]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Top Performers</h3>
                {players.length > 0 ? (
                  <div className="space-y-4">
                    {players.sort((a, b) => b.rating - a.rating).slice(0, 3).map((player, i) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-amber-400">#{i + 1}</span>
                          <div>
                            <p className="font-medium text-white">{player.name}</p>
                            <p className="text-gray-500 text-xs">{player.position}</p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-emerald-400">{player.rating}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Add players to see rankings</p>
                )}
              </div>
            </div>
          </>
        )}
      </PageWrapper>
    );
  };

  // ============================================
  // PROGRESS TRACKING PAGE
  // ============================================
  const ProgressPage = () => {
    return (
      <PageWrapper title="Progress Tracking">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Team Progress</h2>
          <p className="text-gray-400 mt-1">Track improvement over time</p>
        </div>

        {players.length === 0 && videos.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No progress data yet" description="Add players and analyze videos to start tracking progress." actionLabel="Get Started" onAction={() => setCurrentPage('upload')} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-sm">Players Added</p>
                    <p className="text-3xl font-bold text-white">{players.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Video className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Videos Analyzed</p>
                    <p className="text-3xl font-bold text-white">{videos.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Sessions</p>
                    <p className="text-3xl font-bold text-white">{sessions.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Player Ratings Overview</h3>
              {players.length > 0 ? (
                <div className="space-y-3">
                  {players.map(player => (
                    <div key={player.id} className="flex items-center space-x-4">
                      <div className="w-24 text-sm text-gray-400 truncate">{player.name}</div>
                      <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${player.rating}%` }} />
                      </div>
                      <div className="w-12 text-right text-white font-bold">{player.rating}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Add players to see progress</p>
              )}
            </div>
          </>
        )}
      </PageWrapper>
    );
  };

  // ============================================
  // BENCHMARKS PAGE
  // ============================================
  const BenchmarksPage = () => {
    const avgRating = players.length > 0 ? Math.round(players.reduce((acc, p) => acc + p.rating, 0) / players.length) : 0;
    
    const benchmarks = [
      { category: 'Decision IQ', team: avgRating, elite: 92, icon: Brain },
      { category: 'Pass Accuracy', team: Math.min(avgRating + 5, 100), elite: 95, icon: Target },
      { category: 'Spatial Awareness', team: Math.max(avgRating - 7, 0), elite: 88, icon: Eye },
      { category: 'Under Pressure', team: Math.max(avgRating - 10, 0), elite: 85, icon: Activity },
    ];

    return (
      <PageWrapper title="Benchmarks">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Elite Benchmarks</h2>
          <p className="text-gray-400 mt-1">Compare your team against elite standards</p>
        </div>

        {players.length === 0 ? (
          <EmptyState icon={Target} title="No benchmark data" description="Add players to compare against elite benchmarks." actionLabel="Add Players" onAction={() => setCurrentPage('players')} />
        ) : (
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
                  <div className="absolute h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${benchmark.team}%` }} />
                  <div className="absolute h-full w-1 bg-amber-400" style={{ left: `${benchmark.elite}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-emerald-400 text-sm">{benchmark.team}% - Your Team</span>
                  <span className="text-amber-400 text-sm">{benchmark.elite}% - Elite Target</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageWrapper>
    );
  };

  // ============================================
  // UPLOAD PAGE
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
      
      // Save video to library
      const newVideo = {
        id: Date.now(),
        title: videoFile.name.replace(/\.[^/.]+$/, ''),
        date: new Date().toISOString().split('T')[0],
        duration: videoRef.current ? formatTime(videoRef.current.duration) : '00:00',
        decisions: results.decision_points?.length || 0
      };
      setVideos([newVideo, ...videos]);
      
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const StepIndicator = ({ step, label, state, complete }) => (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${complete ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : state ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110' : 'bg-white/10 text-gray-500'}`}>
        {complete ? <CheckCircle className="w-5 h-5" /> : step}
      </div>
      <span className={`mt-2 text-xs font-medium ${state ? 'text-emerald-400' : 'text-gray-500'}`}>{label}</span>
    </div>
  );

  const UploadPage = () => (
    <PageWrapper title="Video Analysis">
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
                      <CheckCircle className="w-5 h-5" /><span className="font-semibold">Player selected!</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertCircle className="w-5 h-5" /><span>Click on a player to select them</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button onClick={resetUpload} className="px-5 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button>
                  <button onClick={startAnalysis} disabled={!clickPosition} className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${clickPosition ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}>
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
            <h2 className="text-2xl font-bold text-white mb-2">{uploadState === 'uploading' ? 'Uploading Video...' : 'AI Analyzing...'}</h2>
            <p className="text-gray-400 mb-8">{uploadState === 'uploading' ? 'Sending to GPU servers' : 'Tracking player movements'}</p>
            <div className="max-w-md mx-auto">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all rounded-full" style={{ width: `${uploadState === 'analyzing' ? 100 : uploadProgress}%` }} />
              </div>
            </div>
          </div>
        )}

        {uploadState === 'complete' && analysisResults && (
          <AnalysisResults results={analysisResults} videoUrl={videoUrl} videoRef={videoRef} currentIndex={currentDecisionIndex} setCurrentIndex={setCurrentDecisionIndex} quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers} onReset={resetUpload} />
        )}
      </div>
    </PageWrapper>
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
              <p className="text-gray-400">Found {decisions.length} key decision moments</p>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center"><div className="text-3xl font-bold text-emerald-400">{decisions.length}</div><div className="text-gray-500 text-sm">Decisions</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-emerald-400">{Math.round((quizAnswers.filter(Boolean).length / Math.max(decisions.length, 1)) * 100)}%</div><div className="text-gray-500 text-sm">Reviewed</div></div>
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
                  <button key={idx} onClick={() => goToDecision(idx)} className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${idx === currentIndex ? 'bg-emerald-500 text-white' : quizAnswers[idx] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {formatTime(decision.timestamp)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {currentDecision ? (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-lg">{currentIndex + 1}/{decisions.length}</div>
                  <span className="text-gray-500 text-sm">{currentDecision.zone}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">What should the player do?</h3>
                <div className="space-y-3 mb-6">
                  {['Pass Forward', 'Dribble', 'Pass Back', 'Shoot'].map((option) => (
                    <button key={option} onClick={() => handleAnswer(option)} className={`w-full p-4 rounded-xl font-medium text-left transition-all ${quizAnswers[currentIndex] === option ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:border-emerald-500/30'}`}>{option}</button>
                  ))}
                </div>
                {quizAnswers[currentIndex] && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2"><Award className="w-5 h-5" /><span>Elite Comparison</span></div>
                    <p className="text-sm text-gray-300">Kevin De Bruyne would choose <strong className="text-white">Pass Forward</strong> 78% of the time.</p>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button onClick={() => goToDecision(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="flex-1 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium disabled:opacity-30">Previous</button>
                  <button onClick={() => goToDecision(Math.min(decisions.length - 1, currentIndex + 1))} disabled={currentIndex === decisions.length - 1} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-medium disabled:opacity-30">Next</button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500"><Target className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No decisions found</p></div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
          <button onClick={onReset} className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white font-medium"><RotateCcw className="w-4 h-4" /><span>Analyze Another</span></button>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-5 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5"><Share2 className="w-4 h-4" /><span>Share</span></button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold"><Download className="w-4 h-4" /><span>Export</span></button>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard
  const Dashboard = () => (
    <PageWrapper title="Dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋</h1>
        <p className="text-gray-400">
          {players.length === 0 && videos.length === 0 
            ? "Let's get started by adding your team or uploading your first video."
            : "Here's your team overview."}
        </p>
      </div>

      <div onClick={() => setCurrentPage('upload')} className="group bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-3xl p-8 cursor-pointer hover:border-emerald-500/50 transition-all mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3"><Brain className="w-6 h-6 text-emerald-400" /><span className="font-bold text-lg text-emerald-400">AI Video Analysis</span></div>
            <h2 className="text-2xl font-bold text-white mb-3">Analyze player decisions with AI</h2>
            <p className="text-gray-400 mb-6 max-w-lg">Upload match footage, select a player, and get instant tactical insights.</p>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-500/25">
              <Upload className="w-5 h-5" /><span>Upload Video</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="hidden lg:block">
            <div className="w-40 h-40 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Video className="w-16 h-16 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => setCurrentPage('players')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            {players.length === 0 && <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">Setup needed</span>}
          </div>
          <div className="text-3xl font-bold text-white mb-1">{players.length}</div>
          <div className="text-gray-500 text-sm group-hover:text-gray-300">Players</div>
        </div>

        <div onClick={() => setCurrentPage('videos')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FileVideo className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{videos.length}</div>
          <div className="text-gray-500 text-sm group-hover:text-gray-300">Videos Analyzed</div>
        </div>

        <div onClick={() => setCurrentPage('planner')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{sessions.length}</div>
          <div className="text-gray-500 text-sm group-hover:text-gray-300">Sessions Planned</div>
        </div>
      </div>

      {players.length === 0 && (
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="font-bold text-white mb-2">🚀 Quick Start Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <button onClick={() => setShowModal('player')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">1</div>
                <span className="font-medium text-white">Add Your Players</span>
              </div>
              <p className="text-gray-400 text-sm">Build your team roster to track development.</p>
            </button>
            <button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">2</div>
                <span className="font-medium text-white">Upload a Video</span>
              </div>
              <p className="text-gray-400 text-sm">Analyze match footage with AI.</p>
            </button>
            <button onClick={() => setShowModal('session')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">3</div>
                <span className="font-medium text-white">Plan a Session</span>
              </div>
              <p className="text-gray-400 text-sm">Schedule training with drills.</p>
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );

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
      
      {/* Modals */}
      {showModal === 'player' && <AddPlayerModal />}
      {showModal === 'session' && <AddSessionModal />}
      {showModal === 'report' && <GenerateReportModal />}
      {showModal === 'addToSession' && selectedDrill && <AddToSessionModal drill={selectedDrill} />}
    </div>
  );
}
