import React, { useState, useMemo } from 'react';
import drillsData, { drillCategories, difficultyLevels, ageGroups } from './DrillData';

// 3D First-Person POV Component for attacking drills
const FirstPersonView = ({ drill, config }) => {
  const cfg = config || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: 'linear-gradient(180deg, #1a472a 0%, #0d2818 100%)', borderRadius: 12, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>👁️ First Person View</div>
      <svg viewBox="0 0 300 200" style={{ width: '100%', maxWidth: 400, borderRadius: 8, overflow: 'hidden' }}>
        <defs>
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1a365d" /><stop offset="100%" stopColor="#2d3748" /></linearGradient>
          <linearGradient id="grass" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1a472a" /><stop offset="100%" stopColor="#234d32" /></linearGradient>
          <linearGradient id="goalNet" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(255,255,255,0.1)" /><stop offset="100%" stopColor="rgba(255,255,255,0.05)" /></linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="80" fill="url(#sky)" />
        <circle cx="50" cy="20" r="15" fill="rgba(255,255,200,0.1)" /><circle cx="250" cy="20" r="15" fill="rgba(255,255,200,0.1)" />
        <circle cx="50" cy="20" r="3" fill="#fef3c7" /><circle cx="250" cy="20" r="3" fill="#fef3c7" />
        <polygon points="0,80 300,80 300,200 0,200" fill="url(#grass)" />
        <line x1="150" y1="80" x2="0" y2="200" stroke="#2d5a3d" strokeWidth="1" opacity="0.6" />
        <line x1="150" y1="80" x2="300" y2="200" stroke="#2d5a3d" strokeWidth="1" opacity="0.6" />
        <line x1="150" y1="80" x2="75" y2="200" stroke="#2d5a3d" strokeWidth="0.5" opacity="0.4" />
        <line x1="150" y1="80" x2="225" y2="200" stroke="#2d5a3d" strokeWidth="0.5" opacity="0.4" />
        <rect x="100" y="45" width="100" height="35" fill="url(#goalNet)" />
        {[0,1,2,3,4,5,6,7,8,9,10].map(i => <line key={`vn${i}`} x1={100+i*10} y1="45" x2={100+i*10} y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />)}
        {[0,1,2,3,4,5,6,7].map(i => <line key={`hn${i}`} x1="100" y1={45+i*5} x2="200" y2={45+i*5} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />)}
        <line x1="100" y1="45" x2="100" y2="80" stroke="#fff" strokeWidth="4" />
        <line x1="200" y1="45" x2="200" y2="80" stroke="#fff" strokeWidth="4" />
        <line x1="100" y1="45" x2="200" y2="45" stroke="#fff" strokeWidth="4" />
        <line x1="100" y1="45" x2="95" y2="40" stroke="#ddd" strokeWidth="2" />
        <line x1="200" y1="45" x2="205" y2="40" stroke="#ddd" strokeWidth="2" />
        <line x1="95" y1="40" x2="205" y2="40" stroke="#ddd" strokeWidth="2" />
        {cfg.gk !== false && <g><ellipse cx={cfg.gkX||150} cy="82" rx="12" ry="3" fill="rgba(0,0,0,0.3)" /><ellipse cx={cfg.gkX||150} cy="72" rx="8" ry="12" fill="#22c55e" /><circle cx={cfg.gkX||150} cy="58" r="6" fill="#fcd34d" /><line x1={(cfg.gkX||150)-15} y1="68" x2={(cfg.gkX||150)+15} y2="68" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" /><circle cx={(cfg.gkX||150)-15} cy="68" r="4" fill="#f59e0b" /><circle cx={(cfg.gkX||150)+15} cy="68" r="4" fill="#f59e0b" /></g>}
        {cfg.defenders?.map((d,i) => <g key={i}><ellipse cx={d.x} cy={d.y+8} rx={d.size||10} ry="3" fill="rgba(0,0,0,0.3)" /><ellipse cx={d.x} cy={d.y} rx={d.size||10} ry={(d.size||10)*1.3} fill="#ef4444" /><circle cx={d.x} cy={d.y-(d.size||10)-2} r={(d.size||10)*0.6} fill="#fcd34d" /></g>)}
        {cfg.teammates?.map((t,i) => <g key={i}><ellipse cx={t.x} cy={t.y+8} rx={t.size||10} ry="3" fill="rgba(0,0,0,0.3)" /><ellipse cx={t.x} cy={t.y} rx={t.size||10} ry={(t.size||10)*1.3} fill="#3b82f6" /><circle cx={t.x} cy={t.y-(t.size||10)-2} r={(t.size||10)*0.6} fill="#fcd34d" />{t.label && <text x={t.x} y={t.y+3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">{t.label}</text>}</g>)}
        {cfg.server && <g><ellipse cx={cfg.server.x} cy={cfg.server.y+8} rx="12" ry="4" fill="rgba(0,0,0,0.3)" /><ellipse cx={cfg.server.x} cy={cfg.server.y} rx="12" ry="16" fill="#3b82f6" /><circle cx={cfg.server.x} cy={cfg.server.y-14} r="7" fill="#fcd34d" /><text x={cfg.server.x} y={cfg.server.y+4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">{cfg.server.label||'S'}</text></g>}
        {cfg.ballPath && <path d={cfg.ballPath} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="8,4" opacity="0.6" />}
        {cfg.crossPath && <path d={cfg.crossPath} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,4" opacity="0.8" />}
        {cfg.targetZone && <ellipse cx={cfg.targetZone.x} cy={cfg.targetZone.y} rx={cfg.targetZone.rx||20} ry={cfg.targetZone.ry||8} fill="rgba(16,185,129,0.3)" stroke="#10b981" strokeWidth="2" strokeDasharray="4,2" />}
        <g><ellipse cx="150" cy="195" rx="12" ry="4" fill="rgba(0,0,0,0.4)" /><circle cx="150" cy="185" r="12" fill="#fff" stroke="#333" strokeWidth="1" /><path d="M145 180 L150 185 L155 180 M145 190 L150 185 L155 190" stroke="#333" strokeWidth="1" fill="none" /></g>
        <ellipse cx="165" cy="195" rx="15" ry="6" fill="#1a1a1a" />
        {cfg.shotTargets?.map((t,i) => <g key={i}><circle cx={t.x} cy={t.y} r="8" fill="none" stroke="#10b981" strokeWidth="2" /><circle cx={t.x} cy={t.y} r="3" fill="#10b981" /></g>)}
        {cfg.instruction && <text x="150" y="15" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">{cfg.instruction}</text>}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }}></span> GK</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></span> Defenders</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></span> Teammates</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #10b981' }}></span> Target</span>
      </div>
    </div>
  );
};

// Top-Down Field View Component
const TopDownView = ({ drill, config }) => {
  const cfg = config || {};
  const isSmall = cfg.type === 'small';
  const viewBox = isSmall ? '0 0 120 120' : '0 0 200 140';
  const maxWidth = isSmall ? 260 : 320;
  const colors = { blue: '#3b82f6', red: '#ef4444', gk: '#22c55e', green: '#10b981', yellow: '#fbbf24', white: '#ffffff', orange: '#f97316' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>📐 Top-Down View</div>
      <svg viewBox={viewBox} style={{ width: '100%', maxWidth, background: '#1a472a', borderRadius: 8, border: '2px solid #2d5a3d' }}>
        {isSmall ? <rect x="10" y="10" width="100" height="100" fill="none" stroke="#3d7a4a" strokeWidth="2" strokeDasharray="5,5" /> : <>
          <rect x="5" y="5" width="190" height="130" fill="none" stroke="#3d7a4a" strokeWidth="2" />
          <line x1="100" y1="5" x2="100" y2="135" stroke="#3d7a4a" strokeWidth="1.5" />
          <circle cx="100" cy="70" r="20" fill="none" stroke="#3d7a4a" strokeWidth="1.5" />
          <rect x="5" y="35" width="30" height="70" fill="none" stroke="#3d7a4a" strokeWidth="1" />
          <rect x="165" y="35" width="30" height="70" fill="none" stroke="#3d7a4a" strokeWidth="1" />
          <rect x="5" y="50" width="3" height="40" fill="#fff" opacity="0.5" />
          <rect x="192" y="50" width="3" height="40" fill="#fff" opacity="0.5" />
        </>}
        {cfg.shapes?.map((s,i) => s.type==='rect' ? <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.fill||'none'} stroke={s.stroke||'#fff'} strokeWidth="1.5" strokeDasharray={s.dashed?"5,5":"0"} opacity={s.opacity||0.4} /> : s.type==='circle' ? <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.fill||'none'} stroke={s.stroke||'#fff'} strokeWidth="1.5" strokeDasharray={s.dashed?"5,5":"0"} opacity={s.opacity||0.4} /> : null)}
        {cfg.lines?.map((l,i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={colors[l.color]||l.color||'#fbbf24'} strokeWidth={l.width||1.5} strokeDasharray={l.dashed?"4,4":"0"} opacity={l.opacity||1} />)}
        {cfg.paths?.map((p,i) => <path key={i} d={p.d} fill="none" stroke={colors[p.color]||p.color||'#fbbf24'} strokeWidth={p.width||2} strokeDasharray={p.dashed!==false?"5,4":"0"} />)}
        {cfg.zones?.map((z,i) => <rect key={i} x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color||'rgba(16,185,129,0.2)'} stroke={z.border||'#10b981'} strokeWidth="1" strokeDasharray="3,3" rx="4" />)}
        {cfg.cones?.map((c,i) => <polygon key={i} points={`${c.x},${c.y-6} ${c.x-5},${c.y+4} ${c.x+5},${c.y+4}`} fill="#f97316" stroke="#fff" strokeWidth="1" />)}
        {cfg.arrows?.map((a,i) => { const id=`arr${drill.id}-${i}`; const color=colors[a.color]||a.color||'#10b981'; return <g key={i}><defs><marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={color} /></marker></defs><line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={color} strokeWidth={a.width||2} strokeDasharray={a.dashed?"5,4":"0"} markerEnd={`url(#${id})`} /></g>; })}
        {cfg.curves?.map((c,i) => { const id=`crv${drill.id}-${i}`; const color=colors[c.color]||c.color||'#10b981'; const midX=(c.x1+c.x2)/2+(c.curveX||0); const midY=(c.y1+c.y2)/2+(c.curveY||c.curve||-20); return <g key={i}><defs><marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={color} /></marker></defs><path d={`M ${c.x1} ${c.y1} Q ${midX} ${midY} ${c.x2} ${c.y2}`} fill="none" stroke={color} strokeWidth={c.width||2} strokeDasharray={c.dashed?"5,4":"0"} markerEnd={`url(#${id})`} /></g>; })}
        {cfg.players?.map((p,i) => { const color=colors[p.color]||p.color||'#3b82f6'; const size=p.size||10; return <g key={i}><circle cx={p.x} cy={p.y} r={size} fill={color} stroke="#fff" strokeWidth="2" />{p.label && <text x={p.x} y={p.y+3} textAnchor="middle" fill="#fff" fontSize={p.labelSize||8} fontWeight="bold">{p.label}</text>}</g>; })}
        {cfg.ball && <circle cx={cfg.ball.x} cy={cfg.ball.y} r={cfg.ball.size||5} fill="#fff" stroke="#333" strokeWidth="1" />}
        {cfg.text?.map((t,i) => <text key={i} x={t.x} y={t.y} textAnchor="middle" fill={t.color||'#fff'} fontSize={t.size||8} opacity={t.opacity||0.8} fontWeight={t.bold?'bold':'normal'}>{t.content}</text>)}
      </svg>
      <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></span> Attackers</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span> Defenders</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></span> GK</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '8px solid #f97316' }}></span> Cones</span>
      </div>
    </div>
  );
};


// INDIVIDUAL DRILL CONFIGS - ALL 155 DRILLS
const drillConfigs = {
  // PASSING (1-25)
  1: { view: 'topdown', type: 'small', players: [{ x: 60, y: 18, color: 'blue', label: 'A' }, { x: 100, y: 95, color: 'blue', label: 'B' }, { x: 20, y: 95, color: 'blue', label: 'C' }], cones: [{ x: 60, y: 18 }, { x: 100, y: 95 }, { x: 20, y: 95 }], ball: { x: 52, y: 23 }, arrows: [{ x1: 55, y1: 26, x2: 28, y2: 85, color: 'green' }], text: [{ x: 60, y: 110, content: 'Triangle passing', size: 8 }] },
  2: { view: 'topdown', type: 'small', players: [{ x: 60, y: 15, color: 'blue', label: '1' }, { x: 105, y: 60, color: 'blue', label: '2' }, { x: 60, y: 105, color: 'blue', label: '3' }, { x: 15, y: 60, color: 'blue', label: '4' }, { x: 60, y: 60, color: 'red', label: 'D' }], ball: { x: 52, y: 20 }, shapes: [{ type: 'rect', x: 15, y: 15, w: 90, h: 90, dashed: true }], text: [{ x: 60, y: 8, content: '4v1 Rondo', size: 8 }] },
  3: { view: 'topdown', type: 'small', players: [{ x: 60, y: 10, color: 'blue', label: '1' }, { x: 105, y: 35, color: 'blue', label: '2' }, { x: 90, y: 95, color: 'blue', label: '3' }, { x: 30, y: 95, color: 'blue', label: '4' }, { x: 15, y: 35, color: 'blue', label: '5' }, { x: 50, y: 55, color: 'red' }, { x: 70, y: 70, color: 'red' }], ball: { x: 52, y: 15 }, shapes: [{ type: 'circle', x: 60, y: 55, r: 48, dashed: true }] },
  4: { view: 'topdown', type: 'field', players: [{ x: 45, y: 70, color: 'blue', label: '1' }, { x: 100, y: 70, color: 'blue', label: '2' }, { x: 130, y: 70, color: 'red', label: 'D' }], ball: { x: 53, y: 68 }, arrows: [{ x1: 55, y1: 68, x2: 92, y2: 68, color: 'green' }], curves: [{ x1: 50, y1: 75, x2: 145, y2: 50, curve: 35, color: 'yellow', dashed: true }], text: [{ x: 100, y: 95, content: 'Wall pass', size: 8 }] },
  5: { view: 'topdown', type: 'field', players: [{ x: 35, y: 100, color: 'blue', label: 'Pass' }, { x: 165, y: 40, color: 'blue', label: 'Recv' }], cones: [{ x: 155, y: 30 }, { x: 175, y: 30 }, { x: 155, y: 50 }, { x: 175, y: 50 }], ball: { x: 43, y: 98 }, curves: [{ x1: 45, y1: 95, x2: 160, y2: 42, curve: -40, color: 'white' }], zones: [{ x: 155, y: 30, w: 20, h: 20 }] },
  6: { view: 'topdown', type: 'field', players: [{ x: 30, y: 95, color: 'blue', label: 'LB' }, { x: 100, y: 70, color: 'blue', label: 'CM' }, { x: 170, y: 45, color: 'blue', label: 'RW' }], ball: { x: 38, y: 93 }, arrows: [{ x1: 40, y1: 93, x2: 92, y2: 72, color: 'green' }], curves: [{ x1: 105, y1: 68, x2: 162, y2: 48, curve: -20, color: 'yellow' }], text: [{ x: 100, y: 115, content: 'Switch play', size: 8 }] },
  7: { view: 'topdown', type: 'small', players: [{ x: 60, y: 105, color: 'blue', label: '1' }, { x: 60, y: 60, color: 'blue', label: '2' }, { x: 25, y: 18, color: 'blue', label: '3' }, { x: 95, y: 18, color: 'blue', label: '4' }], cones: [{ x: 60, y: 105 }, { x: 60, y: 60 }, { x: 25, y: 18 }, { x: 95, y: 18 }], ball: { x: 52, y: 100 }, arrows: [{ x1: 55, y1: 98, x2: 55, y2: 68, color: 'green' }] },
  8: { view: 'topdown', type: 'field', players: [{ x: 50, y: 90, color: 'blue', label: 'Pass' }, { x: 145, y: 50, color: 'blue', label: 'Run' }, { x: 100, y: 60, color: 'red' }, { x: 100, y: 80, color: 'red' }], cones: [{ x: 130, y: 55 }, { x: 130, y: 75 }], ball: { x: 58, y: 88 }, arrows: [{ x1: 60, y1: 88, x2: 125, y2: 65, color: 'green' }], text: [{ x: 130, y: 90, content: 'Through gate', size: 8 }] },
  9: { view: 'topdown', type: 'field', players: [{ x: 50, y: 95, color: 'blue', label: 'FB' }, { x: 95, y: 70, color: 'blue', label: 'W' }, { x: 125, y: 75, color: 'red', label: 'D' }], ball: { x: 58, y: 93 }, arrows: [{ x1: 60, y1: 93, x2: 88, y2: 72, color: 'green' }], curves: [{ x1: 55, y1: 98, x2: 155, y2: 45, curve: 45, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Overlap run', size: 8 }] },
  10: { view: 'topdown', type: 'small', players: [{ x: 20, y: 60, color: 'blue', label: '1' }, { x: 60, y: 60, color: 'blue', label: 'P' }, { x: 100, y: 60, color: 'blue', label: '2' }, { x: 60, y: 45, color: 'red', label: 'D' }], ball: { x: 28, y: 58 }, arrows: [{ x1: 30, y1: 58, x2: 52, y2: 58, color: 'green' }, { x1: 68, y1: 62, x2: 92, y2: 62, color: 'green' }], text: [{ x: 60, y: 95, content: 'Pivot passing', size: 8 }] },
  11: { view: 'topdown', type: 'small', players: [{ x: 60, y: 15, color: 'blue' }, { x: 98, y: 38, color: 'blue' }, { x: 98, y: 82, color: 'blue' }, { x: 60, y: 105, color: 'blue' }, { x: 22, y: 82, color: 'blue' }, { x: 22, y: 38, color: 'blue' }], ball: { x: 52, y: 20 }, shapes: [{ type: 'circle', x: 60, y: 60, r: 45, dashed: true }], text: [{ x: 60, y: 8, content: 'One touch circle', size: 8 }] },
  12: { view: 'topdown', type: 'field', players: [{ x: 40, y: 105, color: 'blue', label: '1' }, { x: 100, y: 60, color: 'blue', label: '2' }, { x: 160, y: 105, color: 'blue', label: '3' }], cones: [{ x: 40, y: 105 }, { x: 100, y: 60 }, { x: 160, y: 105 }], ball: { x: 48, y: 103 }, arrows: [{ x1: 50, y1: 102, x2: 92, y2: 65, color: 'green' }, { x1: 108, y1: 62, x2: 152, y2: 100, color: 'white', dashed: true }] },
  13: { view: 'topdown', type: 'small', players: [{ x: 18, y: 18, color: 'blue', label: '1' }, { x: 102, y: 18, color: 'blue', label: '2' }, { x: 102, y: 102, color: 'blue', label: '3' }, { x: 18, y: 102, color: 'blue', label: '4' }, { x: 60, y: 60, color: 'red', label: 'D' }], ball: { x: 26, y: 18 }, shapes: [{ type: 'rect', x: 18, y: 18, w: 84, h: 84, dashed: true }] },
  14: { view: 'topdown', type: 'field', players: [{ x: 50, y: 95, color: 'blue', label: '1' }, { x: 100, y: 70, color: 'blue', label: '2' }, { x: 150, y: 95, color: 'blue', label: '3' }], ball: { x: 58, y: 93 }, arrows: [{ x1: 60, y1: 92, x2: 92, y2: 72, color: 'green' }], curves: [{ x1: 108, y1: 68, x2: 165, y2: 50, curve: -20, color: 'green' }, { x1: 155, y1: 92, x2: 170, y2: 55, curve: 25, color: 'yellow', dashed: true }], text: [{ x: 150, y: 110, content: '3rd man', size: 8 }] },
  15: { view: 'topdown', type: 'small', players: [{ x: 25, y: 60, color: 'blue', label: '1' }, { x: 95, y: 60, color: 'blue', label: '2' }, { x: 80, y: 55, color: 'red', label: 'D' }], ball: { x: 33, y: 58 }, arrows: [{ x1: 35, y1: 58, x2: 70, y2: 58, color: 'green' }], text: [{ x: 60, y: 95, content: 'Receive under pressure', size: 8 }] },
  16: { view: 'topdown', type: 'small', players: [{ x: 25, y: 60, color: 'blue', label: '1' }, { x: 95, y: 60, color: 'blue', label: '2' }], cones: [{ x: 95, y: 40 }, { x: 95, y: 80 }], ball: { x: 33, y: 58 }, arrows: [{ x1: 35, y1: 58, x2: 85, y2: 58, color: 'green' }], text: [{ x: 60, y: 100, content: 'Back foot receive', size: 8 }] },
  17: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 55, y: 45, color: 'blue', label: 'CB' }, { x: 55, y: 95, color: 'blue', label: 'CB' }, { x: 100, y: 70, color: 'blue', label: 'CM' }, { x: 130, y: 50, color: 'red' }, { x: 130, y: 90, color: 'red' }], ball: { x: 33, y: 68 }, arrows: [{ x1: 35, y1: 68, x2: 48, y2: 48, color: 'green' }], text: [{ x: 100, y: 115, content: 'Build from back', size: 8 }] },
  18: { view: 'topdown', type: 'field', players: [{ x: 30, y: 70, color: 'blue', label: 'A' }, { x: 75, y: 50, color: 'blue', label: 'B' }, { x: 120, y: 70, color: 'blue', label: 'C' }, { x: 165, y: 50, color: 'blue', label: 'D' }], cones: [{ x: 30, y: 70 }, { x: 75, y: 50 }, { x: 120, y: 70 }, { x: 165, y: 50 }], ball: { x: 38, y: 68 }, arrows: [{ x1: 40, y1: 68, x2: 67, y2: 53, color: 'green' }] },
  19: { view: 'topdown', type: 'small', players: [{ x: 25, y: 30, color: 'blue' }, { x: 60, y: 18, color: 'blue' }, { x: 95, y: 30, color: 'blue' }, { x: 25, y: 90, color: 'blue' }, { x: 60, y: 102, color: 'blue' }, { x: 95, y: 90, color: 'blue' }, { x: 45, y: 60, color: 'red' }, { x: 75, y: 60, color: 'red' }], ball: { x: 60, y: 26 }, shapes: [{ type: 'rect', x: 15, y: 15, w: 90, h: 90, dashed: true }], text: [{ x: 60, y: 8, content: '6v2 two-touch', size: 8 }] },
  20: { view: 'topdown', type: 'field', players: [{ x: 50, y: 110, color: 'blue', label: '1' }, { x: 50, y: 70, color: 'blue', label: '2' }, { x: 50, y: 30, color: 'blue', label: '3' }, { x: 150, y: 110, color: 'blue', label: '4' }, { x: 150, y: 70, color: 'blue', label: '5' }, { x: 150, y: 30, color: 'blue', label: '6' }], ball: { x: 50, y: 102 }, arrows: [{ x1: 50, y1: 100, x2: 50, y2: 80, color: 'green' }], lines: [{ x1: 50, y1: 5, x2: 50, y2: 135, color: 'yellow', dashed: true, opacity: 0.3 }, { x1: 150, y1: 5, x2: 150, y2: 135, color: 'yellow', dashed: true, opacity: 0.3 }] },
  21: { view: 'topdown', type: 'small', players: [{ x: 20, y: 60, color: 'blue', label: '1' }, { x: 60, y: 60, color: 'blue', label: '2' }, { x: 100, y: 60, color: 'blue', label: '3' }], ball: { x: 28, y: 58 }, arrows: [{ x1: 30, y1: 58, x2: 52, y2: 58, color: 'green' }, { x1: 68, y1: 62, x2: 92, y2: 62, color: 'green' }], text: [{ x: 60, y: 95, content: 'Bounce pass', size: 8 }] },
  22: { view: 'firstperson', gkX: 150, defenders: [{ x: 130, y: 95, size: 12 }, { x: 170, y: 95, size: 12 }], teammates: [{ x: 120, y: 110, size: 14, label: 'ST' }], server: { x: 260, y: 130, label: 'W' }, crossPath: 'M 255 125 Q 200 60 130 95', instruction: 'Attack the cross', targetZone: { x: 150, y: 65, rx: 25, ry: 10 } },
  23: { view: 'topdown', type: 'field', cones: [{ x: 40, y: 40 }, { x: 100, y: 40 }, { x: 160, y: 40 }, { x: 40, y: 100 }, { x: 100, y: 100 }, { x: 160, y: 100 }], players: [{ x: 40, y: 40, color: 'blue', label: '1' }, { x: 100, y: 40, color: 'blue', label: '2' }, { x: 160, y: 40, color: 'blue', label: '3' }], ball: { x: 48, y: 38 }, arrows: [{ x1: 50, y1: 40, x2: 90, y2: 40, color: 'green' }, { x1: 45, y1: 48, x2: 45, y2: 90, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Pass & move', size: 8 }] },
  24: { view: 'topdown', type: 'field', players: [{ x: 50, y: 70, color: 'blue', label: '1' }, { x: 150, y: 70, color: 'blue', label: '2' }], ball: { x: 58, y: 65 }, curves: [{ x1: 60, y1: 65, x2: 142, y2: 65, curve: -35, color: 'white' }], text: [{ x: 100, y: 95, content: 'Aerial control', size: 8 }] },
  25: { view: 'topdown', type: 'field', cones: [{ x: 30, y: 50 }, { x: 30, y: 90 }, { x: 100, y: 70 }, { x: 170, y: 50 }, { x: 170, y: 90 }], players: [{ x: 40, y: 70, color: 'blue', label: '1' }, { x: 100, y: 70, color: 'blue', label: '2' }, { x: 160, y: 70, color: 'blue', label: '3' }], ball: { x: 48, y: 68 }, arrows: [{ x1: 50, y1: 68, x2: 90, y2: 68, color: 'green' }], text: [{ x: 100, y: 110, content: 'Passing under fatigue', size: 8 }] },
  // DRIBBLING (26-50)
  26: { view: 'topdown', type: 'field', cones: [{ x: 50, y: 70 }, { x: 80, y: 70 }, { x: 110, y: 70 }, { x: 140, y: 70 }, { x: 170, y: 70 }], players: [{ x: 25, y: 70, color: 'blue' }], ball: { x: 33, y: 68 }, paths: [{ d: 'M 38 70 Q 65 50 80 70 Q 95 90 110 70 Q 125 50 140 70 Q 155 90 170 70 L 185 70', color: 'yellow' }], text: [{ x: 100, y: 100, content: 'Weave through cones', size: 8 }] },
  27: { view: 'topdown', type: 'small', players: [{ x: 40, y: 60, color: 'blue', label: 'ATT' }, { x: 80, y: 60, color: 'red', label: 'DEF' }], ball: { x: 48, y: 58 }, cones: [{ x: 20, y: 25 }, { x: 100, y: 25 }, { x: 20, y: 95 }, { x: 100, y: 95 }], shapes: [{ type: 'rect', x: 20, y: 25, w: 80, h: 70, dashed: true }], text: [{ x: 60, y: 110, content: '1v1 box', size: 8 }] },
  28: { view: 'topdown', type: 'small', players: [{ x: 60, y: 60, color: 'blue' }], ball: { x: 60, y: 48 }, shapes: [{ type: 'circle', x: 60, y: 60, r: 25, dashed: true }], text: [{ x: 60, y: 100, content: 'Ball mastery', size: 8 }] },
  29: { view: 'topdown', type: 'field', cones: [{ x: 30, y: 45 }, { x: 30, y: 95 }, { x: 170, y: 45 }, { x: 170, y: 95 }], players: [{ x: 40, y: 45, color: 'blue', label: '1' }, { x: 40, y: 95, color: 'blue', label: '2' }], ball: { x: 48, y: 43 }, arrows: [{ x1: 50, y1: 45, x2: 160, y2: 45, color: 'yellow', dashed: true }, { x1: 50, y1: 95, x2: 160, y2: 95, color: 'yellow', dashed: true }], text: [{ x: 100, y: 70, content: 'Race!', size: 10, bold: true }] },
  30: { view: 'topdown', type: 'small', players: [{ x: 35, y: 60, color: 'blue' }], cones: [{ x: 80, y: 60 }], ball: { x: 43, y: 58 }, arrows: [{ x1: 48, y1: 58, x2: 72, y2: 58, color: 'yellow', dashed: true }], curves: [{ x1: 75, y1: 55, x2: 100, y2: 40, curve: -15, color: 'green', dashed: true }], text: [{ x: 60, y: 100, content: 'Skill move', size: 8 }] },
  31: { view: 'topdown', type: 'small', players: [{ x: 60, y: 52, color: 'blue', label: 'ATT' }, { x: 60, y: 85, color: 'red', label: 'DEF' }], ball: { x: 52, y: 48 }, shapes: [{ type: 'circle', x: 60, y: 60, r: 35, dashed: true }], text: [{ x: 60, y: 110, content: 'Shield the ball', size: 8 }] },
  32: { view: 'topdown', type: 'small', cones: [{ x: 35, y: 35 }, { x: 85, y: 35 }, { x: 35, y: 85 }, { x: 85, y: 85 }], players: [{ x: 60, y: 60, color: 'blue' }], ball: { x: 68, y: 58 }, shapes: [{ type: 'rect', x: 35, y: 35, w: 50, h: 50, dashed: true }], text: [{ x: 60, y: 105, content: 'Tight space', size: 8 }] },
  33: { view: 'firstperson', gkX: 150, defenders: [{ x: 120, y: 110, size: 14 }, { x: 180, y: 115, size: 13 }], ballPath: 'M 150 185 Q 140 140 135 100', shotTargets: [{ x: 120, y: 62 }, { x: 180, y: 62 }], instruction: 'Dribble & shoot' },
  34: { view: 'topdown', type: 'field', cones: [{ x: 60, y: 55 }, { x: 60, y: 85 }, { x: 100, y: 55 }, { x: 100, y: 85 }, { x: 140, y: 55 }, { x: 140, y: 85 }], players: [{ x: 30, y: 70, color: 'blue' }, { x: 80, y: 70, color: 'red' }, { x: 120, y: 70, color: 'red' }], ball: { x: 38, y: 68 }, arrows: [{ x1: 42, y1: 68, x2: 170, y2: 68, color: 'yellow', dashed: true }], text: [{ x: 100, y: 100, content: 'The gauntlet', size: 8 }] },
  35: { view: 'topdown', type: 'field', cones: [{ x: 60, y: 70 }, { x: 140, y: 70 }], players: [{ x: 100, y: 70, color: 'blue' }], ball: { x: 100, y: 62 }, arrows: [{ x1: 92, y1: 70, x2: 68, y2: 70, color: 'yellow', dashed: true }, { x1: 108, y1: 70, x2: 132, y2: 70, color: 'yellow', dashed: true }], text: [{ x: 100, y: 95, content: 'Turn & accelerate', size: 8 }] },
  36: { view: 'topdown', type: 'small', players: [{ x: 30, y: 35, color: 'blue' }, { x: 90, y: 35, color: 'blue' }, { x: 30, y: 85, color: 'blue' }, { x: 90, y: 85, color: 'blue' }, { x: 60, y: 60, color: 'red', label: 'IT' }], shapes: [{ type: 'rect', x: 15, y: 15, w: 90, h: 90, dashed: true }], text: [{ x: 60, y: 8, content: 'Dribble tag', size: 8 }] },
  37: { view: 'topdown', type: 'small', cones: [{ x: 40, y: 60 }, { x: 80, y: 60 }], players: [{ x: 20, y: 60, color: 'blue' }], ball: { x: 28, y: 58 }, paths: [{ d: 'M 32 60 Q 60 30 80 60 Q 60 90 40 60 Q 60 30 80 60', color: 'yellow' }], text: [{ x: 60, y: 100, content: 'Figure 8', size: 8 }] },
  38: { view: 'firstperson', gkX: 155, defenders: [{ x: 100, y: 100, size: 13 }, { x: 170, y: 95, size: 14 }], teammates: [{ x: 130, y: 105, size: 14, label: 'ST' }], crossPath: 'M 150 185 Q 180 120 130 95', instruction: 'Beat & cross', targetZone: { x: 140, y: 70, rx: 30, ry: 12 } },
  39: { view: 'firstperson', gkX: 150, defenders: [{ x: 130, y: 105, size: 12 }, { x: 170, y: 108, size: 12 }], shotTargets: [{ x: 115, y: 60 }, { x: 185, y: 60 }], instruction: 'Dribble then shoot', ballPath: 'M 150 185 Q 130 140 115 60' },
  40: { view: 'topdown', type: 'small', players: [{ x: 20, y: 60, color: 'blue' }], ball: { x: 28, y: 58 }, shapes: [{ type: 'rect', x: 45, y: 25, w: 30, h: 70 }], lines: [{ x1: 45, y1: 35, x2: 75, y2: 35 }, { x1: 45, y1: 45, x2: 75, y2: 45 }, { x1: 45, y1: 55, x2: 75, y2: 55 }, { x1: 45, y1: 65, x2: 75, y2: 65 }, { x1: 45, y1: 75, x2: 75, y2: 75 }], arrows: [{ x1: 32, y1: 60, x2: 42, y2: 30, color: 'yellow', dashed: true }], text: [{ x: 60, y: 110, content: 'Ladder dribble', size: 8 }] },
  41: { view: 'topdown', type: 'small', players: [{ x: 35, y: 60, color: 'blue', label: 'Lead' }, { x: 85, y: 60, color: 'blue', label: 'Copy' }], ball: { x: 43, y: 58 }, arrows: [{ x1: 48, y1: 65, x2: 78, y2: 65, color: 'yellow', dashed: true }], text: [{ x: 60, y: 95, content: 'Shadow dribble', size: 8 }] },
  42: { view: 'topdown', type: 'small', cones: [{ x: 80, y: 60 }], players: [{ x: 35, y: 60, color: 'blue' }], ball: { x: 43, y: 58 }, arrows: [{ x1: 48, y1: 55, x2: 72, y2: 45, color: 'yellow', dashed: true }], curves: [{ x1: 48, y1: 62, x2: 100, y2: 75, curve: 20, color: 'green', dashed: true }], text: [{ x: 60, y: 100, content: 'Body feints', size: 8 }] },
  43: { view: 'topdown', type: 'field', players: [{ x: 40, y: 70, color: 'blue' }, { x: 70, y: 50, color: 'red' }, { x: 70, y: 90, color: 'red' }], ball: { x: 48, y: 68 }, arrows: [{ x1: 52, y1: 68, x2: 110, y2: 68, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Beat the press', size: 8 }] },
  44: { view: 'topdown', type: 'field', cones: [{ x: 45, y: 50 }, { x: 65, y: 90 }, { x: 85, y: 50 }, { x: 105, y: 90 }, { x: 125, y: 50 }, { x: 145, y: 90 }], players: [{ x: 25, y: 70, color: 'blue' }], ball: { x: 33, y: 68 }, paths: [{ d: 'M 38 70 L 45 53 L 65 87 L 85 53 L 105 87 L 125 53 L 145 87 L 170 70', color: 'yellow' }] },
  45: { view: 'topdown', type: 'small', cones: [{ x: 30, y: 30 }, { x: 90, y: 30 }, { x: 30, y: 90 }, { x: 90, y: 90 }], players: [{ x: 60, y: 60, color: 'blue' }, { x: 60, y: 35, color: 'red' }], ball: { x: 68, y: 58 }, shapes: [{ type: 'rect', x: 30, y: 30, w: 60, h: 60, dashed: true }], arrows: [{ x1: 65, y1: 65, x2: 85, y2: 85, color: 'green', dashed: true }], text: [{ x: 60, y: 108, content: 'Escape box', size: 8 }] },
  46: { view: 'topdown', type: 'small', cones: [{ x: 75, y: 60 }], players: [{ x: 35, y: 60, color: 'blue' }], ball: { x: 43, y: 58 }, arrows: [{ x1: 48, y1: 58, x2: 68, y2: 58, color: 'yellow', dashed: true }, { x1: 73, y1: 55, x2: 85, y2: 35, color: 'green', dashed: true }, { x1: 73, y1: 65, x2: 85, y2: 85, color: 'green', dashed: true }], text: [{ x: 60, y: 100, content: 'Ronaldo chops', size: 8 }] },
  47: { view: 'topdown', type: 'small', players: [{ x: 40, y: 35, color: 'blue', label: '1' }, { x: 40, y: 80, color: 'blue', label: '2' }, { x: 60, y: 88, color: 'red' }], ball: { x: 40, y: 43 }, arrows: [{ x1: 40, y1: 45, x2: 40, y2: 72, color: 'green' }], curves: [{ x1: 45, y1: 78, x2: 95, y2: 60, curve: 25, color: 'yellow', dashed: true }], text: [{ x: 60, y: 108, content: 'Blind side turn', size: 8 }] },
  48: { view: 'topdown', type: 'field', cones: [{ x: 35, y: 35 }, { x: 85, y: 35 }, { x: 135, y: 35 }, { x: 35, y: 105 }, { x: 85, y: 105 }, { x: 135, y: 105 }], players: [{ x: 35, y: 70, color: 'blue' }], ball: { x: 43, y: 68 }, paths: [{ d: 'M 40 65 L 40 40 L 80 40 L 80 100 L 130 100 L 130 40 L 170 70', color: 'yellow' }], text: [{ x: 100, y: 120, content: 'Fitness circuit', size: 8 }] },
  49: { view: 'topdown', type: 'small', cones: [{ x: 50, y: 45 }, { x: 70, y: 75 }, { x: 50, y: 95 }], players: [{ x: 30, y: 70, color: 'blue' }], ball: { x: 38, y: 68 }, paths: [{ d: 'M 40 70 Q 55 40 70 70 Q 55 100 40 70', color: 'yellow' }], text: [{ x: 60, y: 110, content: 'Messi patterns', size: 8 }] },
  50: { view: 'topdown', type: 'small', players: [{ x: 25, y: 45, color: 'blue' }, { x: 25, y: 75, color: 'blue' }, { x: 95, y: 45, color: 'red' }, { x: 95, y: 75, color: 'red' }], ball: { x: 33, y: 45 }, cones: [{ x: 12, y: 30 }, { x: 12, y: 90 }, { x: 108, y: 30 }, { x: 108, y: 90 }], shapes: [{ type: 'rect', x: 12, y: 30, w: 96, h: 60, dashed: true }], text: [{ x: 60, y: 105, content: '2v2 dribble', size: 8 }] },
  // SHOOTING (51-75) - All 3D First Person Views
  51: { view: 'firstperson', gkX: 150, defenders: [], shotTargets: [{ x: 115, y: 55 }, { x: 150, y: 70 }, { x: 185, y: 55 }], instruction: 'Pick your corner' },
  52: { view: 'firstperson', gkX: 155, defenders: [{ x: 140, y: 95, size: 13 }], server: { x: 40, y: 120, label: 'W' }, crossPath: 'M 45 115 Q 90 50 150 80', instruction: 'Finish the cross', targetZone: { x: 150, y: 70, rx: 25, ry: 10 } },
  53: { view: 'firstperson', gkX: 150, defenders: [], teammates: [{ x: 80, y: 140, size: 12, label: 'S' }], crossPath: 'M 85 135 L 145 175', shotTargets: [{ x: 120, y: 60 }, { x: 180, y: 60 }], instruction: 'One touch finish' },
  54: { view: 'firstperson', gkX: 150, defenders: [{ x: 170, y: 130, size: 15 }], shotTargets: [{ x: 115, y: 58 }, { x: 185, y: 58 }], instruction: 'Quick release!', ballPath: 'M 150 185 L 120 60' },
  55: { view: 'firstperson', gkX: 130, defenders: [], ballPath: 'M 150 185 Q 150 80 150 55', instruction: 'Chip the keeper', targetZone: { x: 170, y: 55, rx: 20, ry: 8 } },
  56: { view: 'firstperson', gkX: 150, defenders: [], server: { x: 260, y: 140, label: 'S' }, crossPath: 'M 255 135 Q 200 100 150 175', shotTargets: [{ x: 120, y: 60 }, { x: 180, y: 60 }], instruction: 'Volley it!' },
  57: { view: 'firstperson', gkX: 150, defenders: [], teammates: [{ x: 70, y: 130, size: 11, label: '1' }, { x: 230, y: 130, size: 11, label: '2' }], shotTargets: [{ x: 115, y: 58 }, { x: 150, y: 65 }, { x: 185, y: 58 }], instruction: 'Rapid fire!' },
  58: { view: 'firstperson', gkX: 150, defenders: [], ballPath: 'M 150 185 Q 140 120 130 80', shotTargets: [{ x: 110, y: 58 }, { x: 190, y: 58 }], instruction: 'Beat the keeper' },
  59: { view: 'firstperson', gkX: 150, defenders: [{ x: 150, y: 145, size: 12 }], teammates: [{ x: 80, y: 170, size: 11, label: 'S' }], crossPath: 'M 85 165 L 145 180', shotTargets: [{ x: 115, y: 58 }, { x: 185, y: 58 }], instruction: 'Turn and shoot' },
  60: { view: 'firstperson', gkX: 150, defenders: [{ x: 120, y: 100, size: 11 }, { x: 180, y: 100, size: 11 }], shotTargets: [{ x: 110, y: 55 }, { x: 190, y: 55 }], instruction: 'Edge of box', ballPath: 'M 150 185 Q 160 130 185 55' },
  61: { view: 'firstperson', gkX: 150, defenders: [], shotTargets: [{ x: 120, y: 60 }, { x: 180, y: 60 }], instruction: 'React to rebounds', targetZone: { x: 150, y: 75, rx: 30, ry: 10 } },
  62: { view: 'firstperson', gkX: 150, defenders: [], shotTargets: [{ x: 108, y: 52 }, { x: 108, y: 72 }, { x: 192, y: 52 }, { x: 192, y: 72 }], instruction: 'Penalty practice' },
  63: { view: 'firstperson', gkX: 160, defenders: [{ x: 130, y: 95, size: 12 }], server: { x: 50, y: 130, label: 'S' }, crossPath: 'M 55 125 L 120 90', shotTargets: [{ x: 105, y: 62 }], instruction: 'Near post!' },
  64: { view: 'firstperson', gkX: 140, defenders: [{ x: 160, y: 95, size: 12 }], server: { x: 260, y: 130, label: 'W' }, crossPath: 'M 255 125 Q 200 70 185 75', shotTargets: [{ x: 190, y: 62 }], instruction: 'Far post!' },
  65: { view: 'firstperson', gkX: 150, defenders: [{ x: 150, y: 95, size: 13 }], server: { x: 50, y: 140, label: 'S' }, crossPath: 'M 55 135 Q 100 60 150 75', targetZone: { x: 150, y: 60, rx: 20, ry: 8 }, instruction: 'Head it in!' },
  66: { view: 'firstperson', gkX: 150, defenders: [{ x: 130, y: 90, size: 12 }, { x: 170, y: 92, size: 12 }], server: { x: 40, y: 90, label: 'W' }, crossPath: 'M 45 88 Q 80 120 150 170', shotTargets: [{ x: 185, y: 60 }], instruction: 'Cutback finish' },
  67: { view: 'firstperson', gkX: 145, defenders: [], ballPath: 'M 150 185 Q 145 120 140 80', shotTargets: [{ x: 110, y: 55 }, { x: 190, y: 55 }], instruction: 'Breakaway! Stay calm' },
  68: { view: 'firstperson', gkX: 150, defenders: [], shotTargets: [{ x: 115, y: 58 }, { x: 185, y: 58 }], instruction: 'Weak foot only', ballPath: 'M 150 185 Q 180 130 185 58' },
  69: { view: 'firstperson', gkX: 150, defenders: [], shotTargets: [{ x: 195, y: 60 }], instruction: 'Across goal', ballPath: 'M 150 185 Q 170 120 195 60' },
  70: { view: 'firstperson', gkX: 150, defenders: [], shotTargets: [{ x: 108, y: 50 }, { x: 192, y: 50 }, { x: 108, y: 75 }, { x: 192, y: 75 }], instruction: 'Corners only' },
  71: { view: 'firstperson', gkX: 150, defenders: [], shotTargets: [{ x: 150, y: 55 }], instruction: 'Instep drive', ballPath: 'M 150 185 L 150 55' },
  72: { view: 'firstperson', gkX: 150, defenders: [{ x: 130, y: 100, size: 10 }, { x: 150, y: 102, size: 10 }, { x: 170, y: 100, size: 10 }], shotTargets: [{ x: 195, y: 55 }], instruction: 'Curl around wall', ballPath: 'M 150 185 Q 200 120 195 55' },
  73: { view: 'firstperson', gkX: 150, defenders: [], shotTargets: [{ x: 115, y: 58 }, { x: 185, y: 58 }], instruction: 'Stay composed' },
  74: { view: 'firstperson', gkX: 150, defenders: [{ x: 130, y: 100, size: 12 }, { x: 170, y: 105, size: 12 }], teammates: [{ x: 80, y: 150, size: 11, label: 'M' }], crossPath: 'M 85 145 Q 120 130 145 170', shotTargets: [{ x: 185, y: 60 }], instruction: 'Find space, finish' },
  75: { view: 'firstperson', gkX: 150, defenders: [{ x: 150, y: 105, size: 13 }], teammates: [{ x: 90, y: 140, size: 12, label: '2' }], crossPath: 'M 95 135 L 140 165', shotTargets: [{ x: 115, y: 58 }, { x: 185, y: 58 }], instruction: 'Combine & finish' },
  // DEFENDING (76-95)
  76: { view: 'topdown', type: 'small', players: [{ x: 75, y: 60, color: 'red', label: 'DEF' }, { x: 40, y: 60, color: 'blue', label: 'ATT' }], ball: { x: 48, y: 58 }, arrows: [{ x1: 70, y1: 60, x2: 55, y2: 60, color: 'yellow', dashed: true }], text: [{ x: 60, y: 90, content: 'Jockey position', size: 8 }] },
  77: { view: 'topdown', type: 'field', players: [{ x: 75, y: 45, color: 'red', label: 'P1' }, { x: 75, y: 95, color: 'red', label: 'P2' }, { x: 120, y: 70, color: 'blue' }], ball: { x: 128, y: 68 }, arrows: [{ x1: 80, y1: 50, x2: 112, y2: 65, color: 'yellow', dashed: true }, { x1: 80, y1: 90, x2: 112, y2: 75, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Press triggers', size: 8 }] },
  78: { view: 'topdown', type: 'field', players: [{ x: 175, y: 30, color: 'blue', label: 'W' }, { x: 20, y: 70, color: 'gk', label: 'GK' }, { x: 50, y: 55, color: 'red', label: 'CB' }, { x: 50, y: 85, color: 'red', label: 'CB' }, { x: 65, y: 70, color: 'blue', label: 'ST' }], ball: { x: 173, y: 38 }, curves: [{ x1: 172, y1: 35, x2: 60, y2: 65, curve: -30, color: 'white' }], text: [{ x: 100, y: 115, content: 'Defend crosses', size: 8 }] },
  79: { view: 'topdown', type: 'field', players: [{ x: 110, y: 70, color: 'red', label: 'DEF' }, { x: 140, y: 50, color: 'blue', label: 'ATT' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], ball: { x: 148, y: 48 }, curves: [{ x1: 105, y1: 72, x2: 40, y2: 68, curve: 20, color: 'yellow', dashed: true }], arrows: [{ x1: 145, y1: 52, x2: 40, y2: 68, color: 'white', dashed: true }], text: [{ x: 100, y: 115, content: 'Recovery run', size: 8 }] },
  80: { view: 'topdown', type: 'field', players: [{ x: 50, y: 40, color: 'red', label: 'LB' }, { x: 80, y: 50, color: 'red', label: 'CB' }, { x: 120, y: 50, color: 'red', label: 'CB' }, { x: 150, y: 40, color: 'red', label: 'RB' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], lines: [{ x1: 45, y1: 48, x2: 155, y2: 48, color: 'yellow', dashed: true }], text: [{ x: 100, y: 75, content: 'Back 4 shape', size: 8 }] },
  81: { view: 'topdown', type: 'field', players: [{ x: 90, y: 70, color: 'red', label: 'DEF' }, { x: 120, y: 70, color: 'blue', label: 'ATT' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], ball: { x: 120, y: 62 }, arrows: [{ x1: 115, y1: 65, x2: 35, y2: 70, color: 'white', dashed: true }, { x1: 95, y1: 68, x2: 110, y2: 66, color: 'red' }], text: [{ x: 100, y: 100, content: 'Block shot', size: 8 }] },
  82: { view: 'topdown', type: 'field', players: [{ x: 50, y: 70, color: 'red', label: 'CB' }, { x: 80, y: 60, color: 'blue' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], ball: { x: 58, y: 68 }, curves: [{ x1: 60, y1: 68, x2: 160, y2: 50, curve: -30, color: 'yellow' }], text: [{ x: 100, y: 100, content: 'Clear to safety', size: 8 }] },
  83: { view: 'topdown', type: 'field', players: [{ x: 60, y: 60, color: 'red', label: 'CB' }, { x: 60, y: 80, color: 'blue' }, { x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 170, y: 30, color: 'blue', label: 'W' }], ball: { x: 168, y: 38 }, curves: [{ x1: 167, y1: 35, x2: 60, y2: 58, curve: -25, color: 'white' }], text: [{ x: 100, y: 105, content: 'Defensive header', size: 8 }] },
  84: { view: 'topdown', type: 'small', players: [{ x: 55, y: 60, color: 'red', label: 'DEF' }, { x: 70, y: 60, color: 'blue', label: 'ATT' }, { x: 25, y: 60, color: 'blue', label: 'P' }], ball: { x: 33, y: 58 }, lines: [{ x1: 57, y1: 60, x2: 68, y2: 60, color: 'yellow', width: 3, opacity: 0.5 }], text: [{ x: 60, y: 95, content: 'Mark tight', size: 8 }] },
  85: { view: 'topdown', type: 'field', players: [{ x: 70, y: 50, color: 'red' }, { x: 70, y: 90, color: 'red' }, { x: 130, y: 50, color: 'red' }, { x: 130, y: 90, color: 'red' }, { x: 100, y: 70, color: 'blue' }], zones: [{ x: 50, y: 35, w: 40, h: 35 }, { x: 50, y: 75, w: 40, h: 35 }, { x: 110, y: 35, w: 40, h: 35 }, { x: 110, y: 75, w: 40, h: 35 }], text: [{ x: 100, y: 120, content: 'Zonal marking', size: 8 }] },
  86: { view: 'topdown', type: 'field', players: [{ x: 150, y: 50, color: 'red' }, { x: 150, y: 90, color: 'red' }, { x: 80, y: 70, color: 'blue' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], ball: { x: 88, y: 68 }, arrows: [{ x1: 145, y1: 55, x2: 95, y2: 65, color: 'yellow', dashed: true }, { x1: 145, y1: 85, x2: 95, y2: 75, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Defensive transition', size: 8 }] },
  87: { view: 'topdown', type: 'small', players: [{ x: 45, y: 50, color: 'red' }, { x: 45, y: 70, color: 'red' }, { x: 60, y: 60, color: 'blue' }], ball: { x: 68, y: 58 }, arrows: [{ x1: 50, y1: 52, x2: 58, y2: 58, color: 'yellow', dashed: true }, { x1: 50, y1: 68, x2: 58, y2: 62, color: 'yellow', dashed: true }], text: [{ x: 60, y: 95, content: 'Double team', size: 8 }] },
  88: { view: 'topdown', type: 'field', players: [{ x: 70, y: 60, color: 'red', label: 'P' }, { x: 55, y: 80, color: 'red', label: 'C' }, { x: 100, y: 55, color: 'blue' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], ball: { x: 108, y: 53 }, arrows: [{ x1: 75, y1: 62, x2: 95, y2: 55, color: 'yellow', dashed: true }], lines: [{ x1: 60, y1: 78, x2: 40, y2: 70, color: 'green', dashed: true }], text: [{ x: 100, y: 105, content: 'Press & cover', size: 8 }] },
  89: { view: 'topdown', type: 'field', players: [{ x: 50, y: 60, color: 'red' }, { x: 80, y: 60, color: 'red' }, { x: 110, y: 60, color: 'red' }, { x: 140, y: 60, color: 'red' }, { x: 100, y: 45, color: 'blue' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], lines: [{ x1: 45, y1: 60, x2: 145, y2: 60, color: 'yellow', width: 2 }], arrows: [{ x1: 50, y1: 65, x2: 50, y2: 80, color: 'red' }, { x1: 140, y1: 65, x2: 140, y2: 80, color: 'red' }], text: [{ x: 100, y: 100, content: 'Offside trap', size: 8 }] },
  90: { view: 'topdown', type: 'small', players: [{ x: 70, y: 60, color: 'red', label: 'DEF' }, { x: 50, y: 60, color: 'blue', label: 'ATT' }], ball: { x: 55, y: 58 }, arrows: [{ x1: 68, y1: 62, x2: 58, y2: 60, color: 'yellow' }], text: [{ x: 60, y: 90, content: 'Tackle timing', size: 8 }] },
  91: { view: 'topdown', type: 'field', players: [{ x: 60, y: 50, color: 'red', label: 'CB' }, { x: 60, y: 90, color: 'red', label: 'CB' }, { x: 100, y: 70, color: 'red', label: 'DM' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], arrows: [{ x1: 30, y1: 68, x2: 55, y2: 55, color: 'yellow', dashed: true }, { x1: 65, y1: 55, x2: 93, y2: 68, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Communicate!', size: 9, bold: true }] },
  92: { view: 'topdown', type: 'field', players: [{ x: 80, y: 70, color: 'red', label: 'DM' }, { x: 120, y: 50, color: 'blue' }, { x: 120, y: 90, color: 'blue' }, { x: 50, y: 70, color: 'blue' }], ball: { x: 58, y: 68 }, lines: [{ x1: 60, y1: 70, x2: 115, y2: 52, color: 'red', dashed: true, opacity: 0.5 }, { x1: 60, y1: 70, x2: 115, y2: 88, color: 'red', dashed: true, opacity: 0.5 }], shapes: [{ type: 'circle', x: 80, y: 70, r: 15, fill: 'rgba(239,68,68,0.2)', stroke: 'transparent' }], text: [{ x: 100, y: 115, content: 'Screen lanes', size: 8 }] },
  93: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 40, y: 55, color: 'red' }, { x: 40, y: 70, color: 'red' }, { x: 40, y: 85, color: 'red' }, { x: 55, y: 60, color: 'red' }, { x: 55, y: 80, color: 'red' }, { x: 192, y: 8, color: 'blue', label: 'K' }], ball: { x: 192, y: 8 }, curves: [{ x1: 190, y1: 12, x2: 50, y2: 65, curve: -30, color: 'white' }], text: [{ x: 100, y: 115, content: 'Defend set piece', size: 8 }] },
  94: { view: 'topdown', type: 'field', players: [{ x: 100, y: 55, color: 'red' }, { x: 100, y: 85, color: 'red' }, { x: 130, y: 70, color: 'red' }, { x: 110, y: 70, color: 'blue' }], ball: { x: 118, y: 68 }, arrows: [{ x1: 105, y1: 58, x2: 112, y2: 66, color: 'yellow', dashed: true }, { x1: 105, y1: 82, x2: 112, y2: 74, color: 'yellow', dashed: true }, { x1: 125, y1: 70, x2: 118, y2: 70, color: 'yellow', dashed: true }], text: [{ x: 100, y: 110, content: 'Counter press', size: 8 }] },
  95: { view: 'topdown', type: 'field', players: [{ x: 170, y: 35, color: 'red', label: 'FB' }, { x: 175, y: 55, color: 'blue', label: 'W' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], ball: { x: 175, y: 47 }, arrows: [{ x1: 172, y1: 40, x2: 175, y2: 50, color: 'yellow', dashed: true }], lines: [{ x1: 170, y1: 35, x2: 25, y2: 70, color: 'green', dashed: true, opacity: 0.3 }], text: [{ x: 130, y: 80, content: '1v1 wide', size: 8 }] },
  // GOALKEEPING (96-110)
  96: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 80, y: 45, color: 'blue', label: '1' }, { x: 80, y: 95, color: 'blue', label: '2' }], ball: { x: 88, y: 45 }, arrows: [{ x1: 85, y1: 47, x2: 32, y2: 62, color: 'red' }, { x1: 85, y1: 93, x2: 32, y2: 78, color: 'red', dashed: true }], text: [{ x: 100, y: 115, content: 'Shot stopping', size: 8 }] },
  97: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 70, y: 45, color: 'blue' }, { x: 70, y: 95, color: 'blue' }], ball: { x: 78, y: 45 }, arrows: [{ x1: 75, y1: 47, x2: 12, y2: 50, color: 'red' }, { x1: 75, y1: 93, x2: 12, y2: 90, color: 'red', dashed: true }], curves: [{ x1: 27, y1: 68, x2: 15, y2: 52, curve: -10, color: 'yellow', dashed: true }, { x1: 27, y1: 72, x2: 15, y2: 88, curve: 10, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Diving', size: 8 }] },
  98: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 70, y: 35, color: 'blue', label: 'FB' }, { x: 70, y: 105, color: 'blue', label: 'FB' }, { x: 130, y: 70, color: 'blue', label: 'CM' }], ball: { x: 33, y: 70 }, arrows: [{ x1: 35, y1: 68, x2: 62, y2: 40, color: 'green' }, { x1: 35, y1: 72, x2: 62, y2: 100, color: 'green', dashed: true }], text: [{ x: 100, y: 120, content: 'Distribution', size: 8 }] },
  99: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 100, y: 40, color: 'blue', label: 'W' }, { x: 100, y: 100, color: 'blue', label: 'W' }], ball: { x: 30, y: 65 }, curves: [{ x1: 32, y1: 68, x2: 92, y2: 45, curve: -20, color: 'yellow' }], text: [{ x: 100, y: 120, content: 'Quick throw', size: 8 }] },
  100: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 50, y: 55, color: 'red' }, { x: 50, y: 85, color: 'red' }, { x: 55, y: 70, color: 'blue' }, { x: 175, y: 30, color: 'blue', label: 'W' }], ball: { x: 173, y: 38 }, curves: [{ x1: 172, y1: 35, x2: 45, y2: 60, curve: -25, color: 'white' }, { x1: 28, y1: 70, x2: 45, y2: 62, curve: -5, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Claim crosses', size: 8 }] },
  101: { view: 'topdown', type: 'field', players: [{ x: 35, y: 70, color: 'gk', label: 'GK' }, { x: 80, y: 70, color: 'blue', label: 'ATT' }], ball: { x: 88, y: 68 }, arrows: [{ x1: 38, y1: 70, x2: 60, y2: 70, color: 'yellow', dashed: true }, { x1: 85, y1: 68, x2: 50, y2: 68, color: 'white', dashed: true }], text: [{ x: 100, y: 100, content: '1v1 situations', size: 8 }] },
  102: { view: 'topdown', type: 'field', players: [{ x: 22, y: 70, color: 'gk', label: 'GK' }, { x: 100, y: 50, color: 'blue' }], ball: { x: 108, y: 48 }, lines: [{ x1: 8, y1: 50, x2: 105, y2: 48, color: 'yellow', dashed: true, opacity: 0.4 }, { x1: 8, y1: 90, x2: 105, y2: 48, color: 'yellow', dashed: true, opacity: 0.4 }], shapes: [{ type: 'circle', x: 22, y: 60, r: 5, fill: '#22c55e' }], text: [{ x: 50, y: 115, content: 'Angles', size: 8 }] },
  103: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 60, y: 60, color: 'blue' }, { x: 60, y: 80, color: 'blue' }, { x: 80, y: 70, color: 'blue' }], ball: { x: 68, y: 60 }, arrows: [{ x1: 65, y1: 62, x2: 32, y2: 68, color: 'red' }, { x1: 65, y1: 78, x2: 32, y2: 72, color: 'red', dashed: true }], text: [{ x: 100, y: 105, content: 'Reflex saves', size: 8 }] },
  104: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }], cones: [{ x: 15, y: 55 }, { x: 35, y: 55 }, { x: 15, y: 85 }, { x: 35, y: 85 }], paths: [{ d: 'M 20 60 L 30 60 L 30 80 L 20 80 L 20 60', color: 'yellow' }], text: [{ x: 70, y: 70, content: 'Footwork', size: 8 }] },
  105: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 100, y: 100, color: 'blue', label: 'S' }], ball: { x: 108, y: 98 }, curves: [{ x1: 105, y1: 98, x2: 30, y2: 65, curve: -40, color: 'white' }], text: [{ x: 100, y: 120, content: 'High balls', size: 8 }] },
  106: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 80, y: 70, color: 'blue' }], ball: { x: 88, y: 68 }, arrows: [{ x1: 85, y1: 68, x2: 12, y2: 52, color: 'red' }], curves: [{ x1: 15, y1: 55, x2: 50, y2: 25, curve: -20, color: 'yellow', dashed: true }], text: [{ x: 100, y: 100, content: 'Parrying', size: 8 }] },
  107: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 80, y: 40, color: 'blue' }, { x: 80, y: 100, color: 'blue' }, { x: 140, y: 70, color: 'blue' }], ball: { x: 25, y: 62 }, curves: [{ x1: 28, y1: 65, x2: 72, y2: 45, curve: -20, color: 'green' }, { x1: 28, y1: 65, x2: 130, y2: 68, curve: -40, color: 'white', dashed: true }], text: [{ x: 100, y: 120, content: 'Goal kicks', size: 8 }] },
  108: { view: 'topdown', type: 'field', players: [{ x: 35, y: 70, color: 'gk', label: 'GK' }, { x: 100, y: 70, color: 'blue', label: 'ATT' }, { x: 60, y: 50, color: 'red' }, { x: 60, y: 90, color: 'red' }], ball: { x: 108, y: 68 }, arrows: [{ x1: 40, y1: 70, x2: 70, y2: 70, color: 'yellow', dashed: true }], curves: [{ x1: 105, y1: 68, x2: 72, y2: 68, curve: 0, color: 'white' }], text: [{ x: 130, y: 100, content: 'Come off line', size: 8 }] },
  109: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 55, y: 50, color: 'red', label: 'CB' }, { x: 55, y: 90, color: 'red', label: 'CB' }, { x: 100, y: 70, color: 'blue' }], arrows: [{ x1: 30, y1: 68, x2: 50, y2: 55, color: 'yellow', dashed: true }, { x1: 30, y1: 72, x2: 50, y2: 85, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Communication', size: 8 }] },
  110: { view: 'topdown', type: 'field', players: [{ x: 20, y: 70, color: 'gk', label: 'GK' }, { x: 46, y: 70, color: 'blue' }], ball: { x: 46, y: 62 }, shapes: [{ type: 'rect', x: 5, y: 50, w: 3, h: 40, fill: '#fff', stroke: 'transparent' }], arrows: [{ x1: 44, y1: 65, x2: 10, y2: 52, color: 'red', dashed: true }, { x1: 44, y1: 65, x2: 10, y2: 88, color: 'red', dashed: true }], text: [{ x: 80, y: 100, content: 'Penalty saving', size: 8 }] },
  // TACTICAL (111-125)
  111: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk' }, { x: 50, y: 40, color: 'blue' }, { x: 50, y: 100, color: 'blue' }, { x: 80, y: 55, color: 'blue' }, { x: 80, y: 85, color: 'blue' }, { x: 110, y: 70, color: 'blue' }, { x: 140, y: 45, color: 'blue' }, { x: 140, y: 95, color: 'blue' }, { x: 95, y: 60, color: 'red' }, { x: 95, y: 80, color: 'red' }], ball: { x: 118, y: 68 }, text: [{ x: 100, y: 120, content: '8v2 positional', size: 8 }] },
  112: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk' }, { x: 50, y: 35, color: 'blue' }, { x: 50, y: 105, color: 'blue' }, { x: 50, y: 55, color: 'blue' }, { x: 50, y: 85, color: 'blue' }, { x: 85, y: 45, color: 'blue' }, { x: 85, y: 70, color: 'blue' }, { x: 85, y: 95, color: 'blue' }, { x: 130, y: 50, color: 'blue' }, { x: 150, y: 70, color: 'blue' }, { x: 130, y: 90, color: 'blue' }], ball: { x: 93, y: 68 }, arrows: [{ x1: 95, y1: 68, x2: 122, y2: 53, color: 'green' }], text: [{ x: 100, y: 120, content: 'Shadow play', size: 8 }] },
  113: { view: 'topdown', type: 'field', players: [{ x: 130, y: 55, color: 'red' }, { x: 130, y: 85, color: 'red' }, { x: 150, y: 70, color: 'red' }, { x: 160, y: 70, color: 'blue' }, { x: 170, y: 55, color: 'blue' }, { x: 170, y: 85, color: 'blue' }], ball: { x: 168, y: 68 }, arrows: [{ x1: 155, y1: 70, x2: 165, y2: 70, color: 'yellow', dashed: true }, { x1: 135, y1: 58, x2: 162, y2: 58, color: 'yellow', dashed: true }, { x1: 135, y1: 82, x2: 162, y2: 82, color: 'yellow', dashed: true }], text: [{ x: 100, y: 100, content: 'Press patterns', size: 8 }] },
  114: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 55, y: 50, color: 'blue', label: 'CB' }, { x: 55, y: 90, color: 'blue', label: 'CB' }, { x: 85, y: 70, color: 'blue', label: 'DM' }, { x: 110, y: 45, color: 'red' }, { x: 110, y: 95, color: 'red' }], ball: { x: 33, y: 68 }, arrows: [{ x1: 35, y1: 68, x2: 48, y2: 53, color: 'green' }], curves: [{ x1: 60, y1: 52, x2: 78, y2: 68, curve: -10, color: 'green', dashed: true }], text: [{ x: 140, y: 70, content: 'Build up', size: 8 }] },
  115: { view: 'topdown', type: 'field', players: [{ x: 60, y: 70, color: 'blue', label: 'Win' }, { x: 120, y: 50, color: 'blue' }, { x: 120, y: 90, color: 'blue' }, { x: 160, y: 70, color: 'blue', label: 'ST' }, { x: 175, y: 70, color: 'gk', label: 'GK' }], ball: { x: 68, y: 68 }, arrows: [{ x1: 70, y1: 68, x2: 150, y2: 68, color: 'yellow' }, { x1: 125, y1: 52, x2: 165, y2: 55, color: 'yellow', dashed: true }, { x1: 125, y1: 88, x2: 165, y2: 85, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Attack transition', size: 8 }] },
  116: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk' }, { x: 50, y: 40, color: 'red' }, { x: 65, y: 55, color: 'red' }, { x: 65, y: 85, color: 'red' }, { x: 50, y: 100, color: 'red' }, { x: 90, y: 55, color: 'red' }, { x: 90, y: 85, color: 'red' }, { x: 130, y: 70, color: 'blue' }], ball: { x: 138, y: 68 }, shapes: [{ type: 'rect', x: 45, y: 40, w: 50, h: 60, dashed: true, stroke: '#fbbf24' }], text: [{ x: 100, y: 115, content: 'Defensive shape', size: 8 }] },
  117: { view: 'topdown', type: 'field', players: [{ x: 30, y: 30, color: 'blue', label: 'LW' }, { x: 30, y: 110, color: 'blue', label: 'LB' }, { x: 100, y: 70, color: 'blue', label: 'CM' }, { x: 170, y: 30, color: 'blue', label: 'RW' }, { x: 170, y: 110, color: 'blue', label: 'RB' }], ball: { x: 108, y: 68 }, lines: [{ x1: 30, y1: 30, x2: 30, y2: 110, color: 'yellow', dashed: true, opacity: 0.5 }, { x1: 170, y1: 30, x2: 170, y2: 110, color: 'yellow', dashed: true, opacity: 0.5 }], text: [{ x: 100, y: 8, content: 'Width & depth', size: 8 }] },
  118: { view: 'topdown', type: 'field', players: [{ x: 150, y: 35, color: 'blue' }, { x: 130, y: 55, color: 'blue' }, { x: 165, y: 55, color: 'blue' }, { x: 145, y: 35, color: 'red' }, { x: 155, y: 55, color: 'red' }], ball: { x: 138, y: 53 }, zones: [{ x: 125, y: 25, w: 50, h: 45, color: 'rgba(59,130,246,0.2)', border: '#3b82f6' }], text: [{ x: 150, y: 80, content: '3v2 overload', size: 8 }] },
  119: { view: 'topdown', type: 'field', players: [{ x: 40, y: 70, color: 'blue', label: 'CB' }, { x: 100, y: 70, color: 'blue', label: 'CM' }, { x: 160, y: 70, color: 'blue', label: 'ST' }, { x: 70, y: 55, color: 'red' }, { x: 70, y: 85, color: 'red' }, { x: 130, y: 55, color: 'red' }, { x: 130, y: 85, color: 'red' }], ball: { x: 48, y: 68 }, arrows: [{ x1: 50, y1: 68, x2: 92, y2: 68, color: 'green' }], lines: [{ x1: 70, y1: 45, x2: 70, y2: 95, color: 'red', dashed: true, opacity: 0.4 }, { x1: 130, y1: 45, x2: 130, y2: 95, color: 'red', dashed: true, opacity: 0.4 }], text: [{ x: 100, y: 110, content: 'Through lines', size: 8 }] },
  120: { view: 'topdown', type: 'field', players: [{ x: 60, y: 70, color: 'blue', label: '1' }, { x: 100, y: 55, color: 'blue', label: '2' }, { x: 140, y: 70, color: 'blue', label: '3' }, { x: 110, y: 85, color: 'red' }], ball: { x: 68, y: 68 }, arrows: [{ x1: 70, y1: 68, x2: 92, y2: 58, color: 'green' }, { x1: 108, y1: 57, x2: 132, y2: 68, color: 'green' }], curves: [{ x1: 65, y1: 75, x2: 135, y2: 55, curve: 30, color: 'yellow', dashed: true }], text: [{ x: 100, y: 110, content: 'Combinations', size: 8 }] },
  121: { view: 'topdown', type: 'field', players: [{ x: 80, y: 50, color: 'blue', label: 'LW' }, { x: 120, y: 50, color: 'blue', label: 'RW' }, { x: 100, y: 80, color: 'blue', label: 'ST' }], curves: [{ x1: 85, y1: 55, x2: 100, y2: 75, curve: -20, color: 'yellow', dashed: true }, { x1: 115, y1: 55, x2: 100, y2: 75, curve: 20, color: 'yellow', dashed: true }, { x1: 100, y1: 85, x2: 130, y2: 55, curve: 25, color: 'yellow', dashed: true }], text: [{ x: 100, y: 110, content: 'Rotations', size: 8 }] },
  122: { view: 'topdown', type: 'field', players: [{ x: 70, y: 70, color: 'blue' }, { x: 130, y: 90, color: 'blue' }], zones: [{ x: 55, y: 30, w: 30, h: 80, color: 'rgba(251,191,36,0.15)', border: '#fbbf24' }, { x: 115, y: 30, w: 30, h: 80, color: 'rgba(251,191,36,0.15)', border: '#fbbf24' }], curves: [{ x1: 135, y1: 88, x2: 145, y2: 45, curve: 25, color: 'yellow', dashed: true }], text: [{ x: 100, y: 120, content: 'Half space runs', size: 8 }] },
  123: { view: 'topdown', type: 'field', players: [{ x: 100, y: 70, color: 'blue', label: '10' }, { x: 70, y: 55, color: 'red' }, { x: 70, y: 85, color: 'red' }, { x: 130, y: 55, color: 'red' }, { x: 130, y: 85, color: 'red' }], zones: [{ x: 85, y: 55, w: 30, h: 30, color: 'rgba(16,185,129,0.25)', border: '#10b981' }], text: [{ x: 100, y: 100, content: 'Pocket play', size: 8 }] },
  124: { view: 'topdown', type: 'field', players: [{ x: 45, y: 70, color: 'blue', label: 'Win' }, { x: 100, y: 55, color: 'blue' }, { x: 100, y: 85, color: 'blue' }, { x: 150, y: 70, color: 'blue', label: 'ST' }, { x: 175, y: 70, color: 'gk', label: 'GK' }], ball: { x: 53, y: 68 }, arrows: [{ x1: 55, y1: 68, x2: 142, y2: 68, color: 'green' }, { x1: 105, y1: 57, x2: 155, y2: 50, color: 'yellow', dashed: true }, { x1: 105, y1: 83, x2: 155, y2: 90, color: 'yellow', dashed: true }], text: [{ x: 100, y: 115, content: 'Counter attack!', size: 9, bold: true }] },
  125: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk' }, { x: 50, y: 50, color: 'blue' }, { x: 50, y: 90, color: 'blue' }, { x: 80, y: 70, color: 'blue' }, { x: 60, y: 70, color: 'blue' }], ball: { x: 88, y: 68 }, shapes: [{ type: 'circle', x: 60, y: 70, r: 35, dashed: true, stroke: '#22c55e' }], text: [{ x: 130, y: 70, content: 'Game management', size: 8 }] },
  // SET PIECES (126-135)
  126: { view: 'topdown', type: 'field', players: [{ x: 192, y: 8, color: 'blue', label: 'K' }, { x: 50, y: 55, color: 'blue' }, { x: 50, y: 70, color: 'blue' }, { x: 50, y: 85, color: 'blue' }, { x: 75, y: 70, color: 'blue', label: 'E' }, { x: 20, y: 70, color: 'gk', label: 'GK' }], ball: { x: 192, y: 8 }, curves: [{ x1: 190, y1: 12, x2: 55, y2: 65, curve: -30, color: 'white' }], arrows: [{ x1: 55, y1: 58, x2: 40, y2: 55, color: 'yellow', dashed: true }] },
  127: { view: 'firstperson', gkX: 170, defenders: [{ x: 130, y: 100, size: 9 }, { x: 140, y: 100, size: 9 }, { x: 150, y: 100, size: 9 }, { x: 160, y: 100, size: 9 }], teammates: [{ x: 175, y: 145, size: 11 }], shotTargets: [{ x: 195, y: 55 }, { x: 105, y: 55 }], instruction: 'Over or around wall', ballPath: 'M 150 185 Q 200 100 195 55' },
  128: { view: 'topdown', type: 'field', players: [{ x: 195, y: 70, color: 'blue', label: 'T' }, { x: 160, y: 50, color: 'blue' }, { x: 160, y: 90, color: 'blue' }, { x: 130, y: 70, color: 'blue' }, { x: 165, y: 55, color: 'red' }, { x: 165, y: 85, color: 'red' }], ball: { x: 193, y: 62 }, arrows: [{ x1: 190, y1: 68, x2: 168, y2: 53, color: 'green' }, { x1: 190, y1: 72, x2: 168, y2: 87, color: 'green', dashed: true }] },
  129: { view: 'firstperson', gkX: 150, defenders: [], shotTargets: [{ x: 105, y: 50 }, { x: 105, y: 75 }, { x: 195, y: 50 }, { x: 195, y: 75 }], instruction: 'Penalty - pick spot' },
  130: { view: 'topdown', type: 'field', players: [{ x: 192, y: 8, color: 'blue', label: 'K' }, { x: 25, y: 70, color: 'gk', label: 'GK' }, { x: 40, y: 55, color: 'red' }, { x: 40, y: 70, color: 'red' }, { x: 40, y: 85, color: 'red' }, { x: 55, y: 60, color: 'red' }, { x: 55, y: 80, color: 'red' }, { x: 10, y: 60, color: 'red', label: 'P' }, { x: 10, y: 80, color: 'red', label: 'P' }], ball: { x: 192, y: 8 }, curves: [{ x1: 190, y1: 12, x2: 50, y2: 65, curve: -30, color: 'white' }] },
  131: { view: 'topdown', type: 'field', players: [{ x: 100, y: 70, color: 'blue', label: 'K' }, { x: 60, y: 60, color: 'red' }, { x: 60, y: 70, color: 'red' }, { x: 60, y: 80, color: 'red' }, { x: 25, y: 70, color: 'gk', label: 'GK' }], ball: { x: 100, y: 62 }, lines: [{ x1: 60, y1: 55, x2: 60, y2: 85, color: 'red', width: 2 }], arrows: [{ x1: 98, y1: 65, x2: 30, y2: 55, color: 'white', dashed: true }] },
  132: { view: 'topdown', type: 'field', players: [{ x: 100, y: 70, color: 'blue', label: 'K' }, { x: 140, y: 55, color: 'blue' }, { x: 140, y: 85, color: 'blue' }, { x: 175, y: 70, color: 'gk', label: 'GK' }], ball: { x: 100, y: 62 }, arrows: [{ x1: 105, y1: 65, x2: 132, y2: 58, color: 'green' }], text: [{ x: 100, y: 100, content: 'Quick restart!', size: 9, bold: true }] },
  133: { view: 'firstperson', gkX: 165, defenders: [{ x: 120, y: 90, size: 11 }, { x: 145, y: 95, size: 11 }], teammates: [{ x: 115, y: 100, size: 12 }, { x: 160, y: 105, size: 12 }], targetZone: { x: 115, y: 70, rx: 15, ry: 8 }, instruction: 'Near post corner' },
  134: { view: 'topdown', type: 'field', players: [{ x: 192, y: 8, color: 'blue', label: 'K' }, { x: 20, y: 70, color: 'gk', label: 'GK' }, { x: 35, y: 95, color: 'blue', label: 'FP' }, { x: 50, y: 70, color: 'blue' }, { x: 45, y: 55, color: 'red' }, { x: 45, y: 85, color: 'red' }], ball: { x: 192, y: 8 }, curves: [{ x1: 190, y1: 12, x2: 38, y2: 90, curve: -40, color: 'white' }], arrows: [{ x1: 40, y1: 93, x2: 28, y2: 80, color: 'yellow', dashed: true }] },
  135: { view: 'topdown', type: 'field', players: [{ x: 100, y: 70, color: 'blue', label: 'K' }, { x: 130, y: 55, color: 'blue', label: '1' }, { x: 130, y: 85, color: 'blue', label: '2' }, { x: 150, y: 70, color: 'blue', label: '3' }], ball: { x: 100, y: 62 }, text: [{ x: 100, y: 95, content: 'Set piece signals', size: 8 }] },
  // SMALL-SIDED GAMES (136-145)
  136: { view: 'topdown', type: 'field', players: [{ x: 45, y: 40, color: 'blue' }, { x: 45, y: 100, color: 'blue' }, { x: 75, y: 55, color: 'blue' }, { x: 75, y: 85, color: 'blue' }, { x: 155, y: 40, color: 'red' }, { x: 155, y: 100, color: 'red' }, { x: 125, y: 55, color: 'red' }, { x: 125, y: 85, color: 'red' }], ball: { x: 100, y: 70 }, shapes: [{ type: 'rect', x: 5, y: 55, w: 8, h: 30, fill: '#fff', stroke: 'transparent' }, { type: 'rect', x: 187, y: 55, w: 8, h: 30, fill: '#fff', stroke: 'transparent' }] },
  137: { view: 'topdown', type: 'field', players: [{ x: 50, y: 45, color: 'blue' }, { x: 50, y: 95, color: 'blue' }, { x: 75, y: 70, color: 'blue' }, { x: 150, y: 45, color: 'red' }, { x: 150, y: 95, color: 'red' }, { x: 125, y: 70, color: 'red' }], ball: { x: 100, y: 70 }, lines: [{ x1: 10, y1: 5, x2: 10, y2: 135, color: '#10b981', width: 3 }, { x1: 190, y1: 5, x2: 190, y2: 135, color: '#10b981', width: 3 }], text: [{ x: 100, y: 8, content: '3v3 line soccer', size: 8 }] },
  138: { view: 'topdown', type: 'field', players: [{ x: 25, y: 70, color: 'gk' }, { x: 50, y: 45, color: 'blue' }, { x: 50, y: 95, color: 'blue' }, { x: 80, y: 60, color: 'blue' }, { x: 80, y: 80, color: 'blue' }, { x: 175, y: 70, color: 'gk' }, { x: 150, y: 45, color: 'red' }, { x: 150, y: 95, color: 'red' }, { x: 120, y: 60, color: 'red' }, { x: 120, y: 80, color: 'red' }], ball: { x: 100, y: 70 } },
  139: { view: 'topdown', type: 'small', players: [{ x: 40, y: 55, color: 'blue' }, { x: 40, y: 75, color: 'blue' }, { x: 80, y: 55, color: 'red' }, { x: 80, y: 75, color: 'red' }, { x: 60, y: 15, color: 'gk', label: 'T' }, { x: 60, y: 105, color: 'gk', label: 'T' }], ball: { x: 60, y: 65 }, shapes: [{ type: 'rect', x: 20, y: 25, w: 80, h: 70, dashed: true }] },
  140: { view: 'topdown', type: 'field', players: [{ x: 20, y: 70, color: 'gk' }, { x: 45, y: 40, color: 'blue' }, { x: 45, y: 100, color: 'blue' }, { x: 70, y: 55, color: 'blue' }, { x: 70, y: 85, color: 'blue' }, { x: 90, y: 70, color: 'blue' }, { x: 180, y: 70, color: 'gk' }, { x: 155, y: 40, color: 'red' }, { x: 155, y: 100, color: 'red' }, { x: 130, y: 55, color: 'red' }, { x: 130, y: 85, color: 'red' }, { x: 110, y: 70, color: 'red' }], ball: { x: 100, y: 70 } },
  141: { view: 'topdown', type: 'small', players: [{ x: 30, y: 30, color: 'blue' }, { x: 90, y: 30, color: 'blue' }, { x: 30, y: 90, color: 'blue' }, { x: 90, y: 90, color: 'blue' }, { x: 45, y: 60, color: 'red' }, { x: 75, y: 60, color: 'red' }], ball: { x: 38, y: 30 }, shapes: [{ type: 'rect', x: 15, y: 15, w: 90, h: 90, dashed: true }], text: [{ x: 60, y: 8, content: '4v2 possession', size: 8 }] },
  142: { view: 'topdown', type: 'field', players: [{ x: 20, y: 70, color: 'gk' }, { x: 60, y: 55, color: 'blue' }, { x: 60, y: 85, color: 'blue' }, { x: 90, y: 70, color: 'blue' }, { x: 180, y: 70, color: 'gk' }, { x: 140, y: 55, color: 'red' }, { x: 140, y: 85, color: 'red' }, { x: 110, y: 70, color: 'red' }], ball: { x: 98, y: 68 }, arrows: [{ x1: 100, y1: 68, x2: 170, y2: 68, color: 'green', dashed: true }, { x1: 100, y1: 72, x2: 30, y2: 72, color: 'red', dashed: true }], text: [{ x: 100, y: 115, content: 'Transition game', size: 8 }] },
  143: { view: 'topdown', type: 'field', players: [{ x: 50, y: 50, color: 'blue' }, { x: 50, y: 90, color: 'blue' }, { x: 80, y: 70, color: 'blue' }, { x: 150, y: 50, color: 'red' }, { x: 150, y: 90, color: 'red' }, { x: 120, y: 70, color: 'red' }], ball: { x: 100, y: 70 }, zones: [{ x: 5, y: 35, w: 25, h: 70, color: 'rgba(59,130,246,0.2)', border: '#3b82f6' }, { x: 170, y: 35, w: 25, h: 70, color: 'rgba(239,68,68,0.2)', border: '#ef4444' }], text: [{ x: 100, y: 120, content: 'End zone game', size: 8 }] },
  144: { view: 'topdown', type: 'field', players: [{ x: 60, y: 55, color: 'blue' }, { x: 60, y: 85, color: 'blue' }, { x: 140, y: 55, color: 'red' }, { x: 140, y: 85, color: 'red' }], ball: { x: 100, y: 70 }, cones: [{ x: 10, y: 40 }, { x: 10, y: 55 }, { x: 10, y: 85 }, { x: 10, y: 100 }, { x: 190, y: 40 }, { x: 190, y: 55 }, { x: 190, y: 85 }, { x: 190, y: 100 }], text: [{ x: 100, y: 120, content: 'Multi-goal', size: 8 }] },
  145: { view: 'topdown', type: 'field', players: [{ x: 40, y: 50, color: 'blue' }, { x: 40, y: 90, color: 'blue' }, { x: 70, y: 70, color: 'blue' }, { x: 100, y: 55, color: 'blue' }, { x: 100, y: 85, color: 'blue' }, { x: 140, y: 55, color: 'red' }, { x: 140, y: 85, color: 'red' }, { x: 160, y: 70, color: 'red' }], ball: { x: 78, y: 68 }, text: [{ x: 100, y: 115, content: '5v3 overload', size: 8 }] },
  // CONDITIONING (146-150)
  146: { view: 'topdown', type: 'field', cones: [{ x: 30, y: 70 }, { x: 170, y: 70 }], players: [{ x: 40, y: 70, color: 'blue' }], ball: { x: 48, y: 68 }, arrows: [{ x1: 50, y1: 68, x2: 160, y2: 68, color: 'yellow' }], curves: [{ x1: 165, y1: 75, x2: 45, y2: 75, curve: 20, color: 'green', dashed: true }], text: [{ x: 100, y: 55, content: 'Sprint →', size: 9 }, { x: 100, y: 95, content: '← Jog', size: 9 }] },
  147: { view: 'topdown', type: 'field', cones: [{ x: 40, y: 70 }, { x: 80, y: 70 }, { x: 120, y: 70 }, { x: 160, y: 70 }], players: [{ x: 30, y: 70, color: 'blue' }], paths: [{ d: 'M 35 68 L 75 68 L 45 72 L 115 68 L 45 72 L 155 68', color: 'yellow' }], text: [{ x: 60, y: 90, content: '10y', size: 8 }, { x: 100, y: 90, content: '20y', size: 8 }, { x: 140, y: 90, content: '30y', size: 8 }] },
  148: { view: 'topdown', type: 'field', players: [{ x: 35, y: 70, color: 'blue' }], arrows: [{ x1: 40, y1: 68, x2: 165, y2: 68, color: 'yellow' }], shapes: [{ type: 'rect', x: 5, y: 35, w: 30, h: 70, dashed: true }, { type: 'rect', x: 165, y: 35, w: 30, h: 70, dashed: true }], text: [{ x: 100, y: 115, content: 'Box to box', size: 8 }] },
  149: { view: 'topdown', type: 'small', players: [{ x: 20, y: 60, color: 'blue' }], shapes: [{ type: 'rect', x: 40, y: 25, w: 40, h: 70 }], lines: [{ x1: 40, y1: 35, x2: 80, y2: 35 }, { x1: 40, y1: 45, x2: 80, y2: 45 }, { x1: 40, y1: 55, x2: 80, y2: 55 }, { x1: 40, y1: 65, x2: 80, y2: 65 }, { x1: 40, y1: 75, x2: 80, y2: 75 }, { x1: 40, y1: 85, x2: 80, y2: 85 }], arrows: [{ x1: 25, y1: 60, x2: 38, y2: 30, color: 'yellow', dashed: true }], text: [{ x: 60, y: 108, content: 'Agility ladder', size: 8 }] },
  150: { view: 'topdown', type: 'field', cones: [{ x: 40, y: 50 }, { x: 40, y: 90 }, { x: 80, y: 50 }, { x: 80, y: 90 }, { x: 120, y: 50 }, { x: 120, y: 90 }, { x: 160, y: 70 }], players: [{ x: 30, y: 70, color: 'blue' }], paths: [{ d: 'M 35 70 L 40 55 L 40 85 L 80 55 L 80 85 L 120 55 L 120 85 L 155 70', color: 'yellow' }], text: [{ x: 100, y: 115, content: 'SAQ training', size: 8 }] },
  // WARMUP (151-155)
  151: { view: 'topdown', type: 'field', players: [{ x: 40, y: 30, color: 'blue' }, { x: 70, y: 30, color: 'blue' }, { x: 100, y: 30, color: 'blue' }, { x: 130, y: 30, color: 'blue' }, { x: 160, y: 30, color: 'blue' }], cones: [{ x: 40, y: 110 }, { x: 70, y: 110 }, { x: 100, y: 110 }, { x: 130, y: 110 }, { x: 160, y: 110 }], arrows: [{ x1: 40, y1: 40, x2: 40, y2: 100, color: 'green', dashed: true }, { x1: 70, y1: 40, x2: 70, y2: 100, color: 'green', dashed: true }, { x1: 100, y1: 40, x2: 100, y2: 100, color: 'green', dashed: true }], text: [{ x: 100, y: 125, content: 'Dynamic warmup', size: 8 }] },
  152: { view: 'topdown', type: 'small', players: [{ x: 60, y: 18, color: 'blue' }, { x: 102, y: 60, color: 'blue' }, { x: 60, y: 102, color: 'blue' }, { x: 18, y: 60, color: 'blue' }], ball: { x: 52, y: 22 }, shapes: [{ type: 'circle', x: 60, y: 60, r: 42, dashed: true }], text: [{ x: 60, y: 8, content: 'Rondo warmup', size: 8 }] },
  153: { view: 'topdown', type: 'field', players: [{ x: 50, y: 55, color: 'blue', label: 'A' }, { x: 50, y: 85, color: 'blue', label: 'B' }, { x: 150, y: 55, color: 'blue', label: 'C' }, { x: 150, y: 85, color: 'blue', label: 'D' }], ball: { x: 58, y: 53 }, arrows: [{ x1: 60, y1: 55, x2: 140, y2: 55, color: 'green' }, { x1: 140, y1: 85, x2: 60, y2: 85, color: 'green', dashed: true }], text: [{ x: 100, y: 115, content: 'Passing warmup', size: 8 }] },
  154: { view: 'topdown', type: 'field', cones: [{ x: 50, y: 50 }, { x: 100, y: 50 }, { x: 150, y: 50 }, { x: 50, y: 90 }, { x: 100, y: 90 }, { x: 150, y: 90 }], players: [{ x: 35, y: 70, color: 'blue' }], paths: [{ d: 'M 40 70 L 50 55 L 100 55 L 100 85 L 150 85 L 150 55 L 170 70', color: 'yellow' }], text: [{ x: 100, y: 115, content: 'Movement patterns', size: 8 }] },
  155: { view: 'topdown', type: 'small', players: [{ x: 30, y: 40, color: 'blue' }, { x: 60, y: 40, color: 'blue' }, { x: 90, y: 40, color: 'blue' }, { x: 30, y: 80, color: 'blue' }, { x: 60, y: 80, color: 'blue' }, { x: 90, y: 80, color: 'blue' }], shapes: [{ type: 'circle', x: 30, y: 40, r: 12, dashed: true }, { type: 'circle', x: 60, y: 40, r: 12, dashed: true }, { type: 'circle', x: 90, y: 40, r: 12, dashed: true }, { type: 'circle', x: 30, y: 80, r: 12, dashed: true }, { type: 'circle', x: 60, y: 80, r: 12, dashed: true }, { type: 'circle', x: 90, y: 80, r: 12, dashed: true }], text: [{ x: 60, y: 108, content: 'Ball mastery warmup', size: 8 }] },
};

// Main visualization component that selects the right view
const DrillVisualization = ({ drill }) => {
  const config = drillConfigs[drill.id] || { view: 'topdown', type: 'field', players: [] };
  
  if (config.view === 'firstperson') {
    return <FirstPersonView drill={drill} config={config} />;
  }
  return <TopDownView drill={drill} config={config} />;
};

// Main DrillsPage Component
const DrillsPage = ({ drills = [] }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const [viewMode, setViewMode] = React.useState('grid');
  const [expandedDrills, setExpandedDrills] = React.useState({});

  const categoryColors = {
    'Passing & Receiving': '#3b82f6',
    'Dribbling & Ball Control': '#10b981',
    'Shooting & Finishing': '#ef4444',
    'Defending': '#f59e0b',
    'Goalkeeping': '#8b5cf6',
    'Tactical': '#06b6d4',
    'Set Pieces': '#ec4899',
    'Small-Sided Games': '#84cc16',
    'Conditioning': '#f97316',
    'Warmup': '#6366f1'
  };

  const allCategories = Object.keys(categoryColors);

  const filteredDrills = drills.filter(drill => {
    const matchesSearch = drill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(drill.category);
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleExpanded = (drillId) => {
    setExpandedDrills(prev => ({ ...prev, [drillId]: !prev[drillId] }));
  };

  return (
    <div style={{ padding: '20px', background: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>Drill Library</h1>
      
      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search drills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '16px' }}
        />
      </div>

      {/* Category Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: 'none',
              background: selectedCategories.includes(cat) ? categoryColors[cat] : '#334155',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setViewMode('grid')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: viewMode === 'grid' ? '#3b82f6' : '#334155', color: '#fff', cursor: 'pointer' }}>Grid</button>
        <button onClick={() => setViewMode('list')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? '#3b82f6' : '#334155', color: '#fff', cursor: 'pointer' }}>List</button>
      </div>

      {/* Drills Display */}
      <div style={{ display: viewMode === 'grid' ? 'grid' : 'flex', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', flexDirection: 'column' }}>
        {filteredDrills.map(drill => (
          <div
            key={drill.id}
            style={{
              background: '#1e293b',
              borderRadius: '12px',
              border: `2px solid ${categoryColors[drill.category] || '#334155'}`,
              overflow: 'hidden',
              transition: 'transform 0.2s'
            }}
          >
            {/* Header */}
            <div
              onClick={() => toggleExpanded(drill.id)}
              style={{ padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <span style={{ background: categoryColors[drill.category], padding: '4px 8px', borderRadius: '4px', fontSize: '10px', marginRight: '8px' }}>{drill.category}</span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '16px' }}>{drill.name}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{drill.difficulty} • {drill.duration}</p>
              </div>
              <span style={{ fontSize: '20px', transform: expandedDrills[drill.id] ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
            </div>

            {/* Expanded Content */}
            {expandedDrills[drill.id] && (
              <div style={{ padding: '0 16px 16px' }}>
                <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '16px' }}>{drill.description}</p>
                
                {/* Visualization */}
                <DrillVisualization drill={drill} />

                {/* Setup & Instructions */}
                {drill.setup && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#3b82f6' }}>Setup</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>{drill.setup}</p>
                  </div>
                )}
                {drill.instructions && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#10b981' }}>Instructions</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#94a3b8' }}>
                      {drill.instructions.map((inst, i) => <li key={i} style={{ marginBottom: '4px' }}>{inst}</li>)}
                    </ul>
                  </div>
                )}
                {drill.keyPoints && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#f59e0b' }}>Key Points</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#94a3b8' }}>
                      {drill.keyPoints.map((point, i) => <li key={i} style={{ marginBottom: '4px' }}>{point}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredDrills.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>No drills found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default DrillsPage;
