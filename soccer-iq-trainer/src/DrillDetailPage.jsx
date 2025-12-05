import React from 'react';
import { ArrowLeft, Clock, Users, Target, Lightbulb, CheckCircle, Zap, AlertCircle } from 'lucide-react';
import { drillsData } from './DrillData';

// Jersey Icon - like real formation charts
const Jersey = ({ x, y, number, color = '#10b981', size = 32 }) => (
  <g transform={`translate(${x - size/2}, ${y - size/2})`}>
    <path d={`M${size*0.2},${size*0.15} L${size*0.35},0 L${size*0.65},0 L${size*0.8},${size*0.15} L${size*0.95},${size*0.25} L${size*0.85},${size*0.35} L${size*0.75},${size*0.3} L${size*0.75},${size} L${size*0.25},${size} L${size*0.25},${size*0.3} L${size*0.15},${size*0.35} L${size*0.05},${size*0.25} Z`} fill={color} stroke="#fff" strokeWidth="2" />
    <text x={size/2} y={size*0.72} textAnchor="middle" fontSize={size*0.38} fill="#fff" fontWeight="bold" fontFamily="Arial">{number}</text>
  </g>
);

const Cone = ({ x, y }) => <polygon points={`${x},${y-10} ${x-8},${y+8} ${x+8},${y+8}`} fill="#f97316" stroke="#fff" strokeWidth="1.5" />;
const Ball = ({ x, y }) => <circle cx={x} cy={y} r="8" fill="#fff" stroke="#333" strokeWidth="1.5" />;

const Arrow = ({ x1, y1, x2, y2, color = '#fbbf24', dashed = false, label = '' }) => {
  const id = `arrow-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <g>
      <defs><marker id={id} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><polygon points="0 0, 10 5, 0 10" fill={color} /></marker></defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" strokeDasharray={dashed ? "8,6" : "none"} markerEnd={`url(#${id})`} />
      {label && <text x={(x1+x2)/2} y={(y1+y2)/2 - 10} textAnchor="middle" fontSize="14" fill={color} fontWeight="bold">{label}</text>}
    </g>
  );
};

const Zone = ({ x, y, width, height, color = '#fbbf24', label = '' }) => (
  <g>
    <rect x={x} y={y} width={width} height={height} fill={color} fillOpacity="0.2" stroke={color} strokeWidth="3" strokeDasharray="10,6" rx="8" />
    {label && <text x={x + width/2} y={y - 12} textAnchor="middle" fontSize="14" fill={color} fontWeight="bold">{label}</text>}
  </g>
);

// Full Soccer Field
const SoccerField = ({ children }) => (
  <svg viewBox="0 0 700 450" className="w-full h-full rounded-2xl" style={{ background: '#1a472a' }}>
    <rect x="25" y="25" width="650" height="400" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
    <line x1="350" y1="25" x2="350" y2="425" stroke="#fff" strokeWidth="3" opacity="0.6" />
    <circle cx="350" cy="225" r="60" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
    <circle cx="350" cy="225" r="5" fill="#fff" opacity="0.6" />
    <rect x="25" y="125" width="80" height="200" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
    <rect x="25" y="175" width="30" height="100" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
    <rect x="595" y="125" width="80" height="200" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
    <rect x="645" y="175" width="30" height="100" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
    <rect x="10" y="190" width="15" height="70" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
    <rect x="675" y="190" width="15" height="70" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
    {children}
  </svg>
);

// Drill Visualizations
const DrillVisualRondo4v2 = () => (
  <SoccerField>
    <Zone x="200" y="100" width="300" height="250" color="#fbbf24" label="10m x 10m" />
    <Jersey x={350} y={100} number="A1" color="#10b981" size={36} />
    <Jersey x={350} y={350} number="A2" color="#10b981" size={36} />
    <Jersey x={200} y={225} number="A3" color="#10b981" size={36} />
    <Jersey x={500} y={225} number="A4" color="#10b981" size={36} />
    <Jersey x={320} y={200} number="D1" color="#ef4444" size={36} />
    <Jersey x={380} y={250} number="D2" color="#ef4444" size={36} />
    <Ball x={350} y={115} />
    <Arrow x1={350} y1={125} x2={485} y2={220} color="#10b981" dashed label="Pass" />
    <Arrow x1={495} y1={235} x2={360} y2={340} color="#10b981" dashed />
    <Cone x={200} y={100} /><Cone x={500} y={100} /><Cone x={200} y={350} /><Cone x={500} y={350} />
  </SoccerField>
);

const DrillVisualBoxPossession = () => (
  <SoccerField>
    <Zone x="150" y="75" width="400" height="300" color="#fbbf24" label="20m x 20m" />
    <Jersey x={150} y={75} number="1" color="#10b981" size={32} />
    <Jersey x={550} y={75} number="2" color="#10b981" size={32} />
    <Jersey x={150} y={375} number="3" color="#10b981" size={32} />
    <Jersey x={550} y={375} number="4" color="#10b981" size={32} />
    <Jersey x={350} y={75} number="5" color="#3b82f6" size={32} />
    <Jersey x={350} y={375} number="6" color="#3b82f6" size={32} />
    <Jersey x={300} y={200} number="D1" color="#ef4444" size={32} />
    <Jersey x={400} y={250} number="D2" color="#ef4444" size={32} />
    <Ball x={160} y={85} />
    <Arrow x1={170} y1={85} x2={335} y2={78} color="#10b981" dashed />
    <Arrow x1={365} y1={78} x2={535} y2={80} color="#10b981" dashed />
    <Arrow x1={160} y1={95} x2={250} y2={150} color="#fbbf24" label="Move" />
  </SoccerField>
);

const DrillVisual1v1Defending = () => (
  <SoccerField>
    <Zone x="180" y="100" width="200" height="250" color="#3b82f6" label="8m wide channel" />
    <rect x="100" y="175" width="80" height="100" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2" rx="4" />
    <text x="140" y="165" textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">GOAL</text>
    <Jersey x={320} y={225} number="9" color="#10b981" size={40} />
    <Ball x={335} y={235} />
    <Jersey x={220} y={225} number="4" color="#ef4444" size={40} />
    <Arrow x1={310} y1={225} x2={180} y2={225} color="#10b981" label="Attack →" />
    <Cone x={180} y={100} /><Cone x={180} y={350} /><Cone x={380} y={100} /><Cone x={380} y={350} /><Cone x={320} y={100} /><Cone x={320} y={350} />
  </SoccerField>
);

const DrillVisualFinishingCircuit = () => (
  <SoccerField>
    <Jersey x={60} y={225} number="GK" color="#8b5cf6" size={36} />
    <Cone x={250} y={150} /><Cone x={200} y={280} /><Cone x={300} y={280} />
    <Jersey x={250} y={165} number="9" color="#10b981" size={32} />
    <Jersey x={200} y={295} number="10" color="#10b981" size={32} />
    <Jersey x={300} y={295} number="11" color="#10b981" size={32} />
    <Jersey x={350} y={380} number="S" color="#3b82f6" size={32} />
    <Ball x={350} y={365} />
    <Arrow x1={245} y1={165} x2={85} y2={210} color="#fbbf24" label="Shot" />
    <Arrow x1={195} y1={290} x2={85} y2={235} color="#fbbf24" dashed />
    <Arrow x1={295} y1={290} x2={85} y2={240} color="#fbbf24" dashed />
    <Arrow x1={350} y1={365} x2={255} y2={180} color="#3b82f6" label="Pass" />
    <text x={250} y={130} textAnchor="middle" fontSize="12" fill="#fff">Position 1</text>
    <text x={180} y={320} textAnchor="middle" fontSize="12" fill="#fff">Position 2</text>
    <text x={320} y={320} textAnchor="middle" fontSize="12" fill="#fff">Position 3</text>
  </SoccerField>
);

const DrillVisualPressingTriggers = () => (
  <SoccerField>
    <Zone x="480" y="80" width="180" height="150" color="#ef4444" label="TRIGGER ZONE" />
    <Jersey x={280} y={150} number="9" color="#10b981" size={32} />
    <Jersey x={240} y={200} number="10" color="#10b981" size={32} />
    <Jersey x={320} y={200} number="11" color="#10b981" size={32} />
    <Jersey x={200} y={260} number="8" color="#10b981" size={32} />
    <Jersey x={280} y={260} number="6" color="#10b981" size={32} />
    <Jersey x={360} y={260} number="7" color="#10b981" size={32} />
    <line x1="200" y1="180" x2="360" y2="180" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
    <line x1="200" y1="240" x2="360" y2="240" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
    <Jersey x={550} y={130} number="CB" color="#ef4444" size={28} />
    <Jersey x={550} y={200} number="CM" color="#ef4444" size={28} />
    <Jersey x={620} y={165} number="GK" color="#8b5cf6" size={28} />
    <Ball x={560} y={140} />
    <Arrow x1={290} y1={150} x2={530} y2={135} color="#fbbf24" label="PRESS!" />
  </SoccerField>
);

const DrillVisualQuickTransitions = () => (
  <SoccerField>
    <Jersey x={150} y={225} number="6" color="#3b82f6" size={32} />
    <Jersey x={200} y={180} number="8" color="#3b82f6" size={32} />
    <Ball x={210} y={190} />
    <Jersey x={320} y={160} number="10" color="#10b981" size={36} />
    <Jersey x={280} y={280} number="9" color="#10b981" size={36} />
    <Jersey x={380} y={260} number="11" color="#10b981" size={36} />
    <Jersey x={500} y={180} number="D" color="#ef4444" size={28} />
    <Jersey x={550} y={240} number="D" color="#ef4444" size={28} />
    <Jersey x={630} y={225} number="GK" color="#8b5cf6" size={28} />
    <Arrow x1={220} y1={185} x2={305} y2={165} color="#fbbf24" label="1st Pass" />
    <Arrow x1={335} y1={160} x2={550} y2={180} color="#10b981" label="Attack!" />
    <Arrow x1={295} y1={275} x2={480} y2={220} color="#10b981" dashed />
    <Arrow x1={395} y1={255} x2={560} y2={210} color="#10b981" dashed />
    <text x="400" y="380" textAnchor="middle" fontSize="16" fill="#fbbf24" fontWeight="bold">→ TRANSITION IN 6 SECONDS →</text>
  </SoccerField>
);

const DrillVisualCrossingFinishing = () => (
  <SoccerField>
    <Jersey x={60} y={225} number="GK" color="#8b5cf6" size={36} />
    <Jersey x={580} y={100} number="7" color="#10b981" size={36} />
    <Ball x={595} y={110} />
    <Jersey x={140} y={160} number="9" color="#10b981" size={32} />
    <Jersey x={160} y={225} number="10" color="#10b981" size={32} />
    <Jersey x={180} y={290} number="11" color="#10b981" size={32} />
    <Jersey x={120} y={190} number="D" color="#ef4444" size={28} />
    <Jersey x={140} y={260} number="D" color="#ef4444" size={28} />
    <Arrow x1={575} y1={110} x2={150} y2={170} color="#fbbf24" label="Cross" />
    <Arrow x1={145} y1={165} x2={100} y2={140} color="#10b981" dashed label="Near" />
    <Arrow x1={165} y1={225} x2={110} y2={210} color="#10b981" dashed />
    <Arrow x1={185} y1={285} x2={130} y2={270} color="#10b981" dashed label="Far" />
    <rect x="85" y="150" width="50" height="40" fill="#fbbf24" fillOpacity="0.2" rx="4" />
    <rect x="85" y="250" width="50" height="40" fill="#fbbf24" fillOpacity="0.2" rx="4" />
  </SoccerField>
);

const DrillVisualBuildUpPlay = () => (
  <SoccerField>
    <Jersey x={60} y={225} number="1" color="#8b5cf6" size={36} />
    <Ball x={75} y={235} />
    <Jersey x={140} y={140} number="3" color="#10b981" size={32} />
    <Jersey x={140} y={310} number="2" color="#10b981" size={32} />
    <Jersey x={220} y={80} number="4" color="#10b981" size={32} />
    <Jersey x={220} y={370} number="5" color="#10b981" size={32} />
    <Jersey x={280} y={180} number="6" color="#3b82f6" size={32} />
    <Jersey x={280} y={270} number="8" color="#3b82f6" size={32} />
    <Jersey x={350} y={225} number="9" color="#ef4444" size={28} />
    <Jersey x={380} y={160} number="10" color="#ef4444" size={28} />
    <Jersey x={380} y={290} number="11" color="#ef4444" size={28} />
    <Arrow x1={75} y1={230} x2={130} y2={150} color="#10b981" dashed label="Option 1" />
    <Arrow x1={75} y1={240} x2={130} y2={300} color="#10b981" dashed label="Option 2" />
    <Arrow x1={150} y1={145} x2={210} y2={90} color="#fbbf24" dashed />
    <Arrow x1={150} y1={305} x2={210} y2={360} color="#fbbf24" dashed />
    <Arrow x1={155} y1={150} x2={265} y2={180} color="#3b82f6" dashed />
    <text x="350" y="50" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold">BUILD FROM BACK →</text>
  </SoccerField>
);

const DrillVisuals = {
  'd1': DrillVisualRondo4v2, 'd2': DrillVisualBoxPossession, 'd3': DrillVisual1v1Defending, 'd4': DrillVisualFinishingCircuit,
  'd5': DrillVisualPressingTriggers, 'd6': DrillVisualQuickTransitions, 'd7': DrillVisualCrossingFinishing, 'd8': DrillVisualBuildUpPlay,
};

const Legend = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
    <div className="flex items-center space-x-3"><div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center"><span className="text-white text-xs font-bold">A</span></div><span className="text-gray-300 text-sm">Attacker</span></div>
    <div className="flex items-center space-x-3"><div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center"><span className="text-white text-xs font-bold">D</span></div><span className="text-gray-300 text-sm">Defender</span></div>
    <div className="flex items-center space-x-3"><div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center"><span className="text-white text-xs font-bold">M</span></div><span className="text-gray-300 text-sm">Midfielder/Neutral</span></div>
    <div className="flex items-center space-x-3"><div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center"><span className="text-white text-xs font-bold">GK</span></div><span className="text-gray-300 text-sm">Goalkeeper</span></div>
    <div className="flex items-center space-x-3"><div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-orange-500"></div><span className="text-gray-300 text-sm">Cone</span></div>
    <div className="flex items-center space-x-3"><div className="w-4 h-4 bg-white rounded-full border-2 border-gray-400"></div><span className="text-gray-300 text-sm">Ball</span></div>
    <div className="flex items-center space-x-3"><div className="w-8 h-0.5 bg-amber-400 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-amber-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div></div><span className="text-gray-300 text-sm">Pass/Movement</span></div>
    <div className="flex items-center space-x-3"><div className="w-8 h-4 border-2 border-dashed border-amber-400 rounded opacity-60"></div><span className="text-gray-300 text-sm">Zone/Area</span></div>
  </div>
);

const DrillDetailPage = ({ drillId, onBack, sessions, setSessions, setShowModal, setSelectedDrill }) => {
  const drill = drillsData.find(d => d.id === drillId);
  const DrillVisual = DrillVisuals[drillId];
  
  if (!drill) return <div className="text-center py-20"><p className="text-gray-400">Drill not found</p><button onClick={onBack} className="mt-4 text-emerald-400 hover:underline">Go back</button></div>;

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'bg-emerald-500/20 text-emerald-400';
    if (diff === 'Medium') return 'bg-amber-500/20 text-amber-400';
    return 'bg-red-500/20 text-red-400';
  };

  const handleAddToSession = () => {
    if (sessions.length === 0) { alert('Create a session first!'); setShowModal('session'); }
    else { setSelectedDrill(drill); setShowModal('addToSession'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /><span>Back to Drills</span></button>
        <button onClick={handleAddToSession} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">Add to Session</button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2"><span className="text-4xl">{drill.icon}</span><h1 className="text-3xl font-bold text-white">{drill.name}</h1></div>
            <p className="text-gray-400 text-lg">{drill.shortDesc}</p>
          </div>
          <span className={`px-4 py-2 rounded-xl font-bold ${getDifficultyColor(drill.difficulty)}`}>{drill.difficulty}</span>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center space-x-2 text-gray-300"><Clock className="w-5 h-5 text-emerald-400" /><span>{drill.duration}</span></div>
          <div className="flex items-center space-x-2 text-gray-300"><Users className="w-5 h-5 text-blue-400" /><span>{drill.setup.players}</span></div>
          <div className="flex items-center space-x-2 text-gray-300"><Target className="w-5 h-5 text-amber-400" /><span>{drill.category}</span></div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Field Setup</h2>
        <div className="aspect-[16/10] mb-6">{DrillVisual && <DrillVisual />}</div>
        <Legend />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2"><Target className="w-5 h-5 text-emerald-400" /><span>Setup Requirements</span></h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-gray-400">Players</span><span className="text-white font-medium">{drill.setup.players}</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-gray-400">Area Size</span><span className="text-white font-medium">{drill.setup.area}</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-gray-400">Cones Needed</span><span className="text-white font-medium">{drill.setup.cones}</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-gray-400">Cone Spacing</span><span className="text-white font-medium">{drill.setup.coneSpacing}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-400">Equipment</span><span className="text-white font-medium text-right max-w-[60%]">{drill.setup.equipment}</span></div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2"><Lightbulb className="w-5 h-5 text-amber-400" /><span>What This Teaches</span></h2>
          <div className="space-y-2">{drill.teaches.map((item, i) => (<div key={i} className="flex items-center space-x-3 py-2"><CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" /><span className="text-gray-300">{item}</span></div>))}</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Step-by-Step Instructions</h2>
        <div className="space-y-4">{drill.steps.map((step, i) => (<div key={i} className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-white font-bold">{i + 1}</span></div><p className="text-gray-300 pt-1">{step}</p></div>))}</div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2"><AlertCircle className="w-5 h-5 text-amber-400" /><span>Key Coaching Points</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{drill.keyPoints.map((point, i) => (<div key={i} className="flex items-center space-x-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"><Zap className="w-5 h-5 text-amber-400 flex-shrink-0" /><span className="text-gray-300">{point}</span></div>))}</div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-3 flex items-center space-x-2"><span>💡</span><span>Pro Tip</span></h2>
        <p className="text-gray-300 text-lg italic">"{drill.proTip}"</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
        <p className="text-gray-300 leading-relaxed">{drill.overview}</p>
      </div>
    </div>
  );
};

export default DrillDetailPage;
