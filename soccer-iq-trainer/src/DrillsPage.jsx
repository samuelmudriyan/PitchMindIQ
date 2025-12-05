import React from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { drillsData } from './DrillData';

// Mini Jersey for card previews
const Jersey = ({ x, y, number, color = '#10b981', size = 18 }) => (
  <g transform={`translate(${x - size/2}, ${y - size/2})`}>
    <path d={`M${size*0.2},${size*0.15} L${size*0.35},0 L${size*0.65},0 L${size*0.8},${size*0.15} L${size*0.95},${size*0.25} L${size*0.85},${size*0.35} L${size*0.75},${size*0.3} L${size*0.75},${size} L${size*0.25},${size} L${size*0.25},${size*0.3} L${size*0.15},${size*0.35} L${size*0.05},${size*0.25} Z`} fill={color} stroke="#fff" strokeWidth="1" />
    <text x={size/2} y={size*0.72} textAnchor="middle" fontSize={size*0.4} fill="#fff" fontWeight="bold" fontFamily="Arial">{number}</text>
  </g>
);

const Cone = ({ x, y }) => <polygon points={`${x},${y-6} ${x-5},${y+5} ${x+5},${y+5}`} fill="#f97316" stroke="#fff" strokeWidth="0.5" />;
const Ball = ({ x, y }) => <circle cx={x} cy={y} r="5" fill="#fff" stroke="#333" strokeWidth="0.5" />;
const Arrow = ({ x1, y1, x2, y2, color = '#fbbf24', dashed = false }) => {
  const id = `arr-${Math.random().toString(36).substr(2, 5)}`;
  return (<g><defs><marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={color} /></marker></defs><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeDasharray={dashed ? "4,3" : "none"} markerEnd={`url(#${id})`} /></g>);
};
const Zone = ({ x, y, width, height, color = '#fbbf24' }) => <rect x={x} y={y} width={width} height={height} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" rx="3" />;

// Mini Field
const MiniField = ({ children }) => (
  <svg viewBox="0 0 240 160" className="w-full h-full rounded-lg" style={{ background: '#1a472a' }}>
    <rect x="10" y="10" width="220" height="140" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
    <line x1="120" y1="10" x2="120" y2="150" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
    <circle cx="120" cy="80" r="20" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
    <rect x="10" y="50" width="25" height="60" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
    <rect x="205" y="50" width="25" height="60" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
    {children}
  </svg>
);

// Mini Visualizations
const MiniRondo4v2 = () => (
  <MiniField>
    <Zone x="60" y="35" width="120" height="90" />
    <Jersey x={120} y={35} number="A" color="#10b981" />
    <Jersey x={120} y={125} number="A" color="#10b981" />
    <Jersey x={60} y={80} number="A" color="#10b981" />
    <Jersey x={180} y={80} number="A" color="#10b981" />
    <Jersey x={100} y={70} number="D" color="#ef4444" />
    <Jersey x={140} y={90} number="D" color="#ef4444" />
    <Ball x={120} y={42} />
    <Arrow x1={122} y1={47} x2={175} y2={78} color="#10b981" dashed />
  </MiniField>
);

const MiniBoxPossession = () => (
  <MiniField>
    <Zone x="50" y="30" width="140" height="100" />
    <Jersey x={50} y={30} number="1" color="#10b981" size={14} />
    <Jersey x={190} y={30} number="2" color="#10b981" size={14} />
    <Jersey x={50} y={130} number="3" color="#10b981" size={14} />
    <Jersey x={190} y={130} number="4" color="#10b981" size={14} />
    <Jersey x={120} y={30} number="5" color="#3b82f6" size={14} />
    <Jersey x={120} y={130} number="6" color="#3b82f6" size={14} />
    <Jersey x={100} y={70} number="D" color="#ef4444" size={14} />
    <Jersey x={140} y={90} number="D" color="#ef4444" size={14} />
    <Ball x={55} y={36} />
  </MiniField>
);

const Mini1v1Defending = () => (
  <MiniField>
    <Zone x="70" y="30" width="100" height="100" color="#3b82f6" />
    <Cone x={70} y={30} /><Cone x={70} y={130} /><Cone x={170} y={30} /><Cone x={170} y={130} />
    <Jersey x={140} y={80} number="9" color="#10b981" size={22} />
    <Jersey x={90} y={80} number="4" color="#ef4444" size={22} />
    <Ball x={150} y={85} />
    <Arrow x1={135} y1={80} x2={60} y2={80} color="#10b981" />
  </MiniField>
);

const MiniFinishingCircuit = () => (
  <MiniField>
    <Jersey x={25} y={80} number="GK" color="#8b5cf6" size={16} />
    <Cone x={100} y={50} /><Cone x={80} y={110} /><Cone x={130} y={110} />
    <Jersey x={100} y={60} number="9" color="#10b981" size={14} />
    <Jersey x={80} y={120} number="10" color="#10b981" size={14} />
    <Jersey x={130} y={120} number="11" color="#10b981" size={14} />
    <Jersey x={160} y={130} number="S" color="#3b82f6" size={14} />
    <Ball x={160} y={118} />
    <Arrow x1={95} y1={60} x2={40} y2={75} color="#fbbf24" />
  </MiniField>
);

const MiniPressingTriggers = () => (
  <MiniField>
    <Zone x="160" y="30" width="70" height="60" color="#ef4444" />
    <Jersey x={90} y={55} number="9" color="#10b981" size={14} />
    <Jersey x={70} y={75} number="10" color="#10b981" size={14} />
    <Jersey x={110} y={75} number="11" color="#10b981" size={14} />
    <Jersey x={60} y={100} number="8" color="#10b981" size={14} />
    <Jersey x={90} y={100} number="6" color="#10b981" size={14} />
    <Jersey x={120} y={100} number="7" color="#10b981" size={14} />
    <Jersey x={190} y={50} number="CB" color="#ef4444" size={12} />
    <Jersey x={190} y={80} number="CM" color="#ef4444" size={12} />
    <Ball x={195} y={55} />
    <Arrow x1={95} y1={55} x2={175} y2={52} color="#fbbf24" />
  </MiniField>
);

const MiniQuickTransitions = () => (
  <MiniField>
    <Jersey x={50} y={80} number="6" color="#3b82f6" size={14} />
    <Jersey x={70} y={60} number="8" color="#3b82f6" size={14} />
    <Ball x={78} y={65} />
    <Jersey x={120} y={55} number="10" color="#10b981" size={16} />
    <Jersey x={100} y={100} number="9" color="#10b981" size={16} />
    <Jersey x={145} y={95} number="11" color="#10b981" size={16} />
    <Jersey x={180} y={65} number="D" color="#ef4444" size={14} />
    <Jersey x={200} y={90} number="D" color="#ef4444" size={14} />
    <Arrow x1={83} y1={62} x2={115} y2={57} color="#fbbf24" />
    <Arrow x1={125} y1={55} x2={190} y2={60} color="#10b981" dashed />
  </MiniField>
);

const MiniCrossingFinishing = () => (
  <MiniField>
    <Jersey x={25} y={80} number="GK" color="#8b5cf6" size={16} />
    <Jersey x={200} y={40} number="7" color="#10b981" size={16} />
    <Ball x={208} y={45} />
    <Jersey x={55} y={60} number="9" color="#10b981" size={14} />
    <Jersey x={65} y={90} number="10" color="#10b981" size={14} />
    <Jersey x={80} y={115} number="11" color="#10b981" size={14} />
    <Jersey x={45} y={75} number="D" color="#ef4444" size={12} />
    <Jersey x={55} y={100} number="D" color="#ef4444" size={12} />
    <Arrow x1={195} y1={45} x2={65} y2={65} color="#fbbf24" />
  </MiniField>
);

const MiniBuildUpPlay = () => (
  <MiniField>
    <Jersey x={25} y={80} number="1" color="#8b5cf6" size={16} />
    <Ball x={32} y={85} />
    <Jersey x={55} y={50} number="3" color="#10b981" size={14} />
    <Jersey x={55} y={110} number="2" color="#10b981" size={14} />
    <Jersey x={85} y={35} number="4" color="#10b981" size={14} />
    <Jersey x={85} y={125} number="5" color="#10b981" size={14} />
    <Jersey x={110} y={65} number="6" color="#3b82f6" size={14} />
    <Jersey x={110} y={95} number="8" color="#3b82f6" size={14} />
    <Jersey x={140} y={80} number="9" color="#ef4444" size={14} />
    <Arrow x1={35} y1={82} x2={50} y2={55} color="#10b981" dashed />
    <Arrow x1={35} y1={88} x2={50} y2={105} color="#10b981" dashed />
  </MiniField>
);

const MiniVisuals = {
  'd1': MiniRondo4v2, 'd2': MiniBoxPossession, 'd3': Mini1v1Defending, 'd4': MiniFinishingCircuit,
  'd5': MiniPressingTriggers, 'd6': MiniQuickTransitions, 'd7': MiniCrossingFinishing, 'd8': MiniBuildUpPlay,
};

const DrillsPage = ({ sessions, setCurrentPage, setSelectedDrillId, setShowModal, searchQuery }) => {
  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'text-emerald-400 bg-emerald-500/20';
    if (diff === 'Medium') return 'text-amber-400 bg-amber-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const filteredDrills = drillsData.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrillClick = (drillId) => {
    setSelectedDrillId(drillId);
    setCurrentPage('drillDetail');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Training Drills</h2>
          <p className="text-gray-400 mt-1">Click any drill for detailed setup and instructions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrills.map((drill) => {
          const MiniVisual = MiniVisuals[drill.id];
          return (
            <div 
              key={drill.id} 
              onClick={() => handleDrillClick(drill.id)}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10"
            >
              {/* Field visualization */}
              <div className="aspect-[3/2] relative">
                {MiniVisual && <MiniVisual />}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getDifficultyColor(drill.difficulty)}`}>
                    {drill.difficulty}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <span className="text-white font-semibold">Click to view details →</span>
                </div>
              </div>
              
              {/* Drill info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{drill.name}</h3>
                    <p className="text-gray-500 text-sm">{drill.category}</p>
                  </div>
                  <span className="text-2xl">{drill.icon}</span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{drill.shortDesc}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Timer className="w-4 h-4" />
                    <span>{drill.duration}</span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {drill.setup.cones} cones • {drill.setup.players.split(' ')[0]} players
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sessions.length === 0 && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <p className="text-amber-200 text-sm">
            Create a session first to add drills to your training plan. 
            <button onClick={() => setShowModal('session')} className="underline font-medium ml-1">Create Session</button>
          </p>
        </div>
      )}
    </div>
  );
};

export default DrillsPage;
