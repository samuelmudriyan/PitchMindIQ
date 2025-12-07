import React, { useState, useMemo } from 'react';
import drillsData from './DrillData';

const C = { blue: '#3b82f6', red: '#ef4444', gk: '#22c55e', green: '#10b981', yellow: '#fbbf24', white: '#fff', orange: '#f97316' };

// Realistic 3D Player
const Player3D = ({ x, y, s = 1, c = C.blue, n, gk }) => (
  <g transform={`translate(${x},${y})`}>
    <ellipse cx="0" cy={20*s} rx={12*s} ry={4*s} fill="rgba(0,0,0,0.3)" />
    <rect x={-6*s} y={8*s} width={4*s} height={12*s} fill="#1e293b" rx={2*s} />
    <rect x={2*s} y={8*s} width={4*s} height={12*s} fill="#1e293b" rx={2*s} />
    <rect x={-6*s} y={15*s} width={4*s} height={5*s} fill={c} rx={1*s} />
    <rect x={2*s} y={15*s} width={4*s} height={5*s} fill={c} rx={1*s} />
    <ellipse cx={-4*s} cy={20*s} rx={3*s} ry={1.5*s} fill="#1a1a1a" />
    <ellipse cx={4*s} cy={20*s} rx={3*s} ry={1.5*s} fill="#1a1a1a" />
    <path d={`M${-10*s} ${-8*s}Q${-12*s} ${-5*s} ${-10*s} ${8*s}L${10*s} ${8*s}Q${12*s} ${-5*s} ${10*s} ${-8*s}Q${5*s} ${-12*s} 0 ${-12*s}Q${-5*s} ${-12*s} ${-10*s} ${-8*s}`} fill={c} stroke="rgba(0,0,0,0.2)" strokeWidth={0.5*s} />
    <line x1={0} y1={-10*s} x2={0} y2={6*s} stroke="rgba(255,255,255,0.15)" strokeWidth={1*s} />
    <rect x={-13*s} y={-8*s} width={3*s} height={10*s} fill="#f5d0c5" rx={1.5*s} />
    <rect x={10*s} y={-8*s} width={3*s} height={10*s} fill="#f5d0c5" rx={1.5*s} />
    {n && <text x={0} y={2*s} textAnchor="middle" fill="#fff" fontSize={10*s} fontWeight="bold">{n}</text>}
    <rect x={-2*s} y={-15*s} width={4*s} height={4*s} fill="#f5d0c5" />
    <ellipse cx={0} cy={-20*s} rx={6*s} ry={7*s} fill="#f5d0c5" />
    <ellipse cx={0} cy={-23*s} rx={6*s} ry={5*s} fill="#2d1810" />
    {gk && <><ellipse cx={-12*s} cy={1*s} rx={3*s} ry={4*s} fill="#f59e0b"/><ellipse cx={12*s} cy={1*s} rx={3*s} ry={4*s} fill="#f59e0b"/></>}
  </g>
);

// First Person View
const FPV = ({ drill, cfg }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: 'linear-gradient(180deg,#1a472a,#0d2818)', borderRadius: 12, marginBottom: 16 }}>
    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>👁️ First Person View</div>
    <svg viewBox="0 0 300 220" style={{ width: '100%', maxWidth: 400, borderRadius: 8 }}>
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1e3a5f"/><stop offset="100%" stopColor="#2d4a69"/></linearGradient>
        <linearGradient id="grass" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1a5c32"/><stop offset="50%" stopColor="#1e6b3a"/><stop offset="100%" stopColor="#0d3d1f"/></linearGradient>
      </defs>
      <rect x="0" y="0" width="300" height="90" fill="url(#sky)"/>
      {[50,250].map(x=><><circle key={x} cx={x} cy="25" r="4" fill="#fef9c3"/><circle cx={x} cy="25" r="20" fill="rgba(255,255,220,0.05)"/></>)}
      <polygon points="0,90 300,90 300,220 0,220" fill="url(#grass)"/>
      {[[150,90,0,220],[150,90,300,220],[150,90,75,220],[150,90,225,220]].map(([x1,y1,x2,y2],i)=><line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth={i<2?1:0.5}/>)}
      <rect x="90" y="50" width="120" height="40" fill="rgba(255,255,255,0.08)"/>
      {[...Array(13)].map((_,i)=><line key={`v${i}`} x1={90+i*10} y1="50" x2={90+i*10} y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>)}
      {[...Array(9)].map((_,i)=><line key={`h${i}`} x1="90" y1={50+i*5} x2="210" y2={50+i*5} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>)}
      <rect x="87" y="48" width="6" height="44" fill="#fff"/><rect x="207" y="48" width="6" height="44" fill="#fff"/>
      <rect x="87" y="46" width="126" height="6" fill="#fff"/><polygon points="90,46 87,43 213,43 210,46" fill="#ddd"/>
      {cfg.gk!==false && <Player3D x={cfg.gkX||150} y={95} s={1} c={C.gk} n={1} gk/>}
      {cfg.defenders?.map((d,i)=><Player3D key={i} x={d.x} y={d.y} s={(d.size||10)/10} c={C.red} n={d.label||(i+2)}/>)}
      {cfg.teammates?.map((t,i)=><Player3D key={i} x={t.x} y={t.y} s={(t.size||10)/10} c={C.blue} n={t.label||(i+7)}/>)}
      {cfg.crossPath && <path d={cfg.crossPath} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.9"/>}
      {cfg.targetZone && <ellipse cx={cfg.targetZone.x} cy={cfg.targetZone.y} rx={cfg.targetZone.rx||20} ry={cfg.targetZone.ry||8} fill="rgba(16,185,129,0.3)" stroke="#10b981" strokeWidth="2" strokeDasharray="4,2"/>}
      {cfg.shotTargets?.map((t,i)=><g key={i}><circle cx={t.x} cy={t.y} r="10" fill="none" stroke="#10b981" strokeWidth="2"/><circle cx={t.x} cy={t.y} r="4" fill="#10b981"/></g>)}
      <g transform="translate(150,200)"><ellipse cx="0" cy="5" rx="10" ry="3" fill="rgba(0,0,0,0.4)"/><circle r="8" fill="#fff" stroke="#333"/>{[[0,0,3],[-5,-3,2],[5,-3,2],[-3,5,2],[3,5,2]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill="#333"/>)}</g>
      <ellipse cx="165" cy="210" rx="12" ry="5" fill="#1a1a1a" opacity="0.8"/>
      {cfg.instruction && <text x="150" y="18" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">{cfg.instruction}</text>}
    </svg>
    <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap', justifyContent: 'center' }}>
      {[['GK',C.gk],['Defenders',C.red],['Teammates',C.blue]].map(([l,c])=><span key={l} style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:14,height:14,borderRadius:'50%',background:c,border:'2px solid #fff'}}/>{l}</span>)}
    </div>
  </div>
);

// Top Down View
const TDV = ({ drill, cfg }) => {
  const sm = cfg.type==='small', vb = sm?'0 0 120 120':'0 0 200 140';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 12, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>📐 Top-Down View</div>
      <svg viewBox={vb} style={{ width: '100%', maxWidth: sm?260:320, background: 'linear-gradient(135deg,#1a5c32,#1e6b3a,#145228)', borderRadius: 8, border: '2px solid #2d5a3d' }}>
        {sm ? <rect x="10" y="10" width="100" height="100" fill="none" stroke="#3d7a4a" strokeWidth="2" strokeDasharray="5,5"/> : <>
          <rect x="5" y="5" width="190" height="130" fill="none" stroke="#3d7a4a" strokeWidth="2"/>
          <line x1="100" y1="5" x2="100" y2="135" stroke="#3d7a4a" strokeWidth="1.5"/>
          <circle cx="100" cy="70" r="20" fill="none" stroke="#3d7a4a" strokeWidth="1.5"/>
          <rect x="5" y="35" width="30" height="70" fill="none" stroke="#3d7a4a"/><rect x="165" y="35" width="30" height="70" fill="none" stroke="#3d7a4a"/>
          <rect x="5" y="50" width="3" height="40" fill="rgba(255,255,255,0.5)"/><rect x="192" y="50" width="3" height="40" fill="rgba(255,255,255,0.5)"/>
        </>}
        {cfg.shapes?.map((s,i)=>s.type==='rect'?<rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.fill||'none'} stroke={s.stroke||'#fff'} strokeWidth="1.5" strokeDasharray={s.dashed?"5,5":"0"} opacity={s.opacity||0.4} rx={s.rx||0}/>:<circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.fill||'none'} stroke={s.stroke||'#fff'} strokeWidth="1.5" strokeDasharray={s.dashed?"5,5":"0"} opacity={s.opacity||0.4}/>)}
        {cfg.lines?.map((l,i)=><line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={C[l.color]||l.color||'#fbbf24'} strokeWidth={l.width||1.5} strokeDasharray={l.dashed?"4,4":"0"} opacity={l.opacity||1}/>)}
        {cfg.paths?.map((p,i)=><path key={i} d={p.d} fill="none" stroke={C[p.color]||p.color||'#fbbf24'} strokeWidth={p.width||2} strokeDasharray={p.dashed!==false?"5,4":"0"}/>)}
        {cfg.zones?.map((z,i)=><rect key={i} x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color||'rgba(16,185,129,0.2)'} stroke={z.border||'#10b981'} strokeDasharray="3,3" rx="4"/>)}
        {cfg.cones?.map((c,i)=><polygon key={i} points={`${c.x},${c.y-6} ${c.x-5},${c.y+4} ${c.x+5},${c.y+4}`} fill="#f97316" stroke="#fff"/>)}
        {cfg.arrows?.map((a,i)=>{const id=`a${drill.id}-${i}`,col=C[a.color]||a.color||'#10b981';return<g key={i}><defs><marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0,6 3,0 6" fill={col}/></marker></defs><line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={col} strokeWidth={a.width||2} strokeDasharray={a.dashed?"5,4":"0"} markerEnd={`url(#${id})`}/></g>})}
        {cfg.curves?.map((c,i)=>{const id=`c${drill.id}-${i}`,col=C[c.color]||c.color||'#10b981',mx=(c.x1+c.x2)/2+(c.curveX||0),my=(c.y1+c.y2)/2+(c.curveY||c.curve||-20);return<g key={i}><defs><marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0,6 3,0 6" fill={col}/></marker></defs><path d={`M${c.x1} ${c.y1}Q${mx} ${my} ${c.x2} ${c.y2}`} fill="none" stroke={col} strokeWidth={c.width||2} strokeDasharray={c.dashed?"5,4":"0"} markerEnd={`url(#${id})`}/></g>})}
        {cfg.players?.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r={p.size||10} fill={C[p.color]||p.color||C.blue} stroke="#fff" strokeWidth="2"/>{p.label&&<text x={p.x} y={p.y+3} textAnchor="middle" fill="#fff" fontSize={p.labelSize||8} fontWeight="bold">{p.label}</text>}</g>)}
        {cfg.ball && <circle cx={cfg.ball.x} cy={cfg.ball.y} r={cfg.ball.size||5} fill="#fff" stroke="#333"/>}
        {cfg.text?.map((t,i)=><text key={i} x={t.x} y={t.y} textAnchor="middle" fill={t.color||'#fff'} fontSize={t.size||8} opacity={t.opacity||0.8} fontWeight={t.bold?'bold':'normal'}>{t.content}</text>)}
      </svg>
      <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[['Attackers',C.blue],['Defenders',C.red],['GK',C.gk]].map(([l,c])=><span key={l} style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:10,height:10,borderRadius:'50%',background:c,border:'1px solid #fff'}}/>{l}</span>)}
        <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:0,height:0,borderLeft:'5px solid transparent',borderRight:'5px solid transparent',borderBottom:'8px solid #f97316'}}/>Cones</span>
      </div>
    </div>
  );
};

// Drill configs - compressed
const DC = {
  1:{type:'small',players:[{x:60,y:18,color:'blue',label:'A'},{x:100,y:95,color:'blue',label:'B'},{x:20,y:95,color:'blue',label:'C'}],cones:[{x:60,y:18},{x:100,y:95},{x:20,y:95}],ball:{x:52,y:23},arrows:[{x1:55,y1:26,x2:28,y2:85,color:'green'}],text:[{x:60,y:110,content:'Triangle passing',size:8}]},
  2:{type:'small',players:[{x:60,y:15,color:'blue',label:'1'},{x:105,y:60,color:'blue',label:'2'},{x:60,y:105,color:'blue',label:'3'},{x:15,y:60,color:'blue',label:'4'},{x:60,y:60,color:'red',label:'D'}],ball:{x:52,y:20},shapes:[{type:'rect',x:15,y:15,w:90,h:90,dashed:true}],text:[{x:60,y:8,content:'4v1 Rondo',size:8}]},
  3:{type:'small',players:[{x:60,y:10,color:'blue',label:'1'},{x:105,y:35,color:'blue',label:'2'},{x:90,y:95,color:'blue',label:'3'},{x:30,y:95,color:'blue',label:'4'},{x:15,y:35,color:'blue',label:'5'},{x:50,y:55,color:'red'},{x:70,y:70,color:'red'}],ball:{x:52,y:15},shapes:[{type:'circle',x:60,y:55,r:48,dashed:true}]},
  4:{players:[{x:45,y:70,color:'blue',label:'1'},{x:100,y:70,color:'blue',label:'2'},{x:130,y:70,color:'red',label:'D'}],ball:{x:53,y:68},arrows:[{x1:55,y1:68,x2:92,y2:68,color:'green'}],curves:[{x1:50,y1:75,x2:145,y2:50,curve:35,color:'yellow',dashed:true}],text:[{x:100,y:95,content:'Wall pass',size:8}]},
  5:{players:[{x:35,y:100,color:'blue',label:'Pass'},{x:165,y:40,color:'blue',label:'Recv'}],cones:[{x:155,y:30},{x:175,y:30},{x:155,y:50},{x:175,y:50}],ball:{x:43,y:98},curves:[{x1:45,y1:95,x2:160,y2:42,curve:-40,color:'white'}],zones:[{x:155,y:30,w:20,h:20}]},
  6:{players:[{x:30,y:95,color:'blue',label:'LB'},{x:100,y:70,color:'blue',label:'CM'},{x:170,y:45,color:'blue',label:'RW'}],ball:{x:38,y:93},arrows:[{x1:40,y1:93,x2:92,y2:72,color:'green'}],curves:[{x1:105,y1:68,x2:162,y2:48,curve:-20,color:'yellow'}],text:[{x:100,y:115,content:'Switch play',size:8}]},
  7:{type:'small',players:[{x:60,y:105,color:'blue',label:'1'},{x:60,y:60,color:'blue',label:'2'},{x:25,y:18,color:'blue',label:'3'},{x:95,y:18,color:'blue',label:'4'}],cones:[{x:60,y:105},{x:60,y:60},{x:25,y:18},{x:95,y:18}],ball:{x:52,y:100},arrows:[{x1:55,y1:98,x2:55,y2:68,color:'green'}]},
  8:{players:[{x:50,y:90,color:'blue',label:'Pass'},{x:145,y:50,color:'blue',label:'Run'},{x:100,y:60,color:'red'},{x:100,y:80,color:'red'}],cones:[{x:130,y:55},{x:130,y:75}],ball:{x:58,y:88},arrows:[{x1:60,y1:88,x2:125,y2:65,color:'green'}],text:[{x:130,y:90,content:'Through gate',size:8}]},
  9:{players:[{x:50,y:95,color:'blue',label:'FB'},{x:95,y:70,color:'blue',label:'W'},{x:125,y:75,color:'red',label:'D'}],ball:{x:58,y:93},arrows:[{x1:60,y1:93,x2:88,y2:72,color:'green'}],curves:[{x1:55,y1:98,x2:155,y2:45,curve:45,color:'yellow',dashed:true}],text:[{x:100,y:115,content:'Overlap run',size:8}]},
  10:{type:'small',players:[{x:20,y:60,color:'blue',label:'1'},{x:60,y:60,color:'blue',label:'P'},{x:100,y:60,color:'blue',label:'2'},{x:60,y:45,color:'red',label:'D'}],ball:{x:28,y:58},arrows:[{x1:30,y1:58,x2:52,y2:58,color:'green'},{x1:68,y1:62,x2:92,y2:62,color:'green'}],text:[{x:60,y:95,content:'Pivot passing',size:8}]},
  11:{type:'small',players:[{x:60,y:15,color:'blue'},{x:98,y:38,color:'blue'},{x:98,y:82,color:'blue'},{x:60,y:105,color:'blue'},{x:22,y:82,color:'blue'},{x:22,y:38,color:'blue'}],ball:{x:52,y:20},shapes:[{type:'circle',x:60,y:60,r:45,dashed:true}],text:[{x:60,y:8,content:'One touch circle',size:8}]},
  12:{players:[{x:40,y:105,color:'blue',label:'1'},{x:100,y:60,color:'blue',label:'2'},{x:160,y:105,color:'blue',label:'3'}],cones:[{x:40,y:105},{x:100,y:60},{x:160,y:105}],ball:{x:48,y:103},arrows:[{x1:50,y1:102,x2:92,y2:65,color:'green'},{x1:108,y1:62,x2:152,y2:100,color:'white',dashed:true}]},
  13:{type:'small',players:[{x:18,y:18,color:'blue',label:'1'},{x:102,y:18,color:'blue',label:'2'},{x:102,y:102,color:'blue',label:'3'},{x:18,y:102,color:'blue',label:'4'},{x:60,y:60,color:'red',label:'D'}],ball:{x:26,y:18},shapes:[{type:'rect',x:18,y:18,w:84,h:84,dashed:true}]},
  14:{players:[{x:50,y:95,color:'blue',label:'1'},{x:100,y:70,color:'blue',label:'2'},{x:150,y:95,color:'blue',label:'3'}],ball:{x:58,y:93},arrows:[{x1:60,y1:92,x2:92,y2:72,color:'green'}],curves:[{x1:108,y1:68,x2:165,y2:50,curve:-20,color:'green'},{x1:155,y1:92,x2:170,y2:55,curve:25,color:'yellow',dashed:true}],text:[{x:150,y:110,content:'3rd man',size:8}]},
  15:{players:[{x:30,y:70,color:'blue',label:'CB'},{x:100,y:70,color:'blue',label:'CM'},{x:170,y:70,color:'blue',label:'W'}],ball:{x:38,y:68},arrows:[{x1:40,y1:68,x2:92,y2:68,color:'green'},{x1:108,y1:68,x2:162,y2:68,color:'green'}],text:[{x:100,y:100,content:'Build from back',size:8}]},
  16:{players:[{x:100,y:110,color:'blue',label:'1'},{x:100,y:70,color:'blue',label:'2'},{x:100,y:30,color:'blue',label:'3'}],ball:{x:100,y:102},arrows:[{x1:100,y1:100,x2:100,y2:78,color:'green'},{x1:100,y1:62,x2:100,y2:38,color:'green'}],text:[{x:100,y:125,content:'Vertical passing',size:8}]},
  17:{type:'small',players:[{x:20,y:60,color:'blue'},{x:60,y:60,color:'blue'},{x:100,y:60,color:'blue'}],ball:{x:28,y:58},arrows:[{x1:30,y1:58,x2:52,y2:58,color:'green'},{x1:68,y1:58,x2:92,y2:58,color:'green'}],text:[{x:60,y:90,content:'Direct passing',size:8}]},
  18:{players:[{x:50,y:100,color:'blue',label:'1'},{x:100,y:55,color:'blue',label:'2'},{x:150,y:100,color:'blue',label:'3'},{x:100,y:75,color:'red'}],ball:{x:58,y:98},curves:[{x1:60,y1:95,x2:95,y2:60,curve:25,color:'green'}],text:[{x:100,y:120,content:'Combination play',size:8}]},
  19:{players:[{x:40,y:90,color:'blue',label:'CM'},{x:160,y:40,color:'blue',label:'W'}],ball:{x:48,y:88},curves:[{x1:50,y1:85,x2:155,y2:45,curve:-50,color:'yellow'}],text:[{x:100,y:115,content:'Diagonal ball',size:8}]},
  20:{players:[{x:30,y:70,color:'gk',label:'GK'},{x:60,y:50,color:'blue',label:'CB'},{x:60,y:90,color:'blue',label:'CB'},{x:100,y:70,color:'blue',label:'DM'}],ball:{x:38,y:68},arrows:[{x1:40,y1:68,x2:52,y2:55,color:'green'}],text:[{x:100,y:115,content:'GK distribution',size:8}]},
  21:{type:'small',players:[{x:30,y:30,color:'blue'},{x:90,y:30,color:'blue'},{x:30,y:90,color:'blue'},{x:90,y:90,color:'blue'},{x:60,y:60,color:'red'}],ball:{x:38,y:30},shapes:[{type:'rect',x:25,y:25,w:70,h:70,dashed:true}],text:[{x:60,y:110,content:'Keep ball 4v1',size:8}]},
  22:{view:'fp',gkX:145,defenders:[{x:100,y:95,size:11},{x:160,y:100,size:12}],teammates:[{x:200,y:145,size:10,label:'W'}],crossPath:'M195 140Q170 100 140 160',targetZone:{x:145,y:160,rx:25,ry:10},instruction:'Cross delivery'},
  23:{players:[{x:50,y:70,color:'blue',label:'1'},{x:100,y:70,color:'blue',label:'2'},{x:150,y:70,color:'blue',label:'3'}],ball:{x:58,y:68},arrows:[{x1:60,y1:68,x2:92,y2:68,color:'green'},{x1:108,y1:68,x2:142,y2:68,color:'green'}],text:[{x:100,y:95,content:'Quick passing',size:8}]},
  24:{players:[{x:100,y:95,color:'blue',label:'1'},{x:150,y:50,color:'blue',label:'2'},{x:50,y:50,color:'blue',label:'3'},{x:100,y:70,color:'red'}],ball:{x:92,y:93},curves:[{x1:95,y1:90,x2:145,y2:55,curve:-30,color:'green'}],text:[{x:100,y:120,content:'Split defenders',size:8}]},
  25:{players:[{x:50,y:70,color:'blue',label:'DM'},{x:100,y:50,color:'blue',label:'CM'},{x:150,y:30,color:'blue',label:'ST'}],ball:{x:58,y:68},arrows:[{x1:60,y1:66,x2:92,y2:54,color:'green'}],curves:[{x1:108,y1:48,x2:145,y2:35,curve:-15,color:'yellow'}],text:[{x:100,y:85,content:'Progress ball',size:8}]},
  // Dribbling 26-50
  26:{type:'small',players:[{x:60,y:100,color:'blue'}],cones:[{x:60,y:20},{x:60,y:40},{x:60,y:60},{x:60,y:80}],ball:{x:52,y:95},arrows:[{x1:55,y1:92,x2:55,y2:25,color:'green'}],text:[{x:60,y:110,content:'Cone weave',size:8}]},
  27:{type:'small',players:[{x:60,y:100,color:'blue'},{x:60,y:40,color:'red',label:'D'}],ball:{x:52,y:95},arrows:[{x1:55,y1:90,x2:55,y2:50,color:'green'}],curves:[{x1:55,y1:50,x2:45,y2:25,curve:20,color:'yellow',dashed:true}],text:[{x:60,y:110,content:'1v1 take on',size:8}]},
  28:{type:'small',players:[{x:60,y:90,color:'blue'}],ball:{x:52,y:85},shapes:[{type:'circle',x:60,y:50,r:30,dashed:true}],arrows:[{x1:55,y1:82,x2:35,y2:55,color:'green'}],text:[{x:60,y:110,content:'Circle dribble',size:8}]},
  29:{type:'small',players:[{x:20,y:60,color:'blue'},{x:100,y:60,color:'blue'}],ball:{x:28,y:58},arrows:[{x1:30,y1:58,x2:92,y2:58,color:'green'}],text:[{x:60,y:90,content:'Speed dribble',size:8}]},
  30:{type:'small',players:[{x:60,y:95,color:'blue'}],cones:[{x:30,y:30},{x:50,y:50},{x:70,y:30},{x:90,y:50}],ball:{x:52,y:90},paths:[{d:'M55 85L35 40L55 55L75 35L95 55',color:'green'}],text:[{x:60,y:110,content:'Zig-zag',size:8}]},
  31:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:52,y:75},cones:[{x:40,y:30},{x:80,y:30}],arrows:[{x1:55,y1:72,x2:45,y2:38,color:'green'}],text:[{x:60,y:100,content:'Stop & go',size:8}]},
  32:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:68,y:78},arrows:[{x1:70,y1:75,x2:70,y2:60,color:'green'},{x1:68,y1:58,x2:50,y2:55,color:'yellow',dashed:true}],text:[{x:60,y:100,content:'Cut inside',size:8}]},
  33:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:52,y:78},curves:[{x1:50,y1:75,x2:45,y2:40,curve:25,color:'green'}],text:[{x:60,y:100,content:'Outside hook',size:8}]},
  34:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:68,y:78},arrows:[{x1:70,y1:75,x2:70,y2:55,color:'green'},{x1:68,y1:53,x2:85,y2:40,color:'yellow',dashed:true}],text:[{x:60,y:100,content:'Step over',size:8}]},
  35:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:52,y:78},arrows:[{x1:50,y1:75,x2:70,y2:40,color:'green'}],text:[{x:60,y:100,content:'Cruyff turn',size:8}]},
  36:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:68,y:78},curves:[{x1:70,y1:75,x2:35,y2:35,curve:-30,color:'green'}],text:[{x:60,y:100,content:'Drag back',size:8}]},
  37:{players:[{x:170,y:70,color:'blue',label:'W'},{x:140,y:70,color:'red'}],ball:{x:168,y:62},arrows:[{x1:168,y1:65,x2:168,y2:35,color:'green'}],text:[{x:155,y:100,content:'Beat defender',size:8}]},
  38:{view:'fp',gkX:150,defenders:[{x:130,y:105,size:13}],teammates:[{x:75,y:160,size:10,label:'9'}],crossPath:'M80 155Q110 130 145 165',instruction:'Deliver cross'},
  39:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:52,y:78},cones:[{x:30,y:40},{x:90,y:40}],curves:[{x1:50,y1:75,x2:35,y2:48,curve:15,color:'green'},{x1:37,y1:45,x2:85,y2:45,curve:-20,color:'yellow',dashed:true}],text:[{x:60,y:100,content:'Shuffle',size:8}]},
  40:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:52,y:78},arrows:[{x1:50,y1:75,x2:50,y2:55,color:'green'},{x1:48,y1:52,x2:35,y2:35,color:'yellow',dashed:true}],text:[{x:60,y:100,content:'Body feint',size:8}]},
  41:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:68,y:78},curves:[{x1:70,y1:75,x2:55,y2:35,curve:30,color:'green'}],text:[{x:60,y:100,content:'Matthews move',size:8}]},
  42:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:52,y:78},arrows:[{x1:50,y1:75,x2:68,y2:50,color:'green'},{x1:70,y1:48,x2:82,y2:35,color:'yellow',dashed:true}],text:[{x:60,y:100,content:'La croqueta',size:8}]},
  43:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:60,y:70},arrows:[{x1:58,y1:68,x2:45,y2:35,color:'green'}],text:[{x:60,y:100,content:'Elastico',size:8}]},
  44:{players:[{x:140,y:60,color:'blue',label:'W'},{x:110,y:70,color:'red'}],ball:{x:148,y:58},curves:[{x1:145,y1:55,x2:85,y2:50,curve:-25,color:'green'}],text:[{x:115,y:95,content:'Escape pressure',size:8}]},
  45:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:52,y:78},arrows:[{x1:50,y1:75,x2:50,y2:55,color:'green'},{x1:52,y1:52,x2:70,y2:35,color:'yellow',dashed:true}],text:[{x:60,y:100,content:'Reverse step',size:8}]},
  46:{players:[{x:140,y:70,color:'blue'},{x:100,y:70,color:'red'}],ball:{x:148,y:68},curves:[{x1:145,y1:65,x2:65,y2:65,curve:30,color:'green'}],text:[{x:105,y:100,content:'Run with ball',size:8}]},
  47:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:52,y:78},arrows:[{x1:50,y1:75,x2:68,y2:50,color:'green'}],text:[{x:60,y:100,content:'Heel flick',size:8}]},
  48:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:60,y:72},arrows:[{x1:58,y1:70,x2:42,y2:35,color:'green'},{x1:62,y1:70,x2:78,y2:35,color:'yellow',dashed:true}],text:[{x:60,y:100,content:'Nutmeg',size:8}]},
  49:{players:[{x:160,y:70,color:'blue',label:'W'},{x:130,y:60,color:'red'},{x:130,y:80,color:'red'}],ball:{x:168,y:68},curves:[{x1:165,y1:65,x2:100,y2:65,curve:-35,color:'green'}],text:[{x:135,y:105,content:'Beat 2 defenders',size:8}]},
  50:{type:'small',players:[{x:60,y:80,color:'blue'}],ball:{x:60,y:72},shapes:[{type:'rect',x:45,y:20,w:30,h:40,fill:'rgba(16,185,129,0.2)',stroke:'#10b981',dashed:true}],arrows:[{x1:58,y1:70,x2:58,y2:35,color:'green'}],text:[{x:60,y:100,content:'Tight space control',size:8}]},
  // Shooting 51-75 - First Person Views
  51:{view:'fp',gkX:150,defenders:[],teammates:[],shotTargets:[{x:115,y:58},{x:185,y:58}],instruction:'Pick your corner'},
  52:{view:'fp',gkX:150,defenders:[{x:140,y:110,size:11}],shotTargets:[{x:115,y:60}],instruction:'Quick release'},
  53:{view:'fp',gkX:148,defenders:[{x:120,y:100,size:12},{x:175,y:105,size:11}],shotTargets:[{x:190,y:55}],instruction:'Bend it far post'},
  54:{view:'fp',gkX:150,defenders:[{x:135,y:115,size:10}],shotTargets:[{x:120,y:60},{x:180,y:60}],instruction:'Volley finish'},
  55:{view:'fp',gkX:150,defenders:[{x:145,y:95,size:13}],shotTargets:[{x:120,y:58}],instruction:'Header on target'},
  56:{view:'fp',gkX:150,defenders:[],shotTargets:[{x:115,y:56},{x:150,y:50},{x:185,y:56}],instruction:'First-time finish'},
  57:{view:'fp',gkX:150,defenders:[{x:170,y:105,size:12}],teammates:[{x:90,y:145,size:10,label:'7'}],crossPath:'M95 140Q120 115 145 165',instruction:'Tap in'},
  58:{view:'fp',gkX:145,defenders:[{x:130,y:100,size:14}],shotTargets:[{x:190,y:58}],instruction:'Chip the keeper'},
  59:{view:'fp',gkX:150,defenders:[{x:125,y:115,size:11},{x:175,y:115,size:11}],shotTargets:[{x:150,y:52}],instruction:'Low & hard'},
  60:{view:'fp',gkX:150,defenders:[{x:160,y:100,size:13}],shotTargets:[{x:115,y:55}],instruction:'Cut back & shoot'},
  61:{view:'fp',gkX:155,defenders:[{x:145,y:105,size:12}],shotTargets:[{x:115,y:60}],instruction:'Hit across goal'},
  62:{view:'fp',gkX:148,defenders:[],shotTargets:[{x:115,y:55},{x:185,y:55}],instruction:'Penalty technique'},
  63:{view:'fp',gkX:150,defenders:[{x:140,y:98,size:14}],shotTargets:[{x:185,y:58}],instruction:'Power shot'},
  64:{view:'fp',gkX:150,defenders:[{x:155,y:110,size:11}],shotTargets:[{x:115,y:60}],instruction:'Finesse shot'},
  65:{view:'fp',gkX:145,defenders:[{x:135,y:100,size:15}],shotTargets:[{x:180,y:60}],instruction:'Tight angle finish'},
  66:{view:'fp',gkX:150,defenders:[{x:130,y:110,size:12}],teammates:[{x:80,y:155,size:11,label:'10'}],crossPath:'M85 150Q115 125 140 165',instruction:'Near post flick'},
  67:{view:'fp',gkX:150,defenders:[{x:160,y:100,size:13}],instruction:'Control & finish'},
  68:{view:'fp',gkX:150,defenders:[{x:145,y:105,size:12}],shotTargets:[{x:115,y:58},{x:185,y:58}],instruction:'Overhead kick'},
  69:{view:'fp',gkX:150,defenders:[{x:140,y:100,size:13}],shotTargets:[{x:185,y:55}],instruction:'Backheel shot'},
  70:{view:'fp',gkX:150,defenders:[{x:130,y:110,size:11},{x:170,y:110,size:11}],shotTargets:[{x:150,y:50}],instruction:'Half-volley'},
  71:{view:'fp',gkX:150,defenders:[{x:155,y:105,size:14}],instruction:'Running header'},
  72:{view:'fp',gkX:150,defenders:[{x:165,y:100,size:12}],shotTargets:[{x:115,y:58}],instruction:'Outside foot shot'},
  73:{view:'fp',gkX:150,defenders:[{x:140,y:108,size:11}],shotTargets:[{x:115,y:56},{x:185,y:56}],instruction:'Driven shot'},
  74:{view:'fp',gkX:150,defenders:[{x:130,y:100,size:12},{x:170,y:105,size:12}],teammates:[{x:80,y:150,size:11,label:'M'}],crossPath:'M85 145Q120 130 145 170',shotTargets:[{x:185,y:60}],instruction:'Find space, finish'},
  75:{view:'fp',gkX:150,defenders:[{x:150,y:105,size:13}],teammates:[{x:90,y:140,size:12,label:'2'}],crossPath:'M95 135L140 165',shotTargets:[{x:115,y:58},{x:185,y:58}],instruction:'Combine & finish'},
  // Defending 76-95
  76:{type:'small',players:[{x:75,y:60,color:'red',label:'DEF'},{x:40,y:60,color:'blue',label:'ATT'}],ball:{x:48,y:58},arrows:[{x1:70,y1:60,x2:55,y2:60,color:'yellow',dashed:true}],text:[{x:60,y:90,content:'Jockey position',size:8}]},
  77:{players:[{x:75,y:45,color:'red',label:'P1'},{x:75,y:95,color:'red',label:'P2'},{x:120,y:70,color:'blue'}],ball:{x:128,y:68},arrows:[{x1:80,y1:50,x2:112,y2:65,color:'yellow',dashed:true},{x1:80,y1:90,x2:112,y2:75,color:'yellow',dashed:true}],text:[{x:100,y:115,content:'Press triggers',size:8}]},
  78:{players:[{x:175,y:30,color:'blue',label:'W'},{x:20,y:70,color:'gk',label:'GK'},{x:50,y:55,color:'red',label:'CB'},{x:50,y:85,color:'red',label:'CB'},{x:65,y:70,color:'blue',label:'ST'}],ball:{x:173,y:38},curves:[{x1:172,y1:35,x2:60,y2:65,curve:-30,color:'white'}],text:[{x:100,y:115,content:'Defend crosses',size:8}]},
  79:{players:[{x:110,y:70,color:'red',label:'DEF'},{x:140,y:50,color:'blue',label:'ATT'},{x:25,y:70,color:'gk',label:'GK'}],ball:{x:148,y:48},curves:[{x1:105,y1:72,x2:40,y2:68,curve:20,color:'yellow',dashed:true}],arrows:[{x1:145,y1:52,x2:40,y2:68,color:'white',dashed:true}],text:[{x:100,y:115,content:'Recovery run',size:8}]},
  80:{players:[{x:50,y:40,color:'red',label:'LB'},{x:80,y:50,color:'red',label:'CB'},{x:120,y:50,color:'red',label:'CB'},{x:150,y:40,color:'red',label:'RB'},{x:25,y:70,color:'gk',label:'GK'}],lines:[{x1:45,y1:48,x2:155,y2:48,color:'yellow',dashed:true}],text:[{x:100,y:75,content:'Back 4 shape',size:8}]},
  81:{players:[{x:90,y:70,color:'red',label:'DEF'},{x:120,y:70,color:'blue',label:'ATT'},{x:25,y:70,color:'gk',label:'GK'}],ball:{x:120,y:62},arrows:[{x1:115,y1:65,x2:35,y2:70,color:'white',dashed:true},{x1:95,y1:68,x2:110,y2:66,color:'red'}],text:[{x:100,y:100,content:'Block shot',size:8}]},
  82:{players:[{x:50,y:70,color:'red',label:'CB'},{x:80,y:60,color:'blue'},{x:25,y:70,color:'gk',label:'GK'}],ball:{x:58,y:68},curves:[{x1:60,y1:68,x2:160,y2:50,curve:-30,color:'yellow'}],text:[{x:100,y:100,content:'Clear to safety',size:8}]},
  83:{players:[{x:60,y:60,color:'red',label:'CB'},{x:60,y:80,color:'blue'},{x:25,y:70,color:'gk',label:'GK'},{x:170,y:30,color:'blue',label:'W'}],ball:{x:168,y:38},curves:[{x1:167,y1:35,x2:60,y2:58,curve:-25,color:'white'}],text:[{x:100,y:105,content:'Defensive header',size:8}]},
  84:{type:'small',players:[{x:55,y:60,color:'red',label:'DEF'},{x:70,y:60,color:'blue',label:'ATT'},{x:25,y:60,color:'blue',label:'P'}],ball:{x:33,y:58},lines:[{x1:57,y1:60,x2:68,y2:60,color:'yellow',width:3,opacity:0.5}],text:[{x:60,y:95,content:'Mark tight',size:8}]},
  85:{players:[{x:70,y:50,color:'red'},{x:70,y:90,color:'red'},{x:130,y:50,color:'red'},{x:130,y:90,color:'red'},{x:100,y:70,color:'blue'}],zones:[{x:50,y:35,w:40,h:35},{x:50,y:75,w:40,h:35},{x:110,y:35,w:40,h:35},{x:110,y:75,w:40,h:35}],text:[{x:100,y:120,content:'Zonal marking',size:8}]},
  86:{players:[{x:150,y:50,color:'red'},{x:150,y:90,color:'red'},{x:80,y:70,color:'blue'},{x:25,y:70,color:'gk',label:'GK'}],ball:{x:88,y:68},arrows:[{x1:145,y1:55,x2:95,y2:65,color:'yellow',dashed:true},{x1:145,y1:85,x2:95,y2:75,color:'yellow',dashed:true}],text:[{x:100,y:115,content:'Defensive transition',size:8}]},
  87:{type:'small',players:[{x:45,y:50,color:'red'},{x:45,y:70,color:'red'},{x:60,y:60,color:'blue'}],ball:{x:68,y:58},arrows:[{x1:50,y1:52,x2:58,y2:58,color:'yellow',dashed:true},{x1:50,y1:68,x2:58,y2:62,color:'yellow',dashed:true}],text:[{x:60,y:95,content:'Double team',size:8}]},
  88:{players:[{x:70,y:60,color:'red',label:'P'},{x:55,y:80,color:'red',label:'C'},{x:100,y:55,color:'blue'},{x:25,y:70,color:'gk',label:'GK'}],ball:{x:108,y:53},arrows:[{x1:75,y1:62,x2:95,y2:55,color:'yellow',dashed:true}],lines:[{x1:60,y1:78,x2:40,y2:70,color:'green',dashed:true}],text:[{x:100,y:105,content:'Press & cover',size:8}]},
  89:{players:[{x:50,y:60,color:'red'},{x:80,y:60,color:'red'},{x:110,y:60,color:'red'},{x:140,y:60,color:'red'},{x:100,y:45,color:'blue'},{x:25,y:70,color:'gk',label:'GK'}],lines:[{x1:45,y1:60,x2:145,y2:60,color:'yellow',width:2}],arrows:[{x1:50,y1:65,x2:50,y2:80,color:'red'},{x1:140,y1:65,x2:140,y2:80,color:'red'}],text:[{x:100,y:100,content:'Offside trap',size:8}]},
  90:{type:'small',players:[{x:70,y:60,color:'red',label:'DEF'},{x:50,y:60,color:'blue',label:'ATT'}],ball:{x:55,y:58},arrows:[{x1:68,y1:62,x2:58,y2:60,color:'yellow'}],text:[{x:60,y:90,content:'Tackle timing',size:8}]},
  91:{players:[{x:60,y:50,color:'red',label:'CB'},{x:60,y:90,color:'red',label:'CB'},{x:100,y:70,color:'red',label:'DM'},{x:25,y:70,color:'gk',label:'GK'}],arrows:[{x1:30,y1:68,x2:55,y2:55,color:'yellow',dashed:true},{x1:65,y1:55,x2:93,y2:68,color:'yellow',dashed:true}],text:[{x:100,y:115,content:'Communicate!',size:9,bold:true}]},
  92:{players:[{x:80,y:70,color:'red',label:'DM'},{x:120,y:50,color:'blue'},{x:120,y:90,color:'blue'},{x:50,y:70,color:'blue'}],ball:{x:58,y:68},lines:[{x1:60,y1:70,x2:115,y2:52,color:'red',dashed:true,opacity:0.5},{x1:60,y1:70,x2:115,y2:88,color:'red',dashed:true,opacity:0.5}],shapes:[{type:'circle',x:80,y:70,r:15,fill:'rgba(239,68,68,0.2)',stroke:'transparent'}],text:[{x:100,y:115,content:'Screen lanes',size:8}]},
  93:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:40,y:55,color:'red'},{x:40,y:70,color:'red'},{x:40,y:85,color:'red'},{x:55,y:60,color:'red'},{x:55,y:80,color:'red'},{x:192,y:8,color:'blue',label:'K'}],ball:{x:192,y:8},curves:[{x1:190,y1:12,x2:50,y2:65,curve:-30,color:'white'}],text:[{x:100,y:115,content:'Defend set piece',size:8}]},
  94:{players:[{x:100,y:55,color:'red'},{x:100,y:85,color:'red'},{x:130,y:70,color:'red'},{x:110,y:70,color:'blue'}],ball:{x:118,y:68},arrows:[{x1:105,y1:58,x2:112,y2:66,color:'yellow',dashed:true},{x1:105,y1:82,x2:112,y2:74,color:'yellow',dashed:true},{x1:125,y1:70,x2:118,y2:70,color:'yellow',dashed:true}],text:[{x:100,y:110,content:'Counter press',size:8}]},
  95:{players:[{x:170,y:35,color:'red',label:'FB'},{x:175,y:55,color:'blue',label:'W'},{x:25,y:70,color:'gk',label:'GK'}],ball:{x:175,y:47},arrows:[{x1:172,y1:40,x2:175,y2:50,color:'yellow',dashed:true}],lines:[{x1:170,y1:35,x2:25,y2:70,color:'green',dashed:true,opacity:0.3}],text:[{x:130,y:80,content:'1v1 wide',size:8}]},
  // Goalkeeping 96-110
  96:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:80,y:45,color:'blue',label:'1'},{x:80,y:95,color:'blue',label:'2'}],ball:{x:88,y:45},arrows:[{x1:85,y1:47,x2:32,y2:62,color:'red'},{x1:85,y1:93,x2:32,y2:78,color:'red',dashed:true}],text:[{x:100,y:115,content:'Shot stopping',size:8}]},
  97:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:160,y:35,color:'blue',label:'W'}],ball:{x:168,y:33},curves:[{x1:165,y1:35,x2:55,y2:65,curve:-25,color:'white'}],arrows:[{x1:30,y1:70,x2:50,y2:65,color:'green',dashed:true}],text:[{x:100,y:100,content:'Claim crosses',size:8}]},
  98:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:70,y:70,color:'blue',label:'ATT'}],ball:{x:78,y:68},arrows:[{x1:75,y1:68,x2:40,y2:70,color:'red'},{x1:30,y1:70,x2:65,y2:68,color:'green',dashed:true}],text:[{x:80,y:100,content:'1v1 save',size:8}]},
  99:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:60,y:50,color:'blue',label:'CB'},{x:60,y:90,color:'blue',label:'CB'}],ball:{x:33,y:68},arrows:[{x1:35,y1:68,x2:55,y2:55,color:'green'}],text:[{x:90,y:115,content:'Distribution',size:8}]},
  100:{players:[{x:25,y:70,color:'gk',label:'GK'}],ball:{x:100,y:8},curves:[{x1:100,y1:12,x2:30,y2:60,curve:-25,color:'white'}],text:[{x:100,y:100,content:'Catch high ball',size:8}]},
  101:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:100,y:50,color:'blue'}],ball:{x:108,y:48},arrows:[{x1:105,y1:48,x2:35,y2:65,color:'red'}],zones:[{x:15,y:60,w:20,h:20,color:'rgba(34,197,94,0.3)',border:'#22c55e'}],text:[{x:100,y:100,content:'Positioning',size:8}]},
  102:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:80,y:55,color:'blue'},{x:80,y:85,color:'blue'}],ball:{x:88,y:53},arrows:[{x1:85,y1:55,x2:35,y2:65,color:'red'},{x1:35,y1:72,x2:85,y2:83,color:'green',dashed:true}],text:[{x:100,y:115,content:'Quick reaction',size:8}]},
  103:{players:[{x:25,y:70,color:'gk',label:'GK'}],ball:{x:33,y:68},arrows:[{x1:35,y1:66,x2:100,y2:45,color:'green'}],text:[{x:100,y:90,content:'Long kick',size:8}]},
  104:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:60,y:60,color:'blue',label:'CB'}],ball:{x:33,y:68},arrows:[{x1:35,y1:68,x2:52,y2:62,color:'green'},{x1:65,y1:58,x2:38,y2:70,color:'yellow',dashed:true}],text:[{x:90,y:100,content:'Back pass',size:8}]},
  105:{players:[{x:25,y:70,color:'gk',label:'GK'}],ball:{x:100,y:60},arrows:[{x1:97,y1:62,x2:35,y2:68,color:'red'}],shapes:[{type:'rect',x:17,y:55,w:16,h:30,dashed:true}],text:[{x:100,y:95,content:'Dive save',size:8}]},
  106:{players:[{x:25,y:70,color:'gk',label:'GK'}],ball:{x:33,y:68},curves:[{x1:35,y1:65,x2:170,y2:40,curve:-40,color:'green'}],text:[{x:100,y:100,content:'Goal kick',size:8}]},
  107:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:65,y:70,color:'red',label:'CB'}],ball:{x:33,y:68},arrows:[{x1:35,y1:68,x2:57,y2:70,color:'green'}],text:[{x:100,y:100,content:'Throw out',size:8}]},
  108:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:85,y:60,color:'blue'},{x:85,y:80,color:'blue'}],ball:{x:93,y:58},lines:[{x1:30,y1:68,x2:80,y2:58,color:'yellow',dashed:true,opacity:0.5},{x1:30,y1:72,x2:80,y2:82,color:'yellow',dashed:true,opacity:0.5}],text:[{x:100,y:115,content:'Communication',size:8}]},
  109:{players:[{x:25,y:70,color:'gk',label:'GK'}],ball:{x:100,y:70},arrows:[{x1:97,y1:70,x2:40,y2:70,color:'red'}],zones:[{x:10,y:50,w:30,h:40,color:'rgba(34,197,94,0.2)',border:'#22c55e'}],text:[{x:100,y:100,content:'Penalty save',size:8}]},
  110:{players:[{x:25,y:70,color:'gk',label:'GK'}],ball:{x:100,y:55},arrows:[{x1:97,y1:57,x2:35,y2:62,color:'red'},{x1:35,y1:78,x2:97,y2:85,color:'green',dashed:true}],text:[{x:100,y:110,content:'Parry & recover',size:8}]},
  // Tactical 111-125
  111:{players:[{x:25,y:70,color:'gk'},{x:50,y:40,color:'red'},{x:80,y:50,color:'red'},{x:120,y:50,color:'red'},{x:150,y:40,color:'red'},{x:65,y:75,color:'red'},{x:100,y:70,color:'red'},{x:135,y:75,color:'red'},{x:70,y:100,color:'red'},{x:100,y:95,color:'red'},{x:130,y:100,color:'red'}],lines:[{x1:45,y1:48,x2:155,y2:48,color:'yellow',dashed:true,opacity:0.5}],text:[{x:100,y:125,content:'4-3-3 Shape',size:8}]},
  112:{players:[{x:25,y:70,color:'gk'},{x:50,y:45,color:'red'},{x:80,y:50,color:'red'},{x:120,y:50,color:'red'},{x:150,y:45,color:'red'},{x:85,y:75,color:'red'},{x:115,y:75,color:'red'},{x:50,y:95,color:'red'},{x:100,y:100,color:'red'},{x:150,y:95,color:'red'}],text:[{x:100,y:125,content:'4-2-3-1 Shape',size:8}]},
  113:{players:[{x:60,y:70,color:'red',label:'P'},{x:90,y:50,color:'blue'},{x:25,y:70,color:'gk',label:'GK'}],ball:{x:98,y:48},arrows:[{x1:65,y1:68,x2:88,y2:55,color:'yellow'}],text:[{x:100,y:100,content:'High press',size:8}]},
  114:{players:[{x:50,y:50,color:'red'},{x:80,y:55,color:'red'},{x:120,y:55,color:'red'},{x:150,y:50,color:'red'},{x:25,y:70,color:'gk'}],zones:[{x:40,y:35,w:120,h:40,color:'rgba(239,68,68,0.15)',border:'#ef4444'}],text:[{x:100,y:100,content:'Low block',size:8}]},
  115:{players:[{x:50,y:80,color:'red'},{x:100,y:70,color:'red'},{x:150,y:80,color:'red'},{x:100,y:50,color:'blue'}],ball:{x:108,y:48},arrows:[{x1:55,y1:78,x2:160,y2:40,color:'green'},{x1:145,y1:78,x2:40,y2:40,color:'green',dashed:true}],text:[{x:100,y:110,content:'Counter attack',size:8}]},
  116:{players:[{x:50,y:70,color:'blue'},{x:100,y:60,color:'blue'},{x:150,y:70,color:'blue'},{x:100,y:90,color:'red'}],ball:{x:58,y:68},arrows:[{x1:60,y1:66,x2:92,y2:62,color:'green'},{x1:108,y1:58,x2:142,y2:68,color:'green'}],text:[{x:100,y:115,content:'Possession play',size:8}]},
  117:{players:[{x:50,y:95,color:'red',label:'LB'},{x:60,y:60,color:'red',label:'CB'},{x:140,y:60,color:'red',label:'CB'},{x:150,y:95,color:'red',label:'RB'},{x:25,y:70,color:'gk'}],arrows:[{x1:55,y1:92,x2:65,y2:70,color:'yellow',dashed:true},{x1:145,y1:92,x2:135,y2:70,color:'yellow',dashed:true}],text:[{x:100,y:115,content:'FB overlap',size:8}]},
  118:{players:[{x:100,y:100,color:'red',label:'ST'},{x:70,y:75,color:'red',label:'LW'},{x:130,y:75,color:'red',label:'RW'},{x:100,y:55,color:'blue'}],ball:{x:108,y:98},arrows:[{x1:95,y1:95,x2:75,y2:78,color:'green'},{x1:105,y1:95,x2:125,y2:78,color:'green'}],text:[{x:100,y:120,content:'Attack width',size:8}]},
  119:{players:[{x:100,y:95,color:'red',label:'ST'},{x:70,y:60,color:'red'},{x:130,y:60,color:'red'},{x:100,y:55,color:'blue',label:'CB'}],ball:{x:78,y:58},arrows:[{x1:75,y1:62,x2:95,y2:90,color:'green'},{x1:125,y1:62,x2:105,y2:90,color:'green',dashed:true}],text:[{x:100,y:120,content:'Runs behind',size:8}]},
  120:{players:[{x:50,y:60,color:'red'},{x:80,y:70,color:'red'},{x:120,y:70,color:'red'},{x:150,y:60,color:'red'},{x:100,y:50,color:'blue'}],ball:{x:108,y:48},arrows:[{x1:105,y1:52,x2:95,y2:70,color:'red'},{x1:102,y1:52,x2:115,y2:68,color:'red',dashed:true}],zones:[{x:80,y:55,w:40,h:30,color:'rgba(239,68,68,0.2)',border:'#ef4444'}],text:[{x:100,y:100,content:'Compact midfield',size:8}]},
  121:{players:[{x:100,y:100,color:'red',label:'ST'},{x:60,y:85,color:'red',label:'LW'},{x:100,y:60,color:'blue'},{x:140,y:50,color:'blue'}],ball:{x:68,y:83},curves:[{x1:70,y1:82,x2:135,y2:52,curve:-30,color:'green'}],text:[{x:100,y:120,content:'Switch play',size:8}]},
  122:{players:[{x:50,y:55,color:'red',label:'LM'},{x:100,y:70,color:'red',label:'CM'},{x:150,y:55,color:'red',label:'RM'},{x:100,y:45,color:'blue'}],ball:{x:108,y:68},lines:[{x1:55,y1:57,x2:145,y2:57,color:'yellow',dashed:true}],text:[{x:100,y:100,content:'Midfield line',size:8}]},
  123:{players:[{x:70,y:60,color:'red',label:'CM'},{x:130,y:60,color:'red',label:'CM'},{x:100,y:80,color:'red',label:'DM'},{x:100,y:45,color:'blue'}],ball:{x:78,y:58},arrows:[{x1:75,y1:62,x2:95,y2:78,color:'green'},{x1:105,y1:78,x2:125,y2:62,color:'green'}],shapes:[{type:'circle',x:100,y:65,r:35,dashed:true,opacity:0.3}],text:[{x:100,y:115,content:'Midfield triangle',size:8}]},
  124:{players:[{x:60,y:70,color:'red',label:'CB'},{x:100,y:85,color:'red',label:'DM'},{x:140,y:70,color:'red',label:'CB'},{x:25,y:70,color:'gk'}],ball:{x:68,y:68},arrows:[{x1:70,y1:68,x2:95,y2:83,color:'green'},{x1:105,y1:83,x2:135,y2:72,color:'green'}],text:[{x:100,y:110,content:'Build from back',size:8}]},
  125:{players:[{x:80,y:90,color:'red'},{x:120,y:90,color:'red'},{x:70,y:60,color:'red'},{x:130,y:60,color:'red'},{x:100,y:45,color:'blue'}],ball:{x:88,y:88},arrows:[{x1:85,y1:86,x2:75,y2:65,color:'green'},{x1:115,y1:86,x2:125,y2:65,color:'green'}],text:[{x:100,y:115,content:'Rotate positions',size:8}]},
  // Set Pieces 126-140
  126:{players:[{x:130,y:70,color:'blue',label:'K'},{x:60,y:50,color:'red'},{x:60,y:70,color:'red'},{x:60,y:90,color:'red'},{x:25,y:70,color:'gk'}],ball:{x:130,y:62},curves:[{x1:128,y1:65,x2:55,y2:55,curve:-25,color:'white'}],text:[{x:100,y:115,content:'Corner routine',size:8}]},
  127:{view:'fp',gkX:145,defenders:[{x:110,y:100,size:12},{x:140,y:95,size:13},{x:170,y:100,size:11}],teammates:[{x:95,y:130,size:11,label:'9'},{x:200,y:145,size:10,label:'11'}],crossPath:'M220 60Q180 80 140 155',instruction:'Attack near post'},
  128:{players:[{x:100,y:30,color:'blue',label:'K'},{x:80,y:55,color:'red'},{x:100,y:55,color:'red'},{x:120,y:55,color:'red'},{x:100,y:70,color:'red'},{x:25,y:70,color:'gk'}],ball:{x:100,y:22},arrows:[{x1:100,y1:28,x2:100,y2:48,color:'white'}],shapes:[{type:'rect',x:70,y:48,w:60,h:15,dashed:true}],text:[{x:100,y:100,content:'Free kick wall',size:8}]},
  129:{view:'fp',gkX:148,defenders:[{x:115,y:90,size:14},{x:135,y:90,size:14},{x:155,y:90,size:14},{x:175,y:90,size:14}],shotTargets:[{x:115,y:55},{x:185,y:55}],instruction:'Over or around wall'},
  130:{players:[{x:130,y:15,color:'blue',label:'K'},{x:60,y:60,color:'red'},{x:80,y:80,color:'red'},{x:50,y:50,color:'blue'},{x:25,y:70,color:'gk'}],ball:{x:130,y:7},curves:[{x1:128,y1:10,x2:55,y2:55,curve:-20,color:'white'}],text:[{x:100,y:110,content:'Throw-in routine',size:8}]},
  131:{players:[{x:100,y:95,color:'blue',label:'K'},{x:60,y:55,color:'red'},{x:80,y:70,color:'red'},{x:120,y:70,color:'red'},{x:25,y:70,color:'gk'}],ball:{x:100,y:87},arrows:[{x1:98,y1:90,x2:65,y2:60,color:'white'}],text:[{x:100,y:115,content:'Quick free kick',size:8}]},
  132:{players:[{x:25,y:70,color:'gk',label:'GK'},{x:60,y:45,color:'blue'},{x:60,y:95,color:'blue'},{x:100,y:70,color:'blue'}],ball:{x:33,y:68},arrows:[{x1:35,y1:66,x2:92,y2:68,color:'green'}],text:[{x:130,y:100,content:'Goal kick routine',size:8}]},
  133:{view:'fp',gkX:150,defenders:[{x:130,y:100,size:13},{x:160,y:95,size:12}],teammates:[{x:100,y:135,size:12,label:'9'}],crossPath:'M200 70Q170 90 120 150',targetZone:{x:140,y:155,rx:25,ry:10},instruction:'Find the runner'},
  134:{players:[{x:50,y:55,color:'red'},{x:50,y:70,color:'red'},{x:50,y:85,color:'red'},{x:70,y:63,color:'red'},{x:70,y:77,color:'red'},{x:25,y:70,color:'gk'},{x:192,y:5,color:'blue',label:'K'}],ball:{x:192,y:5},curves:[{x1:190,y1:8,x2:55,y2:60,curve:-30,color:'white'}],text:[{x:100,y:110,content:'Defend corner',size:8}]},
  135:{players:[{x:100,y:100,color:'blue',label:'K'},{x:80,y:60,color:'red'},{x:120,y:60,color:'red'},{x:100,y:50,color:'red'},{x:25,y:70,color:'gk'}],ball:{x:100,y:92},arrows:[{x1:95,y1:95,x2:75,y2:65,color:'white'},{x1:105,y1:95,x2:125,y2:65,color:'white',dashed:true}],text:[{x:100,y:115,content:'Short FK option',size:8}]},
  136:{players:[{x:175,y:8,color:'blue',label:'K'},{x:100,y:40,color:'red'},{x:100,y:70,color:'red'},{x:130,y:55,color:'blue'}],ball:{x:175,y:0},curves:[{x1:173,y1:5,x2:125,y2:50,curve:20,color:'white'}],arrows:[{x1:105,y1:42,x2:122,y2:52,color:'yellow',dashed:true}],text:[{x:100,y:95,content:'Long throw',size:8}]},
  137:{players:[{x:150,y:135,color:'blue',label:'K'},{x:55,y:50,color:'red'},{x:55,y:70,color:'red'},{x:55,y:90,color:'red'},{x:75,y:60,color:'red'},{x:75,y:80,color:'red'},{x:25,y:70,color:'gk'}],ball:{x:150,y:127},curves:[{x1:148,y1:130,x2:60,y2:55,curve:40,color:'white'}],text:[{x:100,y:110,content:'In-swing corner',size:8}]},
  138:{players:[{x:50,y:135,color:'blue',label:'K'},{x:55,y:50,color:'red'},{x:55,y:70,color:'red'},{x:55,y:90,color:'red'},{x:80,y:60,color:'red'},{x:80,y:80,color:'red'},{x:25,y:70,color:'gk'}],ball:{x:50,y:127},curves:[{x1:52,y1:130,x2:75,y2:55,curve:-35,color:'white'}],text:[{x:100,y:110,content:'Out-swing corner',size:8}]},
  139:{players:[{x:100,y:20,color:'blue',label:'K'},{x:80,y:50,color:'red'},{x:110,y:50,color:'red'},{x:100,y:75,color:'red'},{x:25,y:70,color:'gk'}],ball:{x:100,y:12},arrows:[{x1:95,y1:18,x2:75,y2:45,color:'white'}],text:[{x:100,y:100,content:'Indirect FK',size:8}]},
  140:{players:[{x:100,y:70,color:'blue',label:'K'},{x:25,y:70,color:'gk'}],ball:{x:100,y:62},shapes:[{type:'circle',x:100,y:70,r:2,fill:'#fff'}],zones:[{x:10,y:50,w:30,h:40,color:'rgba(239,68,68,0.2)',border:'#ef4444'}],text:[{x:100,y:100,content:'Penalty kick',size:8}]},
  // Small-Sided Games 141-150
  141:{type:'small',players:[{x:30,y:30,color:'blue'},{x:30,y:90,color:'blue'},{x:90,y:60,color:'red'},{x:90,y:30,color:'red'}],ball:{x:38,y:32},shapes:[{type:'rect',x:15,y:15,w:90,h:90,dashed:true}],text:[{x:60,y:8,content:'2v2',size:8}]},
  142:{type:'small',players:[{x:25,y:30,color:'blue'},{x:25,y:60,color:'blue'},{x:25,y:90,color:'blue'},{x:95,y:30,color:'red'},{x:95,y:60,color:'red'},{x:95,y:90,color:'red'}],ball:{x:33,y:58},shapes:[{type:'rect',x:15,y:15,w:90,h:90,dashed:true}],text:[{x:60,y:8,content:'3v3',size:8}]},
  143:{players:[{x:35,y:40,color:'blue'},{x:35,y:70,color:'blue'},{x:35,y:100,color:'blue'},{x:60,y:70,color:'blue'},{x:165,y:40,color:'red'},{x:165,y:70,color:'red'},{x:165,y:100,color:'red'},{x:140,y:70,color:'red'}],ball:{x:43,y:68},text:[{x:100,y:125,content:'4v4',size:8}]},
  144:{players:[{x:30,y:50,color:'blue'},{x:30,y:90,color:'blue'},{x:60,y:50,color:'blue'},{x:60,y:90,color:'blue'},{x:45,y:70,color:'blue'},{x:170,y:50,color:'red'},{x:170,y:90,color:'red'},{x:140,y:50,color:'red'},{x:140,y:90,color:'red'},{x:155,y:70,color:'red'}],ball:{x:38,y:68},text:[{x:100,y:125,content:'5v5',size:8}]},
  145:{players:[{x:20,y:70,color:'gk'},{x:50,y:50,color:'blue'},{x:50,y:90,color:'blue'},{x:80,y:70,color:'blue'},{x:180,y:70,color:'gk'},{x:150,y:50,color:'red'},{x:150,y:90,color:'red'},{x:120,y:70,color:'red'}],ball:{x:88,y:68},text:[{x:100,y:125,content:'3v3 + GKs',size:8}]},
  146:{type:'small',players:[{x:25,y:60,color:'blue'},{x:60,y:30,color:'blue'},{x:95,y:60,color:'red'},{x:60,y:90,color:'yellow'}],ball:{x:33,y:58},shapes:[{type:'rect',x:15,y:15,w:90,h:90,dashed:true}],text:[{x:60,y:8,content:'2v1 + target',size:8}]},
  147:{players:[{x:30,y:40,color:'blue'},{x:30,y:70,color:'blue'},{x:30,y:100,color:'blue'},{x:100,y:70,color:'yellow'},{x:170,y:40,color:'red'},{x:170,y:70,color:'red'},{x:170,y:100,color:'red'}],ball:{x:38,y:68},text:[{x:100,y:125,content:'3v3 + neutral',size:8}]},
  148:{players:[{x:50,y:70,color:'blue'},{x:100,y:70,color:'blue'},{x:150,y:70,color:'red'},{x:100,y:50,color:'red'}],cones:[{x:20,y:55},{x:20,y:85},{x:180,y:55},{x:180,y:85}],ball:{x:58,y:68},text:[{x:100,y:115,content:'Line soccer',size:8}]},
  149:{players:[{x:50,y:50,color:'blue'},{x:50,y:90,color:'blue'},{x:100,y:70,color:'blue'},{x:150,y:50,color:'red'},{x:150,y:90,color:'red'},{x:100,y:70,color:'red'}],cones:[{x:20,y:60},{x:20,y:80},{x:180,y:60},{x:180,y:80}],ball:{x:58,y:48},text:[{x:100,y:115,content:'Small goal game',size:8}]},
  150:{players:[{x:60,y:55,color:'blue'},{x:60,y:85,color:'blue'},{x:140,y:55,color:'red'},{x:140,y:85,color:'red'}],zones:[{x:85,y:55,w:30,h:30,color:'rgba(16,185,129,0.3)',border:'#10b981'}],ball:{x:68,y:53},text:[{x:100,y:115,content:'Capture zones',size:8}]},
  // Conditioning 151-155
  151:{type:'small',players:[{x:20,y:60,color:'blue'},{x:60,y:60,color:'blue'},{x:100,y:60,color:'blue'}],cones:[{x:20,y:90},{x:60,y:90},{x:100,y:90}],arrows:[{x1:25,y1:65,x2:55,y2:85,color:'green'},{x1:65,y1:85,x2:95,y2:65,color:'green'}],text:[{x:60,y:30,content:'Shuttle runs',size:8}]},
  152:{type:'small',cones:[{x:20,y:20},{x:50,y:20},{x:80,y:20},{x:100,y:50},{x:100,y:80},{x:70,y:100},{x:40,y:100},{x:20,y:70}],paths:[{d:'M20 20L50 20L80 20L100 50L100 80L70 100L40 100L20 70Z',color:'green'}],text:[{x:60,y:60,content:'Box drill',size:8}]},
  153:{players:[{x:30,y:70,color:'blue'},{x:170,y:70,color:'blue'}],cones:[{x:60,y:70},{x:90,y:70},{x:120,y:70},{x:150,y:70}],arrows:[{x1:38,y1:70,x2:162,y2:70,color:'green'}],text:[{x:100,y:100,content:'Sprint intervals',size:8}]},
  154:{type:'small',cones:[{x:60,y:20},{x:30,y:60},{x:90,y:60},{x:60,y:100}],paths:[{d:'M60 25L35 55L60 55L85 55L60 95',color:'green'}],text:[{x:60,y:8,content:'T-drill',size:8}]},
  155:{type:'small',players:[{x:60,y:100,color:'blue'}],cones:[{x:40,y:20},{x:60,y:40},{x:40,y:60},{x:60,y:80}],paths:[{d:'M55 95Q45 75 55 60Q65 45 55 25',color:'green'}],text:[{x:60,y:8,content:'Agility ladder',size:8}]}
};

// Category mapping
const CAT_MAP = {passing:'Passing',dribbling:'Dribbling',shooting:'Shooting',defending:'Defending',goalkeeping:'Goalkeeping',tactical:'Tactical','set pieces':'Set Pieces','small-sided games':'Small-Sided',conditioning:'Conditioning',warmup:'Warmup'};
const CAT_COLORS = {passing:'#3b82f6',dribbling:'#10b981',shooting:'#ef4444',defending:'#f59e0b',goalkeeping:'#8b5cf6',tactical:'#06b6d4','set pieces':'#ec4899','small-sided games':'#84cc16',conditioning:'#f97316',warmup:'#6366f1'};

const DrillsPage = () => {
  const [search, setSearch] = useState('');
  const [cats, setCats] = useState([]);
  const [view, setView] = useState('grid');
  const [exp, setExp] = useState(null);

  const drills = drillsData || [];
  const displayCats = Object.values(CAT_MAP);

  const filtered = useMemo(() => drills.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !cats.length || cats.some(c => CAT_MAP[d.category?.toLowerCase()] === c);
    return matchSearch && matchCat;
  }), [drills, search, cats]);

  const toggleCat = c => setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  return (
    <div style={{ padding: 24, background: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <input placeholder="Search drills..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: 15, marginBottom: 20, outline: 'none' }}/>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {displayCats.map(c => {
          const catKey = Object.keys(CAT_MAP).find(k => CAT_MAP[k] === c);
          const col = CAT_COLORS[catKey] || '#334155';
          const sel = cats.includes(c);
          return <button key={c} onClick={() => toggleCat(c)} style={{ padding: '8px 14px', borderRadius: 20, border: 'none', background: sel ? col : '#1e293b', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: sel ? 600 : 400, boxShadow: sel ? `0 0 12px ${col}50` : 'none' }}>{c}</button>;
        })}
        {cats.length > 0 && <button onClick={() => setCats([])} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #475569', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>Clear</button>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['grid', 'list'].map(v => <button key={v} onClick={() => setView(v)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: view === v ? '#3b82f6' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: view === v ? 600 : 400, textTransform: 'capitalize' }}>{v}</button>)}
        <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 14, display: 'flex', alignItems: 'center' }}>{filtered.length} drills</span>
      </div>

      <div style={{ display: view === 'grid' ? 'grid' : 'flex', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, flexDirection: 'column' }}>
        {filtered.map(d => {
          const isExp = exp === d.id;
          const col = CAT_COLORS[d.category?.toLowerCase()] || '#334155';
          const cfg = DC[d.id] || {};
          return (
            <div key={d.id} style={{ background: '#1e293b', borderRadius: 12, border: `2px solid ${isExp ? col : '#334155'}`, overflow: 'hidden', boxShadow: isExp ? `0 4px 20px ${col}30` : 'none' }}>
              <div onClick={() => setExp(p => p === d.id ? null : d.id)} style={{ padding: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExp ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                <div>
                  <span style={{ background: col, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{d.category}</span>
                  <h3 style={{ margin: '10px 0 6px', fontSize: 17, fontWeight: 600 }}>{d.name}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>{d.difficulty} • {d.duration}</p>
                </div>
                <span style={{ fontSize: 18, transform: isExp ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', color: '#64748b' }}>▼</span>
              </div>
              {isExp && (
                <div style={{ padding: '0 16px 20px' }}>
                  <p style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 16, lineHeight: 1.5 }}>{d.description}</p>
                  {cfg.view === 'fp' ? <FPV drill={d} cfg={cfg}/> : <TDV drill={d} cfg={cfg}/>}
                  {d.setup && <><h4 style={{ fontSize: 14, marginBottom: 8, color: '#3b82f6', fontWeight: 600 }}>Setup</h4><p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{d.setup}</p></>}
                  {d.instructions && <><h4 style={{ fontSize: 14, margin: '14px 0 8px', color: '#10b981', fontWeight: 600 }}>Instructions</h4><ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{d.instructions.map((x,i) => <li key={i} style={{ marginBottom: 4 }}>{x}</li>)}</ul></>}
                  {d.keyPoints && <><h4 style={{ fontSize: 14, margin: '14px 0 8px', color: '#f59e0b', fontWeight: 600 }}>Key Points</h4><ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{d.keyPoints.map((x,i) => <li key={i} style={{ marginBottom: 4 }}>{x}</li>)}</ul></>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!filtered.length && <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}><p style={{ fontSize: 16, marginBottom: 8 }}>No drills found.</p><p style={{ fontSize: 14 }}>Try adjusting your search or filters.</p></div>}
    </div>
  );
};

export default DrillsPage;
