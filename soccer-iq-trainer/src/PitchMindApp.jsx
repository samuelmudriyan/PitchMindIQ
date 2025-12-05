import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, CheckCircle, AlertCircle, Loader2, Clock, Brain, Video, Zap,
  MousePointer, Target, Sparkles, Award, RotateCcw, Share2, Download, Save, Plus, X
} from 'lucide-react';
import { Sidebar, Modal, drillTemplates } from './Components';
import {
  Dashboard, PlayersPage, VideosPage, AICoachPage, SessionPlannerPage,
  ReportsPage, DrillsPage, TeamStatsPage, ProgressPage, BenchmarksPage
} from './Pages';

const API_BASE = 'https://pitchmind-backend-production-483d.up.railway.app';

// Local Storage Keys
const STORAGE_KEYS = {
  PLAYERS: 'pitchmind_players',
  VIDEOS: 'pitchmind_videos',
  SESSIONS: 'pitchmind_sessions',
  REPORTS: 'pitchmind_reports',
  CHAT_HISTORY: 'pitchmind_chat_history'
};

const loadFromStorage = (key, defaultValue = []) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export default function PitchMindApp() {
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
  
  // Data state
  const [players, setPlayers] = useState(() => loadFromStorage(STORAGE_KEYS.PLAYERS, []));
  const [videos, setVideos] = useState(() => loadFromStorage(STORAGE_KEYS.VIDEOS, []));
  const [sessions, setSessions] = useState(() => loadFromStorage(STORAGE_KEYS.SESSIONS, []));
  const [reports, setReports] = useState(() => loadFromStorage(STORAGE_KEYS.REPORTS, []));
  const [chatHistory, setChatHistory] = useState(() => loadFromStorage(STORAGE_KEYS.CHAT_HISTORY, []));
  
  // Modal state
  const [showModal, setShowModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDrill, setSelectedDrill] = useState(null);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Save to localStorage when data changes
  useEffect(() => { saveToStorage(STORAGE_KEYS.PLAYERS, players); }, [players]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.VIDEOS, videos); }, [videos]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SESSIONS, sessions); }, [sessions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.REPORTS, reports); }, [reports]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CHAT_HISTORY, chatHistory); }, [chatHistory]);

  // ============================================
  // MODALS
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
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={() => { setShowModal(null); setEditingItem(null); }} className="flex-1 py-3 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">{editingItem ? 'Save Changes' : 'Create Session'}</button>
          </div>
        </form>
      </Modal>
    );
  };

  const GenerateReportModal = () => {
    const [form, setForm] = useState({ type: 'Team', title: '', player: '' });
    const [generating, setGenerating] = useState(false);
    
    const handleGenerate = async (e) => {
      e.preventDefault();
      setGenerating(true);
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
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-3 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={generating} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating...</span></> : <span>Generate Report</span>}
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  const AddToSessionModal = () => {
    const drill = selectedDrill;
    if (!drill) return null;
    
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
      setSelectedDrill(null);
    };

    return (
      <Modal title="Add Drill to Session" onClose={() => { setShowModal(null); setSelectedDrill(null); }}>
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
            <button onClick={() => { setShowModal('session'); setSelectedDrill(null); }} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium">Create a Session First</button>
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const StepIndicator = ({ step, label, state, complete }) => (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${complete ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : state ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110' : 'bg-white/10 text-gray-500'}`}>
        {complete ? <CheckCircle className="w-5 h-5" /> : step}
      </div>
      <span className={`mt-2 text-xs font-medium ${state ? 'text-emerald-400' : 'text-gray-500'}`}>{label}</span>
    </div>
  );

  const UploadPage = () => (
    <div className={`pt-16 min-h-screen bg-[#0a0f0d] transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <div className="p-8">
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
              <p className="text-gray-400 mb-8">Drag and drop or click to select</p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <span className="flex items-center space-x-2"><Video className="w-4 h-4 text-emerald-400" /><span>MP4, MOV, AVI</span></span>
                <span className="flex items-center space-x-2"><Clock className="w-4 h-4 text-emerald-400" /><span>Up to 10 min</span></span>
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
                        <AlertCircle className="w-5 h-5" /><span>Click on a player</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={resetUpload} className="px-5 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5">Cancel</button>
                    <button onClick={startAnalysis} disabled={!clickPosition} className={`px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 ${clickPosition ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}>
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
              <h2 className="text-2xl font-bold text-white mb-2">{uploadState === 'uploading' ? 'Uploading...' : 'AI Analyzing...'}</h2>
              <p className="text-gray-400 mb-8">{uploadState === 'uploading' ? 'Sending to GPU servers' : 'Tracking player movements'}</p>
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${uploadState === 'analyzing' ? 100 : uploadProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {uploadState === 'complete' && analysisResults && (
            <AnalysisResults 
              results={analysisResults} 
              videoUrl={videoUrl} 
              videoRef={videoRef} 
              currentIndex={currentDecisionIndex} 
              setCurrentIndex={setCurrentDecisionIndex} 
              quizAnswers={quizAnswers} 
              setQuizAnswers={setQuizAnswers} 
              onReset={resetUpload}
              formatTime={formatTime}
            />
          )}
        </div>
      </div>
    </div>
  );

  const AnalysisResults = ({ results, videoUrl, videoRef, currentIndex, setCurrentIndex, quizAnswers, setQuizAnswers, onReset, formatTime }) => {
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
                  <button key={idx} onClick={() => goToDecision(idx)} className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm ${idx === currentIndex ? 'bg-emerald-500 text-white' : quizAnswers[idx] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
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
                </div>
                <h3 className="text-lg font-bold text-white mb-4">What should the player do?</h3>
                <div className="space-y-3 mb-6">
                  {['Pass Forward', 'Dribble', 'Pass Back', 'Shoot'].map((option) => (
                    <button key={option} onClick={() => handleAnswer(option)} className={`w-full p-4 rounded-xl font-medium text-left ${quizAnswers[currentIndex] === option ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:border-emerald-500/30'}`}>{option}</button>
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
          <button onClick={onReset} className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white"><RotateCcw className="w-4 h-4" /><span>Analyze Another</span></button>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-5 py-2.5 border border-white/20 text-gray-300 rounded-xl"><Share2 className="w-4 h-4" /><span>Share</span></button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold"><Download className="w-4 h-4" /><span>Export</span></button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // PAGE ROUTER
  // ============================================
  const renderPage = () => {
    const commonProps = { sidebarCollapsed, searchQuery, setSearchQuery, setCurrentPage };
    
    switch(currentPage) {
      case 'players':
        return <PlayersPage players={players} setPlayers={setPlayers} setShowModal={setShowModal} setEditingItem={setEditingItem} {...commonProps} />;
      case 'videos':
        return <VideosPage videos={videos} setVideos={setVideos} setUploadState={setUploadState} {...commonProps} />;
      case 'assistant':
        return <AICoachPage players={players} sessions={sessions} chatHistory={chatHistory} setChatHistory={setChatHistory} {...commonProps} />;
      case 'planner':
        return <SessionPlannerPage sessions={sessions} setSessions={setSessions} players={players} setShowModal={setShowModal} setEditingItem={setEditingItem} {...commonProps} />;
      case 'reports':
        return <ReportsPage reports={reports} setReports={setReports} setShowModal={setShowModal} {...commonProps} />;
      case 'drills':
        return <DrillsPage sessions={sessions} setSessions={setSessions} setShowModal={setShowModal} setSelectedDrill={setSelectedDrill} {...commonProps} />;
      case 'stats':
        return <TeamStatsPage players={players} videos={videos} sessions={sessions} {...commonProps} />;
      case 'progress':
        return <ProgressPage players={players} videos={videos} sessions={sessions} {...commonProps} />;
      case 'benchmarks':
        return <BenchmarksPage players={players} {...commonProps} />;
      case 'upload':
        return <UploadPage />;
      default:
        return <Dashboard players={players} videos={videos} sessions={sessions} setShowModal={setShowModal} setUploadState={setUploadState} {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        playerCount={players.length}
        setUploadState={setUploadState}
      />
      {renderPage()}
      
      {/* Modals */}
      {showModal === 'player' && <AddPlayerModal />}
      {showModal === 'session' && <AddSessionModal />}
      {showModal === 'report' && <GenerateReportModal />}
      {showModal === 'addToSession' && <AddToSessionModal />}
    </div>
  );
}
