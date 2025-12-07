import React, { useState, useRef, useCallback } from 'react';

// ============================================================================
// FORMATION MAKER - Interactive Formation Builder with Draggable 3D Players
// ============================================================================

const FormationMaker = () => {
  // Theme colors
  const colors = {
    bg: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    accent: '#f59e0b',
    accentHover: '#fbbf24',
    field: '#166534',
    fieldLight: '#22c55e',
  };

  // Preset formations
  const presetFormations = {
    '4-4-2': {
      name: '4-4-2',
      description: 'Classic balanced formation',
      players: [
        { id: 1, x: 50, y: 92, number: 1, name: 'GK', role: 'goalkeeper' },
        { id: 2, x: 15, y: 75, number: 2, name: 'RB', role: 'defender' },
        { id: 3, x: 38, y: 78, number: 4, name: 'CB', role: 'defender' },
        { id: 4, x: 62, y: 78, number: 5, name: 'CB', role: 'defender' },
        { id: 5, x: 85, y: 75, number: 3, name: 'LB', role: 'defender' },
        { id: 6, x: 15, y: 50, number: 7, name: 'RM', role: 'midfielder' },
        { id: 7, x: 38, y: 53, number: 8, name: 'CM', role: 'midfielder' },
        { id: 8, x: 62, y: 53, number: 6, name: 'CM', role: 'midfielder' },
        { id: 9, x: 85, y: 50, number: 11, name: 'LM', role: 'midfielder' },
        { id: 10, x: 38, y: 25, number: 9, name: 'ST', role: 'forward' },
        { id: 11, x: 62, y: 25, number: 10, name: 'ST', role: 'forward' },
      ],
    },
    '4-3-3': {
      name: '4-3-3',
      description: 'Attacking wide formation',
      players: [
        { id: 1, x: 50, y: 92, number: 1, name: 'GK', role: 'goalkeeper' },
        { id: 2, x: 15, y: 75, number: 2, name: 'RB', role: 'defender' },
        { id: 3, x: 38, y: 78, number: 4, name: 'CB', role: 'defender' },
        { id: 4, x: 62, y: 78, number: 5, name: 'CB', role: 'defender' },
        { id: 5, x: 85, y: 75, number: 3, name: 'LB', role: 'defender' },
        { id: 6, x: 30, y: 55, number: 8, name: 'CM', role: 'midfielder' },
        { id: 7, x: 50, y: 50, number: 6, name: 'CDM', role: 'midfielder' },
        { id: 8, x: 70, y: 55, number: 10, name: 'CM', role: 'midfielder' },
        { id: 9, x: 15, y: 25, number: 7, name: 'RW', role: 'forward' },
        { id: 10, x: 50, y: 20, number: 9, name: 'ST', role: 'forward' },
        { id: 11, x: 85, y: 25, number: 11, name: 'LW', role: 'forward' },
      ],
    },
    '3-5-2': {
      name: '3-5-2',
      description: 'Midfield dominance',
      players: [
        { id: 1, x: 50, y: 92, number: 1, name: 'GK', role: 'goalkeeper' },
        { id: 2, x: 25, y: 78, number: 4, name: 'CB', role: 'defender' },
        { id: 3, x: 50, y: 80, number: 5, name: 'CB', role: 'defender' },
        { id: 4, x: 75, y: 78, number: 6, name: 'CB', role: 'defender' },
        { id: 5, x: 10, y: 55, number: 2, name: 'RWB', role: 'midfielder' },
        { id: 6, x: 30, y: 52, number: 8, name: 'CM', role: 'midfielder' },
        { id: 7, x: 50, y: 48, number: 10, name: 'CAM', role: 'midfielder' },
        { id: 8, x: 70, y: 52, number: 7, name: 'CM', role: 'midfielder' },
        { id: 9, x: 90, y: 55, number: 3, name: 'LWB', role: 'midfielder' },
        { id: 10, x: 38, y: 22, number: 9, name: 'ST', role: 'forward' },
        { id: 11, x: 62, y: 22, number: 11, name: 'ST', role: 'forward' },
      ],
    },
    '4-2-3-1': {
      name: '4-2-3-1',
      description: 'Modern attacking system',
      players: [
        { id: 1, x: 50, y: 92, number: 1, name: 'GK', role: 'goalkeeper' },
        { id: 2, x: 15, y: 75, number: 2, name: 'RB', role: 'defender' },
        { id: 3, x: 38, y: 78, number: 4, name: 'CB', role: 'defender' },
        { id: 4, x: 62, y: 78, number: 5, name: 'CB', role: 'defender' },
        { id: 5, x: 85, y: 75, number: 3, name: 'LB', role: 'defender' },
        { id: 6, x: 38, y: 58, number: 6, name: 'CDM', role: 'midfielder' },
        { id: 7, x: 62, y: 58, number: 8, name: 'CDM', role: 'midfielder' },
        { id: 8, x: 15, y: 38, number: 7, name: 'RW', role: 'midfielder' },
        { id: 9, x: 50, y: 35, number: 10, name: 'CAM', role: 'midfielder' },
        { id: 10, x: 85, y: 38, number: 11, name: 'LW', role: 'midfielder' },
        { id: 11, x: 50, y: 18, number: 9, name: 'ST', role: 'forward' },
      ],
    },
    '5-3-2': {
      name: '5-3-2',
      description: 'Defensive solidity',
      players: [
        { id: 1, x: 50, y: 92, number: 1, name: 'GK', role: 'goalkeeper' },
        { id: 2, x: 10, y: 72, number: 2, name: 'RWB', role: 'defender' },
        { id: 3, x: 30, y: 78, number: 4, name: 'CB', role: 'defender' },
        { id: 4, x: 50, y: 80, number: 5, name: 'CB', role: 'defender' },
        { id: 5, x: 70, y: 78, number: 6, name: 'CB', role: 'defender' },
        { id: 6, x: 90, y: 72, number: 3, name: 'LWB', role: 'defender' },
        { id: 7, x: 30, y: 50, number: 8, name: 'CM', role: 'midfielder' },
        { id: 8, x: 50, y: 48, number: 10, name: 'CM', role: 'midfielder' },
        { id: 9, x: 70, y: 50, number: 7, name: 'CM', role: 'midfielder' },
        { id: 10, x: 38, y: 22, number: 9, name: 'ST', role: 'forward' },
        { id: 11, x: 62, y: 22, number: 11, name: 'ST', role: 'forward' },
      ],
    },
  };

  // State
  const [players, setPlayers] = useState(presetFormations['4-4-2'].players);
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [draggingPlayer, setDraggingPlayer] = useState(null);
  const [formationName, setFormationName] = useState('My Formation');
  const [showGrid, setShowGrid] = useState(true);
  const [teamColor, setTeamColor] = useState('#3b82f6');
  const [savedFormations, setSavedFormations] = useState([]);
  
  const fieldRef = useRef(null);

  // Role colors
  const getRoleColor = (role) => {
    switch (role) {
      case 'goalkeeper': return '#22c55e';
      case 'defender': return '#3b82f6';
      case 'midfielder': return teamColor;
      case 'forward': return '#ef4444';
      default: return teamColor;
    }
  };

  // Handle drag start
  const handleDragStart = (playerId, e) => {
    e.preventDefault();
    setDraggingPlayer(playerId);
    setSelectedPlayer(playerId);
  };

  // Handle drag
  const handleDrag = useCallback((e) => {
    if (!draggingPlayer || !fieldRef.current) return;
    
    const rect = fieldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp values
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    
    setPlayers(prev => prev.map(p => 
      p.id === draggingPlayer ? { ...p, x: clampedX, y: clampedY } : p
    ));
  }, [draggingPlayer]);

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingPlayer(null);
  };

  // Load preset formation
  const loadFormation = (formationKey) => {
    setSelectedFormation(formationKey);
    setPlayers(presetFormations[formationKey].players);
    setFormationName(presetFormations[formationKey].name);
  };

  // Save current formation
  const saveFormation = () => {
    const newFormation = {
      id: Date.now(),
      name: formationName,
      players: [...players],
      createdAt: new Date().toISOString(),
    };
    setSavedFormations(prev => [...prev, newFormation]);
  };

  // Update player details
  const updatePlayer = (playerId, updates) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, ...updates } : p
    ));
  };

  // 3D Player component for the field
  const Player3D = ({ player, isSelected, onDragStart }) => {
    const jerseyColor = getRoleColor(player.role);
    const skinTones = ['#f4d0b0', '#d4a574', '#8d5524', '#c68642'];
    const skinTone = skinTones[player.id % skinTones.length];
    
    return (
      <g
        transform={`translate(${player.x}, ${player.y})`}
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => onDragStart(player.id, e)}
      >
        {/* Selection ring */}
        {isSelected && (
          <circle cx="0" cy="0" r="6" fill="none" stroke={colors.accent} strokeWidth="0.8" strokeDasharray="2,1">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        )}
        
        {/* Shadow */}
        <ellipse cx="0" cy="4.5" rx="2.5" ry="0.8" fill="rgba(0,0,0,0.4)" />
        
        {/* Legs */}
        <rect x="-1.3" y="1.8" width="1" height="2.8" rx="0.3" fill={skinTone} />
        <rect x="0.3" y="1.8" width="1" height="2.8" rx="0.3" fill={skinTone} />
        
        {/* Shorts */}
        <rect x="-1.6" y="0.8" width="3.2" height="1.6" rx="0.3" fill="#1e293b" />
        
        {/* Torso/Jersey */}
        <rect x="-2" y="-2" width="4" height="3.5" rx="0.6" fill={jerseyColor} />
        
        {/* Jersey number */}
        <text x="0" y="0.3" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">
          {player.number}
        </text>
        
        {/* Arms */}
        <rect x="-2.8" y="-1.5" width="1.2" height="2" rx="0.3" fill={jerseyColor} />
        <rect x="1.6" y="-1.5" width="1.2" height="2" rx="0.3" fill={jerseyColor} />
        
        {/* Hands */}
        <circle cx="-2.2" cy="1" r="0.6" fill={skinTone} />
        <circle cx="2.2" cy="1" r="0.6" fill={skinTone} />
        
        {/* Head */}
        <circle cx="0" cy="-3.5" r="1.6" fill={skinTone} />
        
        {/* Hair */}
        <ellipse cx="0" cy="-4.5" rx="1.3" ry="0.8" fill="#1e293b" />
        
        {/* Eyes */}
        <circle cx="-0.5" cy="-3.5" r="0.2" fill="#1e293b" />
        <circle cx="0.5" cy="-3.5" r="0.2" fill="#1e293b" />
        
        {/* Position label */}
        <text x="0" y="6.5" textAnchor="middle" fontSize="1.8" fill="white" fontWeight="600">
          {player.name}
        </text>
      </g>
    );
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        background: colors.bg, 
        color: colors.text,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Header */}
      <div style={{ 
        padding: '20px 32px', 
        borderBottom: `1px solid ${colors.border}`,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 4px 0', 
            fontSize: '24px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🎯 Formation Maker
          </h1>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: '13px' }}>
            Drag players to customize your tactical setup
          </p>
        </div>
        
        {/* Save Button */}
        <button
          onClick={saveFormation}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
            color: '#000',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          💾 Save Formation
        </button>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 85px)' }}>
        {/* Left Panel - Controls */}
        <div style={{ 
          width: '280px', 
          borderRight: `1px solid ${colors.border}`,
          padding: '20px',
          overflowY: 'auto',
        }}>
          {/* Formation Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>
              Formation Name
            </label>
            <input
              type="text"
              value={formationName}
              onChange={(e) => setFormationName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: colors.card,
                color: colors.text,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Preset Formations */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '10px' }}>
              Preset Formations
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.keys(presetFormations).map(key => (
                <button
                  key={key}
                  onClick={() => loadFormation(key)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: selectedFormation === key ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                    background: selectedFormation === key ? `${colors.accent}22` : colors.card,
                    color: selectedFormation === key ? colors.accent : colors.text,
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Team Color */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '10px' }}>
              Team Color
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'].map(color => (
                <button
                  key={color}
                  onClick={() => setTeamColor(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: teamColor === color ? '3px solid white' : '2px solid transparent',
                    background: color,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Show Grid Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: colors.text }}>Show Grid Lines</span>
            </label>
          </div>

          {/* Selected Player Editor */}
          {selectedPlayer && (
            <div style={{ 
              padding: '16px',
              background: colors.card,
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: colors.accent }}>
                ✏️ Edit Player
              </h3>
              
              {(() => {
                const player = players.find(p => p.id === selectedPlayer);
                if (!player) return null;
                
                return (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>
                        Position Name
                      </label>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updatePlayer(selectedPlayer, { name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${colors.border}`,
                          background: colors.bg,
                          color: colors.text,
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>
                        Jersey Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={player.number}
                        onChange={(e) => updatePlayer(selectedPlayer, { number: parseInt(e.target.value) || 1 })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${colors.border}`,
                          background: colors.bg,
                          color: colors.text,
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>
                        Role
                      </label>
                      <select
                        value={player.role}
                        onChange={(e) => updatePlayer(selectedPlayer, { role: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${colors.border}`,
                          background: colors.bg,
                          color: colors.text,
                          fontSize: '13px',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="goalkeeper">Goalkeeper</option>
                        <option value="defender">Defender</option>
                        <option value="midfielder">Midfielder</option>
                        <option value="forward">Forward</option>
                      </select>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Saved Formations */}
          {savedFormations.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: colors.accent }}>
                📁 Saved Formations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedFormations.map(formation => (
                  <button
                    key={formation.id}
                    onClick={() => {
                      setPlayers(formation.players);
                      setFormationName(formation.name);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      background: colors.card,
                      color: colors.text,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    {formation.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Field Area */}
        <div style={{ 
          flex: 1, 
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0a0f1a',
        }}>
          <div
            ref={fieldRef}
            style={{
              width: '100%',
              maxWidth: '600px',
              aspectRatio: '68/105',
              position: 'relative',
            }}
          >
            <svg
              viewBox="0 0 68 105"
              style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(180deg, ${colors.field} 0%, #14532d 100%)`,
                borderRadius: '8px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* Field pattern (stripes) */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <rect
                  key={i}
                  x="0"
                  y={i * 10.5}
                  width="68"
                  height="10.5"
                  fill={i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'}
                />
              ))}
              
              {/* Grid lines */}
              {showGrid && (
                <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.15">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(y => (
                    <line key={`h${y}`} x1="0" y1={y * 1.05} x2="68" y2={y * 1.05} />
                  ))}
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(x => (
                    <line key={`v${x}`} x1={x * 0.68} y1="0" x2={x * 0.68} y2="105" />
                  ))}
                </g>
              )}
              
              {/* Field markings */}
              <g stroke="rgba(255,255,255,0.7)" strokeWidth="0.3" fill="none">
                {/* Outline */}
                <rect x="2" y="2" width="64" height="101" />
                
                {/* Center line */}
                <line x1="2" y1="52.5" x2="66" y2="52.5" />
                
                {/* Center circle */}
                <circle cx="34" cy="52.5" r="9.15" />
                <circle cx="34" cy="52.5" r="0.5" fill="rgba(255,255,255,0.7)" />
                
                {/* Penalty areas */}
                <rect x="13.84" y="2" width="40.32" height="16.5" />
                <rect x="13.84" y="86.5" width="40.32" height="16.5" />
                
                {/* Goal areas */}
                <rect x="24.84" y="2" width="18.32" height="5.5" />
                <rect x="24.84" y="97.5" width="18.32" height="5.5" />
                
                {/* Penalty spots */}
                <circle cx="34" cy="13" r="0.5" fill="rgba(255,255,255,0.7)" />
                <circle cx="34" cy="92" r="0.5" fill="rgba(255,255,255,0.7)" />
                
                {/* Penalty arcs */}
                <path d="M 24.84 18.5 A 9.15 9.15 0 0 0 43.16 18.5" />
                <path d="M 24.84 86.5 A 9.15 9.15 0 0 1 43.16 86.5" />
                
                {/* Goals */}
                <rect x="29.34" y="-1" width="9.32" height="3" strokeWidth="0.5" />
                <rect x="29.34" y="103" width="9.32" height="3" strokeWidth="0.5" />
                
                {/* Corner arcs */}
                <path d="M 2 3 A 1 1 0 0 0 3 2" />
                <path d="M 65 2 A 1 1 0 0 0 66 3" />
                <path d="M 2 102 A 1 1 0 0 1 3 103" />
                <path d="M 65 103 A 1 1 0 0 1 66 102" />
              </g>
              
              {/* Players */}
              <g transform="scale(0.68, 1.05)">
                {players.map(player => (
                  <Player3D
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayer === player.id}
                    onDragStart={handleDragStart}
                  />
                ))}
              </g>
            </svg>
          </div>
        </div>

        {/* Right Panel - Formation Stats */}
        <div style={{ 
          width: '240px', 
          borderLeft: `1px solid ${colors.border}`,
          padding: '20px',
          overflowY: 'auto',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: colors.accent }}>
            📊 Formation Stats
          </h3>
          
          {/* Position counts */}
          <div style={{ marginBottom: '20px' }}>
            {['goalkeeper', 'defender', 'midfielder', 'forward'].map(role => {
              const count = players.filter(p => p.role === role).length;
              return (
                <div
                  key={role}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    marginBottom: '8px',
                    background: colors.card,
                    borderRadius: '8px',
                    borderLeft: `3px solid ${getRoleColor(role)}`,
                  }}
                >
                  <span style={{ fontSize: '13px', color: colors.text, textTransform: 'capitalize' }}>
                    {role}s
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: getRoleColor(role),
                  }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div style={{ 
            padding: '14px',
            background: `${colors.accent}11`,
            borderRadius: '10px',
            border: `1px solid ${colors.accent}33`,
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: colors.accent }}>
              💡 Tips
            </h4>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '16px',
              fontSize: '12px',
              color: colors.textMuted,
              lineHeight: '1.6',
            }}>
              <li>Drag players to position them</li>
              <li>Click a player to edit details</li>
              <li>Use presets as starting points</li>
              <li>Save formations for later use</li>
            </ul>
          </div>

          {/* Export Options */}
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: colors.accent }}>
              📤 Export
            </h3>
            <button
              onClick={() => {
                const data = JSON.stringify({ name: formationName, players }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${formationName.replace(/\s+/g, '-')}.json`;
                a.click();
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: colors.card,
                color: colors.text,
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '8px',
              }}
            >
              💾 Export as JSON
            </button>
            <button
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: colors.card,
                color: colors.text,
                fontSize: '13px',
                cursor: 'pointer',
              }}
              onClick={() => {
                // Copy formation to clipboard
                navigator.clipboard.writeText(JSON.stringify({ name: formationName, players }));
              }}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationMaker;
