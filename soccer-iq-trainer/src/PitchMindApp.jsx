import React, { useState, useRef } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { 
  Upload, Play, Pause, RotateCcw, CheckCircle, AlertCircle, 
  Loader2, X, ChevronRight, Target, Clock, MapPin, Brain,
  TrendingUp, Award, Video, Home, Users, FileVideo, Lightbulb,
  Clipboard, FileText, BookOpen, BarChart3, Settings, Bell,
  Search, Star, Share2, Download, Zap, MousePointer, ArrowRight,
  ChevronLeft, Sparkles
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
  const TopBar = ({ title }) => (
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
        <button className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <Search className="w-5 h-5" />
        </button>
        <button className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
        </button>
        <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Settings className="w-5 h-5" />
        </button>
        <div className="pl-2 border-l border-white/10">
          <UserButton 
            afterSignOutUrl="/" 
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 rounded-xl"
              }
            }}
          />
        </div>
      </div>
    </div>
  );

  // Handle file selection
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

  // Handle video click
  const handleVideoClick = (e) => {
    if (uploadState !== 'selecting') return;
    const video = videoRef.current;
    const rect = video.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * video.videoWidth;
    const y = ((e.clientY - rect.top) / rect.height) * video.videoHeight;
    const timestamp = video.currentTime;
    setClickPosition({ x, y, timestamp, displayX: e.clientX - rect.left, displayY: e.clientY - rect.top });
  };

  // Start analysis
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

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

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

  // Reset
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

  // Upload Page
  const UploadPage = () => (
    <div className={`pt-16 min-h-screen bg-[#0a0f0d] transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <TopBar title="Video Analysis" />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]" />
      </div>
      
      <div className="relative p-8">
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

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Upload */}
          {uploadState === 'idle' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group bg-white/5 border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-3xl p-16 text-center cursor-pointer transition-all hover:bg-emerald-500/5"
            >
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

          {/* Step 2: Select Player */}
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
                    <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping" />
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
                        <span className="text-gray-500 text-sm">({Math.round(clickPosition.x)}, {Math.round(clickPosition.y)})</span>
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
                    <button 
                      onClick={startAnalysis}
                      disabled={!clickPosition}
                      className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${clickPosition ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
                    >
                      <Brain className="w-5 h-5" /><span>Start Analysis</span>
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" /><span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {['uploading', 'analyzing'].includes(uploadState) && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
              <div className="inline-flex p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {uploadState === 'uploading' ? 'Uploading Video...' : 'AI Analyzing Footage...'}
              </h2>
              <p className="text-gray-400 mb-8">
                {uploadState === 'uploading' ? 'Sending video to GPU servers' : 'Tracking player and identifying decision moments'}
              </p>
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 rounded-full" style={{ width: `${uploadState === 'analyzing' ? 100 : uploadProgress}%` }} />
                </div>
                <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center space-x-2"><Video className="w-4 h-4 text-emerald-400" /><span>YOLOv11</span></span>
                  <span className="flex items-center space-x-2"><Target className="w-4 h-4 text-emerald-400" /><span>Deep SORT</span></span>
                  <span className="flex items-center space-x-2"><Brain className="w-4 h-4 text-emerald-400" /><span>TorchReID</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {uploadState === 'complete' && analysisResults && (
            <AnalysisResults 
              results={analysisResults} videoUrl={videoUrl} videoRef={videoRef}
              currentIndex={currentDecisionIndex} setCurrentIndex={setCurrentDecisionIndex}
              quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers} onReset={resetUpload}
            />
          )}

          {uploadState === 'complete' && !analysisResults && (
            <DemoResults videoUrl={videoUrl} videoRef={videoRef} onReset={resetUpload} />
          )}
        </div>
      </div>
    </div>
  );

  const StepIndicator = ({ step, label, state, complete }) => (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
        complete ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
        : state ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110' 
        : 'bg-white/10 text-gray-500'
      }`}>
        {complete ? <CheckCircle className="w-5 h-5" /> : step}
      </div>
      <span className={`mt-2 text-xs font-medium ${state ? 'text-emerald-400' : 'text-gray-500'}`}>{label}</span>
    </div>
  );

  // Analysis Results
  const AnalysisResults = ({ results, videoUrl, videoRef, currentIndex, setCurrentIndex, quizAnswers, setQuizAnswers, onReset }) => {
    const decisions = results.decision_points || [];
    const currentDecision = decisions[currentIndex];

    const handleAnswer = (answer) => {
      const newAnswers = [...quizAnswers];
      newAnswers[currentIndex] = answer;
      setQuizAnswers(newAnswers);
    };

    const goToDecision = (index) => {
      setCurrentIndex(index);
      if (videoRef.current && decisions[index]) videoRef.current.currentTime = decisions[index].timestamp;
    };

    return (
      <div className="space-y-6">
        {/* Summary Banner */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Analysis Complete!</h2>
              </div>
              <p className="text-gray-400">Found {decisions.length} key decision moments to review</p>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{decisions.length}</div>
                <div className="text-gray-500 text-sm">Decisions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{Math.round((quizAnswers.filter(Boolean).length / decisions.length) * 100) || 0}%</div>
                <div className="text-gray-500 text-sm">Reviewed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Video + Quiz */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <video ref={videoRef} src={videoUrl} className="w-full" controls />
            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-gray-300">Decision Points</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {decisions.map((decision, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToDecision(idx)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      idx === currentIndex ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : quizAnswers[idx] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
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
                  <div className="bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                    {currentIndex + 1}/{decisions.length}
                  </div>
                  <span className="text-gray-500 text-sm">{currentDecision.zone}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">What should the player do here?</h3>
                <div className="space-y-3 mb-6">
                  {['Pass Forward', 'Dribble', 'Pass Back', 'Shoot'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 rounded-xl font-medium text-left transition-all ${
                        quizAnswers[currentIndex] === option
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {quizAnswers[currentIndex] && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2">
                      <Award className="w-5 h-5" /><span>Elite Comparison</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Kevin De Bruyne would choose <strong className="text-white">Pass Forward</strong> in this situation 78% of the time.
                    </p>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button onClick={() => goToDecision(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="flex-1 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium disabled:opacity-30 hover:bg-white/5 transition-all">Previous</button>
                  <button onClick={() => goToDecision(Math.min(decisions.length - 1, currentIndex + 1))} disabled={currentIndex === decisions.length - 1} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-medium disabled:opacity-30 hover:bg-emerald-400 transition-all">Next</button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No decision points found</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
          <button onClick={onReset} className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white font-medium transition-all">
            <RotateCcw className="w-4 h-4" /><span>Analyze Another Video</span>
          </button>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-5 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">
              <Share2 className="w-4 h-4" /><span>Share</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/20 transition-all">
              <Download className="w-4 h-4" /><span>Export Report</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DemoResults = ({ videoUrl, videoRef, onReset }) => {
    const demoDecisions = [
      { timestamp: 5.2, zone: 'Middle Third' },
      { timestamp: 12.8, zone: 'Attacking Third' },
      { timestamp: 23.1, zone: 'Defensive Third' },
      { timestamp: 31.5, zone: 'Attacking Third' },
    ];
    return <AnalysisResults results={{ decision_points: demoDecisions }} videoUrl={videoUrl} videoRef={videoRef} currentIndex={0} setCurrentIndex={() => {}} quizAnswers={[]} setQuizAnswers={() => {}} onReset={onReset} />;
  };

  // Dashboard
  const Dashboard = () => (
    <div className={`pt-16 min-h-screen bg-[#0a0f0d] transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <TopBar title="Dashboard" />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Good morning, Coach! 👋</h1>
          <p className="text-gray-400">Upload a video to get started with AI-powered analysis.</p>
        </div>

        {/* Quick Upload CTA */}
        <div 
          onClick={() => setCurrentPage('upload')}
          className="group bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-3xl p-8 cursor-pointer hover:border-emerald-500/50 hover:from-emerald-500/30 hover:to-emerald-600/20 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-lg text-emerald-400">AI Video Analysis</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Analyze player decisions with AI</h2>
              <p className="text-gray-400 mb-6 max-w-lg">
                Upload match footage, select a player, and get instant tactical insights compared to elite players.
              </p>
              <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40">
                <Upload className="w-5 h-5" />
                <span>Upload Video Now</span>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { label: 'Videos Analyzed', value: '24', icon: Video, color: 'emerald' },
            { label: 'Decision Points', value: '156', icon: Target, color: 'amber' },
            { label: 'Improvement', value: '+12%', icon: TrendingUp, color: 'purple' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      <Sidebar />
      {currentPage === 'upload' ? <UploadPage /> : <Dashboard />}
    </div>
  );
}
