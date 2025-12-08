import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Save, RotateCcw, Download, Users, ChevronDown, Lock, Unlock, X, Check, ChevronRight, Trash2 } from 'lucide-react';

// Vertical orientation: GK at bottom, attacking upward toward goal at top
const FORMATIONS = {
  '4v4': {
    name: '4v4 (U6-U8)',
    fieldWidth: 350,
    fieldHeight: 500,
    playerCount: 4,
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
    playerCount: 5,
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
    playerCount: 7,
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
    playerCount: 9,
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
    playerCount: 11,
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

// Jersey Badge Component
const JerseyBadge = ({ number, color, size = 'md', name }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  const isLight = color === '#ffffff' || color === '#fef08a' || color === '#fed7aa';
  return (
    <div 
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold border-2 border-white/20 flex-shrink-0`}
      style={{ backgroundColor: color || '#10b981', color: isLight ? '#1f2937' : '#ffffff' }}
      title={name}
    >
      {number || '?'}
    </div>
  );
};

// Jersey component for the pitch
const DraggableJersey = ({ player, onDrag, onDragEnd, isSelected, onSelect, locked, onAssign, assignedPlayer }) => {
  const [isDragging, setIsDragging] = useState(false);
  const jerseyRef = useRef(null);
  
  const handleMouseDown = (e) => {
    if (locked) return;
    e.preventDefault();
    setIsDragging(true);
    onSelect(player.id);
  };
  
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(player.id);
    if (onAssign) {
      onAssign(player.id);
    }
  };
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || locked) return;
    const svg = jerseyRef.current?.closest('svg');
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * svg.viewBox.baseVal.width;
    const y = ((e.clientY - rect.top) / rect.height) * svg.viewBox.baseVal.height;
    
    onDrag(player.id, Math.max(30, Math.min(x, svg.viewBox.baseVal.width - 30)), Math.max(30, Math.min(y, svg.viewBox.baseVal.height - 30)));
  }, [isDragging, locked, onDrag, player.id]);
  
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);
  
  const size = 40;
  const color = assignedPlayer?.jerseyColor || player.color || ROLE_COLORS[player.role] || '#10b981';
  const displayNumber = assignedPlayer?.jerseyNumber || player.role;
  const displayName = assignedPlayer?.name?.split(' ')[0] || '';
  
  return (
    <g 
      ref={jerseyRef}
      transform={`translate(${player.x - size/2}, ${player.y - size/2})`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{ cursor: locked ? 'pointer' : 'grab' }}
      className={isDragging ? 'grabbing' : ''}
    >
      {/* Selection ring */}
      {isSelected && (
        <circle cx={size/2} cy={size/2} r={size/2 + 8} fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="6,4">
          <animate attributeName="stroke-dashoffset" from="0" to="10" dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}
      
      {/* Shadow */}
      <ellipse cx={size/2} cy={size + 6} rx={size/3} ry={5} fill="rgba(0,0,0,0.4)" />
      
      {/* Jersey shape */}
      <path 
        d={`M${size*0.2},${size*0.15} L${size*0.35},0 L${size*0.65},0 L${size*0.8},${size*0.15} L${size*0.95},${size*0.25} L${size*0.85},${size*0.35} L${size*0.75},${size*0.3} L${size*0.75},${size} L${size*0.25},${size} L${size*0.25},${size*0.3} L${size*0.15},${size*0.35} L${size*0.05},${size*0.25} Z`} 
        fill={color} 
        stroke="#fff" 
        strokeWidth="2"
        filter={isDragging ? 'drop-shadow(0 6px 8px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}
      />
      
      {/* Number/Role text */}
      <text 
        x={size/2} 
        y={size*0.68} 
        textAnchor="middle" 
        fontSize={assignedPlayer?.jerseyNumber ? size*0.4 : size*0.28} 
        fill="#fff" 
        fontWeight="bold" 
        fontFamily="Arial"
        style={{ pointerEvents: 'none' }}
      >
        {displayNumber}
      </text>
      
      {/* Player name below jersey */}
      {displayName && (
        <text 
          x={size/2} 
          y={size + 20} 
          textAnchor="middle" 
          fontSize="11" 
          fill="#fff" 
          fontWeight="bold"
          style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          {displayName}
        </text>
      )}
      
      {/* Click to assign indicator */}
      {!assignedPlayer && (
        <circle cx={size - 5} cy={5} r={8} fill="#f59e0b" stroke="#fff" strokeWidth="2">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
};

// Soccer pitch SVG - Vertical orientation (attacking upward)
const SoccerPitch = ({ children, width, height }) => (
  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ background: 'linear-gradient(180deg, #1a5c2e 0%, #145224 50%, #1a5c2e 100%)' }}>
    {/* Grass stripes - horizontal */}
    {[...Array(14)].map((_, i) => (
      <rect key={i} x={0} y={i * (height/14)} width={width} height={height/14} fill={i % 2 === 0 ? '#1a5c2e' : '#176129'} opacity="0.4" />
    ))}
    
    {/* Field outline */}
    <rect x="15" y="15" width={width - 30} height={height - 30} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" rx="2" />
    
    {/* Center line - horizontal */}
    <line x1="15" y1={height/2} x2={width - 15} y2={height/2} stroke="#fff" strokeWidth="2" opacity="0.8" />
    
    {/* Center circle */}
    <circle cx={width/2} cy={height/2} r={Math.min(width, height) * 0.1} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
    <circle cx={width/2} cy={height/2} r="4" fill="#fff" opacity="0.8" />
    
    {/* Top penalty area (opponent's goal) */}
    <rect x={width * 0.18} y="15" width={width * 0.64} height={height * 0.13} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
    {/* Top goal box */}
    <rect x={width * 0.3} y="15" width={width * 0.4} height={height * 0.055} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
    {/* Top goal */}
    <rect x={width * 0.35} y="2" width={width * 0.3} height="13" fill="rgba(255,255,255,0.1)" stroke="#fff" strokeWidth="2" opacity="0.6" rx="2" />
    
    {/* Bottom penalty area (your team's goal) */}
    <rect x={width * 0.18} y={height - 15 - height * 0.13} width={width * 0.64} height={height * 0.13} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
    {/* Bottom goal box */}
    <rect x={width * 0.3} y={height - 15 - height * 0.055} width={width * 0.4} height={height * 0.055} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
    {/* Bottom goal */}
    <rect x={width * 0.35} y={height - 15} width={width * 0.3} height="13" fill="rgba(255,255,255,0.1)" stroke="#fff" strokeWidth="2" opacity="0.6" rx="2" />
    
    {/* Penalty spots */}
    <circle cx={width/2} cy={height * 0.18} r="3" fill="#fff" opacity="0.6" />
    <circle cx={width/2} cy={height * 0.82} r="3" fill="#fff" opacity="0.6" />
    
    {/* Corner arcs */}
    <path d={`M 25 15 A 10 10 0 0 1 15 25`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
    <path d={`M ${width - 25} 15 A 10 10 0 0 0 ${width - 15} 25`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
    <path d={`M 25 ${height - 15} A 10 10 0 0 0 15 ${height - 25}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
    <path d={`M ${width - 25} ${height - 15} A 10 10 0 0 1 ${width - 15} ${height - 25}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
    
    {children}
  </svg>
);

// Player Selection Modal
const PlayerSelectModal = ({ isOpen, onClose, players, onSelect, currentAssignment, positionRole }) => {
  if (!isOpen) return null;
  
  // Filter players by position compatibility
  const getPositionMatch = (playerPos, role) => {
    const posMap = {
      'Goalkeeper': ['GK'],
      'Defender': ['CB', 'LB', 'RB', 'DEF', 'LWB', 'RWB'],
      'Midfielder': ['CM', 'CDM', 'CAM', 'LM', 'RM', 'MID', 'DM'],
      'Forward': ['ST', 'LW', 'RW', 'FWD']
    };
    return posMap[playerPos]?.includes(role);
  };
  
  const sortedPlayers = [...players].sort((a, b) => {
    const aMatch = getPositionMatch(a.position, positionRole);
    const bMatch = getPositionMatch(b.position, positionRole);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d1210] border border-white/10 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Assign Player to {positionRole}</h2>
            <p className="text-gray-400 text-sm">Select a player from your roster</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {/* Clear assignment option */}
          <button
            onClick={() => { onSelect(null); onClose(); }}
            className="w-full flex items-center space-x-3 p-3 mb-2 bg-white/5 border border-white/10 rounded-xl hover:border-red-500/30 hover:bg-red-500/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <X className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <p className="font-medium text-gray-300">Clear Assignment</p>
              <p className="text-gray-500 text-sm">Remove player from this position</p>
            </div>
          </button>
          
          <div className="border-t border-white/10 my-3"></div>
          
          {sortedPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No players in roster</p>
              <p className="text-sm mt-1">Add players to your team first</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedPlayers.map(player => {
                const isMatch = getPositionMatch(player.position, positionRole);
                const isAssigned = currentAssignment === player.id;
                return (
                  <button
                    key={player.id}
                    onClick={() => { onSelect(player); onClose(); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                      isAssigned 
                        ? 'bg-emerald-500/20 border-2 border-emerald-500/50' 
                        : 'bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <JerseyBadge number={player.jerseyNumber || '?'} color={player.jerseyColor} />
                      <div>
                        <p className="font-medium text-white">{player.name}</p>
                        <p className={`text-sm ${isMatch ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {player.position} {isMatch && '• Recommended'}
                        </p>
                      </div>
                    </div>
                    {isAssigned && <Check className="w-5 h-5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Saved Formation Card
const SavedFormationCard = ({ formation, onLoad, onDelete }) => (
  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/30 transition-all group">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
        <Users className="w-5 h-5 text-emerald-400" />
      </div>
      <div>
        <p className="font-medium text-white">{formation.name}</p>
        <p className="text-gray-500 text-sm">{formation.formationType} • {formation.ageGroup}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
      <button onClick={() => onLoad(formation)} className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg">
        <Check className="w-4 h-4" />
      </button>
      <button onClick={() => onDelete(formation.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Main Formation Creator Component
const FormationCreator = ({ teams = [], players = [], onSave, savedFormations = [], onDeleteFormation }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [ageGroup, setAgeGroup] = useState('11v11');
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [positions, setPositions] = useState(FORMATIONS['11v11'].formations['4-3-3']);
  const [playerAssignments, setPlayerAssignments] = useState({}); // { positionId: playerId }
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [locked, setLocked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [formationName, setFormationName] = useState('');
  
  const fieldConfig = FORMATIONS[ageGroup];
  
  // Get players for selected team
  const teamPlayers = selectedTeam 
    ? players.filter(p => p.teamId === selectedTeam.id || p.teamName === selectedTeam.name)
    : players;
  
  // Load formation when age group or formation changes
  const loadFormation = (group, formation) => {
    const config = FORMATIONS[group];
    if (config && config.formations[formation]) {
      setPositions(JSON.parse(JSON.stringify(config.formations[formation])));
      setPlayerAssignments({});
      setSelectedPosition(null);
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
    setPositions(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
  };
  
  const handleDragEnd = () => {};
  
  const handleReset = () => {
    loadFormation(ageGroup, selectedFormation);
  };
  
  const handlePositionClick = (positionId) => {
    setSelectedPosition(positionId);
    setShowPlayerModal(true);
  };
  
  const handlePlayerAssign = (player) => {
    if (player === null) {
      // Remove assignment
      setPlayerAssignments(prev => {
        const next = { ...prev };
        delete next[selectedPosition];
        return next;
      });
    } else {
      // Remove this player from any other position first
      setPlayerAssignments(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (next[key] === player.id) delete next[key];
        });
        next[selectedPosition] = player.id;
        return next;
      });
    }
  };
  
  const handleSaveFormation = () => {
    const name = formationName.trim() || `${selectedTeam?.name || 'Team'} ${selectedFormation}`;
    const formation = {
      id: Date.now(),
      name,
      teamId: selectedTeam?.id,
      teamName: selectedTeam?.name,
      ageGroup,
      formationType: selectedFormation,
      positions: JSON.parse(JSON.stringify(positions)),
      playerAssignments: { ...playerAssignments },
      createdAt: new Date().toISOString()
    };
    if (onSave) onSave(formation);
    setFormationName('');
  };
  
  const handleLoadFormation = (formation) => {
    setAgeGroup(formation.ageGroup);
    setSelectedFormation(formation.formationType);
    setPositions(formation.positions);
    setPlayerAssignments(formation.playerAssignments || {});
    if (formation.teamId) {
      const team = teams.find(t => t.id === formation.teamId);
      if (team) setSelectedTeam(team);
    }
  };
  
  const getAssignedPlayer = (positionId) => {
    const playerId = playerAssignments[positionId];
    return playerId ? players.find(p => p.id === playerId) : null;
  };
  
  const currentPosition = positions.find(p => p.id === selectedPosition);
  const teamFormations = savedFormations.filter(f => !selectedTeam || f.teamId === selectedTeam.id);
  
  return (
    <div className="space-y-4">
      {/* Team Selection */}
      {teams.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">SELECT TEAM</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTeam(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !selectedTeam ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All Players
            </button>
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTeam?.id === team.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {team.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {/* Age Group Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(showDropdown === 'age' ? null : 'age')}
              className="flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:border-emerald-500/30 transition-all text-sm"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{fieldConfig.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDropdown === 'age' && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-[#1a1f1d] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                {Object.entries(FORMATIONS).map(([key, config]) => (
                  <button 
                    key={key}
                    onClick={() => handleAgeGroupChange(key)}
                    className={`w-full px-4 py-2.5 text-left hover:bg-white/5 transition-all text-sm ${ageGroup === key ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-300'}`}
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
              className="flex items-center space-x-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-bold"
            >
              <span>{selectedFormation}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDropdown === 'formation' && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-[#1a1f1d] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                {Object.keys(fieldConfig.formations).map(formation => (
                  <button 
                    key={formation}
                    onClick={() => handleFormationChange(formation)}
                    className={`w-full px-4 py-2.5 text-left hover:bg-white/5 transition-all text-sm ${selectedFormation === formation ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-300'}`}
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
            className={`p-2 rounded-lg border transition-all ${locked ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            title={locked ? 'Unlock positions' : 'Lock positions'}
          >
            {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleReset}
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
            title="Reset formation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <p className="text-xs text-gray-500">
        👆 Click player icons to assign from roster • Drag to adjust positions • {locked ? '🔒 Locked' : '🔓 Unlocked'}
      </p>
      
      {/* Formation Pitch - Full Width */}
      <div className="bg-gradient-to-b from-emerald-900/20 to-emerald-900/5 rounded-2xl overflow-hidden">
        <div className="w-full max-w-lg mx-auto" style={{ aspectRatio: `${fieldConfig.fieldWidth}/${fieldConfig.fieldHeight}` }}>
          <SoccerPitch width={fieldConfig.fieldWidth} height={fieldConfig.fieldHeight}>
            {positions.map(position => (
              <DraggableJersey
                key={position.id}
                player={position}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                isSelected={selectedPosition === position.id}
                onSelect={setSelectedPosition}
                locked={locked}
                onAssign={() => handlePositionClick(position.id)}
                assignedPlayer={getAssignedPlayer(position.id)}
              />
            ))}
          </SoccerPitch>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-purple-500"></div>
          <span className="text-gray-400">GK</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-blue-500"></div>
          <span className="text-gray-400">Defender</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-amber-500"></div>
          <span className="text-gray-400">Midfielder</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-emerald-500"></div>
          <span className="text-gray-400">Forward</span>
        </div>
      </div>
      
      {/* Roster Assignment Quick View */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-white mb-3 flex items-center space-x-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Lineup ({Object.keys(playerAssignments).length}/{positions.length})</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {positions.map(pos => {
            const assigned = getAssignedPlayer(pos.id);
            return (
              <button
                key={pos.id}
                onClick={() => handlePositionClick(pos.id)}
                className={`flex items-center space-x-2 p-2 rounded-lg text-left transition-all ${
                  assigned 
                    ? 'bg-emerald-500/10 border border-emerald-500/30' 
                    : 'bg-white/5 border border-white/10 border-dashed hover:border-amber-500/50'
                }`}
              >
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: assigned?.jerseyColor || ROLE_COLORS[pos.role] }}
                >
                  {assigned?.jerseyNumber || pos.role}
                </div>
                <span className={`text-xs truncate ${assigned ? 'text-white' : 'text-gray-500'}`}>
                  {assigned?.name?.split(' ')[0] || 'Tap to assign'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Save Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={formationName}
            onChange={(e) => setFormationName(e.target.value)}
            placeholder={`${selectedTeam?.name || 'Team'} ${selectedFormation}`}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
          />
          <button 
            onClick={handleSaveFormation}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-semibold transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Formation</span>
          </button>
        </div>
      </div>
      
      {/* Saved Formations */}
      {teamFormations.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">Saved Formations</h3>
          <div className="space-y-2">
            {teamFormations.map(formation => (
              <SavedFormationCard
                key={formation.id}
                formation={formation}
                onLoad={handleLoadFormation}
                onDelete={onDeleteFormation}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Player Selection Modal */}
      <PlayerSelectModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        players={teamPlayers}
        onSelect={handlePlayerAssign}
        currentAssignment={playerAssignments[selectedPosition]}
        positionRole={currentPosition?.role || ''}
      />
    </div>
  );
};

export default FormationCreator;
