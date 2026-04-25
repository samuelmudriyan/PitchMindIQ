import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Film, Upload, Play, Pause, SkipBack, SkipForward, Scissors, Trash2, Brain, CheckCircle, AlertCircle, Loader2, ChevronLeft, X, Clock } from 'lucide-react';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function GameClipsPage({ user, sidebarCollapsed, setCurrentPage, gameClips, setGameClips, trimVideoForUpload, apiBase, players }) {
  const [gameFile, setGameFile] = useState(null);
  const [gameUrl, setGameUrl] = useState(null);
  const [gameTitle, setGameTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clipIn, setClipIn] = useState(null);
  const [clipOut, setClipOut] = useState(null);
  const [clipName, setClipName] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'clips'

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const gameClipsForGame = gameClips.filter(c => c.gameTitle === gameTitle);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) return;
    setGameFile(file);
    setGameUrl(URL.createObjectURL(file));
    setGameTitle(file.name.replace(/\.[^/.]+$/, ''));
    setClipIn(null);
    setClipOut(null);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  const seek = (delta) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
  };

  const markIn = () => setClipIn(currentTime);
  const markOut = () => setClipOut(currentTime);

  const addClip = () => {
    if (clipIn === null || clipOut === null || clipOut <= clipIn) return;
    const name = clipName.trim() || `Clip ${gameClipsForGame.length + 1}`;
    const clip = {
      id: Date.now(),
      gameTitle,
      clipName: name,
      startTime: clipIn,
      endTime: clipOut,
      analyzed: false,
      analysisResults: null,
    };
    setGameClips(prev => [...prev, clip]);
    setClipIn(null);
    setClipOut(null);
    setClipName('');
  };

  const deleteClip = (id) => setGameClips(prev => prev.filter(c => c.id !== id));

  const playClip = (clip) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = clip.startTime;
    videoRef.current.play();
    const stopAt = clip.endTime;
    const check = () => {
      if (videoRef.current && videoRef.current.currentTime >= stopAt) {
        videoRef.current.pause();
        videoRef.current.removeEventListener('timeupdate', check);
      }
    };
    videoRef.current.addEventListener('timeupdate', check);
  };

  const analyzeClip = async (clip) => {
    if (!gameFile || !trimVideoForUpload) return;
    setAnalyzingId(clip.id);
    setAnalyzeError(null);
    try {
      const clipDuration = clip.endTime - clip.startTime;
      const trimmed = await trimVideoForUpload(gameFile, clip.startTime + clipDuration / 2, clipDuration);

      const formData = new FormData();
      formData.append('video', trimmed);
      formData.append('clickX', '50');
      formData.append('clickY', '50');
      formData.append('clickTimestamp', String(clipDuration / 2));
      if (selectedPlayer) {
        formData.append('playerName', selectedPlayer.name);
        formData.append('jerseyNumber', selectedPlayer.jerseyNumber || '');
        formData.append('jerseyColor', selectedPlayer.jerseyColor || '');
      }

      const res = await fetch(`${apiBase}/api/analyze`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Analysis failed');
      const { jobId } = await res.json();
      if (!jobId) throw new Error('No job ID');

      const results = await new Promise((resolve, reject) => {
        const poll = setInterval(async () => {
          try {
            const s = await fetch(`${apiBase}/api/analyze-status/${jobId}`).then(r => r.json());
            if (s.status === 'completed') { clearInterval(poll); resolve(s.results); }
            else if (s.status === 'failed') { clearInterval(poll); reject(new Error(s.error || 'Analysis failed')); }
          } catch (e) { clearInterval(poll); reject(e); }
        }, 5000);
      });

      setGameClips(prev => prev.map(c => c.id === clip.id ? { ...c, analyzed: true, analysisResults: results } : c));
    } catch (err) {
      setAnalyzeError(err.message);
    }
    setAnalyzingId(null);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [gameUrl]);

  useEffect(() => {
    const onKey = (e) => {
      if (!gameUrl) return;
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowLeft') seek(-5);
      if (e.code === 'ArrowRight') seek(5);
      if (e.code === 'KeyI') markIn();
      if (e.code === 'KeyO') markOut();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const marginClass = sidebarCollapsed ? 'ml-20' : 'ml-64';

  return (
    <div className={`pt-16 min-h-screen bg-[#0a0f0d] transition-all duration-300 ${marginClass}`}>
      {/* Top bar */}
      <div className={`fixed top-0 right-0 h-16 bg-[#0a0f0d]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-40 transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
        <div className="flex items-center space-x-3">
          <Film className="w-5 h-5 text-emerald-400" />
          <h1 className="text-lg font-bold text-white">Game Clips</h1>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto">

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white/5 p-1 rounded-xl w-fit">
            {['editor', 'clips'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                {tab === 'editor' ? 'Clip Editor' : `Saved Clips (${gameClips.length})`}
              </button>
            ))}
          </div>

          {/* ── EDITOR TAB ── */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              {!gameUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-3xl p-16 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                  <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-300 mb-2">Load Game Footage</p>
                  <p className="text-gray-500">Click to select a video file — no upload, stays on your device</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Video player */}
                  <div className="bg-black rounded-2xl overflow-hidden relative">
                    <video ref={videoRef} src={gameUrl} className="w-full max-h-[480px] object-contain" />
                    {/* In/Out overlay */}
                    {(clipIn !== null || clipOut !== null) && duration > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                        {clipIn !== null && clipOut !== null && (
                          <div
                            className="absolute h-full bg-emerald-400/70"
                            style={{ left: `${(clipIn / duration) * 100}%`, width: `${((clipOut - clipIn) / duration) * 100}%` }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timeline scrubber */}
                  <input type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
                    onChange={e => { if (videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value); }}
                    className="w-full accent-emerald-400" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  {/* Transport controls */}
                  <div className="flex items-center justify-center space-x-3">
                    <button onClick={() => seek(-10)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="−10s">
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button onClick={() => seek(-5)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="−5s">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={togglePlay} className="p-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button onClick={() => seek(5)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="+5s">
                      <SkipForward className="w-5 h-5" />
                    </button>
                    <button onClick={() => seek(10)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="+10s">
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mark In / Out */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={markIn} className="flex items-center justify-center space-x-2 p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all font-medium">
                        <Scissors className="w-4 h-4" />
                        <span>Mark In {clipIn !== null ? `(${formatTime(clipIn)})` : ''}</span>
                      </button>
                      <button onClick={markOut} className="flex items-center justify-center space-x-2 p-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-all font-medium">
                        <Scissors className="w-4 h-4 scale-x-[-1]" />
                        <span>Mark Out {clipOut !== null ? `(${formatTime(clipOut)})` : ''}</span>
                      </button>
                    </div>

                    {clipIn !== null && clipOut !== null && clipOut > clipIn && (
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={clipName}
                          onChange={e => setClipName(e.target.value)}
                          placeholder="Clip name (optional)"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                        />
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatTime(clipOut - clipIn)}
                        </div>
                        <button onClick={addClip} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium text-sm transition-all whitespace-nowrap">
                          Save Clip
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-600">Shortcuts: Space = play/pause · ← → = ±5s · I = mark in · O = mark out</p>
                  </div>

                  {/* Clips for this game */}
                  {gameClipsForGame.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Clips from this game</h3>
                      {gameClipsForGame.map(clip => (
                        <div key={clip.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                          <div>
                            <p className="text-white font-medium text-sm">{clip.clipName}</p>
                            <p className="text-gray-500 text-xs">{formatTime(clip.startTime)} → {formatTime(clip.endTime)} · {formatTime(clip.endTime - clip.startTime)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => playClip(clip)} className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-all"><Play className="w-4 h-4" /></button>
                            <button onClick={() => deleteClip(clip.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={() => { setGameUrl(null); setGameFile(null); }} className="text-sm text-gray-500 hover:text-gray-300 transition-all">
                    ← Load different video
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── CLIPS TAB ── */}
          {activeTab === 'clips' && (
            <div className="space-y-4">
              {gameClips.length === 0 ? (
                <div className="text-center py-16">
                  <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No clips saved yet. Use the Clip Editor to mark clips from game footage.</p>
                </div>
              ) : (
                <>
                  {/* Player filter */}
                  {players.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400">Track player:</span>
                      <select value={selectedPlayer?.id || ''} onChange={e => setSelectedPlayer(players.find(p => String(p.id) === e.target.value) || null)}
                        className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500/50">
                        <option value="">None</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name} #{p.jerseyNumber}</option>)}
                      </select>
                    </div>
                  )}

                  {analyzeError && (
                    <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{analyzeError}</span>
                    </div>
                  )}

                  {!gameFile && (
                    <div className="flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>To analyze clips, load the game video in the Clip Editor tab first (needed for trimming).</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {gameClips.map(clip => (
                      <div key={clip.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">{clip.clipName}</p>
                            <p className="text-gray-500 text-sm">{clip.gameTitle} · {formatTime(clip.startTime)} → {formatTime(clip.endTime)} · {formatTime(clip.endTime - clip.startTime)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {clip.analyzed && <span className="flex items-center space-x-1 text-emerald-400 text-xs"><CheckCircle className="w-3.5 h-3.5" /><span>Analyzed</span></span>}
                            <button onClick={() => deleteClip(clip.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>

                        {clip.analyzed && clip.analysisResults?.decision_points?.length > 0 && (
                          <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">
                            {clip.analysisResults.decision_points.length} decision points · {clip.analysisResults.summary || ''}
                          </div>
                        )}

                        <button
                          disabled={!gameFile || analyzingId !== null}
                          onClick={() => analyzeClip(clip)}
                          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">
                          {analyzingId === clip.id ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Analyzing…</span></> : <><Brain className="w-4 h-4" /><span>{clip.analyzed ? 'Re-analyze' : 'Analyze with AI'}</span></>}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
