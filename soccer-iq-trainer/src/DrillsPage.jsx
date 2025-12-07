import React, { useState, useMemo } from 'react';
import drillsData, { drillCategories, difficultyLevels, ageGroups } from './DrillData';

// ============================================
// DRILL VISUALIZATION COMPONENT
// ============================================
const DrillVisualization = ({ drill, categoryColor }) => {
  const category = drill.category;
  const name = drill.name?.toLowerCase() || '';
  
  // Field background
  const Field = ({ children, mini = false }) => (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 320, background: '#1a472a', borderRadius: 8, border: '2px solid #2d5a3d' }}>
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

  // Player marker
  const Player = ({ x, y, color = '#3b82f6', number, label }) => (
    <g>
      <circle cx={x} cy={y} r="10" fill={color} stroke="#fff" strokeWidth="2" />
      {number && <text x={x} y={y + 4} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">{number}</text>}
      {label && <text x={x} y={y + 22} textAnchor="middle" fill="#fff" fontSize="7" opacity="0.8">{label}</text>}
    </g>
  );

  // Cone marker
  const Cone = ({ x, y }) => (
    <polygon points={`${x},${y-6} ${x-5},${y+4} ${x+5},${y+4}`} fill="#f97316" stroke="#fff" strokeWidth="1" />
  );

  // Ball
  const Ball = ({ x, y }) => (
    <circle cx={x} cy={y} r="5" fill="#fff" stroke="#000" strokeWidth="1" />
  );

  // Arrow for movement/passing
  const Arrow = ({ x1, y1, x2, y2, color = '#fff', dashed = false }) => (
    <g>
      <defs>
        <marker id={`arrowhead-${color.replace('#','')}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={color} />
        </marker>
      </defs>
      <line 
        x1={x1} y1={y1} x2={x2} y2={y2} 
        stroke={color} strokeWidth="2" 
        strokeDasharray={dashed ? "4,3" : "0"}
        markerEnd={`url(#arrowhead-${color.replace('#','')})`}
      />
    </g>
  );

  // Curved arrow for runs
  const CurvedArrow = ({ x1, y1, x2, y2, color = '#fbbf24' }) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - 20;
    return (
      <g>
        <defs>
          <marker id={`curved-arrow-${color.replace('#','')}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={color} />
          </marker>
        </defs>
        <path 
          d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth="2" strokeDasharray="4,3"
          markerEnd={`url(#curved-arrow-${color.replace('#','')})`}
        />
      </g>
    );
  };

  // Generate visualization based on category
  const renderVisualization = () => {
    // PASSING DRILLS
    if (category === 'passing') {
      if (name.includes('triangle')) {
        return (
          <Field>
            <Player x={100} y={30} color="#3b82f6" number="A" />
            <Player x={60} y={100} color="#3b82f6" number="B" />
            <Player x={140} y={100} color="#3b82f6" number="C" />
            <Arrow x1={95} y1={38} x2={68} y2={90} color="#10b981" />
            <Arrow x1={70} y1={100} x2={130} y2={100} color="#10b981" />
            <Arrow x1={135} y1={92} x2={105} y2={38} color="#10b981" />
            <Ball x={100} y={30} />
          </Field>
        );
      }
      if (name.includes('rondo')) {
        return (
          <Field>
            <Player x={100} y={30} color="#3b82f6" number="1" />
            <Player x={60} y={55} color="#3b82f6" number="2" />
            <Player x={60} y={95} color="#3b82f6" number="3" />
            <Player x={100} y={115} color="#3b82f6" number="4" />
            <Player x={140} y={55} color="#3b82f6" number="5" />
            <Player x={140} y={95} color="#3b82f6" number="6" />
            <Player x={100} y={70} color="#ef4444" label="DEF" />
            <Ball x={100} y={30} />
            <circle cx={100} cy={70} r="45" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
          </Field>
        );
      }
      // Default passing
      return (
        <Field>
          <Player x={50} y={70} color="#3b82f6" number="A" />
          <Player x={100} y={50} color="#3b82f6" number="B" />
          <Player x={150} y={70} color="#3b82f6" number="C" />
          <Arrow x1={58} y1={68} x2={92} y2={52} color="#10b981" />
          <Arrow x1={108} y1={52} x2={142} y2={68} color="#10b981" />
          <Ball x={50} y={70} />
        </Field>
      );
    }

    // DRIBBLING DRILLS
    if (category === 'dribbling') {
      if (name.includes('cone') || name.includes('weave') || name.includes('slalom')) {
        return (
          <Field>
            <Cone x={40} y={70} />
            <Cone x={70} y={70} />
            <Cone x={100} y={70} />
            <Cone x={130} y={70} />
            <Cone x={160} y={70} />
            <Player x={25} y={70} color="#3b82f6" />
            <Ball x={32} y={70} />
            <path d="M 35 70 Q 55 55 70 70 Q 85 85 100 70 Q 115 55 130 70 Q 145 85 160 70 L 175 70" 
              fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,3" />
          </Field>
        );
      }
      if (name.includes('1v1') || name.includes('box')) {
        return (
          <Field>
            <rect x={70} y={40} width={60} height={60} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4,4" />
            <Player x={85} y={70} color="#3b82f6" label="ATT" />
            <Player x={115} y={70} color="#ef4444" label="DEF" />
            <Ball x={78} y={70} />
            <Arrow x1={92} y1={70} x2={108} y2={70} color="#fbbf24" dashed />
          </Field>
        );
      }
      // Default dribbling
      return (
        <Field>
          <Player x={40} y={70} color="#3b82f6" />
          <Ball x={47} y={70} />
          <Arrow x1={55} y1={70} x2={160} y2={70} color="#fbbf24" dashed />
          <Cone x={80} y={70} />
          <Cone x={120} y={70} />
        </Field>
      );
    }

    // SHOOTING DRILLS
    if (category === 'shooting') {
      if (name.includes('cross') || name.includes('finishing')) {
        return (
          <Field>
            <Player x={170} y={50} color="#3b82f6" label="Winger" />
            <Player x={140} y={70} color="#3b82f6" label="Striker" />
            <Player x={30} y={70} color="#22c55e" label="GK" />
            <Ball x={170} y={58} />
            <CurvedArrow x1={168} y1={55} x2={145} y2={65} color="#fff" />
            <Arrow x1={140} y1={70} x2={35} y2={70} color="#ef4444" />
          </Field>
        );
      }
      // Default shooting
      return (
        <Field>
          <Player x={100} y={90} color="#3b82f6" label="Shooter" />
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Ball x={100} y={82} />
          <Arrow x1={100} y1={80} x2={30} y2={70} color="#ef4444" />
          <Cone x={80} y={60} />
          <Cone x={120} y={60} />
        </Field>
      );
    }

    // DEFENDING DRILLS
    if (category === 'defending') {
      if (name.includes('press') || name.includes('trap')) {
        return (
          <Field>
            <Player x={60} y={50} color="#ef4444" />
            <Player x={60} y={90} color="#ef4444" />
            <Player x={100} y={70} color="#3b82f6" label="Ball" />
            <Ball x={107} y={70} />
            <Arrow x1={65} y1={55} x2={92} y2={68} color="#fbbf24" dashed />
            <Arrow x1={65} y1={85} x2={92} y2={72} color="#fbbf24" dashed />
          </Field>
        );
      }
      // Default defending
      return (
        <Field>
          <Player x={80} y={70} color="#ef4444" label="DEF" />
          <Player x={120} y={70} color="#3b82f6" label="ATT" />
          <Ball x={127} y={70} />
          <Arrow x1={85} y1={70} x2={112} y2={70} color="#fbbf24" dashed />
        </Field>
      );
    }

    // GOALKEEPING
    if (category === 'goalkeeping') {
      return (
        <Field>
          <Player x={25} y={70} color="#22c55e" label="GK" />
          <Player x={80} y={50} color="#3b82f6" />
          <Player x={80} y={90} color="#3b82f6" />
          <Ball x={87} y={50} />
          <Arrow x1={85} y1={52} x2={30} y2={68} color="#ef4444" />
          <Arrow x1={85} y1={88} x2={30} y2={72} color="#ef4444" dashed />
        </Field>
      );
    }

    // TACTICAL
    if (category === 'tactical') {
      return (
        <Field>
          {/* Defensive line */}
          <Player x={40} y={50} color="#3b82f6" />
          <Player x={40} y={70} color="#3b82f6" />
          <Player x={40} y={90} color="#3b82f6" />
          {/* Midfield */}
          <Player x={80} y={45} color="#3b82f6" />
          <Player x={80} y={70} color="#3b82f6" />
          <Player x={80} y={95} color="#3b82f6" />
          {/* Attack */}
          <Player x={130} y={55} color="#3b82f6" />
          <Player x={130} y={85} color="#3b82f6" />
          <Ball x={80} y={70} />
          <Arrow x1={85} y1={68} x2={122} y2={57} color="#10b981" />
        </Field>
      );
    }

    // SET PIECES
    if (category === 'setpieces') {
      if (name.includes('corner')) {
        return (
          <Field>
            <Ball x={190} y={10} />
            <Player x={185} y={15} color="#3b82f6" label="Taker" />
            <Player x={170} y={55} color="#3b82f6" />
            <Player x={170} y={70} color="#3b82f6" />
            <Player x={170} y={85} color="#3b82f6" />
            <Player x={180} y={70} color="#ef4444" />
            <CurvedArrow x1={185} y1={15} x2={172} y2={60} color="#fff" />
          </Field>
        );
      }
      // Free kick
      return (
        <Field>
          <Ball x={120} y={70} />
          <Player x={115} y={75} color="#3b82f6" label="Taker" />
          <Player x={150} y={60} color="#ef4444" />
          <Player x={150} y={70} color="#ef4444" />
          <Player x={150} y={80} color="#ef4444" />
          <Player x={175} y={70} color="#22c55e" label="GK" />
          <Arrow x1={125} y1={70} x2={165} y2={70} color="#fff" />
        </Field>
      );
    }

    // SMALL-SIDED GAMES
    if (category === 'smallsided') {
      return (
        <Field>
          {/* Team A */}
          <Player x={50} y={50} color="#3b82f6" />
          <Player x={50} y={90} color="#3b82f6" />
          <Player x={80} y={70} color="#3b82f6" />
          {/* Team B */}
          <Player x={150} y={50} color="#ef4444" />
          <Player x={150} y={90} color="#ef4444" />
          <Player x={120} y={70} color="#ef4444" />
          {/* GKs */}
          <Player x={20} y={70} color="#22c55e" />
          <Player x={180} y={70} color="#fbbf24" />
          <Ball x={100} y={70} />
        </Field>
      );
    }

    // CONDITIONING
    if (category === 'conditioning') {
      return (
        <Field>
          <Cone x={30} y={40} />
          <Cone x={30} y={100} />
          <Cone x={170} y={40} />
          <Cone x={170} y={100} />
          <Player x={30} y={70} color="#3b82f6" />
          <Arrow x1={35} y1={65} x2={165} y2={42} color="#fbbf24" dashed />
          <Arrow x1={165} y1={45} x2={165} y2={95} color="#fbbf24" dashed />
          <Arrow x1={165} y1={98} x2={35} y2={98} color="#fbbf24" dashed />
        </Field>
      );
    }

    // WARMUP
    if (category === 'warmup') {
      return (
        <Field>
          <Player x={60} y={50} color="#3b82f6" />
          <Player x={100} y={50} color="#3b82f6" />
          <Player x={140} y={50} color="#3b82f6" />
          <Player x={60} y={90} color="#3b82f6" />
          <Player x={100} y={90} color="#3b82f6" />
          <Player x={140} y={90} color="#3b82f6" />
          <Arrow x1={65} y1={55} x2={65} y2={85} color="#10b981" dashed />
          <Arrow x1={105} y1={55} x2={105} y2={85} color="#10b981" dashed />
          <Arrow x1={145} y1={55} x2={145} y2={85} color="#10b981" dashed />
        </Field>
      );
    }

    // Default
    return (
      <Field>
        <Player x={100} y={70} color="#3b82f6" />
        <Ball x={107} y={70} />
      </Field>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '16px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: 12,
      marginBottom: 16
    }}>
      {renderVisualization()}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginTop: 12, 
        fontSize: 11, 
        color: 'rgba(255,255,255,0.6)' 
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></span> Players
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span> Defenders
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '8px solid #f97316' }}></span> Cones
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', border: '1px solid #000' }}></span> Ball
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
      result = result.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.focusAreas?.some(a => a.toLowerCase().includes(q))
      );
    }
    return result;
  }, [safeDrillsData, selectedCategory, selectedDifficulty, selectedAgeGroup, searchQuery]);

  const getCategoryInfo = (categoryId) => drillCategories.find(c => c.id === categoryId) || { name: categoryId, icon: '⚽', color: '#6b7280' };
  
  const getDifficultyInfo = (d) => {
    const map = {
      beginner: { color: '#22c55e', label: 'Beginner' },
      intermediate: { color: '#f59e0b', label: 'Intermediate' },
      advanced: { color: '#ef4444', label: 'Advanced' }
    };
    return map[d] || { color: '#6b7280', label: d };
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedAgeGroup('all');
    setSearchQuery('');
  };

  const selectStyle = {
    padding: '10px 14px',
    background: '#1a1f1c',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
    outline: 'none',
    minWidth: 150,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 36
  };

  const DrillDetails = ({ drill, cat }) => (
    <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
      {/* VISUAL DIAGRAM */}
      <DrillVisualization drill={drill} categoryColor={cat.color} />
      
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>🎒 Equipment</h4>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{drill.equipment?.join(', ') || 'None specified'}</p>
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
        <button
          onClick={(e) => { e.stopPropagation(); onAddToSession(drill); }}
          style={{
            width: '100%', padding: '14px 20px',
            background: cat.color, color: '#fff',
            border: 'none', borderRadius: 10,
            cursor: 'pointer', fontSize: 15, fontWeight: 600
          }}
        >+ Add to Training Session</button>
      )}
    </div>
  );

  const DrillCard = ({ drill }) => {
    const isExpanded = expandedDrill === drill.id;
    const cat = getCategoryInfo(drill.category);
    const diff = getDifficultyInfo(drill.difficulty);

    if (viewMode === 'list') {
      return (
        <div 
          onClick={() => setExpandedDrill(isExpanded ? null : drill.id)}
          style={{ 
            background: isExpanded ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', 
            borderRadius: 12, 
            border: isExpanded ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)', 
            overflow: 'hidden',
            cursor: 'pointer',
            marginBottom: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 16 }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 12, 
              background: `${cat.color}20`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0
            }}>{cat.icon}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#fff' }}>{drill.name}</h3>
              <div style={{ display: 'flex', gap: 16, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                <span>⏱️ {drill.duration} min</span>
                <span>👥 {drill.players}</span>
                <span style={{ color: cat.color }}>{cat.name}</span>
              </div>
            </div>
            <span style={{ 
              fontSize: 12, padding: '6px 12px', borderRadius: 8,
              background: diff.color, color: '#fff', fontWeight: 600
            }}>{diff.label}</span>
            <div style={{ 
              color: 'rgba(255,255,255,0.4)', fontSize: 20,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>▾</div>
          </div>
          {isExpanded && <DrillDetails drill={drill} cat={cat} />}
        </div>
      );
    }

    return (
      <div style={{ 
        background: isExpanded ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)', 
        borderRadius: 16, 
        border: isExpanded ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)', 
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedDrill(isExpanded ? null : drill.id)}
          style={{ padding: 20, cursor: 'pointer', borderLeft: `4px solid ${cat.color}` }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{drill.name}</h3>
            </div>
            <span style={{ 
              fontSize: 11, padding: '4px 10px', borderRadius: 6,
              background: diff.color, color: '#fff', fontWeight: 600,
              whiteSpace: 'nowrap', flexShrink: 0
            }}>{diff.label}</span>
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
            <span>⏱️ {drill.duration} min</span>
            <span>👥 {drill.players}</span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {drill.ageGroup?.map(age => (
              <span key={age} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 6,
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)'
              }}>{age.toUpperCase()}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {drill.focusAreas?.slice(0, 3).map((a, i) => (
              <span key={i} style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 6,
                background: `${cat.color}15`, color: cat.color
              }}>{a}</span>
            ))}
          </div>

          <div style={{ 
            marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13
          }}>
            {isExpanded ? '▲ Collapse' : '▼ View Details & Diagram'}
          </div>
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
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
            {filteredDrills.length} of {safeDrillsData.length} drills
          </p>
        </div>
        {onBack && (
          <button onClick={onBack} style={{
            padding: '10px 20px', background: 'rgba(255,255,255,0.08)',
            color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
            fontSize: 14, fontWeight: 500
          }}>← Back</button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search drills by name or focus area..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%', padding: '14px 18px', marginBottom: 20,
          background: '#1a1f1c', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, color: '#fff', fontSize: 15,
          boxSizing: 'border-box', outline: 'none'
        }}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={selectStyle}>
          <option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Categories</option>
          {drillCategories.map(c => (
            <option key={c.id} value={c.id} style={{ background: '#1a1f1c', color: '#fff' }}>{c.name}</option>
          ))}
        </select>

        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} style={selectStyle}>
          <option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Difficulties</option>
          {difficultyLevels.map(d => (
            <option key={d.id} value={d.id} style={{ background: '#1a1f1c', color: '#fff' }}>{d.name}</option>
          ))}
        </select>

        <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)} style={selectStyle}>
          <option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Ages</option>
          {ageGroups.map(a => (
            <option key={a.id} value={a.id} style={{ background: '#1a1f1c', color: '#fff' }}>{a.name}</option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '10px 18px', border: 'none', cursor: 'pointer',
              borderRadius: '10px 0 0 10px', fontSize: 14, fontWeight: 500,
              background: viewMode === 'grid' ? '#10b981' : '#1a1f1c',
              color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.6)'
            }}
          >▦ Grid</button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '10px 18px', border: 'none', cursor: 'pointer',
              borderRadius: '0 10px 10px 0', fontSize: 14, fontWeight: 500,
              background: viewMode === 'list' ? '#10b981' : '#1a1f1c',
              color: viewMode === 'list' ? '#fff' : 'rgba(255,255,255,0.6)',
              borderLeft: '1px solid rgba(255,255,255,0.1)'
            }}
          >☰ List</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '10px 18px',
            background: selectedCategory === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: 'none', borderRadius: 25,
            color: selectedCategory === 'all' ? '#fff' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontSize: 14, fontWeight: 500
          }}
        >All ({safeDrillsData.length})</button>
        {drillCategories.slice(0, 6).map(c => {
          const count = safeDrillsData.filter(d => d.category === c.id).length;
          const isActive = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                padding: '10px 18px',
                background: isActive ? `${c.color}25` : 'rgba(255,255,255,0.05)',
                border: isActive ? `1px solid ${c.color}` : '1px solid transparent',
                borderRadius: 25,
                color: isActive ? c.color : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', fontSize: 14, fontWeight: 500
              }}
            >{c.icon} {c.name} ({count})</button>
          );
        })}
      </div>

      {filteredDrills.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(380px, 1fr))' : '1fr',
          gap: 20,
          alignItems: 'start'
        }}>
          {filteredDrills.map(drill => <DrillCard key={drill.id} drill={drill} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
          <p style={{ fontSize: 18, marginBottom: 24 }}>No drills found</p>
          <button onClick={clearFilters} style={{
            padding: '14px 28px', background: '#10b981',
            color: '#fff', border: 'none', borderRadius: 12,
            cursor: 'pointer', fontSize: 15, fontWeight: 600
          }}>Clear Filters</button>
        </div>
      )}
    </div>
  );
};

export default DrillsPage;
