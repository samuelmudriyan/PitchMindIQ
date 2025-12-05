import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Upload, CheckCircle, AlertCircle, Loader2, Target, Clock, Brain,
  TrendingUp, Award, Video, Users, FileVideo, Plus, Calendar, Edit, Trash2,
  Eye, MoreVertical, PlayCircle, FileCheck, MessageSquare, Timer, Send,
  Save, AlertTriangle, ArrowUp, ArrowDown, RotateCcw, Share2, Download,
  Zap, MousePointer, Sparkles, X, ArrowRight, Activity
} from 'lucide-react';
import { PageWrapper, Modal, EmptyState, DrillVisualizations, drillTemplates } from './Components';

const API_BASE = 'https://pitchmind-backend-production-483d.up.railway.app';

// ============================================
// DASHBOARD PAGE
// ============================================
export const Dashboard = ({ 
  players, videos, sessions, setCurrentPage, setShowModal, setUploadState, sidebarCollapsed, searchQuery, setSearchQuery 
}) => {
  const { user } = useUser();
  
  return (
    <PageWrapper title="Dashboard" sidebarCollapsed={sidebarCollapsed} currentPage="dashboard" setCurrentPage={setCurrentPage} searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋</h1>
        <p className="text-gray-400">
          {players.length === 0 && videos.length === 0 
            ? "Let's get started by adding your team or uploading your first video."
            : "Here's your team overview."}
        </p>
      </div>

      {/* Main CTA */}
      <div onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="group bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-3xl p-8 cursor-pointer hover:border-emerald-500/50 transition-all mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="w-6 h-6 text-emerald-400" />
              <span className="font-bold text-lg text-emerald-400">AI Video Analysis</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Analyze player decisions with AI</h2>
            <p className="text-gray-400 mb-6 max-w-lg">Upload match footage, select a player, and get instant tactical insights.</p>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-500/25">
              <Upload className="w-5 h-5" />
              <span>Upload Video</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="hidden lg:block">
            <div className="w-40 h-40 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Video className="w-16 h-16 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
            <FileVideo className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{videos.length}</div>
          <div className="text-gray-500 text-sm group-hover:text-gray-300">Videos Analyzed</div>
        </div>

        <div onClick={() => setCurrentPage('planner')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{sessions.length}</div>
          <div className="text-gray-500 text-sm group-hover:text-gray-300">Sessions Planned</div>
        </div>
      </div>

      {/* Quick Start for new users */}
      {players.length === 0 && (
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="font-bold text-white mb-2">🚀 Quick Start Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <button onClick={() => setShowModal('player')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">1</div>
                <span className="font-medium text-white">Add Your Players</span>
              </div>
              <p className="text-gray-400 text-sm">Build your team roster.</p>
            </button>
            <button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">2</div>
                <span className="font-medium text-white">Upload a Video</span>
              </div>
              <p className="text-gray-400 text-sm">Analyze with AI.</p>
            </button>
            <button onClick={() => setShowModal('session')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">3</div>
                <span className="font-medium text-white">Plan a Session</span>
              </div>
              <p className="text-gray-400 text-sm">Schedule training.</p>
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

// ============================================
// PLAYERS PAGE
// ============================================
export const PlayersPage = ({ 
  players, setPlayers, setShowModal, setEditingItem, sidebarCollapsed, searchQuery, setSearchQuery, setCurrentPage 
}) => {
  const deletePlayer = (id) => {
    if (window.confirm('Delete this player?')) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper title="Player Profiles" showSearch sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="players" setCurrentPage={setCurrentPage}>
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
        <EmptyState icon={Users} title="No players yet" description="Add your first player to start tracking their development." actionLabel="Add Your First Player" onAction={() => setShowModal('player')} />
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
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setEditingItem(player); setShowModal('player'); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deletePlayer(player.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
// VIDEOS PAGE
// ============================================
export const VideosPage = ({ 
  videos, setVideos, setCurrentPage, setUploadState, sidebarCollapsed, searchQuery, setSearchQuery 
}) => {
  const deleteVideo = (id) => {
    if (window.confirm('Delete this video?')) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  return (
    <PageWrapper title="Video Library" showSearch sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="videos" setCurrentPage={setCurrentPage}>
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
        <EmptyState icon={FileVideo} title="No videos yet" description="Upload your first match footage to start analyzing player decisions." actionLabel="Upload Your First Video" onAction={() => { setCurrentPage('upload'); setUploadState('idle'); }} />
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
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{video.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-500 text-sm">{video.date}</p>
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
export const AICoachPage = ({ 
  players, sessions, chatHistory, setChatHistory, sidebarCollapsed, searchQuery, setSearchQuery, setCurrentPage 
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const suggestions = [
    "How can I improve my team's passing accuracy?",
    "What drills help with decision-making under pressure?",
    "Create a weekly training plan for midfielders",
    "How should we defend against counter-attacks?"
  ];

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
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
        aiResponse = "I'm having trouble connecting to the AI service. Please make sure the /api/coach endpoint is configured on your backend with the Anthropic API key.";
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Connection error. Please check that your backend is running and has the /api/coach endpoint configured.", 
        timestamp: new Date().toISOString() 
      }]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <PageWrapper title="AI Coach Assistant" sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="assistant" setCurrentPage={setCurrentPage}>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Brain className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">AI Coach Assistant</h2>
            <p className="text-gray-400 text-lg mb-8 text-center max-w-lg">Get personalized tactical advice powered by Claude AI.</p>
            
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
export const SessionPlannerPage = ({ 
  sessions, setSessions, players, setShowModal, setEditingItem, sidebarCollapsed, searchQuery, setSearchQuery, setCurrentPage 
}) => {
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
    <PageWrapper title="Session Planner" sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="planner" setCurrentPage={setCurrentPage}>
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
        <EmptyState icon={Calendar} title="No sessions planned" description="Create your first training session." actionLabel="Create First Session" onAction={() => setShowModal('session')} />
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
                    <button onClick={() => { setEditingItem(session); setShowModal('session'); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteSession(session.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg">
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
// REPORTS PAGE
// ============================================
export const ReportsPage = ({ 
  reports, setReports, setShowModal, sidebarCollapsed, searchQuery, setSearchQuery, setCurrentPage 
}) => {
  const deleteReport = (id) => {
    if (window.confirm('Delete this report?')) {
      setReports(reports.filter(r => r.id !== id));
    }
  };

  return (
    <PageWrapper title="Auto Reports" sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="reports" setCurrentPage={setCurrentPage}>
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
        <EmptyState icon={FileCheck} title="No reports yet" description="Generate AI-powered reports to track progress." actionLabel="Generate First Report" onAction={() => setShowModal('report')} />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-400">{report.title}</h3>
                    <p className="text-gray-400 text-sm">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-white/10 text-gray-300 text-xs font-medium px-3 py-1 rounded-lg">{report.type}</span>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10">
                    <Eye className="w-4 h-4" /><span>View</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30">
                    <Download className="w-4 h-4" /><span>Download</span>
                  </button>
                  <button onClick={() => deleteReport(report.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100">
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
// DRILL LIBRARY PAGE (with visualizations)
// ============================================
export const DrillsPage = ({ 
  sessions, setSessions, setShowModal, sidebarCollapsed, searchQuery, setSearchQuery, setCurrentPage, setSelectedDrill 
}) => {
  const [expandedDrill, setExpandedDrill] = useState(null);
  
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
    <PageWrapper title="Drill Library" showSearch sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="drills" setCurrentPage={setCurrentPage}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Training Drills</h2>
          <p className="text-gray-400 mt-1">Browse and add drills to your sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrills.map((drill) => {
          const DrillVisualization = DrillVisualizations[drill.id];
          const isExpanded = expandedDrill === drill.id;
          
          return (
            <div key={drill.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group">
              {/* Field visualization */}
              <div 
                className="aspect-[4/3] bg-[#1a472a] cursor-pointer relative"
                onClick={() => setExpandedDrill(isExpanded ? null : drill.id)}
              >
                {DrillVisualization && <DrillVisualization />}
                <div className="absolute top-2 right-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getDifficultyColor(drill.difficulty)}`}>
                    {drill.difficulty}
                  </span>
                </div>
              </div>
              
              {/* Drill info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{drill.name}</h3>
                    <p className="text-gray-500 text-sm">{drill.category}</p>
                  </div>
                  <span className="text-2xl">{drill.icon}</span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">{drill.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Timer className="w-4 h-4" />
                    <span>{drill.duration}</span>
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
            </div>
          );
        })}
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
export const TeamStatsPage = ({ 
  players, videos, sessions, sidebarCollapsed, searchQuery, setSearchQuery, setCurrentPage 
}) => {
  const avgRating = players.length > 0 ? Math.round(players.reduce((acc, p) => acc + p.rating, 0) / players.length) : 0;
  
  return (
    <PageWrapper title="Team Stats" sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="stats" setCurrentPage={setCurrentPage}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Team Statistics</h2>
        <p className="text-gray-400 mt-1">Overall team performance metrics</p>
      </div>

      {players.length === 0 ? (
        <EmptyState icon={Target} title="No data yet" description="Add players to see team statistics." actionLabel="Add Players" onAction={() => setCurrentPage('players')} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-gray-500 text-sm mb-2">Avg Decision IQ</p>
              <span className="text-3xl font-bold text-white">{avgRating}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-gray-500 text-sm mb-2">Total Players</p>
              <span className="text-3xl font-bold text-white">{players.length}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-gray-500 text-sm mb-2">Videos Analyzed</p>
              <span className="text-3xl font-bold text-white">{videos.length}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-gray-500 text-sm mb-2">Sessions Planned</p>
              <span className="text-3xl font-bold text-white">{sessions.length}</span>
            </div>
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
                        <div className={`h-full ${colors[i]} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Top Performers</h3>
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
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
};

// ============================================
// PROGRESS PAGE
// ============================================
export const ProgressPage = ({ 
  players, videos, sessions, sidebarCollapsed, searchQuery, setSearchQuery, setCurrentPage 
}) => {
  return (
    <PageWrapper title="Progress Tracking" sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="progress" setCurrentPage={setCurrentPage}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Team Progress</h2>
        <p className="text-gray-400 mt-1">Track improvement over time</p>
      </div>

      {players.length === 0 && videos.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No progress data yet" description="Add players and analyze videos to track progress." actionLabel="Get Started" onAction={() => setCurrentPage('upload')} />
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
export const BenchmarksPage = ({ 
  players, sidebarCollapsed, searchQuery, setSearchQuery, setCurrentPage 
}) => {
  const avgRating = players.length > 0 ? Math.round(players.reduce((acc, p) => acc + p.rating, 0) / players.length) : 0;
  
  const benchmarks = [
    { category: 'Decision IQ', team: avgRating, elite: 92, icon: Brain },
    { category: 'Pass Accuracy', team: Math.min(avgRating + 5, 100), elite: 95, icon: Target },
    { category: 'Spatial Awareness', team: Math.max(avgRating - 7, 0), elite: 88, icon: Eye },
    { category: 'Under Pressure', team: Math.max(avgRating - 10, 0), elite: 85, icon: Activity },
  ];

  return (
    <PageWrapper title="Benchmarks" sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="benchmarks" setCurrentPage={setCurrentPage}>
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
                <div className="absolute h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${benchmark.team}%` }} />
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
