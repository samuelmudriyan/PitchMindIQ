import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, Play, Pause, RotateCcw, CheckCircle, AlertCircle, 
  Loader2, X, ChevronRight, Target, Clock, MapPin, Brain,
  TrendingUp, Award, Video, Home, Users, FileVideo, Lightbulb,
  Clipboard, FileText, BookOpen, BarChart3, Settings, Bell,
  Search, Star, Share2, Download, Zap, MousePointer, ArrowRight
} from 'lucide-react';

const API_BASE = 'https://your-backend.railway.app'; // Update this

export default function PitchMindApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, selecting, analyzing, complete
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [error, setError] = useState(null);
  
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
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      <div className="h-16 border-b border-gray-200 flex items-center px-6">
        <Logo size="md" />
        <span className="ml-3 text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
          PitchMind
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <SidebarItem icon={Home} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
        <SidebarItem icon={Users} label="Player Profiles" active={currentPage === 'players'} onClick={() => setCurrentPage('players')} count={18} />
        <SidebarItem icon={FileVideo} label="Video Library" active={currentPage === 'videos'} onClick={() => setCurrentPage('videos')} />
        <SidebarItem icon={Lightbulb} label="AI Coach Assistant" active={currentPage === 'assistant'} onClick={() => setCurrentPage('assistant')} badge="New" />
        <SidebarItem icon={Clipboard} label="Session Planner" active={currentPage === 'planner'} onClick={() => setCurrentPage('planner')} />
        <SidebarItem icon={FileText} label="Auto Reports" active={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} />
        <SidebarItem icon={BookOpen} label="Drill Library" active={currentPage === 'drills'} onClick={() => setCurrentPage('drills')} />
        
        <div className="pt-4 pb-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Analytics</div>
        </div>
        
        <SidebarItem icon={BarChart3} label="Team Stats" active={currentPage === 'stats'} onClick={() => setCurrentPage('stats')} />
        <SidebarItem icon={TrendingUp} label="Progress Tracking" active={currentPage === 'progress'} onClick={() => setCurrentPage('progress')} />
        <SidebarItem icon={Target} label="Benchmarks" active={currentPage === 'benchmarks'} onClick={() => setCurrentPage('benchmarks')} />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Video</span>
        </button>
      </div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick, count, badge }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-medium ${
        active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </div>
      {count && <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
      {badge && <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );

  // Top Bar
  const TopBar = ({ title }) => (
    <div className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40">
      <div className="flex items-center space-x-4">
        {currentPage !== 'dashboard' && (
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="text-gray-600 hover:text-gray-900 font-semibold flex items-center space-x-1"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Back</span>
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Settings className="w-5 h-5" />
        </button>
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coach" 
          alt="" 
          className="w-9 h-9 rounded-full border-2 border-gray-200" 
        />
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

  // Handle video click to select player
  const handleVideoClick = (e) => {
    if (uploadState !== 'selecting') return;
    
    const video = videoRef.current;
    const rect = video.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * video.videoWidth;
    const y = ((e.clientY - rect.top) / rect.height) * video.videoHeight;
    
    setClickPosition({ x, y, displayX: e.clientX - rect.left, displayY: e.clientY - rect.top });
  };

  // Start analysis
  const startAnalysis = async () => {
    if (!videoFile || !clickPosition) return;
    
    setUploadState('uploading');
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('clickX', Math.round(clickPosition.x));
      formData.append('clickY', Math.round(clickPosition.y));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      setUploadState('analyzing');

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

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

  // Reset everything
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
    <div className="ml-64 pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <TopBar title="Video Analysis" />
      <div className="p-8">
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <StepIndicator 
              step={1} 
              label="Upload" 
              active={uploadState === 'idle'} 
              complete={uploadState !== 'idle'} 
            />
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <StepIndicator 
              step={2} 
              label="Select Player" 
              active={uploadState === 'selecting'} 
              complete={['uploading', 'analyzing', 'complete'].includes(uploadState)} 
            />
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <StepIndicator 
              step={3} 
              label="Analyze" 
              active={['uploading', 'analyzing'].includes(uploadState)} 
              complete={uploadState === 'complete'} 
            />
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <StepIndicator 
              step={4} 
              label="Results" 
              active={uploadState === 'complete'} 
              complete={false} 
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Upload */}
          {uploadState === 'idle' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border-4 border-dashed border-gray-300 hover:border-emerald-400 rounded-2xl p-16 text-center cursor-pointer transition-all group"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="video/*" 
                onChange={handleFileSelect}
                className="hidden" 
              />
              <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Match Footage</h2>
              <p className="text-gray-600 mb-6">Drag and drop or click to select a video file</p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Video className="w-4 h-4" />
                  <span>MP4, MOV, AVI</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Up to 10 minutes</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>~30 sec processing</span>
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Select Player */}
          {uploadState === 'selecting' && videoUrl && (
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-white">
                <div className="flex items-center space-x-2">
                  <MousePointer className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Click on the player you want to track</h2>
                </div>
                <p className="text-emerald-100 text-sm mt-1">Pause the video and click directly on the player</p>
              </div>
              
              <div className="relative bg-black">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full cursor-crosshair"
                  controls
                  onClick={handleVideoClick}
                />
                
                {/* Click indicator */}
                {clickPosition && (
                  <div 
                    className="absolute w-12 h-12 border-4 border-emerald-500 rounded-full animate-pulse pointer-events-none"
                    style={{ 
                      left: clickPosition.displayX - 24, 
                      top: clickPosition.displayY - 24,
                    }}
                  >
                    <div className="absolute inset-2 bg-emerald-500 rounded-full opacity-50"></div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    {clickPosition ? (
                      <div className="flex items-center space-x-2 text-emerald-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Player selected!</span>
                        <span className="text-gray-500 text-sm">
                          Position: ({Math.round(clickPosition.x)}, {Math.round(clickPosition.y)})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-amber-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Click on a player to select them</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={resetUpload}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={startAnalysis}
                      disabled={!clickPosition}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                        clickPosition 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Brain className="w-5 h-5" />
                      <span>Start Analysis</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {['uploading', 'analyzing'].includes(uploadState) && (
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center shadow-lg">
              <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 mb-6 animate-pulse">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {uploadState === 'uploading' ? 'Uploading Video...' : 'AI Analyzing Footage...'}
              </h2>
              <p className="text-gray-600 mb-8">
                {uploadState === 'uploading' 
                  ? 'Sending video to our GPU servers' 
                  : 'Tracking player movement and identifying decision moments'}
              </p>

              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadState === 'analyzing' ? 100 : uploadProgress}%` }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Video className="w-4 h-4" />
                    <span>YOLOv11 Detection</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>Deep SORT Tracking</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Brain className="w-4 h-4" />
                    <span>TorchReID</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
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
            />
          )}

          {/* Demo Mode - No Backend */}
          {uploadState === 'complete' && !analysisResults && (
            <DemoResults 
              videoUrl={videoUrl}
              videoRef={videoRef}
              onReset={resetUpload}
            />
          )}
        </div>
      </div>
    </div>
  );

  const StepIndicator = ({ step, label, active, complete }) => (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
        complete 
          ? 'bg-emerald-500 text-white' 
          : active 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-110' 
            : 'bg-gray-200 text-gray-500'
      }`}>
        {complete ? <CheckCircle className="w-5 h-5" /> : step}
      </div>
      <span className={`mt-2 text-xs font-semibold ${active ? 'text-emerald-700' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );

  // Analysis Results Component
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
      if (videoRef.current && decisions[index]) {
        videoRef.current.currentTime = decisions[index].timestamp;
      }
    };

    return (
      <div className="space-y-6">
        {/* Summary Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Analysis Complete! 🎉</h2>
              <p className="text-emerald-100">
                Found {decisions.length} key decision moments to review
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{decisions.length}</div>
                <div className="text-emerald-200 text-sm">Decisions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{Math.round((quizAnswers.filter(Boolean).length / decisions.length) * 100) || 0}%</div>
                <div className="text-emerald-200 text-sm">Reviewed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Video + Quiz Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="col-span-2 bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full"
              controls
            />
            
            {/* Decision Timeline */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Decision Points</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {decisions.map((decision, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToDecision(idx)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      idx === currentIndex
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : quizAnswers[idx]
                          ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {formatTime(decision.timestamp)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quiz Panel */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
            {currentDecision ? (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    Decision {currentIndex + 1}/{decisions.length}
                  </div>
                  <span className="text-gray-500 text-sm">{currentDecision.zone}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  What should the player do here?
                </h3>

                <div className="space-y-3 mb-6">
                  {['Pass Forward', 'Dribble', 'Pass Back', 'Shoot'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 rounded-lg font-semibold text-left transition-all ${
                        quizAnswers[currentIndex] === option
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {quizAnswers[currentIndex] && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 text-amber-700 font-semibold mb-2">
                      <Award className="w-5 h-5" />
                      <span>Elite Comparison</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Kevin De Bruyne would choose <strong>Pass Forward</strong> in this situation 78% of the time, 
                      prioritizing progressive play into the final third.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => goToDecision(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToDecision(Math.min(decisions.length - 1, currentIndex + 1))}
                    disabled={currentIndex === decisions.length - 1}
                    className="flex-1 py-2 bg-emerald-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No decision points found</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between bg-white border-2 border-gray-200 rounded-xl p-4">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Analyze Another Video</span>
          </button>
          
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
              <span>Share with Player</span>
            </button>
            <button className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 shadow-lg">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Demo Results (when no backend)
  const DemoResults = ({ videoUrl, videoRef, onReset }) => {
    const demoDecisions = [
      { timestamp: 5.2, zone: 'Middle Third' },
      { timestamp: 12.8, zone: 'Attacking Third' },
      { timestamp: 23.1, zone: 'Defensive Third' },
      { timestamp: 31.5, zone: 'Attacking Third' },
    ];

    return (
      <AnalysisResults
        results={{ decision_points: demoDecisions }}
        videoUrl={videoUrl}
        videoRef={videoRef}
        currentIndex={0}
        setCurrentIndex={() => {}}
        quizAnswers={[]}
        setQuizAnswers={() => {}}
        onReset={onReset}
      />
    );
  };

  // Simple Dashboard (placeholder)
  const Dashboard = () => (
    <div className="ml-64 pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <TopBar title="Dashboard" />
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Good morning, Coach! 👋</h1>
          <p className="text-gray-600">Upload a video to get started with AI-powered analysis.</p>
        </div>

        {/* Quick Upload CTA */}
        <div 
          onClick={() => setCurrentPage('upload')}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl cursor-pointer hover:from-emerald-600 hover:to-emerald-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-6 h-6" />
                <span className="font-bold text-lg">AI Video Analysis</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">
                Analyze player decisions with AI
              </h2>
              <p className="text-emerald-100 mb-4">
                Upload match footage, select a player, and get instant tactical insights compared to elite players.
              </p>
              <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload Video Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="ml-6">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Video className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {currentPage === 'upload' ? <UploadPage /> : <Dashboard />}
    </div>
  );
}
