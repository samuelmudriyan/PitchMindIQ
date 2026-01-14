import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, Tag, Brain, X, ChevronLeft, Trash2, Sparkles, Play, Pause } from 'lucide-react';

const API_BASE = 'https://pitchmind-backend-production-483d.up.railway.app';

const formatTime = (seconds) => {
  const secs = Math.floor(seconds);
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
};

export default function ManualTaggingPage({ 
  user, 
  sidebarCollapsed, 
  setCurrentPage,
  taggedGames,
  setTaggedGames 
}) {
  // Core state
  const [uploadingGame, setUploadingGame] = useState(false);
  const [taggingMode, setTaggingMode] = useState(false);
  const [analyzingGame, setAnalyzingGame] = useState(false);
  const [loadingGame, setLoadingGame] = useState(false);
  
  // Game data
  const [currentGame, setCurrentGame] = useState(null);
  const [gameEvents, setGameEvents] = useState([]);
  const [gameInsights, setGameInsights] = useState([]);
  
  // Refs
  const gameVideoRef = useRef(null);
  const gameUploadInputRef = useRef(null);
  
  // Debug mode
  const [showDebug, setShowDebug] = useState(false);
  
  // Keep tagging mode stable - only reset when explicitly closed
  useEffect(() => {
    if (currentGame && !taggingMode) {
      console.log('🔧 Re-enabling tagging mode for current game');
      setTaggingMode(true);
    }
  }, [currentGame, taggingMode]);
  
  const handleUploadGame = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('📤 Uploading game:', file.name);
    setUploadingGame(true);
    
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('date', new Date().toISOString().split('T')[0]);
    
    try {
      const response = await fetch(`${API_BASE}/api/tagged-games`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Game uploaded:', result);
      
      // Update list
      setTaggedGames([result, ...taggedGames]);
      
      // Set current game and switch to tagging mode
      setCurrentGame(result);
      setGameEvents([]);
      setGameInsights([]);
      setTaggingMode(true);
      
      // Reset file input
      if (gameUploadInputRef.current) {
        gameUploadInputRef.current.value = '';
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingGame(false);
    }
  };
  
  const addEventTag = async (eventType) => {
    if (!gameVideoRef.current || !currentGame) {
      console.warn('Cannot add tag: missing video ref or game');
      return;
    }
    
    const timestamp = gameVideoRef.current.currentTime;
    console.log(`🏷️ Adding ${eventType} tag at ${formatTime(timestamp)}`);
    
    try {
      const response = await fetch(`${API_BASE}/api/tagged-games/${currentGame.id}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gamePlayerId: null, // Can be enhanced later
          timestamp,
          eventType,
          notes: ''
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add tag');
      }
      
      const event = await response.json();
      console.log('✅ Tag added:', event);
      
      // Update events list
      setGameEvents(prev => [...prev, event].sort((a, b) => a.timestamp - b.timestamp));
      
      // Update tags count
      const newCount = (currentGame.tags_count || 0) + 1;
      setCurrentGame(prev => ({ ...prev, tags_count: newCount }));
      setTaggedGames(prev => prev.map(g => 
        g.id === currentGame.id ? { ...g, tags_count: newCount } : g
      ));
      
      // Flash feedback
      if (gameVideoRef.current) {
        const video = gameVideoRef.current;
        const originalOpacity = video.style.opacity;
        video.style.opacity = '0.5';
        setTimeout(() => { video.style.opacity = originalOpacity; }, 100);
      }
    } catch (err) {
      console.error('❌ Tag error:', err);
      alert('Failed to add tag: ' + err.message);
    }
  };
  
  const deleteEventTag = async (eventId) => {
    if (!window.confirm('Delete this tag?')) return;
    
    console.log('🗑️ Deleting tag:', eventId);
    
    try {
      const response = await fetch(`${API_BASE}/api/tagged-games/${currentGame.id}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }
      
      console.log('✅ Tag deleted');
      
      // Update events list
      setGameEvents(prev => prev.filter(e => e.id !== eventId));
      
      // Update tags count
      const newCount = Math.max(0, (currentGame.tags_count || 1) - 1);
      setCurrentGame(prev => ({ ...prev, tags_count: newCount }));
      setTaggedGames(prev => prev.map(g => 
        g.id === currentGame.id ? { ...g, tags_count: newCount } : g
      ));
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert('Failed to delete tag');
    }
  };
  
  const analyzeGame = async () => {
    if (!currentGame || gameEvents.length === 0) {
      alert('Add some event tags before analyzing');
      return;
    }
    
    console.log('🧠 Analyzing game with', gameEvents.length, 'events');
    setAnalyzingGame(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/tagged-games/${currentGame.id}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const result = await response.json();
      console.log('✅ Analysis complete:', result);
      
      setGameInsights(result.insights || []);
      setCurrentGame(prev => ({ ...prev, analyzed: true }));
      setTaggedGames(prev => prev.map(g => 
        g.id === currentGame.id ? { ...g, analyzed: true } : g
      ));
    } catch (err) {
      console.error('❌ Analysis error:', err);
      alert('AI analysis failed: ' + err.message);
    } finally {
      setAnalyzingGame(false);
    }
  };
  
  const loadGameData = async (game) => {
    console.log('📂 Loading game:', game.title);
    setLoadingGame(true);
    
    try {
      // First set the game and mode - this prevents flashing
      setCurrentGame(game);
      setTaggingMode(true);
      
      // Then fetch detailed data
      const response = await fetch(`${API_BASE}/api/tagged-games/${game.id}`, {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load game data');
      }
      
      const data = await response.json();
      console.log('✅ Game loaded:', data);
      
      // Verify video_url
      if (!data.video_url) {
        console.error('❌ Missing video_url in game data!');
        throw new Error('Video URL not found. Please re-upload this game.');
      }
      
      // Update with full data
      setCurrentGame(data);
      setGameEvents(data.events || []);
      setGameInsights(data.insights || []);
      
    } catch (err) {
      console.error('❌ Load error:', err);
      alert('Failed to load game: ' + err.message);
      // Don't reset state - let user try again
    } finally {
      setLoadingGame(false);
    }
  };
  
  const deleteGame = async (gameId) => {
    if (!window.confirm('Delete this tagged game and all its tags?')) return;
    
    console.log('🗑️ Deleting game:', gameId);
    
    try {
      const response = await fetch(`${API_BASE}/api/tagged-games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete game');
      }
      
      console.log('✅ Game deleted');
      
      setTaggedGames(prev => prev.filter(g => g.id !== gameId));
      
      if (currentGame?.id === gameId) {
        closeTaggingMode();
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert('Failed to delete game');
    }
  };
  
  const closeTaggingMode = () => {
    console.log('🚪 Closing tagging mode');
    setCurrentGame(null);
    setGameEvents([]);
    setGameInsights([]);
    setTaggingMode(false);
  };
  
  // PageWrapper component (inline for completeness)
  const PageWrapper = ({ children, title }) => (
    <div className={`pt-16 min-h-screen bg-[#0a0f0d] transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      {/* Top Bar */}
      <div className={`fixed top-0 right-0 h-16 bg-[#0a0f0d]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-40 transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
        <div className="flex items-center space-x-4">
          <button onClick={() => setCurrentPage('dashboard')} className="text-gray-400 hover:text-white font-medium flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
      </div>
      
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]" />
      </div>
      
      <div className="relative p-8">{children}</div>
    </div>
  );
  
  // Main render
  return (
    <PageWrapper title="Manual Tagging">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Manual Game Tagging</h2>
        <p className="text-gray-400">Upload game footage, tag players and events while watching, then let AI analyze patterns.</p>
        
        {/* Debug toggle */}
        <button 
          onClick={() => setShowDebug(!showDebug)} 
          className="mt-2 text-xs text-gray-500 hover:text-gray-400"
        >
          {showDebug ? '🔧 Hide' : '🔧 Show'} Debug Info
        </button>
      </div>
      
      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs space-y-1">
          <div><strong>State:</strong></div>
          <div>• taggingMode: {String(taggingMode)}</div>
          <div>• loadingGame: {String(loadingGame)}</div>
          <div>• currentGame: {currentGame ? `${currentGame.title} (ID: ${currentGame.id})` : 'none'}</div>
          <div>• video_url: {currentGame?.video_url || 'none'}</div>
          <div>• events: {gameEvents.length}</div>
          <div>• insights: {gameInsights.length}</div>
        </div>
      )}
      
      {!taggingMode ? (
        /* UPLOAD & LIST VIEW */
        <div className="space-y-6">
          {/* Upload Box */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleUploadGame} 
              className="hidden" 
              id="game-upload" 
              ref={gameUploadInputRef}
              disabled={uploadingGame}
            />
            <label htmlFor="game-upload" className={`flex flex-col items-center ${uploadingGame ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                {uploadingGame ? (
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-blue-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Game Video</h3>
              <p className="text-gray-400 mb-4 text-center">
                {uploadingGame ? 'Uploading...' : 'Click to select a full game or match footage'}
              </p>
              {uploadingGame && (
                <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse" style={{ width: '100%' }} />
                </div>
              )}
            </label>
          </div>
          
          {/* Games List */}
          {taggedGames.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Your Tagged Games ({taggedGames.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {taggedGames.map(game => (
                  <div key={game.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 
                          className="font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 cursor-pointer" 
                          onClick={() => loadGameData(game)}
                        >
                          {game.title}
                        </h4>
                        <p className="text-gray-400 text-sm mb-2">{game.date}</p>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-semibold">
                            {game.tags_count || 0} tags
                          </span>
                          {game.analyzed && (
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-semibold">
                              ✓ Analyzed
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteGame(game.id)} 
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => loadGameData(game)} 
                      className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 font-medium text-sm flex items-center justify-center space-x-2"
                    >
                      {loadingGame ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /><span>Loading...</span></>
                      ) : (
                        <><Play className="w-4 h-4" /><span>Open & Tag</span></>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TAGGING VIEW */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{currentGame?.title}</h3>
              <p className="text-gray-400 text-sm">
                {currentGame?.date} • {gameEvents.length} events tagged
                {currentGame?.analyzed && ' • ✓ Analyzed'}
              </p>
            </div>
            <button 
              onClick={closeTaggingMode} 
              className="text-gray-400 hover:text-white flex items-center space-x-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to list</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Player */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {currentGame?.video_url ? (
                <>
                  <video 
                    ref={gameVideoRef} 
                    src={currentGame.video_url} 
                    className="w-full bg-black" 
                    controls 
                    onError={(e) => {
                      console.error('❌ Video error:', e);
                      alert('Failed to load video. Check console for details.');
                    }}
                  />
                  <div className="p-4">
                    <h4 className="text-white font-semibold mb-3">Tag Event at Current Time</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => addEventTag('pass')} 
                        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm font-medium transition-all"
                      >
                        ⚽ Pass
                      </button>
                      <button 
                        onClick={() => addEventTag('shot')} 
                        className="px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 text-sm font-medium transition-all"
                      >
                        🎯 Shot
                      </button>
                      <button 
                        onClick={() => addEventTag('tackle')} 
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm font-medium transition-all"
                      >
                        🛡️ Tackle
                      </button>
                      <button 
                        onClick={() => addEventTag('turnover')} 
                        className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm font-medium transition-all"
                      >
                        ⚠️ Turnover
                      </button>
                      <button 
                        onClick={() => addEventTag('goal')} 
                        className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-sm font-medium transition-all"
                      >
                        🥅 Goal
                      </button>
                      <button 
                        onClick={() => addEventTag('dribble')} 
                        className="px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 text-sm font-medium transition-all"
                      >
                        🏃 Dribble
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="font-semibold">Video not available</p>
                  <p className="text-sm mt-2">The video URL is missing. Try re-uploading this game.</p>
                </div>
              )}
            </div>
            
            {/* Events & Insights */}
            <div className="space-y-4">
              {/* Events List */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white">Tagged Events ({gameEvents.length})</h4>
                  {gameEvents.length > 0 && (
                    <button 
                      onClick={analyzeGame} 
                      disabled={analyzingGame}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      {analyzingGame ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          <span>AI Analyze</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No events tagged yet.</p>
                      <p className="text-xs mt-1">Play the video and click buttons above to tag events.</p>
                    </div>
                  ) : (
                    gameEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg group hover:bg-white/10 transition-all">
                        <div className="flex-1">
                          <span className="text-white font-medium capitalize">{event.event_type}</span>
                          <span className="text-gray-400 text-sm ml-2">{formatTime(event.timestamp)}</span>
                        </div>
                        <button 
                          onClick={() => deleteEventTag(event.id)} 
                          className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* AI Insights */}
              {gameInsights.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>AI Insights ({gameInsights.length})</span>
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {gameInsights.map((insight, i) => (
                      <div key={i} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                          {insight.insight_type?.replace(/_/g, ' ')}
                        </p>
                        <p className="text-gray-300 text-sm">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
