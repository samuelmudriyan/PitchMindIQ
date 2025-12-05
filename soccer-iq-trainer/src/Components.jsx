import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import {
  ChevronRight, ChevronLeft, Home, Users, FileVideo, Lightbulb,
  Clipboard, FileText, BookOpen, BarChart3, TrendingUp, Target,
  Upload, Bell, Settings, Search, X
} from 'lucide-react';
import logo from './assets/logo.png'; // Your actual logo file

// ============================================
// LOGO COMPONENT
// ============================================
export const Logo = ({ size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  return (
    <img 
      src={logo} 
      alt="PitchMind" 
      className={`${sizes[size]} object-contain`}
    />
  );
};

// ============================================
// SIDEBAR COMPONENT
// ============================================
export const Sidebar = ({ 
  currentPage, 
  setCurrentPage, 
  sidebarCollapsed, 
  setSidebarCollapsed,
  playerCount,
  setUploadState
}) => {
  const SidebarItem = ({ icon: Icon, label, active, onClick, count, badge }) => (
    <button
      onClick={onClick}
      title={sidebarCollapsed ? label : ''}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium group ${
        active 
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'group-hover:text-emerald-400'} transition-colors`} />
        {!sidebarCollapsed && <span>{label}</span>}
      </div>
      {!sidebarCollapsed && count > 0 && (
        <span className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
      )}
      {!sidebarCollapsed && badge && (
        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{badge}</span>
      )}
    </button>
  );

  return (
    <div className={`fixed left-0 top-0 h-screen bg-[#0d1210] border-r border-white/10 flex flex-col z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <SidebarItem icon={Home} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
        <SidebarItem icon={Users} label="Player Profiles" active={currentPage === 'players'} onClick={() => setCurrentPage('players')} count={playerCount} />
        <SidebarItem icon={FileVideo} label="Video Library" active={currentPage === 'videos'} onClick={() => setCurrentPage('videos')} />
        <SidebarItem icon={Lightbulb} label="AI Coach" active={currentPage === 'assistant'} onClick={() => setCurrentPage('assistant')} badge="New" />
        <SidebarItem icon={Clipboard} label="Session Planner" active={currentPage === 'planner'} onClick={() => setCurrentPage('planner')} />
        <SidebarItem icon={FileText} label="Auto Reports" active={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} />
        <SidebarItem icon={BookOpen} label="Drill Library" active={currentPage === 'drills'} onClick={() => setCurrentPage('drills')} />
        
        {!sidebarCollapsed && (
          <div className="pt-4 pb-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Analytics</div>
          </div>
        )}
        
        <SidebarItem icon={BarChart3} label="Team Stats" active={currentPage === 'stats'} onClick={() => setCurrentPage('stats')} />
        <SidebarItem icon={TrendingUp} label="Progress" active={currentPage === 'progress'} onClick={() => setCurrentPage('progress')} />
        <SidebarItem icon={Target} label="Benchmarks" active={currentPage === 'benchmarks'} onClick={() => setCurrentPage('benchmarks')} />
      </nav>

      {/* Upload Button */}
      <div className="p-3 border-t border-white/10">
        <button 
          onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }}
          className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}
        >
          <Upload className="w-5 h-5" />
          {!sidebarCollapsed && <span>Upload Video</span>}
        </button>
      </div>
    </div>
  );
};

// ============================================
// TOP BAR COMPONENT
// ============================================
export const TopBar = ({ 
  title, 
  showSearch = false, 
  searchQuery, 
  setSearchQuery, 
  sidebarCollapsed,
  currentPage,
  setCurrentPage
}) => (
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

// ============================================
// PAGE WRAPPER COMPONENT
// ============================================
export const PageWrapper = ({ children, title, showSearch, searchQuery, setSearchQuery, sidebarCollapsed, currentPage, setCurrentPage }) => (
  <div className={`pt-16 min-h-screen bg-[#0a0f0d] transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
    <TopBar 
      title={title} 
      showSearch={showSearch} 
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      sidebarCollapsed={sidebarCollapsed}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]" />
    </div>
    <div className="relative p-8">{children}</div>
  </div>
);

// ============================================
// MODAL COMPONENT
// ============================================
export const Modal = ({ title, children, onClose, size = 'md' }) => {
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
export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
      <Icon className="w-10 h-10 text-gray-500" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 max-w-md mb-6">{description}</p>
    {actionLabel && (
      <button onClick={onAction} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">
        <span>{actionLabel}</span>
      </button>
    )}
  </div>
);

// ============================================
// SOCCER FIELD SVG COMPONENT (Base)
// ============================================
export const SoccerField = ({ children, mini = false }) => {
  const width = mini ? 200 : 320;
  const height = mini ? 140 : 220;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Field background */}
      <rect x="0" y="0" width={width} height={height} fill="#1a472a" rx="4" />
      
      {/* Field outline */}
      <rect x="10" y="10" width={width - 20} height={height - 20} fill="none" stroke="#2d5a3d" strokeWidth="2" />
      
      {/* Center line */}
      <line x1={width/2} y1="10" x2={width/2} y2={height - 10} stroke="#2d5a3d" strokeWidth="2" />
      
      {/* Center circle */}
      <circle cx={width/2} cy={height/2} r={mini ? 20 : 30} fill="none" stroke="#2d5a3d" strokeWidth="2" />
      <circle cx={width/2} cy={height/2} r="3" fill="#2d5a3d" />
      
      {/* Left penalty area */}
      <rect x="10" y={height/2 - (mini ? 30 : 45)} width={mini ? 25 : 40} height={mini ? 60 : 90} fill="none" stroke="#2d5a3d" strokeWidth="2" />
      <rect x="10" y={height/2 - (mini ? 15 : 22)} width={mini ? 10 : 16} height={mini ? 30 : 44} fill="none" stroke="#2d5a3d" strokeWidth="2" />
      
      {/* Right penalty area */}
      <rect x={width - (mini ? 35 : 50)} y={height/2 - (mini ? 30 : 45)} width={mini ? 25 : 40} height={mini ? 60 : 90} fill="none" stroke="#2d5a3d" strokeWidth="2" />
      <rect x={width - (mini ? 20 : 26)} y={height/2 - (mini ? 15 : 22)} width={mini ? 10 : 16} height={mini ? 30 : 44} fill="none" stroke="#2d5a3d" strokeWidth="2" />
      
      {/* Custom drill elements */}
      {children}
    </svg>
  );
};

// Player marker component
const Player = ({ x, y, color = '#10b981', number, isDefender = false }) => (
  <g>
    <circle cx={x} cy={y} r="10" fill={isDefender ? '#ef4444' : color} stroke="#fff" strokeWidth="2" />
    {number && <text x={x} y={y + 4} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">{number}</text>}
  </g>
);

// Ball component
const Ball = ({ x, y }) => (
  <circle cx={x} cy={y} r="5" fill="#fff" stroke="#000" strokeWidth="1" />
);

// Arrow component for movement
const Arrow = ({ x1, y1, x2, y2, color = '#fbbf24', dashed = false }) => (
  <g>
    <defs>
      <marker id={`arrowhead-${color.replace('#', '')}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <polygon points="0 0, 6 3, 0 6" fill={color} />
      </marker>
    </defs>
    <line 
      x1={x1} y1={y1} x2={x2} y2={y2} 
      stroke={color} 
      strokeWidth="2" 
      strokeDasharray={dashed ? "5,5" : "none"}
      markerEnd={`url(#arrowhead-${color.replace('#', '')})`} 
    />
  </g>
);

// Cone component
const Cone = ({ x, y }) => (
  <polygon points={`${x},${y-6} ${x-5},${y+4} ${x+5},${y+4}`} fill="#f97316" stroke="#fff" strokeWidth="1" />
);

// ============================================
// DRILL VISUALIZATION COMPONENTS
// ============================================

// Rondo 4v2 - 4 attackers on outside, 2 defenders in middle
export const DrillRondo4v2 = () => (
  <SoccerField mini>
    {/* Box outline */}
    <rect x="40" y="30" width="120" height="80" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,5" />
    
    {/* 4 Attackers on edges */}
    <Player x={100} y={30} color="#10b981" number="1" />
    <Player x={100} y={110} color="#10b981" number="2" />
    <Player x={40} y={70} color="#10b981" number="3" />
    <Player x={160} y={70} color="#10b981" number="4" />
    
    {/* 2 Defenders in middle */}
    <Player x={85} y={60} isDefender number="D" />
    <Player x={115} y={80} isDefender number="D" />
    
    {/* Ball */}
    <Ball x={100} y={35} />
    
    {/* Passing arrows */}
    <Arrow x1={100} y1={40} x2={155} y2={68} color="#10b981" dashed />
  </SoccerField>
);

// Box Possession - Keep ball in tight space
export const DrillBoxPossession = () => (
  <SoccerField mini>
    {/* Box */}
    <rect x="50" y="35" width="100" height="70" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,5" />
    
    {/* Corner players */}
    <Player x={50} y={35} color="#10b981" number="1" />
    <Player x={150} y={35} color="#10b981" number="2" />
    <Player x={50} y={105} color="#10b981" number="3" />
    <Player x={150} y={105} color="#10b981" number="4" />
    
    {/* Middle players */}
    <Player x={100} y={35} color="#3b82f6" number="5" />
    <Player x={100} y={105} color="#3b82f6" number="6" />
    
    {/* Defenders */}
    <Player x={85} y={65} isDefender number="D" />
    <Player x={115} y={75} isDefender number="D" />
    
    <Ball x={55} y={40} />
    
    {/* Pass pattern */}
    <Arrow x1={55} y1={45} x2={95} y2={35} color="#10b981" dashed />
    <Arrow x1={105} y1={35} x2={145} y2={38} color="#10b981" dashed />
  </SoccerField>
);

// 1v1 Defending
export const Drill1v1Defending = () => (
  <SoccerField mini>
    {/* Channel markers */}
    <line x1="60" y1="20" x2="60" y2="120" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,5" />
    <line x1="140" y1="20" x2="140" y2="120" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,5" />
    
    {/* Goal area highlight */}
    <rect x="10" y="45" width="25" height="50" fill="#ef4444" fillOpacity="0.2" />
    
    {/* Attacker with ball */}
    <Player x={120} y={70} color="#10b981" number="A" />
    <Ball x={115} y={75} />
    
    {/* Defender */}
    <Player x={80} y={70} isDefender number="D" />
    
    {/* Attack direction */}
    <Arrow x1={115} y1={70} x2={50} y2={70} color="#10b981" />
    
    {/* Defender stance arrows */}
    <Arrow x1={75} y1={60} x2={75} y2={50} color="#ef4444" dashed />
    <Arrow x1={75} y1={80} x2={75} y2={90} color="#ef4444" dashed />
    
    {/* Cones for channel */}
    <Cone x={60} y={30} />
    <Cone x={60} y={110} />
    <Cone x={140} y={30} />
    <Cone x={140} y={110} />
  </SoccerField>
);

// Finishing Circuit
export const DrillFinishingCircuit = () => (
  <SoccerField mini>
    {/* Shooting positions */}
    <Player x={100} y={50} color="#10b981" number="1" />
    <Player x={60} y={80} color="#10b981" number="2" />
    <Player x={140} y={80} color="#10b981" number="3" />
    
    {/* Server/passer */}
    <Player x={100} y={110} color="#3b82f6" number="S" />
    
    {/* Goalkeeper */}
    <Player x={20} y={70} color="#8b5cf6" number="GK" />
    
    {/* Shooting arrows */}
    <Arrow x1={95} y1={50} x2={35} y2={65} color="#fbbf24" />
    <Arrow x1={55} y1={80} x2={35} y2={75} color="#fbbf24" />
    <Arrow x1={135} y1={80} x2={35} y2={80} color="#fbbf24" />
    
    {/* Pass from server */}
    <Arrow x1={100} y1={105} x2={100} y2={55} color="#3b82f6" dashed />
    
    {/* Cones for positions */}
    <Cone x={100} y={45} />
    <Cone x={55} y={85} />
    <Cone x={145} y={85} />
    
    <Ball x={100} y={110} />
  </SoccerField>
);

// Pressing Triggers
export const DrillPressingTriggers = () => (
  <SoccerField mini>
    {/* Pressing team (compact shape) */}
    <Player x={80} y={50} color="#10b981" number="9" />
    <Player x={60} y={70} color="#10b981" number="10" />
    <Player x={100} y={70} color="#10b981" number="11" />
    <Player x={50} y={95} color="#10b981" number="8" />
    <Player x={80} y={95} color="#10b981" number="6" />
    <Player x={110} y={95} color="#10b981" number="7" />
    
    {/* Opposition with ball */}
    <Player x={160} y={40} isDefender number="CB" />
    <Player x={160} y={70} isDefender number="CM" />
    <Ball x={165} y={45} />
    
    {/* Pressing trigger arrow */}
    <Arrow x1={85} y1={50} x2={150} y2={42} color="#fbbf24" />
    
    {/* Compact shape lines */}
    <line x1="50" y1="60" x2="110" y2="60" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
    <line x1="50" y1="85" x2="110" y2="85" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
    
    {/* Press trigger zone */}
    <rect x="130" y="25" width="60" height="40" fill="#fbbf24" fillOpacity="0.15" stroke="#fbbf24" strokeDasharray="3,3" />
    <text x="160" y="20" textAnchor="middle" fontSize="8" fill="#fbbf24">TRIGGER</text>
  </SoccerField>
);

// Quick Transitions
export const DrillQuickTransitions = () => (
  <SoccerField mini>
    {/* Defensive positions */}
    <Player x={40} y={70} color="#3b82f6" number="CB" />
    <Player x={60} y={55} color="#3b82f6" number="CM" />
    
    {/* Ball won position */}
    <Ball x={65} y={60} />
    
    {/* Transition runners */}
    <Player x={100} y={50} color="#10b981" number="10" />
    <Player x={80} y={90} color="#10b981" number="9" />
    <Player x={120} y={85} color="#10b981" number="11" />
    
    {/* Opposition recovering */}
    <Player x={140} y={60} isDefender number="D" />
    <Player x={160} y={80} isDefender number="D" />
    
    {/* Transition arrows */}
    <Arrow x1={70} y1={58} x2={95} y2={52} color="#fbbf24" />
    <Arrow x1={105} y1={50} x2={155} y2={55} color="#10b981" />
    <Arrow x1={85} y1={88} x2={150} y2={75} color="#10b981" dashed />
    <Arrow x1={125} y1={83} x2={170} y2={70} color="#10b981" dashed />
    
    {/* Counter attack zone */}
    <text x="130" y="115" textAnchor="middle" fontSize="7" fill="#fbbf24">ATTACK →</text>
  </SoccerField>
);

// Crossing & Finishing
export const DrillCrossingFinishing = () => (
  <SoccerField mini>
    {/* Wide player */}
    <Player x={170} y={35} color="#10b981" number="7" />
    <Ball x={175} y={40} />
    
    {/* Attackers in box */}
    <Player x={45} y={55} color="#10b981" number="9" />
    <Player x={55} y={80} color="#10b981" number="10" />
    <Player x={70} y={95} color="#10b981" number="11" />
    
    {/* Defenders */}
    <Player x={35} y={65} isDefender number="D" />
    <Player x={45} y={90} isDefender number="D" />
    
    {/* Goalkeeper */}
    <Player x={15} y={70} color="#8b5cf6" number="GK" />
    
    {/* Crossing arrow */}
    <Arrow x1={168} y1={40} x2={50} y2={60} color="#fbbf24" />
    
    {/* Run arrows */}
    <Arrow x1={50} y1={55} x2={35} y2={50} color="#10b981" dashed />
    <Arrow x1={60} y1={80} x2={40} y2={70} color="#10b981" dashed />
    <Arrow x1={75} y1={95} x2={50} y2={85} color="#10b981" dashed />
    
    {/* Target zones */}
    <rect x="25" y="45" width="30" height="15" fill="#fbbf24" fillOpacity="0.2" rx="2" />
    <rect x="25" y="65" width="30" height="15" fill="#fbbf24" fillOpacity="0.2" rx="2" />
  </SoccerField>
);

// Build-up Play
export const DrillBuildUpPlay = () => (
  <SoccerField mini>
    {/* GK */}
    <Player x={20} y={70} color="#8b5cf6" number="GK" />
    <Ball x={25} y={75} />
    
    {/* Center backs */}
    <Player x={50} y={45} color="#10b981" number="CB" />
    <Player x={50} y={95} color="#10b981" number="CB" />
    
    {/* Full backs */}
    <Player x={75} y={25} color="#10b981" number="RB" />
    <Player x={75} y={115} color="#10b981" number="LB" />
    
    {/* Midfielders */}
    <Player x={90} y={55} color="#3b82f6" number="6" />
    <Player x={90} y={85} color="#3b82f6" number="8" />
    
    {/* Pressing opponents */}
    <Player x={100} y={70} isDefender number="9" />
    <Player x={120} y={50} isDefender number="10" />
    
    {/* Build-up passing options */}
    <Arrow x1={25} y1={72} x2={45} y2={48} color="#10b981" dashed />
    <Arrow x1={25} y1={78} x2={45} y2={92} color="#10b981" dashed />
    <Arrow x1={55} y1={45} x2={70} y2={28} color="#fbbf24" dashed />
    <Arrow x1={55} y1={95} x2={70} y2={112} color="#fbbf24" dashed />
    <Arrow x1={55} y1={50} x2={85} y2={55} color="#3b82f6" dashed />
    
    {/* Passing lanes highlighted */}
    <text x="100" y="15" textAnchor="middle" fontSize="7" fill="#fbbf24">BUILD FROM BACK</text>
  </SoccerField>
);

// Export all drill visualizations mapped by drill ID
export const DrillVisualizations = {
  'd1': DrillRondo4v2,
  'd2': DrillBoxPossession,
  'd3': Drill1v1Defending,
  'd4': DrillFinishingCircuit,
  'd5': DrillPressingTriggers,
  'd6': DrillQuickTransitions,
  'd7': DrillCrossingFinishing,
  'd8': DrillBuildUpPlay,
};

// Drill data with all info
export const drillTemplates = [
  { id: 'd1', name: 'Rondo 4v2', category: 'Passing', difficulty: 'Medium', duration: '15 min', icon: '⚽', description: 'Classic possession drill focusing on quick passing and movement. 4 attackers keep the ball from 2 defenders in a confined space.' },
  { id: 'd2', name: 'Box Possession', category: 'Possession', difficulty: 'Hard', duration: '20 min', icon: '🎯', description: 'Advanced possession drill in tight spaces. Players on corners and edges must move the ball while defenders press.' },
  { id: 'd3', name: '1v1 Defending', category: 'Defending', difficulty: 'Medium', duration: '12 min', icon: '🛡️', description: 'Individual defending technique and positioning. Defender must channel attacker and prevent shots on goal.' },
  { id: 'd4', name: 'Finishing Circuit', category: 'Shooting', difficulty: 'Easy', duration: '18 min', icon: '🥅', description: 'Various finishing scenarios from different angles. Rotate through 3 shooting positions with server passes.' },
  { id: 'd5', name: 'Pressing Triggers', category: 'Tactical', difficulty: 'Hard', duration: '25 min', icon: '📍', description: 'Team pressing patterns and trigger recognition. Learn when to press as a unit vs hold shape.' },
  { id: 'd6', name: 'Quick Transitions', category: 'Transition', difficulty: 'Medium', duration: '15 min', icon: '⚡', description: 'Fast transition play from defense to attack. Win the ball and exploit space before defense recovers.' },
  { id: 'd7', name: 'Crossing & Finishing', category: 'Attacking', difficulty: 'Medium', duration: '20 min', icon: '🎯', description: 'Wide play and finishing from crosses. Attackers make runs to near post, far post, and penalty spot.' },
  { id: 'd8', name: 'Build-up Play', category: 'Tactical', difficulty: 'Hard', duration: '25 min', icon: '📐', description: 'Playing out from the back patterns. GK and defenders work through midfield press with passing patterns.' },
];
