import React, { useState, useMemo } from 'react';
import drillsData, { drillCategories, difficultyLevels, ageGroups } from './DrillData';

// ============================================
// ACCURATE DRILL VISUALIZATION COMPONENT
// ============================================
const DrillVisualization = ({ drill, categoryColor }) => {
  const name = drill.name?.toLowerCase() || '';
  const setup = drill.setup?.toLowerCase() || '';
  const category = drill.category;
  
  // Field background
  const Field = ({ children, small = false }) => (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: small ? 280 : 320, background: '#1a472a', borderRadius: 8, border: '2px solid #2d5a3d' }}>
      {/* Field markings */}
      <rect x="5" y="5" width="190" height="130" fill="none" stroke="#3d7a4a" strokeWidth="2" />
      <line x1="100" y1="5" x2="100" y2="135" stroke="#3d7a4a" strokeWidth="1.5" />
      <circle cx="100" cy="70" r="20" fill="none" stroke="#3d7a4a" strokeWidth="1.5" />
      <circle cx="100" cy="70" r="2" fill="#3d7a4a" />
      {/* Goals */}
      <rect x="5" y="45" width="3" height="50" fill="#fff" opacity="0.6" />
      <rect x="192" y="45" width="3" height="50" fill="#fff" opacity="0.6" />
      {/* Penalty areas */}
      <rect x="5" y="30" width="30" height="80" fill="none" stroke="#3d7a4a" strokeWidth="1" />
      <rect x="165" y="30" width="30" height="80" fill="none" stroke="#3d7a4a" strokeWidth="1" />
      {children}
    </svg>
  );

  // Small grid for rondos/small drills
  const SmallGrid = ({ children, size = 60 }) => (
    <svg viewBox="0 0 120 120" style={{ width: '100%', maxWidth: 280, background: '#1a472a', borderRadius: 8, border: '2px solid #2d5a3d' }}>
      <rect x="10" y="10" width="100" height="100" fill="none" stroke="#3d7a4a" strokeWidth="2" strokeDasharray="5,5" />
      {children}
    </svg>
  );

  // Player marker
  const Player = ({ x, y, color = '#3b82f6', number, label }) => (
    <g>
      <circle cx={x} cy={y} r="12" fill={color} stroke="#fff" strokeWidth="2" />
      {number && <text x={x} y={y + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">{number}</text>}
      {label && <text x={x} y={y + 24} textAnchor="middle" fill="#fff" fontSize="8" opacity="0.9">{label}</text>}
    </g>
  );

  // Cone marker
  const Cone = ({ x, y }) => (
    <polygon points={`${x},${y-7} ${x-6},${y+5} ${x+6},${y+5}`} fill="#f97316" stroke="#fff" strokeWidth="1" />
  );

  // Ball
  const Ball = ({ x, y }) => (
    <circle cx={x} cy={y} r="5" fill="#fff" stroke="#333" strokeWidth="1" />
  );

  // Arrow for movement/passing
  const Arrow = ({ x1, y1, x2, y2, color = '#10b981', dashed = false }) => {
    const id = `arrow-${x1}-${y1}-${x2}-${y2}`.replace(/\./g, '-');
    return (
      <g>
        <defs>
          <marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={color} />
          </marker>
        </defs>
        <line 
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke={color} strokeWidth="2" 
          strokeDasharray={dashed ? "5,4" : "0"}
          markerEnd={`url(#${id})`}
        />
      </g>
    );
  };

  // Curved arrow
  const CurvedArrow = ({ x1, y1, x2, y2, curve = -25, color = '#10b981' }) => {
    const id = `curved-${x1}-${y1}`.replace(/\./g, '-');
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 + curve;
    return (
      <g>
        <defs>
          <marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={color} />
          </marker>
        </defs>
        <path 
          d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth="2"
          markerEnd={`url(#${id})`}
        />
      </g>
    );
  };

  // ============================================
  // RENDER SPECIFIC DRILL VISUALIZATIONS
  // ============================================
  const renderVisualization = () => {
    
    // ========== RONDO DRILLS ==========
    if (name.includes('rondo 4v1') || name.includes('4v1')) {
      // 4 players in square, 1 defender in middle
      return (
        <SmallGrid>
          <Player x={60} y={20} color="#3b82f6" number="1" />
          <Player x={100} y={60} color="#3b82f6" number="2" />
          <Player x={60} y={100} color="#3b82f6" number="3" />
          <Player x={20} y={60} color="#3b82f6" number="4" />
          <Player x={60} y={60} color="#ef4444" label="DEF" />
          <Ball x={60} y={28} />
          <Arrow x1={60} y1={30} x2={90} y2={55} color="#10b981" />
        </SmallGrid>
      );
    }

    if (name.includes('rondo 5v2') || name.includes('5v2')) {
      // 5 players in pentagon, 2 defenders in middle
      return (
        <SmallGrid>
          <Player x={60} y={15} color="#3b82f6" number="1" />
          <Player x={100} y={45} color="#3b82f6" number="2" />
          <Player x={85} y={95} color="#3b82f6" number="3" />
          <Player x={35} y={95} color="#3b82f6" number="4" />
          <Player x={20} y={45} color="#3b82f6" number="5" />
          <Player x={50} y={55} color="#ef4444" />
          <Player x={70} y={65} color="#ef4444" />
          <Ball x={60} y={23} />
        </SmallGrid>
      );
    }

    if (name.includes('rondo') && (name.includes('3v1') || setup.includes('3v1'))) {
      return (
        <SmallGrid>
          <Player x={60} y={25} color="#3b82f6" number="1" />
          <Player x={95} y={85} color="#3b82f6" number="2" />
          <Player x={25} y={85} color="#3b82f6" number="3" />
          <Player x={60} y={60} color="#ef4444" label="DEF" />
          <Ball x={60} y={33} />
        </SmallGrid>
      );
    }

    // ========== TRIANGLE PASSING ==========
    if (name.includes('triangle')) {
      return (
        <SmallGrid>
          <Cone x={60} y={25} />
          <Cone x={95} y={90} />
          <Cone x={25} y={90} />
          <Player x={60} y={25} color="#3b82f6" number="A" />
          <Player x={95} y={90} color="#3b82f6" number="B" />
          <Player x={25} y={90} color="#3b82f6" number="C" />
          <Ball x={52} y={30} />
          <Arrow x1={55} y1={35} x2={30} y2={80} color="#10b981" />
          <Arrow x1={35} y1={90} x2={85} y2={90} color="#10b981" />
          <Arrow x1={90} y1={80} x2={65} y2={35} color="#10b981" />
        </SmallGrid>
      );
    }

    // ========== Y SHAPE PASSING ==========
    if (name.includes('y shape') || name.includes('y-shape')) {
      return (
        <SmallGrid>
          <Player x={60} y={100} color="#3b82f6" number="1" />
          <Player x={60} y={55} color="#3b82f6" number="2" />
          <Player x={30} y={20} color="#3b82f6" number="3" />
          <Player x={90} y={20} color="#3b82f6" number="4" />
          <Ball x={60} y={92} />
          <Arrow x1={60} y1={90} x2={60} y2={65} color="#10b981" />
          <Arrow x1={55} y1={50} x2={35} y2={30} color="#10b981" dashed />
          <Arrow x1={65} y1={50} x2={85} y2={30} color="#10b981" dashed />
        </SmallGrid>
      );
    }

    // ========== WALL PASS / GIVE AND GO ==========
    if (name.includes('wall pass') || name.includes('give and go') || name.includes('overlap')) {
      return (
        <Field>
          <Player x={50} y={70} color="#3b82f6" number="1" />
          <Player x={100} y={70} color="#3b82f6" number="2" />
          <Player x={130} y={70} color="#ef4444" label="DEF" />
          <Ball x={58} y={70} />
          <Arrow x1={60} y1={68} x2={90} y2={68} color="#10b981" />
          <Arrow x1={105} y1={72} x2={140} y2={50} color="#10b981" />
          <CurvedArrow x1={55} y1={75} x2={145} y2={50} curve={30} color="#fbbf24" />
          <text x={100} y={100} textAnchor="middle" fill="#fbbf24" fontSize="8">Player 1 run</text>
        </Field>
      );
    }

    // ========== THROUGH BALL ==========
    if (name.includes('through ball')) {
      return (
        <Field>
          <Player x={60} y={90} color="#3b82f6" number="1" />
          <Player x={120} y={70} color="#3b82f6" number="2" />
          <Player x={100} y={60} color="#ef4444" />
          <Player x={100} y={80} color="#ef4444" />
          <Ball x={68} y={88} />
          <Arrow x1={70} y1={88} x2={155} y2={55} color="#10b981" />
          <CurvedArrow x1={125} y1={68} x2={160} y2={50} curve={-15} color="#fbbf24" />
        </Field>
      );
    }

    // ========== LONG BALL ==========
    if (name.includes('long ball') || name.includes('switching play')) {
      return (
        <Field>
          <Player x={40} y={100} color="#3b82f6" number="1" />
          <Player x={160} y={50} color="#3b82f6" number="2" />
          <Ball x={48} y={98} />
          <CurvedArrow x1={50} y1={95} x2={150} y2={55} curve={-40} color="#10b981" />
        </Field>
      );
    }

    // ========== CONE WEAVE / DRIBBLING ==========
    if (name.includes('cone') || name.includes('weave') || name.includes('slalom')) {
      return (
        <Field>
          <Cone x={50} y={70} />
          <Cone x={80} y={70} />
          <Cone x={110} y={70} />
          <Cone x={140} y={70} />
          <Player x={30} y={70} color="#3b82f6" />
          <Ball x={38} y={70} />
          <path d="M 42 70 Q 65 50 80 70 Q 95 90 110 70 Q 125 50 140 70 L 160 70" 
            fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,4" />
        </Field>
      );
    }

    // ========== 1V1 DRIBBLING ==========
    if (name.includes('1v1') && category === 'dribbling') {
      return (
        <SmallGrid>
          <rect x={20} y={20} width={80} height={80} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
          <Player x={40} y={60} color="#3b82f6" label="ATT" />
          <Player x={80} y={60} color="#ef4444" label="DEF" />
          <Ball x={48} y={60} />
          <Arrow x1={55} y1={60} x2={70} y2={60} color="#fbbf24" dashed />
        </SmallGrid>
      );
    }

    // ========== COERVER / BALL MASTERY ==========
    if (name.includes('coerver') || name.includes('mastery') || name.includes('moves')) {
      return (
        <SmallGrid>
          <Player x={60} y={60} color="#3b82f6" />
          <Ball x={60} y={48} />
          <circle cx={60} cy={60} r={25} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,4" />
          <text x={60} y={105} textAnchor="middle" fill="#fff" fontSize="9" opacity="0.7">Ball mastery zone</text>
        </SmallGrid>
      );
    }

    // ========== SHOOTING DRILLS ==========
    if (name.includes('finishing cross') || name.includes('cross')) {
      return (
        <Field>
          <Player x={170} y={30} color="#3b82f6" label="Winger" />
          <Player x={130} y={70} color="#3b82f6" label="Striker" />
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Ball x={170} y={38} />
          <CurvedArrow x1={168} y1={35} x2={135} y2={65} curve={-20} color="#fff" />
          <Arrow x1={130} y1={70} x2={35} y2={70} color="#ef4444" />
        </Field>
      );
    }

    if (name.includes('one touch finishing') || name.includes('1 touch')) {
      return (
        <Field>
          <Player x={80} y={70} color="#3b82f6" label="Passer" />
          <Player x={130} y={70} color="#3b82f6" label="Shooter" />
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Ball x={88} y={70} />
          <Arrow x1={90} y1={70} x2={120} y2={70} color="#10b981" />
          <Arrow x1={130} y1={68} x2={35} y2={68} color="#ef4444" />
        </Field>
      );
    }

    if (name.includes('volley') || name.includes('volleys')) {
      return (
        <Field>
          <Player x={100} y={100} color="#3b82f6" label="Server" />
          <Player x={100} y={60} color="#3b82f6" label="Shooter" />
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Ball x={100} y={92} />
          <CurvedArrow x1={100} y1={92} x2={100} y2={68} curve={15} color="#fff" />
          <Arrow x1={95} y1={58} x2={35} y2={68} color="#ef4444" />
        </Field>
      );
    }

    if (category === 'shooting') {
      return (
        <Field>
          <Player x={100} y={85} color="#3b82f6" label="Shooter" />
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Cone x={75} y={55} />
          <Cone x={125} y={55} />
          <Ball x={100} y={77} />
          <Arrow x1={100} y1={75} x2={35} y2={68} color="#ef4444" />
        </Field>
      );
    }

    // ========== DEFENDING DRILLS ==========
    if (name.includes('1v1') && category === 'defending') {
      return (
        <SmallGrid>
          <Player x={70} y={60} color="#ef4444" label="DEF" />
          <Player x={40} y={60} color="#3b82f6" label="ATT" />
          <Ball x={48} y={60} />
          <Arrow x1={65} y1={60} x2={55} y2={60} color="#fbbf24" dashed />
          <text x={60} y={105} textAnchor="middle" fill="#fff" fontSize="8" opacity="0.7">Jockey & contain</text>
        </SmallGrid>
      );
    }

    if (name.includes('press') || name.includes('trap')) {
      return (
        <Field>
          <Player x={80} y={50} color="#ef4444" number="1" />
          <Player x={80} y={90} color="#ef4444" number="2" />
          <Player x={120} y={70} color="#3b82f6" label="Ball" />
          <Ball x={128} y={70} />
          <Arrow x1={85} y1={55} x2={110} y2={68} color="#fbbf24" dashed />
          <Arrow x1={85} y1={85} x2={110} y2={72} color="#fbbf24" dashed />
          <text x={100} y={120} textAnchor="middle" fill="#fbbf24" fontSize="8">Pressing trigger</text>
        </Field>
      );
    }

    if (name.includes('recovery run')) {
      return (
        <Field>
          <Player x={60} y={70} color="#ef4444" label="DEF" />
          <Player x={140} y={50} color="#3b82f6" label="ATT" />
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Ball x={148} y={50} />
          <CurvedArrow x1={65} y1={70} x2={40} y2={60} curve={20} color="#fbbf24" />
          <Arrow x1={145} y1={52} x2={35} y2={68} color="#ef4444" dashed />
        </Field>
      );
    }

    if (name.includes('back 4') || name.includes('defensive shape')) {
      return (
        <Field>
          <Player x={50} y={70} color="#ef4444" />
          <Player x={75} y={70} color="#ef4444" />
          <Player x={125} y={70} color="#ef4444" />
          <Player x={150} y={70} color="#ef4444" />
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <line x1={45} y1={70} x2={155} y2={70} stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,4" />
          <text x={100} y={90} textAnchor="middle" fill="#fbbf24" fontSize="8">Defensive line</text>
        </Field>
      );
    }

    if (category === 'defending') {
      return (
        <Field>
          <Player x={80} y={70} color="#ef4444" label="DEF" />
          <Player x={120} y={70} color="#3b82f6" label="ATT" />
          <Ball x={128} y={70} />
          <Arrow x1={85} y1={70} x2={110} y2={70} color="#fbbf24" dashed />
        </Field>
      );
    }

    // ========== GOALKEEPING ==========
    if (name.includes('shot stopping') || name.includes('diving')) {
      return (
        <Field>
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Player x={100} y={50} color="#3b82f6" number="1" />
          <Player x={100} y={90} color="#3b82f6" number="2" />
          <Ball x={100} y={58} />
          <Arrow x1={100} y1={55} x2={32} y2={65} color="#ef4444" />
          <Arrow x1={100} y1={85} x2={32} y2={75} color="#ef4444" dashed />
        </Field>
      );
    }

    if (name.includes('distribution')) {
      return (
        <Field>
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Player x={80} y={40} color="#3b82f6" />
          <Player x={80} y={100} color="#3b82f6" />
          <Player x={140} y={70} color="#3b82f6" />
          <Ball x={33} y={70} />
          <Arrow x1={35} y1={68} x2={70} y2={45} color="#10b981" />
          <Arrow x1={35} y1={72} x2={70} y2={95} color="#10b981" dashed />
        </Field>
      );
    }

    if (name.includes('1v1') && category === 'goalkeeping') {
      return (
        <Field>
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Player x={80} y={70} color="#3b82f6" label="ATT" />
          <Ball x={88} y={70} />
          <Arrow x1={30} y1={70} x2={70} y2={70} color="#fbbf24" dashed />
          <text x={50} y={90} textAnchor="middle" fill="#fbbf24" fontSize="8">Close down</text>
        </Field>
      );
    }

    if (category === 'goalkeeping') {
      return (
        <Field>
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Player x={100} y={70} color="#3b82f6" />
          <Ball x={100} y={62} />
          <Arrow x1={100} y1={65} x2={32} y2={68} color="#ef4444" />
        </Field>
      );
    }

    // ========== TACTICAL ==========
    if (name.includes('positional play') || name.includes('formation')) {
      return (
        <Field>
          {/* 4-3-3 formation */}
          <Player x={25} y={70} color="#22c55e" />
          <Player x={55} y={45} color="#3b82f6" />
          <Player x={55} y={70} color="#3b82f6" />
          <Player x={55} y={95} color="#3b82f6" />
          <Player x={100} y={35} color="#3b82f6" />
          <Player x={100} y={70} color="#3b82f6" />
          <Player x={100} y={105} color="#3b82f6" />
          <Player x={145} y={45} color="#3b82f6" />
          <Player x={155} y={70} color="#3b82f6" />
          <Player x={145} y={95} color="#3b82f6" />
          <Ball x={100} y={70} />
        </Field>
      );
    }

    if (name.includes('overload')) {
      return (
        <Field>
          <Player x={80} y={50} color="#3b82f6" />
          <Player x={80} y={90} color="#3b82f6" />
          <Player x={110} y={70} color="#3b82f6" />
          <Player x={130} y={50} color="#ef4444" />
          <Player x={130} y={90} color="#ef4444" />
          <Ball x={88} y={50} />
          <text x={95} y={120} textAnchor="middle" fill="#10b981" fontSize="9">3v2 Overload</text>
        </Field>
      );
    }

    if (category === 'tactical') {
      return (
        <Field>
          <Player x={50} y={50} color="#3b82f6" />
          <Player x={50} y={90} color="#3b82f6" />
          <Player x={100} y={70} color="#3b82f6" />
          <Player x={150} y={50} color="#3b82f6" />
          <Player x={150} y={90} color="#3b82f6" />
          <Ball x={100} y={62} />
          <Arrow x1={105} y1={68} x2={140} y2={55} color="#10b981" />
        </Field>
      );
    }

    // ========== SET PIECES ==========
    if (name.includes('corner')) {
      return (
        <Field>
          <Ball x={192} y={8} />
          <Player x={185} y={15} color="#3b82f6" label="Taker" />
          <Player x={160} y={55} color="#3b82f6" />
          <Player x={155} y={70} color="#3b82f6" />
          <Player x={160} y={85} color="#3b82f6" />
          <Player x={170} y={60} color="#ef4444" />
          <Player x={170} y={80} color="#ef4444" />
          <Player x={180} y={70} color="#22c55e" label="GK" />
          <CurvedArrow x1={188} y1={12} x2={162} y2={58} curve={-30} color="#fff" />
        </Field>
      );
    }

    if (name.includes('free kick')) {
      return (
        <Field>
          <Ball x={110} y={70} />
          <Player x={105} y={78} color="#3b82f6" label="Taker" />
          <Player x={140} y={60} color="#ef4444" />
          <Player x={140} y={70} color="#ef4444" />
          <Player x={140} y={80} color="#ef4444" />
          <Player x={180} y={70} color="#22c55e" label="GK" />
          <Arrow x1={115} y1={68} x2={170} y2={60} color="#fff" />
        </Field>
      );
    }

    if (name.includes('throw') || name.includes('throw-in')) {
      return (
        <Field>
          <Player x={100} y={10} color="#3b82f6" label="Thrower" />
          <Player x={80} y={50} color="#3b82f6" />
          <Player x={120} y={50} color="#3b82f6" />
          <Player x={100} y={80} color="#3b82f6" />
          <Ball x={100} y={18} />
          <Arrow x1={100} y1={22} x2={85} y2={42} color="#10b981" />
        </Field>
      );
    }

    if (category === 'setpieces') {
      return (
        <Field>
          <Ball x={100} y={50} />
          <Player x={95} y={58} color="#3b82f6" label="Taker" />
          <Player x={130} y={70} color="#3b82f6" />
          <Player x={150} y={50} color="#ef4444" />
          <Player x={180} y={70} color="#22c55e" label="GK" />
          <Arrow x1={105} y1={52} x2={125} y2={65} color="#10b981" />
        </Field>
      );
    }

    // ========== SMALL-SIDED GAMES ==========
    if (name.includes('4v4')) {
      return (
        <Field>
          <Player x={50} y={50} color="#3b82f6" />
          <Player x={50} y={90} color="#3b82f6" />
          <Player x={80} y={60} color="#3b82f6" />
          <Player x={80} y={80} color="#3b82f6" />
          <Player x={150} y={50} color="#ef4444" />
          <Player x={150} y={90} color="#ef4444" />
          <Player x={120} y={60} color="#ef4444" />
          <Player x={120} y={80} color="#ef4444" />
          <Ball x={100} y={70} />
        </Field>
      );
    }

    if (name.includes('3v3')) {
      return (
        <Field>
          <Player x={50} y={50} color="#3b82f6" />
          <Player x={50} y={90} color="#3b82f6" />
          <Player x={80} y={70} color="#3b82f6" />
          <Player x={150} y={50} color="#ef4444" />
          <Player x={150} y={90} color="#ef4444" />
          <Player x={120} y={70} color="#ef4444" />
          <Ball x={100} y={70} />
        </Field>
      );
    }

    if (name.includes('5v5') || name.includes('6v6')) {
      return (
        <Field>
          <Player x={25} y={70} color="#22c55e" />
          <Player x={50} y={45} color="#3b82f6" />
          <Player x={50} y={95} color="#3b82f6" />
          <Player x={80} y={70} color="#3b82f6" />
          <Player x={95} y={50} color="#3b82f6" />
          <Player x={95} y={90} color="#3b82f6" />
          <Player x={175} y={70} color="#fbbf24" />
          <Player x={150} y={45} color="#ef4444" />
          <Player x={150} y={95} color="#ef4444" />
          <Player x={120} y={70} color="#ef4444" />
          <Player x={105} y={50} color="#ef4444" />
          <Player x={105} y={90} color="#ef4444" />
          <Ball x={100} y={70} />
        </Field>
      );
    }

    if (category === 'smallsided') {
      return (
        <Field>
          <Player x={50} y={55} color="#3b82f6" />
          <Player x={50} y={85} color="#3b82f6" />
          <Player x={80} y={70} color="#3b82f6" />
          <Player x={150} y={55} color="#ef4444" />
          <Player x={150} y={85} color="#ef4444" />
          <Player x={120} y={70} color="#ef4444" />
          <Player x={20} y={70} color="#22c55e" />
          <Player x={180} y={70} color="#fbbf24" />
          <Ball x={100} y={70} />
        </Field>
      );
    }

    // ========== CONDITIONING ==========
    if (name.includes('interval') || name.includes('sprint')) {
      return (
        <Field>
          <Cone x={30} y={70} />
          <Cone x={170} y={70} />
          <Player x={40} y={70} color="#3b82f6" />
          <Arrow x1={50} y1={68} x2={160} y2={68} color="#fbbf24" />
          <Arrow x1={160} y1={72} x2={50} y2={72} color="#10b981" dashed />
          <text x={100} y={55} textAnchor="middle" fill="#fbbf24" fontSize="9">Sprint</text>
          <text x={100} y={90} textAnchor="middle" fill="#10b981" fontSize="9">Jog back</text>
        </Field>
      );
    }

    if (name.includes('agility') || name.includes('ladder')) {
      return (
        <SmallGrid>
          <rect x={50} y={20} width={20} height={80} fill="none" stroke="#fbbf24" strokeWidth="2" />
          {[30, 45, 60, 75, 90].map(y => (
            <line key={y} x1={50} y1={y} x2={70} y2={y} stroke="#fbbf24" strokeWidth="1" />
          ))}
          <Player x={30} y={25} color="#3b82f6" />
          <Arrow x1={35} y1={30} x2={55} y2={95} color="#10b981" dashed />
        </SmallGrid>
      );
    }

    if (category === 'conditioning') {
      return (
        <Field>
          <Cone x={30} y={40} />
          <Cone x={30} y={100} />
          <Cone x={170} y={40} />
          <Cone x={170} y={100} />
          <Player x={40} y={70} color="#3b82f6" />
          <path d="M 40 65 L 165 42 L 165 98 L 35 98 L 35 45" 
            fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,4" />
        </Field>
      );
    }

    // ========== WARMUP ==========
    if (name.includes('dynamic') || name.includes('warm')) {
      return (
        <Field>
          <Player x={40} y={40} color="#3b82f6" />
          <Player x={70} y={40} color="#3b82f6" />
          <Player x={100} y={40} color="#3b82f6" />
          <Player x={130} y={40} color="#3b82f6" />
          <Player x={160} y={40} color="#3b82f6" />
          <Cone x={40} y={100} />
          <Cone x={70} y={100} />
          <Cone x={100} y={100} />
          <Cone x={130} y={100} />
          <Cone x={160} y={100} />
          <Arrow x1={40} y1={50} x2={40} y2={90} color="#10b981" dashed />
          <Arrow x1={70} y1={50} x2={70} y2={90} color="#10b981" dashed />
          <Arrow x1={100} y1={50} x2={100} y2={90} color="#10b981" dashed />
        </Field>
      );
    }

    if (name.includes('passing warm') || name.includes('warm-up')) {
      return (
        <SmallGrid>
          <Player x={30} y={30} color="#3b82f6" />
          <Player x={90} y={30} color="#3b82f6" />
          <Player x={30} y={90} color="#3b82f6" />
          <Player x={90} y={90} color="#3b82f6" />
          <Ball x={38} y={30} />
          <Arrow x1={40} y1={32} x2={80} y2={32} color="#10b981" />
          <Arrow x1={88} y1={40} x2={88} y2={80} color="#10b981" dashed />
        </SmallGrid>
      );
    }

    if (category === 'warmup') {
      return (
        <Field>
          <Player x={50} y={50} color="#3b82f6" />
          <Player x={100} y={50} color="#3b82f6" />
          <Player x={150} y={50} color="#3b82f6" />
          <Player x={50} y={90} color="#3b82f6" />
          <Player x={100} y={90} color="#3b82f6" />
          <Player x={150} y={90} color="#3b82f6" />
          <Arrow x1={55} y1={55} x2={55} y2={85} color="#10b981" dashed />
          <Arrow x1={105} y1={55} x2={105} y2={85} color="#10b981" dashed />
          <Arrow x1={155} y1={55} x2={155} y2={85} color="#10b981" dashed />
        </Field>
      );
    }

    // ========== DEFAULT ==========
    return (
      <Field>
        <Player x={80} y={70} color="#3b82f6" />
        <Player x={120} y={70} color="#3b82f6" />
        <Ball x={100} y={70} />
        <Arrow x1={88} y1={70} x2={110} y2={70} color="#10b981" />
      </Field>
    );
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 16
    }}>
      {renderVisualization()}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></span> Attackers
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span> Defenders
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></span> GK
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '8px solid #f97316' }}></span> Cones
        </span>
      </div>
    </div>
  );
};

// ============================================
// MAIN DRILLS PAGE
// ============================================
const DrillsPage = ({ onAddToSession, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDrill, setExpandedDrill] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const safeDrillsData = Array.isArray(drillsData) ? drillsData : [];

  const filteredDrills = useMemo(() => {
    let result = [...safeDrillsData];
    if (selectedCategory !== 'all') result = result.filter(d => d.category === selectedCategory);
    if (selectedDifficulty !== 'all') result = result.filter(d => d.difficulty === selectedDifficulty);
    if (selectedAgeGroup !== 'all') result = result.filter(d => d.ageGroup?.includes(selectedAgeGroup));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => d.name?.toLowerCase().includes(q) || d.focusAreas?.some(a => a.toLowerCase().includes(q)));
    }
    return result;
  }, [safeDrillsData, selectedCategory, selectedDifficulty, selectedAgeGroup, searchQuery]);

  const getCategoryInfo = (id) => drillCategories.find(c => c.id === id) || { name: id, icon: '⚽', color: '#6b7280' };
  const getDifficultyInfo = (d) => ({ beginner: { color: '#22c55e', label: 'Beginner' }, intermediate: { color: '#f59e0b', label: 'Intermediate' }, advanced: { color: '#ef4444', label: 'Advanced' } }[d] || { color: '#6b7280', label: d });
  const clearFilters = () => { setSelectedCategory('all'); setSelectedDifficulty('all'); setSelectedAgeGroup('all'); setSearchQuery(''); };

  const selectStyle = { padding: '10px 14px', background: '#1a1f1c', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, cursor: 'pointer', outline: 'none', minWidth: 150, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36 };

  const DrillDetails = ({ drill, cat }) => (
    <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
      <DrillVisualization drill={drill} categoryColor={cat.color} />
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>🎒 Equipment</h4>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{drill.equipment?.join(', ') || 'None'}</p>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>📋 Setup</h4>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{drill.setup}</p>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>📝 Instructions</h4>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
          {drill.instructions?.map((inst, i) => <li key={i} style={{ marginBottom: 6 }}>{inst}</li>)}
        </ol>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#10b981', fontWeight: 600 }}>💡 Coaching Points</h4>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
          {drill.coachingPoints?.map((p, i) => <li key={i} style={{ marginBottom: 6 }}>{p}</li>)}
        </ul>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#8b5cf6', fontWeight: 600 }}>🔄 Variations</h4>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
          {drill.variations?.map((v, i) => <li key={i} style={{ marginBottom: 6 }}>{v}</li>)}
        </ul>
      </div>
      {onAddToSession && (
        <button onClick={(e) => { e.stopPropagation(); onAddToSession(drill); }} style={{ width: '100%', padding: '14px 20px', background: cat.color, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>+ Add to Training Session</button>
      )}
    </div>
  );

  const DrillCard = ({ drill }) => {
    const isExpanded = expandedDrill === drill.id;
    const cat = getCategoryInfo(drill.category);
    const diff = getDifficultyInfo(drill.difficulty);

    if (viewMode === 'list') {
      return (
        <div onClick={() => setExpandedDrill(isExpanded ? null : drill.id)} style={{ background: isExpanded ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: 12, border: isExpanded ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', cursor: 'pointer', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{cat.icon}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#fff' }}>{drill.name}</h3>
              <div style={{ display: 'flex', gap: 16, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                <span>⏱️ {drill.duration} min</span>
                <span>👥 {drill.players}</span>
                <span style={{ color: cat.color }}>{cat.name}</span>
              </div>
            </div>
            <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: diff.color, color: '#fff', fontWeight: 600 }}>{diff.label}</span>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</div>
          </div>
          {isExpanded && <DrillDetails drill={drill} cat={cat} />}
        </div>
      );
    }

    return (
      <div style={{ background: isExpanded ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)', borderRadius: 16, border: isExpanded ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div onClick={() => setExpandedDrill(isExpanded ? null : drill.id)} style={{ padding: 20, cursor: 'pointer', borderLeft: `4px solid ${cat.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{drill.name}</h3>
            </div>
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: diff.color, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{diff.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
            <span>⏱️ {drill.duration} min</span>
            <span>👥 {drill.players}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {drill.ageGroup?.map(age => <span key={age} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>{age.toUpperCase()}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {drill.focusAreas?.slice(0, 3).map((a, i) => <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: `${cat.color}15`, color: cat.color }}>{a}</span>)}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{isExpanded ? '▲ Collapse' : '▼ View Details & Diagram'}</div>
        </div>
        {isExpanded && <DrillDetails drill={drill} cat={cat} />}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, color: '#fff', fontWeight: 700 }}>⚽ Drill Library</h2>
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>{filteredDrills.length} of {safeDrillsData.length} drills</p>
        </div>
        {onBack && <button onClick={onBack} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>← Back</button>}
      </div>

      <input type="text" placeholder="Search drills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '14px 18px', marginBottom: 20, background: '#1a1f1c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', fontSize: 15, boxSizing: 'border-box', outline: 'none' }} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={selectStyle}>
          <option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Categories</option>
          {drillCategories.map(c => <option key={c.id} value={c.id} style={{ background: '#1a1f1c', color: '#fff' }}>{c.name}</option>)}
        </select>
        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} style={selectStyle}>
          <option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Difficulties</option>
          {difficultyLevels.map(d => <option key={d.id} value={d.id} style={{ background: '#1a1f1c', color: '#fff' }}>{d.name}</option>)}
        </select>
        <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)} style={selectStyle}>
          <option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Ages</option>
          {ageGroups.map(a => <option key={a.id} value={a.id} style={{ background: '#1a1f1c', color: '#fff' }}>{a.name}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '10px 18px', border: 'none', cursor: 'pointer', borderRadius: '10px 0 0 10px', fontSize: 14, fontWeight: 500, background: viewMode === 'grid' ? '#10b981' : '#1a1f1c', color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.6)' }}>▦ Grid</button>
          <button onClick={() => setViewMode('list')} style={{ padding: '10px 18px', border: 'none', cursor: 'pointer', borderRadius: '0 10px 10px 0', fontSize: 14, fontWeight: 500, background: viewMode === 'list' ? '#10b981' : '#1a1f1c', color: viewMode === 'list' ? '#fff' : 'rgba(255,255,255,0.6)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>☰ List</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <button onClick={() => setSelectedCategory('all')} style={{ padding: '10px 18px', background: selectedCategory === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 25, color: selectedCategory === 'all' ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>All ({safeDrillsData.length})</button>
        {drillCategories.slice(0, 6).map(c => {
          const count = safeDrillsData.filter(d => d.category === c.id).length;
          const isActive = selectedCategory === c.id;
          return <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{ padding: '10px 18px', background: isActive ? `${c.color}25` : 'rgba(255,255,255,0.05)', border: isActive ? `1px solid ${c.color}` : '1px solid transparent', borderRadius: 25, color: isActive ? c.color : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>{c.icon} {c.name} ({count})</button>;
        })}
      </div>

      {filteredDrills.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(380px, 1fr))' : '1fr', gap: 20, alignItems: 'start' }}>
          {filteredDrills.map(drill => <DrillCard key={drill.id} drill={drill} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
          <p style={{ fontSize: 18, marginBottom: 24 }}>No drills found</p>
          <button onClick={clearFilters} style={{ padding: '14px 28px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>Clear Filters</button>
        </div>
      )}
    </div>
  );
};

export default DrillsPage;
