import React, { useState, useRef, useCallback } from 'react';
import { Save, RotateCcw, Download, Users, ChevronDown, Palette, Move, Lock, Unlock, Copy, Trash2 } from 'lucide-react';

// Default formations for each age group
// Vertical orientation: GK at bottom, attacking upward toward goal at top
const FORMATIONS = {
  '4v4': {
    name: '4v4 (U6-U8)',
    fieldWidth: 350,
    fieldHeight: 500,
    formations: {
      'Diamond': [
        { id: 1, x: 175, y: 450, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 100, y: 320, role: 'DEF', color: '#3b82f6' },
        { id: 3, x: 250, y: 320, role: 'DEF', color: '#3b82f6' },
        { id: 4, x: 175, y: 120, role: 'FWD', color: '#10b981' },
      ],
      '2-1': [
        { id: 1, x: 175, y: 450, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 100, y: 320, role: 'DEF', color: '#3b82f6' },
        { id: 3, x: 250, y: 320, role: 'DEF', color: '#3b82f6' },
        { id: 4, x: 175, y: 150, role: 'FWD', color: '#10b981' },
      ],
      '1-2': [
        { id: 1, x: 175, y: 450, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 175, y: 320, role: 'DEF', color: '#3b82f6' },
        { id: 3, x: 100, y: 150, role: 'FWD', color: '#10b981' },
        { id: 4, x: 250, y: 150, role: 'FWD', color: '#10b981' },
      ],
    }
  },
  '5v5': {
    name: '5v5 (U8-U9)',
    fieldWidth: 380,
    fieldHeight: 520,
    formations: {
      '2-2': [
        { id: 1, x: 190, y: 470, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 100, y: 340, role: 'DEF', color: '#3b82f6' },
        { id: 3, x: 280, y: 340, role: 'DEF', color: '#3b82f6' },
        { id: 4, x: 100, y: 140, role: 'FWD', color: '#10b981' },
        { id: 5, x: 280, y: 140, role: 'FWD', color: '#10b981' },
      ],
      '1-2-1': [
        { id: 1, x: 190, y: 470, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 190, y: 360, role: 'DEF', color: '#3b82f6' },
        { id: 3, x: 100, y: 240, role: 'MID', color: '#f59e0b' },
        { id: 4, x: 280, y: 240, role: 'MID', color: '#f59e0b' },
        { id: 5, x: 190, y: 100, role: 'FWD', color: '#10b981' },
      ],
      '3-1': [
        { id: 1, x: 190, y: 470, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 80, y: 340, role: 'DEF', color: '#3b82f6' },
        { id: 3, x: 190, y: 340, role: 'DEF', color: '#3b82f6' },
        { id: 4, x: 300, y: 340, role: 'DEF', color: '#3b82f6' },
        { id: 5, x: 190, y: 120, role: 'FWD', color: '#10b981' },
      ],
    }
  },
  '7v7': {
    name: '7v7 (U9-U10)',
    fieldWidth: 420,
    fieldHeight: 580,
    formations: {
      '2-3-1': [
        { id: 1, x: 210, y: 530, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 120, y: 420, role: 'CB', color: '#3b82f6' },
        { id: 3, x: 300, y: 420, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 70, y: 280, role: 'LM', color: '#f59e0b' },
        { id: 5, x: 210, y: 280, role: 'CM', color: '#f59e0b' },
        { id: 6, x: 350, y: 280, role: 'RM', color: '#f59e0b' },
        { id: 7, x: 210, y: 100, role: 'ST', color: '#10b981' },
      ],
      '3-2-1': [
        { id: 1, x: 210, y: 530, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 80, y: 410, role: 'LB', color: '#3b82f6' },
        { id: 3, x: 210, y: 410, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 340, y: 410, role: 'RB', color: '#3b82f6' },
        { id: 5, x: 130, y: 260, role: 'CM', color: '#f59e0b' },
        { id: 6, x: 290, y: 260, role: 'CM', color: '#f59e0b' },
        { id: 7, x: 210, y: 90, role: 'ST', color: '#10b981' },
      ],
      '2-1-2-1': [
        { id: 1, x: 210, y: 530, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 120, y: 430, role: 'CB', color: '#3b82f6' },
        { id: 3, x: 300, y: 430, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 210, y: 330, role: 'DM', color: '#f59e0b' },
        { id: 5, x: 100, y: 190, role: 'LW', color: '#10b981' },
        { id: 6, x: 320, y: 190, role: 'RW', color: '#10b981' },
        { id: 7, x: 210, y: 80, role: 'ST', color: '#10b981' },
      ],
    }
  },
  '9v9': {
    name: '9v9 (U11-U12)',
    fieldWidth: 480,
    fieldHeight: 640,
    formations: {
      '3-3-2': [
        { id: 1, x: 240, y: 590, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 100, y: 480, role: 'LB', color: '#3b82f6' },
        { id: 3, x: 240, y: 480, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 380, y: 480, role: 'RB', color: '#3b82f6' },
        { id: 5, x: 100, y: 320, role: 'LM', color: '#f59e0b' },
        { id: 6, x: 240, y: 320, role: 'CM', color: '#f59e0b' },
        { id: 7, x: 380, y: 320, role: 'RM', color: '#f59e0b' },
        { id: 8, x: 160, y: 130, role: 'ST', color: '#10b981' },
        { id: 9, x: 320, y: 130, role: 'ST', color: '#10b981' },
      ],
      '3-2-3': [
        { id: 1, x: 240, y: 590, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 100, y: 480, role: 'LB', color: '#3b82f6' },
        { id: 3, x: 240, y: 480, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 380, y: 480, role: 'RB', color: '#3b82f6' },
        { id: 5, x: 160, y: 320, role: 'CM', color: '#f59e0b' },
        { id: 6, x: 320, y: 320, role: 'CM', color: '#f59e0b' },
        { id: 7, x: 100, y: 130, role: 'LW', color: '#10b981' },
        { id: 8, x: 240, y: 130, role: 'ST', color: '#10b981' },
        { id: 9, x: 380, y: 130, role: 'RW', color: '#10b981' },
      ],
      '2-4-2': [
        { id: 1, x: 240, y: 590, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 160, y: 490, role: 'CB', color: '#3b82f6' },
        { id: 3, x: 320, y: 490, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 70, y: 320, role: 'LM', color: '#f59e0b' },
        { id: 5, x: 180, y: 320, role: 'CM', color: '#f59e0b' },
        { id: 6, x: 300, y: 320, role: 'CM', color: '#f59e0b' },
        { id: 7, x: 410, y: 320, role: 'RM', color: '#f59e0b' },
        { id: 8, x: 160, y: 130, role: 'ST', color: '#10b981' },
        { id: 9, x: 320, y: 130, role: 'ST', color: '#10b981' },
      ],
    }
  },
  '11v11': {
    name: '11v11 (U13+)',
    fieldWidth: 520,
    fieldHeight: 700,
    formations: {
      '4-3-3': [
        { id: 1, x: 260, y: 650, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 70, y: 530, role: 'LB', color: '#3b82f6' },
        { id: 3, x: 180, y: 530, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 340, y: 530, role: 'CB', color: '#3b82f6' },
        { id: 5, x: 450, y: 530, role: 'RB', color: '#3b82f6' },
        { id: 6, x: 140, y: 360, role: 'CM', color: '#f59e0b' },
        { id: 7, x: 260, y: 360, role: 'CM', color: '#f59e0b' },
        { id: 8, x: 380, y: 360, role: 'CM', color: '#f59e0b' },
        { id: 9, x: 80, y: 150, role: 'LW', color: '#10b981' },
        { id: 10, x: 260, y: 150, role: 'ST', color: '#10b981' },
        { id: 11, x: 440, y: 150, role: 'RW', color: '#10b981' },
      ],
      '4-4-2': [
        { id: 1, x: 260, y: 650, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 70, y: 530, role: 'LB', color: '#3b82f6' },
        { id: 3, x: 180, y: 530, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 340, y: 530, role: 'CB', color: '#3b82f6' },
        { id: 5, x: 450, y: 530, role: 'RB', color: '#3b82f6' },
        { id: 6, x: 70, y: 350, role: 'LM', color: '#f59e0b' },
        { id: 7, x: 190, y: 350, role: 'CM', color: '#f59e0b' },
        { id: 8, x: 330, y: 350, role: 'CM', color: '#f59e0b' },
        { id: 9, x: 450, y: 350, role: 'RM', color: '#f59e0b' },
        { id: 10, x: 180, y: 140, role: 'ST', color: '#10b981' },
        { id: 11, x: 340, y: 140, role: 'ST', color: '#10b981' },
      ],
      '4-2-3-1': [
        { id: 1, x: 260, y: 650, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 70, y: 530, role: 'LB', color: '#3b82f6' },
        { id: 3, x: 180, y: 530, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 340, y: 530, role: 'CB', color: '#3b82f6' },
        { id: 5, x: 450, y: 530, role: 'RB', color: '#3b82f6' },
        { id: 6, x: 180, y: 410, role: 'CDM', color: '#f59e0b' },
        { id: 7, x: 340, y: 410, role: 'CDM', color: '#f59e0b' },
        { id: 8, x: 80, y: 260, role: 'LW', color: '#10b981' },
        { id: 9, x: 260, y: 260, role: 'CAM', color: '#f59e0b' },
        { id: 10, x: 440, y: 260, role: 'RW', color: '#10b981' },
        { id: 11, x: 260, y: 100, role: 'ST', color: '#10b981' },
      ],
      '3-5-2': [
        { id: 1, x: 260, y: 650, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 130, y: 530, role: 'CB', color: '#3b82f6' },
        { id: 3, x: 260, y: 530, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 390, y: 530, role: 'CB', color: '#3b82f6' },
        { id: 5, x: 60, y: 350, role: 'LWB', color: '#f59e0b' },
        { id: 6, x: 170, y: 350, role: 'CM', color: '#f59e0b' },
        { id: 7, x: 260, y: 350, role: 'CM', color: '#f59e0b' },
        { id: 8, x: 350, y: 350, role: 'CM', color: '#f59e0b' },
        { id: 9, x: 460, y: 350, role: 'RWB', color: '#f59e0b' },
        { id: 10, x: 180, y: 120, role: 'ST', color: '#10b981' },
        { id: 11, x: 340, y: 120, role: 'ST', color: '#10b981' },
      ],
      '5-3-2': [
        { id: 1, x: 260, y: 650, role: 'GK', color: '#8b5cf6' },
        { id: 2, x: 60, y: 520, role: 'LWB', color: '#3b82f6' },
        { id: 3, x: 150, y: 520, role: 'CB', color: '#3b82f6' },
        { id: 4, x: 260, y: 520, role: 'CB', color: '#3b82f6' },
        { id: 5, x: 370, y: 520, role: 'CB', color: '#3b82f6' },
        { id: 6, x: 460, y: 520, role: 'RWB', color: '#3b82f6' },
        { id: 7, x: 150, y: 330, role: 'CM', color: '#f59e0b' },
        { id: 8, x: 260, y: 330, role: 'CM', color: '#f59e0b' },
        { id: 9, x: 370, y: 330, role: 'CM', color: '#f59e0b' },
        { id: 10, x: 180, y: 120, role: 'ST', color: '#10b981' },
        { id: 11, x: 340, y: 120, role: 'ST', color: '#10b981' },
      ],
    }
  }
};

const ROLE_COLORS = {
  GK: '#8b5cf6',
  DEF: '#3b82f6', CB: '#3b82f6', LB: '#3b82f6', RB: '#3b82f6', LWB: '#3b82f6', RWB: '#3b82f6',
  MID: '#f59e0b', CM: '#f59e0b', CDM: '#f59e0b', CAM: '#f59e0b', LM: '#f59e0b', RM: '#f59e0b', DM: '#f59e0b',
  FWD: '#10b981', ST: '#10b981', LW: '#10b981', RW: '#10b981',
};

// Jersey component for the pitch
const DraggableJersey = ({ player, onDrag, onDragEnd, isSelected, onSelect, locked }) => {
  const [isDragging, setIsDragging] = useState(false);
  const jerseyRef = useRef(null);
  
  const handleMouseDown = (e) => {
    if (locked) return;
    e.preventDefault();
    setIsDragging(true);
    onSelect(player.id);
  };
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || locked) return;
    const svg = jerseyRef.current?.closest('svg');
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * svg.viewBox.baseVal.width;
    const y = ((e.clientY - rect.top) / rect.height) * svg.viewBox.baseVal.height;
    
    onDrag(player.id, Math.max(20, Math.min(x, svg.viewBox.baseVal.width - 20)), Math.max(20, Math.min(y, svg.viewBox.baseVal.height - 20)));
  }, [isDragging, locked, onDrag, player.id]);
  
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  };
  
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);
  
  const size = 36;
  const color = player.color || ROLE_COLORS[player.role] || '#10b981';
  
  return (
    <g 
      ref={jerseyRef}
      transform={`translate(${player.x - size/2}, ${player.y - size/2})`}
      onMouseDown={handleMouseDown}
      style={{ cursor: locked ? 'default' : 'grab' }}
      className={isDragging ? 'grabbing' : ''}
    >
      {/* Selection ring */}
      {isSelected && (
        <circle cx={size/2} cy={size/2} r={size/2 + 6} fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="4,4">
          <animate attributeName="stroke-dashoffset" from="0" to="8" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
      
      {/* Shadow */}
      <ellipse cx={size/2} cy={size + 4} rx={size/3} ry={4} fill="rgba(0,0,0,0.3)" />
      
      {/* Jersey shape */}
      <path 
        d={`M${size*0.2},${size*0.15} L${size*0.35},0 L${size*0.65},0 L${size*0.8},${size*0.15} L${size*0.95},${size*0.25} L${size*0.85},${size*0.35} L${size*0.75},${size*0.3} L${size*0.75},${size} L${size*0.25},${size} L${size*0.25},${size*0.3} L${size*0.15},${size*0.35} L${size*0.05},${size*0.25} Z`} 
        fill={color} 
        stroke="#fff" 
        strokeWidth="2"
        filter={isDragging ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' : 'none'}
      />
      
      {/* Role text */}
      <text 
        x={size/2} 
        y={size*0.65} 
        textAnchor="middle" 
        fontSize={size*0.32} 
        fill="#fff" 
        fontWeight="bold" 
        fontFamily="Arial"
        style={{ pointerEvents: 'none' }}
      >
        {player.role}
      </text>
      
      {/* Player number if assigned */}
      {player.number && (
        <text 
          x={size/2} 
          y={size + 16} 
          textAnchor="middle" 
          fontSize="12" 
          fill="#fff" 
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          #{player.number}
        </text>
      )}
    </g>
  );
};

// Soccer pitch SVG - Vertical orientation (attacking upward)
const SoccerPitch = ({ children, width, height }) => (
  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full rounded-2xl" style={{ background: 'linear-gradient(180deg, #1a5c2e 0%, #145224 50%, #1a5c2e 100%)' }}>
    {/* Grass stripes - horizontal */}
    {[...Array(12)].map((_, i) => (
      <rect key={i} x={0} y={i * (height/12)} width={width} height={height/12} fill={i % 2 === 0 ? '#1a5c2e' : '#176129'} opacity="0.3" />
    ))}
    
    {/* Field outline */}
    <rect x="20" y="20" width={width - 40} height={height - 40} fill="none" stroke="#fff" strokeWidth="3" opacity="0.7" rx="4" />
    
    {/* Center line - horizontal */}
    <line x1="20" y1={height/2} x2={width - 20} y2={height/2} stroke="#fff" strokeWidth="2" opacity="0.7" />
    
    {/* Center circle */}
    <circle cx={width/2} cy={height/2} r={Math.min(width, height) * 0.1} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    <circle cx={width/2} cy={height/2} r="4" fill="#fff" opacity="0.7" />
    
    {/* Top penalty area (opponent's) */}
    <rect x={width * 0.2} y="20" width={width * 0.6} height={height * 0.14} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    {/* Top goal box */}
    <rect x={width * 0.32} y="20" width={width * 0.36} height={height * 0.06} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    {/* Top goal */}
    <rect x={width * 0.38} y="5" width={width * 0.24} height="15" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
    
    {/* Bottom penalty area (your team's) */}
    <rect x={width * 0.2} y={height - 20 - height * 0.14} width={width * 0.6} height={height * 0.14} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    {/* Bottom goal box */}
    <rect x={width * 0.32} y={height - 20 - height * 0.06} width={width * 0.36} height={height * 0.06} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    {/* Bottom goal */}
    <rect x={width * 0.38} y={height - 20} width={width * 0.24} height="15" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
    
    {/* Corner arcs */}
    <path d={`M 30 20 A 10 10 0 0 1 20 30`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    <path d={`M ${width - 30} 20 A 10 10 0 0 0 ${width - 20} 30`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    <path d={`M 30 ${height - 20} A 10 10 0 0 0 20 ${height - 30}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    <path d={`M ${width - 30} ${height - 20} A 10 10 0 0 1 ${width - 20} ${height - 30}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
    
    {children}
  </svg>
);

// Main Formation Creator Component
const FormationCreator = ({ onSave, initialFormation, teamName = 'My Team' }) => {
  const [ageGroup, setAgeGroup] = useState('11v11');
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [players, setPlayers] = useState(FORMATIONS['11v11'].formations['4-3-3']);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [locked, setLocked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [savedFormations, setSavedFormations] = useState([]);
  
  const fieldConfig = FORMATIONS[ageGroup];
  
  // Load formation when age group or formation changes
  const loadFormation = (group, formation) => {
    const config = FORMATIONS[group];
    if (config && config.formations[formation]) {
      setPlayers(JSON.parse(JSON.stringify(config.formations[formation])));
      setSelectedPlayer(null);
    }
  };
  
  const handleAgeGroupChange = (group) => {
    setAgeGroup(group);
    const formations = Object.keys(FORMATIONS[group].formations);
    setSelectedFormation(formations[0]);
    loadFormation(group, formations[0]);
    setShowDropdown(null);
  };
  
  const handleFormationChange = (formation) => {
    setSelectedFormation(formation);
    loadFormation(ageGroup, formation);
    setShowDropdown(null);
  };
  
  const handleDrag = (id, x, y) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
  };
  
  const handleDragEnd = () => {
    // Could save state here
  };
  
  const handleReset = () => {
    loadFormation(ageGroup, selectedFormation);
  };
  
  const handleSaveFormation = () => {
    const formation = {
      id: Date.now(),
      name: `${teamName} - ${selectedFormation}`,
      ageGroup,
      formation: selectedFormation,
      players: JSON.parse(JSON.stringify(players)),
      createdAt: new Date().toISOString()
    };
    setSavedFormations(prev => [...prev, formation]);
    if (onSave) onSave(formation);
    alert('Formation saved!');
  };
  
  const handleExportImage = () => {
    // In a real implementation, this would use html2canvas or similar
    alert('Export feature coming soon!');
  };
  
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {/* Age Group Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(showDropdown === 'age' ? null : 'age')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:border-emerald-500/30 transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{fieldConfig.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDropdown === 'age' && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1f1d] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                {Object.entries(FORMATIONS).map(([key, config]) => (
                  <button 
                    key={key}
                    onClick={() => handleAgeGroupChange(key)}
                    className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-all ${ageGroup === key ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-300'}`}
                  >
                    {config.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Formation Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(showDropdown === 'formation' ? null : 'formation')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:border-emerald-500/30 transition-all"
            >
              <span className="font-bold text-emerald-400">{selectedFormation}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDropdown === 'formation' && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-[#1a1f1d] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                {Object.keys(fieldConfig.formations).map(formation => (
                  <button 
                    key={formation}
                    onClick={() => handleFormationChange(formation)}
                    className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-all ${selectedFormation === formation ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-300'}`}
                  >
                    {formation}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setLocked(!locked)}
            className={`p-2.5 rounded-xl border transition-all ${locked ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            title={locked ? 'Unlock players' : 'Lock players'}
          >
            {locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleReset}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all"
            title="Reset positions"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleExportImage}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all"
            title="Export image"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSaveFormation}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <Move className="w-4 h-4" />
        <span>Drag players to adjust positions • Click to select • {locked ? 'Positions locked' : 'Positions unlocked'}</span>
      </div>
      
      {/* Formation Pitch */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden">
        <div className="aspect-[3/4] max-h-[600px] mx-auto" style={{ maxWidth: '450px' }}>
          <SoccerPitch width={fieldConfig.fieldWidth} height={fieldConfig.fieldHeight}>
            {players.map(player => (
              <DraggableJersey
                key={player.id}
                player={player}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                isSelected={selectedPlayer === player.id}
                onSelect={setSelectedPlayer}
                locked={locked}
              />
            ))}
          </SoccerPitch>
        </div>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">GK</span>
          </div>
          <span className="text-gray-400 text-sm">Goalkeeper</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-gray-400 text-sm">Defender</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-gray-400 text-sm">Midfielder</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className="text-gray-400 text-sm">Forward</span>
        </div>
      </div>
      
      {/* Player List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <h3 className="font-bold text-white mb-3">Player Positions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => setSelectedPlayer(player.id)}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${selectedPlayer === player.id ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-transparent hover:border-white/10'}`}
            >
              <div 
                className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: player.color || ROLE_COLORS[player.role] }}
              >
                {player.role}
              </div>
              <span className="text-gray-300 text-sm">Player {player.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormationCreator;
