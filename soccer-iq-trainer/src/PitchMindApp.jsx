import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload, CheckCircle, Trophy, User, Target, MousePointer } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Toast({ message, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 bg-black/80 border border-yellow-500 text-white px-4 py-3 rounded-xl shadow-2xl z-50">
      {message}
    </div>
  );
}

export default function PitchMindApp() {
  const [screen, setScreen] = useState("landing");
  const [subscriptionTier, setSubscriptionTier] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [freezeFrameUrl, setFreezeFrameUrl] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [aiScenarios, setAIScenarios] = useState([]);
  const [selectingPlayer, setSelectingPlayer] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 50, y: 40 });
  const [gameLibrary, setGameLibrary] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [toast, setToast] = useState(null);
  const [analyzingEliteActions, setAnalyzingEliteActions] = useState(false);
  const [eliteAnalyses, setEliteAnalyses] = useState([]);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const videoRef = useRef(null);
  const trainingVideoRef = useRef(null);
  const videoBoxRef = useRef(null);

  useEffect(() => {
    const id = "pitch-mind-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
      * { font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif !important; }
      .pitch-mind-gradient{background:linear-gradient(135deg,#FFD700 0%,#FFA500 100%)}
      .pitch-mind-text-gradient{background:linear-gradient(135deg,#FFD700 0%,#FFA500 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .gold-glow{box-shadow:0 0 30px rgba(255,215,0,.3)}
      .gold-glow-hover:hover{box-shadow:0 0 40px rgba(255,215,0,.6);border-color:#FFD700;transform:translateY(-2px);transition:all .3s ease}
      .gold-border-hover:hover{border-color:#FFD700}
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
      if (freezeFrameUrl?.startsWith("blob:")) URL.revokeObjectURL(freezeFrameUrl);
    };
  }, [videoUrl, freezeFrameUrl]);

  // Restore video URL from sessionStorage on component mount
  useEffect(() => {
    const savedVideoUrl = sessionStorage.getItem('pitchMindVideoUrl');
    const savedFileName = sessionStorage.getItem('pitchMindFileName');
    
    if (savedVideoUrl && !videoUrl) {
      setVideoUrl(savedVideoUrl);
      setVideoLoaded(true);
    }
    if (savedFileName && !uploadedFileName) {
      setUploadedFileName(savedFileName);
    }
  }, []);



  const scenarios = useMemo(
    () => [
      {
        timestamp: 15,
        situation: "Counter-attack opportunity with 3v2 advantage",
        playerHighlight: "Center Forward (You)",
        options: [
          { text: "Sprint forward with the ball to draw defenders", points: 72, feedback: "Better to distribute quickly." },
          { text: "Pass wide to the unmarked winger", points: 94, feedback: "Elite transition choice." },
          { text: "Play a through ball to the striker", points: 83, feedback: "Good if timing is perfect." },
        ],
      },
      {
        timestamp: 42,
        situation: "Defensive pressure with passing lanes blocked",
        playerHighlight: "Central Midfielder (You)",
        options: [
          { text: "Dribble out of pressure", points: 58, feedback: "Risky in this zone." },
          { text: "Play safe back pass to defender", points: 88, feedback: "Reset shape under pressure." },
          { text: "Attempt long ball to forward", points: 75, feedback: "Lower completion rates." },
        ],
      },
      {
        timestamp: 67,
        situation: "1v1 situation near the penalty box",
        playerHighlight: "Winger (You)",
        options: [
          { text: "Cut inside and shoot", points: 91, feedback: "High xG from this angle." },
          { text: "Continue down the line for a cross", points: 78, feedback: "Less optimal." },
          { text: "Stop and wait for support", points: 62, feedback: "Loses momentum." },
        ],
      },
    ],
    []
  );

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { setToast("Please select a valid video file."); return; }
    setVideoFile(file);
    setVideoLoaded(false);
    setLoadingProgress(10);

    const formData = new FormData();
    formData.append("video", file);

    try {
      setLoadingProgress(30);
      const resp = await fetch(`${API_URL}/upload-video`, { method: "POST", body: formData });
      setLoadingProgress(60);
      const data = await resp.json();
      setLoadingProgress(90);
   if (data?.success) {
  const fullUrl = `${API_URL.replace('/api', '')}${data.videoUrl}`;
  const fileName = data.videoId || data.videoUrl.split("/").pop();
  setUploadedFileName(fileName);
  setVideoUrl(fullUrl);
  setVideoLoaded(true);
  setLoadingProgress(100);
  setToast("Video uploaded successfully.");
  
  // Save to sessionStorage to persist across screen changes
  sessionStorage.setItem('pitchMindVideoUrl', fullUrl);
  sessionStorage.setItem('pitchMindFileName', fileName);
}   else {
        throw new Error(data?.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setToast(`Upload error: ${err.message}`);
    }
  };

  const getDisplayedVideoMetrics = () => {
    const box = videoBoxRef.current;
    const node = box?.querySelector("img,video");
    if (!box || !node) return null;
    const rVid = node.getBoundingClientRect();
    return { vidRect: rVid };
  };

  const handleCanvasClick = (e) => {
    if (!selectingPlayer) return;
    const m = getDisplayedVideoMetrics();
    if (!m) return;
    const { vidRect } = m;
    const x = ((e.clientX - vidRect.left) / vidRect.width) * 100;
    const y = ((e.clientY - vidRect.top) / vidRect.height) * 100;
    setHighlightPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    setSelectedPlayer(true);
    setSelectingPlayer(false);
  };

  const waitForEvent = (el, evt) =>
    new Promise((resolve) => {
      const handler = () => { el.removeEventListener(evt, handler); resolve(); };
      el.addEventListener(evt, handler, { once: true });
    });

  const captureFrame = () => {
    const vid = trainingVideoRef.current;
    if (!vid || vid.videoWidth === 0 || vid.videoHeight === 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(vid, 0, 0);
    return canvas.toDataURL("image/png");
  };

  const freezeAt = async (timestampSec) => {
    const vid = trainingVideoRef.current;
    if (!vid) return;
    setIsPaused(false);
    setFreezeFrameUrl(null);
    if (vid.readyState < 1) await waitForEvent(vid, "loadedmetadata");
    const target = Math.max(0, Math.min(timestampSec, (vid.duration || timestampSec) - 0.001));
    vid.currentTime = target;
    await waitForEvent(vid, "seeked");
    await new Promise((r) => ("requestVideoFrameCallback" in vid) ? vid.requestVideoFrameCallback(() => r()) : setTimeout(r, 150));
    const frameUrl = captureFrame();
    if (frameUrl) { setFreezeFrameUrl(frameUrl); setIsPaused(true); return; }
    await new Promise((r) => setTimeout(r, 200));
    const retry = captureFrame();
    if (retry) { setFreezeFrameUrl(retry); setIsPaused(true); }
  };

const proceedToTraining = async () => {
  if (!selectedPlayer) return;

  console.log('=== STARTING ANALYSIS ===');
  console.log('Selected Player:', selectedPlayer);
  console.log('Highlight Position:', highlightPosition);

  setScreen("training");
  setCurrentScenario(0);
  
  // Restore video URL from sessionStorage if lost
  const savedVideoUrl = sessionStorage.getItem('pitchMindVideoUrl');
  const savedFileName = sessionStorage.getItem('pitchMindFileName');

  console.log('Video URL from state:', videoUrl);
  console.log('Saved Video URL:', savedVideoUrl);
  console.log('Uploaded FileName:', uploadedFileName);
  console.log('Saved FileName:', savedFileName);
  
  if (!videoUrl && savedVideoUrl) {
    setVideoUrl(savedVideoUrl);
  }
  if (!uploadedFileName && savedFileName) {
    setUploadedFileName(savedFileName);
  }
  
  const fileToUse = uploadedFileName || savedFileName;

  console.log('File to use for analysis:', fileToUse);
  console.log('Request body:', JSON.stringify({ videoPath: fileToUse, playerPosition: highlightPosition }));
  
  try {
    console.log('Sending request to:', `${API_URL}/analyze-video`);
    const resp = await fetch(`${API_URL}/analyze-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoPath: fileToUse, playerPosition: highlightPosition }),
    });

    console.log('Response status:', resp.status);
    const data = await resp.json();
    console.log('Response data:', data);

    if (data?.success && Array.isArray(data.analyses) && data.analyses.length) {
      setAIScenarios(data.analyses);
      if (data.analyses[0]?.playerPosition) setHighlightPosition(data.analyses[0].playerPosition);
      await freezeAt(data.analyses[0].timestamp);
    } else {
      setToast(data?.error || "Analysis failed.");
      setScreen("uploadVideo");
    }
  } catch (e) {
    console.error('Analysis error:', e);
    setToast(`Analysis error: ${e.message}`);
    setScreen("uploadVideo");
  }
};

  const handleAnswer = async (optionIndex) => {
    const hasAI = aiScenarios.length > 0;
    const scenIdx = currentScenario;
    const scenData = hasAI ? { options: aiScenarios[scenIdx].analysis.options } : scenarios[scenIdx];
    const picked = scenData.options[optionIndex];
    setUserAnswers((prev) => [...prev, { scenario: scenIdx, choice: optionIndex, points: picked.points }]);

    const total = hasAI ? aiScenarios.length : scenarios.length;
    if (scenIdx < total - 1) {
      const next = scenIdx + 1;
      setCurrentScenario(next);
      setIsPaused(false);
      setFreezeFrameUrl(null);
      if (hasAI) {
        if (aiScenarios[next]?.playerPosition) setHighlightPosition(aiScenarios[next].playerPosition);
        await freezeAt(aiScenarios[next].timestamp);
      } else {
        await freezeAt(scenarios[next].timestamp);
      }
    } else {
      setScreen("results");
    }
  };

  const calculateScore = () => {
    const total = userAnswers.reduce((s, a) => s + a.points, 0);
    const max = (aiScenarios.length || scenarios.length) * 100;
    const pct = max > 0 ? Math.round((total / max) * 100) : 0;
    return Math.max(0, Math.min(100, pct));
  };

  const eliteBenchmarks = useMemo(
    () => ({
      90: { players: ["Kevin De Bruyne", "Luka Modrić"], label: "World Class" },
      85: { players: ["Toni Kroos", "Bernardo Silva"], label: "Elite Level" },
      80: { players: ["Frenkie de Jong", "Martin Ødegaard"], label: "Top Professional" },
      75: { players: ["Declan Rice", "Rodri"], label: "High Professional" },
      70: { players: ["Professional Average"], label: "Professional" },
      60: { players: ["Semi-Professional"], label: "Developing" },
    }),
    []
  );

  const getGrade = (score) => {
    if (score >= 90) return { letter: "S", label: "World Class", color: "text-yellow-400", players: eliteBenchmarks[90].players, description: "Top level." };
    if (score >= 85) return { letter: "A+", label: "Elite Level", color: "text-yellow-500", players: eliteBenchmarks[85].players, description: "Elite IQ." };
    if (score >= 80) return { letter: "A", label: "Top Professional", color: "text-yellow-600", players: eliteBenchmarks[80].players, description: "Strong decisions." };
    if (score >= 75) return { letter: "B+", label: "High Professional", color: "text-orange-400", players: eliteBenchmarks[75].players, description: "Very good." };
    if (score >= 70) return { letter: "B", label: "Professional", color: "text-orange-500", players: eliteBenchmarks[70].players, description: "Solid." };
    if (score >= 60) return { letter: "C", label: "Developing", color: "text-gray-400", players: eliteBenchmarks[60].players, description: "Improving." };
    return { letter: "D", label: "Amateur", color: "text-red-500", players: ["Amateur Level"], description: "Work on fundamentals." };
  };

  const captureYouTubeFrame = (player) => {
    return new Promise((resolve) => {
      try {
        const iframe = player.getIframe();
        const canvas = document.createElement('canvas');
        const video = iframe;
        
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        resolve(null);
      } catch (e) {
        console.error('Frame capture failed:', e);
        resolve(null);
      }
    });
  };

const analyzeEliteDecisions = useCallback(async () => {
  if (!selectedGame || !quizAnswers.length) return;
  
  console.log('🎯 Starting elite analysis...');
  console.log('Selected game:', selectedGame);
  console.log('Quiz answers:', quizAnswers);
  
  setAnalyzingEliteActions(true);
  const analyses = [];
  
  for (let i = 0; i < quizAnswers.length; i++) {
    const answer = quizAnswers[i];
    const question = selectedGame.quizQuestions[answer.question];
    
    console.log('Question:', question);
    console.log('Answer:', answer);
    
    if (!question) {
      console.error('❌ Question not found for index:', answer.question);
      continue;
    }
    
    const userChoice = question.options[answer.choice];
    
    console.log('Sending to backend:', {
      playerName: selectedGame.keyPlayers[0],
      decisionTimestamp: question.timestamp,
      situation: question.situation,
      userChoice: userChoice.text,
      question: question.question
    });
    
    try {
      const resp = await fetch(`${API_URL}/analyze-elite-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameBase64: null,
          playerName: selectedGame.keyPlayers[0],
          decisionTimestamp: question.timestamp,
          situation: question.situation,
          userChoice: userChoice.text,
          question: question.question
        })
      });
      
      const data = await resp.json();
      console.log('Backend response:', data);
      
      if (data.success) {
        analyses.push({
          questionIndex: i,
          ...data.analysis,
          userChoice: userChoice.text,
          userPoints: answer.points,
          eliteChoice: question.options.find(opt => opt.eliteChoice)?.text || 'N/A'
        });
      }
    } catch (e) {
      console.error('Elite analysis failed:', e);
    }
  }
  
  console.log('✅ All analyses complete:', analyses);
  setEliteAnalyses(analyses);
  setAnalyzingEliteActions(false);
}, [selectedGame, quizAnswers, API_URL]);

useEffect(() => {
  if (showQuizResults && selectedGame && quizAnswers.length > 0 && eliteAnalyses.length === 0 && !analyzingEliteActions) {
    analyzeEliteDecisions();
  }
}, [showQuizResults, selectedGame, quizAnswers, eliteAnalyses, analyzingEliteActions, analyzeEliteDecisions]);

  if (screen === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block p-6 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mb-6 gold-glow">
            <Target className="w-20 h-20 text-yellow-400" />
          </div>
          <h1 className="text-7xl font-black mb-4 tracking-tight">
            <span className="text-white">PITCH</span> <span className="pitch-mind-text-gradient">MIND</span>
          </h1>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto">Elevate Your Game Intelligence</p>
          <div className="mt-10">
            <button onClick={() => setScreen("subscription")} className="pitch-mind-gradient text-black px-12 py-5 rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-xl">
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "subscription") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-12">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <div className="container mx-auto px-4">
          <button onClick={() => setScreen("landing")} className="mb-6 text-gray-400 hover:text-yellow-400">← Back to Home</button>
          <h2 className="text-5xl font-black text-center mb-4">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-10">
            <div className="bg-gray-800/50 rounded-2xl p-8 border-2 border-gray-700 gold-border-hover">
              <h3 className="text-3xl font-black mb-2">Basic</h3>
              <ul className="space-y-3 my-6">
                <li className="flex items-start"><CheckCircle className="w-6 h-6 text-yellow-400 mr-3" />3 video uploads</li>
                <li className="flex items-start"><CheckCircle className="w-6 h-6 text-yellow-400 mr-3" />Basic analysis</li>
              </ul>
              <button onClick={() => { setSubscriptionTier("basic"); setScreen("upload"); }} className="w-full bg-gray-700 py-3 rounded-xl font-bold">Start Free Trial</button>
            </div>
            <div className="pitch-mind-gradient text-black rounded-2xl p-8 border-4 border-yellow-400 transform scale-105">
              <h3 className="text-3xl font-black mb-2">Pro</h3>
              <ul className="space-y-3 my-6">
                <li className="flex items-start"><CheckCircle className="w-6 h-6 mr-3" />Unlimited uploads</li>
                <li className="flex items-start"><CheckCircle className="w-6 h-6 mr-3" />Advanced AI</li>
              </ul>
              <button onClick={() => { setSubscriptionTier("pro"); setScreen("upload"); }} className="w-full bg-black text-yellow-400 py-3 rounded-xl font-black">Start Free Trial</button>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-8 border-2 border-gray-700 gold-border-hover">
              <h3 className="text-3xl font-black mb-2">Elite</h3>
              <ul className="space-y-3 my-6">
                <li className="flex items-start"><CheckCircle className="w-6 h-6 text-yellow-400 mr-3" />Coach review</li>
                <li className="flex items-start"><CheckCircle className="w-6 h-6 text-yellow-400 mr-3" />Custom plans</li>
              </ul>
              <button onClick={() => { setSubscriptionTier("elite"); setScreen("upload"); }} className="w-full bg-gray-700 py-3 rounded-xl font-bold">Start Free Trial</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "upload") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-12">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <div className="container mx-auto px-4 max-w-4xl">
          <button onClick={() => setScreen("subscription")} className="mb-6 text-gray-400 hover:text-yellow-400">← Back</button>
          <h2 className="text-4xl font-black text-center mb-8">Choose Your Training Method</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 rounded-2xl p-10 border-2 border-yellow-500 gold-glow-hover cursor-pointer" onClick={() => setScreen("uploadVideo")}>
              <div className="text-6xl mb-6">📤</div>
              <h3 className="text-3xl font-black mb-4">Upload Your Game</h3>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-10 border-2 border-yellow-500 gold-glow-hover cursor-pointer" onClick={async () => {
              try { const r = await fetch(`${API_URL}/game-library`); setGameLibrary(await r.json()); setScreen("gameLibrary"); }
              catch { setToast("Failed to load library"); }
            }}>
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-3xl font-black mb-4">Study Pro Games</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "uploadVideo") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-12">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <div className="container mx-auto px-4 max-w-3xl">
          <button onClick={() => setScreen("upload")} className="mb-6 text-gray-400 hover:text-yellow-400">← Back</button>
          <h2 className="text-4xl font-black text-center mb-8">Upload Your Match Video</h2>
          <div className="bg-gray-800/50 rounded-2xl p-10 border-2 border-gray-700">
            <div className="border-4 border-dashed border-gray-600 rounded-xl p-16 text-center hover:border-yellow-500">
              <Upload className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
              <p className="text-xl mb-6 font-semibold">Drop MP4 here or click</p>
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" id="video-upload" />
              <label htmlFor="video-upload" className="pitch-mind-gradient text-black px-10 py-4 rounded-xl cursor-pointer inline-block font-bold text-lg">Select Video</label>
            </div>

            {videoFile && (
              <div className="mt-8">
                <p className="font-bold text-xl mb-6">{videoFile.name}</p>
                {!videoLoaded && (
                  <div className="w-full bg-gray-700 rounded-xl mb-6 p-8">
                    <div className="text-center mb-5">
                      <p className="text-gray-300 font-bold text-lg mb-2">Uploading/Loading…</p>
                      <p className="text-5xl font-black pitch-mind-text-gradient">{loadingProgress}%</p>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-5 overflow-hidden">
                      <div className="pitch-mind-gradient h-full rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
                    </div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  src={videoUrl || ""}
                  className={`w-full rounded-xl mb-6 border-2 border-gray-700 ${!videoLoaded ? "hidden" : ""}`}
                  controls
                  onProgress={(e) => {
                    const v = e.currentTarget;
                    if (v.buffered.length > 0) {
                      const end = v.buffered.end(v.buffered.length - 1);
                      const dur = v.duration;
                      if (dur > 0) setLoadingProgress(Math.round((end / dur) * 100));
                    }
                  }}
                  onLoadedMetadata={() => { setLoadingProgress(100); setTimeout(() => setVideoLoaded(true), 200); }}
                  onCanPlayThrough={() => { setLoadingProgress(100); setTimeout(() => setVideoLoaded(true), 200); }}
                  onError={() => { setVideoLoaded(true); setToast("Error loading video."); }}
                />
                <button onClick={() => setScreen("playerSelection")} disabled={!videoLoaded} className={`w-full py-5 rounded-xl font-black text-lg ${videoLoaded ? "pitch-mind-gradient text-black hover:scale-105" : "bg-gray-600 text-gray-400"}`}>
                  {videoLoaded ? "Proceed to Player Selection" : `Loading… ${loadingProgress}%`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
if (screen === "gameLibrary") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-12">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <div className="container mx-auto px-4 max-w-7xl">
          <button onClick={() => setScreen("upload")} className="mb-6 text-gray-400 hover:text-yellow-400">← Back</button>
          <h2 className="text-5xl font-black mb-4">Professional Game Library</h2>
          <p className="text-gray-400 text-xl mb-12">Select games featuring elite players in your position</p>
          
          {gameLibrary && (
            <div className="space-y-12">
              <div>
                <h3 className="text-3xl font-black mb-6 flex items-center">
                  <span className="pitch-mind-gradient px-4 py-2 rounded-lg mr-4 text-black">⚽</span>
                  Midfielders
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {gameLibrary.midfielder.map(game => (
                    <div
                      key={game.id}
                      className="bg-gray-800/70 rounded-xl overflow-hidden border-2 border-gray-700 gold-glow-hover transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedGame(game);
                        setShowYouTubeModal(true);
                      }}
                    >
                      <img src={game.thumbnail} alt={game.title} className="w-full h-52 object-cover bg-gray-700" />
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-xl leading-tight flex-1">{game.title}</h4>
                          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-black ml-2">{game.difficulty}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{game.description}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-semibold">{game.duration}</span>
                          <span className="text-yellow-400 font-semibold">{game.keyPlayers.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black mb-6 flex items-center">
                  <span className="pitch-mind-gradient px-4 py-2 rounded-lg mr-4 text-black">⚡</span>
                  Forwards
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {gameLibrary.forward.map(game => (
                    <div
                      key={game.id}
                      className="bg-gray-800/70 rounded-xl overflow-hidden border-2 border-gray-700 gold-glow-hover transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedGame(game);
                        setShowYouTubeModal(true);
                      }}
                    >
                      <img src={game.thumbnail} alt={game.title} className="w-full h-52 object-cover bg-gray-700" />
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-xl leading-tight flex-1">{game.title}</h4>
                          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-black ml-2">{game.difficulty}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{game.description}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-semibold">{game.duration}</span>
                          <span className="text-yellow-400 font-semibold">{game.keyPlayers.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black mb-6 flex items-center">
                  <span className="pitch-mind-gradient px-4 py-2 rounded-lg mr-4 text-black">🛡️</span>
                  Defenders
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {gameLibrary.defender.map(game => (
                    <div
                      key={game.id}
                      className="bg-gray-800/70 rounded-xl overflow-hidden border-2 border-gray-700 gold-glow-hover transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedGame(game);
                        setShowYouTubeModal(true);
                      }}
                    >
                      <img src={game.thumbnail} alt={game.title} className="w-full h-52 object-cover bg-gray-700" />
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-xl leading-tight flex-1">{game.title}</h4>
                          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-black ml-2">{game.difficulty}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{game.description}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-semibold">{game.duration}</span>
                          <span className="text-yellow-400 font-semibold">{game.keyPlayers.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showYouTubeModal && selectedGame && (
            <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6">
              <div className="bg-gray-800 rounded-2xl max-w-5xl w-full p-8 border-2 border-yellow-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black mb-2">{selectedGame.title}</h3>
                    <p className="text-gray-400 text-lg">{selectedGame.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowYouTubeModal(false);
                      setSelectedGame(null);
                    }}
                    className="text-gray-400 hover:text-white text-4xl font-light leading-none"
                  >
                    ×
                  </button>
                </div>
                
                <div className="relative w-full rounded-xl overflow-hidden mb-6" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedGame.youtubeId}?rel=0`}
                    title={selectedGame.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h5 className="font-bold mb-2">🎥 Free Study Mode</h5>
                    <p className="text-sm text-gray-400">Watch and learn at your own pace</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 p-4 rounded-lg border-2 border-yellow-500">
                    <h5 className="font-bold mb-2 text-yellow-400">🧠 Interactive Quiz</h5>
                    <p className="text-sm text-gray-300 mb-3">Test your tactical IQ!</p>
                    <button
                      onClick={() => {
                        setShowYouTubeModal(false);
                        setQuizMode(true);
                        setCurrentQuizQuestion(0);
                        setQuizAnswers([]);
                      }}
                      className="w-full pitch-mind-gradient text-black px-4 py-2 rounded-lg font-bold"
                    >
                      Start Quiz →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {quizMode && selectedGame && (
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto z-50">
              <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (window.confirm('Exit quiz?')) {
                        setQuizMode(false);
                        setQuizAnswers([]);
                        setCurrentQuizQuestion(0);
                      }
                    }}
                    className="text-gray-400 hover:text-yellow-400"
                  >
                    ← Exit Quiz
                  </button>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Question {currentQuizQuestion + 1} of {selectedGame.quizQuestions.length}</div>
                    <div className="text-yellow-400 font-black text-xl">Score: {quizAnswers.reduce((s, a) => s + a.points, 0)} pts</div>
                  </div>
                </div>

                <div className="max-w-5xl mx-auto">
                  <div className="bg-black rounded-xl mb-8 overflow-hidden border-2 border-yellow-500 relative">
                    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${selectedGame.youtubeId}?start=${selectedGame.quizQuestions[currentQuizQuestion].timestamp}&rel=0`}
                        title={selectedGame.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800/70 rounded-xl p-8 mb-8 border-2 border-gray-700">
                    <h3 className="text-xl font-black mb-3 text-yellow-400">SITUATION:</h3>
                    <p className="text-lg leading-relaxed mb-5">{selectedGame.quizQuestions[currentQuizQuestion].situation}</p>
                    <h3 className="text-2xl font-black mb-4">{selectedGame.quizQuestions[currentQuizQuestion].question}</h3>
                  </div>

                  <div className="space-y-5">
                    {selectedGame.quizQuestions[currentQuizQuestion].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
  // Prevent multiple clicks on the same question
  if (quizAnswers.find(a => a.question === currentQuizQuestion)) {
    return; // Already answered this question
  }
  
  const newAnswer = {
    question: currentQuizQuestion,
    choice: idx,
    points: option.points,
    feedback: option.feedback,
    eliteChoice: option.eliteChoice
  };
  
  const updatedAnswers = [...quizAnswers, newAnswer];
  setQuizAnswers(updatedAnswers);
  
  if (currentQuizQuestion < selectedGame.quizQuestions.length - 1) {
    setTimeout(() => setCurrentQuizQuestion(currentQuizQuestion + 1), 100);
  } else {
    // Quiz complete - show results
    setTimeout(() => {
      setShowQuizResults(true);
    }, 100);
  }
}}
                        className="w-full bg-gray-800/70 hover:bg-gray-700/70 p-8 rounded-xl text-left border-2 border-gray-700 hover:border-yellow-400"
                      >
                        <div className="flex items-center">
                          <div className="pitch-mind-gradient text-black w-14 h-14 rounded-full flex items-center justify-center font-black text-xl mr-5">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <p className="text-lg font-semibold">{option.text}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
{showQuizResults && selectedGame && analyzingEliteActions && eliteAnalyses.length === 0 && (
  <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto z-50">
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <Trophy className="w-28 h-28 mx-auto mb-6 text-yellow-400 animate-pulse" />
        <h2 className="text-5xl font-black mb-3">Analyzing Elite Decisions...</h2>
        <p className="text-gray-400 text-xl mb-6">Comparing your choices to {selectedGame.keyPlayers[0]}</p>
        
        {analysisProgress > 0 && (
          <div className="max-w-md mx-auto">
            <p className="text-2xl font-bold mb-4 text-yellow-400">{analysisProgress} / {selectedGame.quizQuestions.length} questions analyzed</p>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="pitch-mind-gradient h-full rounded-full transition-all duration-500" 
                style={{ width: `${(analysisProgress / selectedGame.quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
)}

{showQuizResults && selectedGame && eliteAnalyses.length > 0 && (
  <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto z-50">
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-10">
        <Trophy className="w-28 h-28 mx-auto mb-6 text-yellow-400" />
        <h2 className="text-5xl font-black mb-3">Quiz Complete!</h2>
        <p className="text-gray-400 text-xl">Your tactical IQ breakdown</p>
      </div>

      {/* Overall Score */}
      <div className="bg-gray-800/70 border-2 border-yellow-500 rounded-2xl p-10 mb-8">
        <div className="text-center mb-6">
          <div className="text-8xl font-black mb-4 pitch-mind-text-gradient">
            {Math.round((quizAnswers.reduce((s, a) => s + a.points, 0) / (selectedGame.quizQuestions.length * 100)) * 100)}%
          </div>
          <div className="text-3xl font-bold mb-2">
            {quizAnswers.reduce((s, a) => s + a.points, 0)} / {selectedGame.quizQuestions.length * 100} points
          </div>
          <div className="text-lg text-gray-400">
            Matched elite choice: {quizAnswers.filter(a => a.eliteChoice).length} / {selectedGame.quizQuestions.length}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <h3 className="text-3xl font-black mb-6">Decision Breakdown</h3>
      
      <div className="space-y-6">
        {eliteAnalyses.map((analysis, idx) => {
          const question = selectedGame.quizQuestions[idx];
          const userAnswer = quizAnswers[idx];
          const matchedElite = analysis.matchedUserChoice;
          
          return (
            <div key={idx} className={`bg-gray-800/70 rounded-2xl p-8 border-2 ${matchedElite ? 'border-green-500' : 'border-orange-500'}`}>
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-black text-yellow-400">Q{idx + 1}</span>
                    {matchedElite ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">✓ Elite Match</span>
                    ) : (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">⚠ Different Choice</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-lg">{question.question}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-3xl font-black pitch-mind-text-gradient">{userAnswer.points}</div>
                  <div className="text-sm text-gray-400">points</div>
                </div>
              </div>

              {/* Your Choice vs Elite Choice */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Your Choice:</p>
                  <p className="text-white font-bold">{analysis.userChoice}</p>
                </div>
                <div className="bg-yellow-600/10 p-4 rounded-xl border border-yellow-600">
                  <p className="text-sm text-yellow-400 mb-2 font-semibold">Elite Choice:</p>
                  <p className="text-white font-bold">{analysis.eliteChoice}</p>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                  <p className="text-sm text-yellow-400 mb-2 font-bold">🎯 What {selectedGame.keyPlayers[0]} Did:</p>
                  <p className="text-gray-200 leading-relaxed">{analysis.eliteAction}</p>
                </div>

                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                  <p className="text-sm text-yellow-400 mb-2 font-bold">🧠 Why This is Elite:</p>
                  <p className="text-gray-200 leading-relaxed">{analysis.whyElite}</p>
                </div>

                <div className="bg-yellow-600/10 p-5 rounded-xl border border-yellow-600">
                  <p className="text-sm text-yellow-400 mb-2 font-bold">📚 Tactical Lesson:</p>
                  <p className="text-white font-semibold leading-relaxed">{analysis.tacticalLesson}</p>
                </div>

                {!matchedElite && analysis.improvementTip && (
                  <div className="bg-orange-600/10 p-5 rounded-xl border border-orange-500">
                    <p className="text-sm text-orange-400 mb-2 font-bold">💡 How to Improve:</p>
                    <p className="text-white leading-relaxed">{analysis.improvementTip}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-5 mt-10">
        <button
          onClick={() => {
            setCurrentQuizQuestion(0);
            setQuizAnswers([]);
            setShowQuizResults(false);
            setEliteAnalyses([]);
          }}
          className="pitch-mind-gradient text-black px-10 py-4 rounded-xl font-black hover:scale-105"
        >
          Retake Quiz
        </button>
        <button
          onClick={() => {
            setQuizMode(false);
            setShowQuizResults(false);
            setQuizAnswers([]);
            setEliteAnalyses([]);
            setSelectedGame(null);
          }}
          className="bg-gray-700 text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-600"
        >
          Back to Library
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      </div>
    );
  }      
if (screen === "playerSelection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-12">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <div className="container mx-auto px-4 max-w-5xl">
          <button onClick={() => setScreen("uploadVideo")} className="mb-6 text-gray-400 hover:text-yellow-400">← Back to Upload</button>
          <h2 className="text-4xl font-black text-center mb-4">Select Player to Analyze</h2>
          <p className="text-center text-gray-400 mb-10 text-lg">Click on the player you want to analyze</p>

          <div ref={videoBoxRef} className="bg-gray-800/50 rounded-2xl p-0 border-2 border-gray-700 relative overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
            {videoUrl ? (
              <>
                <video
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full object-contain"
                  muted
                  onLoadedData={(e) => { try { e.currentTarget.currentTime = 5; e.currentTarget.pause(); } catch {} }}
                />
                <div onClick={handleCanvasClick} className={`absolute inset-0 ${selectingPlayer ? "cursor-crosshair" : "cursor-default"}`} />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center"><p className="text-gray-400">No video loaded</p></div>
            )}

            {selectedPlayer && (
              <>
                <div
                  className="absolute border-4 border-yellow-400 rounded-full animate-pulse z-20 pointer-events-none"
                  style={{ left: `${highlightPosition.x}%`, top: `${highlightPosition.y}%`, width: "90px", height: "90px", transform: "translate(-50%, -50%)", boxShadow: "0 0 30px rgba(255, 215, 0, 0.9)" }}
                />
                <div className="absolute z-20 pointer-events-none" style={{ left: `${highlightPosition.x}%`, top: `${highlightPosition.y}%`, transform: "translate(-50%, -130px)" }}>
                  <div className="bg-yellow-400 text-black px-5 py-2 rounded-full font-black text-xl shadow-2xl">🎯 TARGET</div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-1 h-20 bg-yellow-400" />
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setSelectingPlayer(true)} className={`flex items-center px-8 py-4 rounded-xl font-bold text-lg ${selectingPlayer ? "pitch-mind-gradient text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
              <MousePointer className="w-6 h-6 mr-2" />
              {selectingPlayer ? "Click on Player" : "Select Player"}
            </button>
            {selectedPlayer && (
              <button onClick={proceedToTraining} className="pitch-mind-gradient text-black px-10 py-4 rounded-xl font-black text-lg hover:scale-105">
                Start Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "training") {
    const hasAI = aiScenarios.length > 0;
    const current = hasAI
      ? { timestamp: aiScenarios[currentScenario].timestamp, situation: aiScenarios[currentScenario].analysis.situation, playerHighlight: aiScenarios[currentScenario].analysis.playerRole || aiScenarios[currentScenario].tacticalPosition, options: aiScenarios[currentScenario].analysis.options, fieldLocation: aiScenarios[currentScenario].analysis.fieldLocation, pressureLevel: aiScenarios[currentScenario].analysis.pressureLevel }
      : scenarios[currentScenario];
    const total = hasAI ? aiScenarios.length : scenarios.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={() => { if (window.confirm("Exit training? Progress will be lost.")) { setScreen("landing"); setCurrentScenario(0); setUserAnswers([]); setAIScenarios([]); } }}
                className="text-gray-400 hover:text-yellow-400 text-sm font-semibold"
              >
                ← Exit Training
              </button>
              <h2 className="text-3xl font-black">Scenario {currentScenario + 1} of {total}</h2>
            </div>
            <div className="text-sm text-gray-400">
              Score: <span className="text-yellow-400 font-black text-xl">{userAnswers.reduce((s, a) => s + a.points, 0)}</span> pts
            </div>
          </div>

          <div className="bg-black rounded-xl mb-8 relative overflow-hidden border-2 border-gray-700" ref={videoBoxRef} style={{ aspectRatio: "16 / 9" }}>
            <video ref={trainingVideoRef} src={videoUrl || ""} className="absolute inset-0 w-full h-full object-contain opacity-0" crossOrigin="anonymous" muted />
            {freezeFrameUrl ? (
              <img src={freezeFrameUrl} alt="Freeze frame" className="absolute inset-0 w-full h-full object-contain" />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-yellow-400 mx-auto mb-5"></div>
                  <p className="text-gray-400 text-lg font-semibold">Loading freeze frame…</p>
                </div>
              </div>
            )}

            {isPaused && (
              <div
                className="absolute border-4 border-yellow-400 rounded-full animate-pulse"
                style={{ left: `${highlightPosition.x}%`, top: `${highlightPosition.y}%`, width: "110px", height: "110px", transform: "translate(-50%, -50%)", boxShadow: "0 0 40px rgba(255,215,0,.9), inset 0 0 30px rgba(255,215,0,.3)" }}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-5 py-2 rounded-full text-sm font-black">YOU</div>
              </div>
            )}

            <div className="absolute top-5 left-5 bg-red-600 px-4 py-2 rounded-lg text-sm font-black">PAUSED - Decision Point</div>
            <div className="absolute top-5 right-5 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-black">Time: {current.timestamp}s</div>
            {current.fieldLocation && <div className="absolute top-16 right-5 bg-yellow-500 text-black px-4 py-2 rounded-lg text-xs font-black">{current.fieldLocation}</div>}
            {current.pressureLevel && <div className="absolute top-28 right-5 bg-orange-500 text-black px-4 py-2 rounded-lg text-xs font-black">Pressure: {current.pressureLevel}</div>}
          </div>

          <div className="bg-gray-800/70 rounded-xl p-8 mb-8 border-2 border-gray-700">
            <div className="flex items-start mb-5">
              <User className="w-7 h-7 text-yellow-400 mr-4 mt-1" />
              <div>
                <p className="text-sm text-gray-400 mb-2 font-semibold">You are playing as:</p>
                <p className="text-2xl font-black">{current.playerHighlight}</p>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-5">
              <p className="text-xl font-black mb-3">Situation:</p>
              <p className="text-gray-300 text-lg">{current.situation}</p>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-2xl font-black mb-6">What should you do?</h3>
            {current.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(idx)} className="w-full bg-gray-800/70 hover:bg-gray-700/70 p-8 rounded-xl text-left border-2 border-gray-700 hover:border-yellow-400 gold-glow-hover">
                <div className="flex items-center">
                  <div className="pitch-mind-gradient text-black w-14 h-14 rounded-full flex items-center justify-center font-black text-xl mr-5 shadow-lg">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <p className="text-lg font-semibold">{opt.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "results") {
    const score = calculateScore();
    const grade = getGrade(score);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-12">
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <Trophy className="w-28 h-28 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-5xl font-black mb-3">Training Complete!</h2>
            <p className="text-gray-400 text-xl">Your Soccer IQ comparison</p>
          </div>
          <div className="bg-gray-800/70 border-2 border-yellow-500 rounded-2xl p-10 mb-8 shadow-2xl text-center">
            <div className="text-8xl font-black mb-4 pitch-mind-text-gradient">{score}%</div>
            <div className={`text-5xl font-black mb-3 ${grade.color}`}>Grade: {grade.letter}</div>
            <div className="text-3xl font-bold mb-5">{grade.label}</div>
            <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">{grade.description}</p>
            <div className="bg-gray-900/50 rounded-xl p-6 inline-block border border-gray-700">
              <p className="text-sm text-gray-400 mb-3 font-semibold">Playing at the level of:</p>
              <p className="text-2xl font-black text-yellow-400">{grade.players.join(", ")}</p>
            </div>
          </div>
          <div className="flex justify-center gap-5">
            <button onClick={() => { setScreen("upload"); setCurrentScenario(0); setUserAnswers([]); setAIScenarios([]); }} className="pitch-mind-gradient text-black px-10 py-4 rounded-xl font-black hover:scale-105">
              Analyze Another Video
            </button>
            <button onClick={() => {
              setScreen("landing");
              setSubscriptionTier(null);
              setVideoFile(null);
              if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
              setVideoUrl(null);
              setUploadedFileName(null);
              setCurrentScenario(0);
              setUserAnswers([]);
              setIsPaused(false);
              setFreezeFrameUrl(null);
              setSelectedPlayer(false);
              setSelectingPlayer(false);
              setAIScenarios([]);
            }} className="bg-gray-700 border-2 border-gray-600 text-white px-10 py-4 rounded-xl hover:border-yellow-400 font-bold">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
