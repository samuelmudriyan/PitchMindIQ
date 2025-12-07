import React, { useState, useMemo } from 'react';
import drillsData, { drillCategories, difficultyLevels, ageGroups } from './DrillData';

const DrillsPage = ({ onAddToSession, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDrill, setExpandedDrill] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Safety check
  const safeDrillsData = Array.isArray(drillsData) ? drillsData : [];

  // Filter drills
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
  const getDifficultyColor = (d) => ({ beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' }[d] || '#6b7280');

  const DrillCard = ({ drill }) => {
    const isExpanded = expandedDrill === drill.id;
    const cat = getCategoryInfo(drill.category);

    return (
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div onClick={() => setExpandedDrill(isExpanded ? null : drill.id)} style={{ padding: 16, cursor: 'pointer', borderLeft: `4px solid ${cat.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{drill.name}</h3>
            </div>
            <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, background: getDifficultyColor(drill.difficulty), color: '#fff', textTransform: 'capitalize' }}>{drill.difficulty}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
            <span>⏱️ {drill.duration} min</span>
            <span>👥 {drill.players}</span>
            <span style={{ color: cat.color }}>{cat.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {drill.ageGroup?.map(age => <span key={age} style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>{age.toUpperCase()}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {drill.focusAreas?.slice(0, 3).map((a, i) => <span key={i} style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: `${cat.color}22`, color: cat.color }}>{a}</span>)}
          </div>
        </div>
        {isExpanded && (
          <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>🎒 Equipment</h4>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{drill.equipment?.join(', ') || 'None'}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>📋 Setup</h4>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{drill.setup}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>📝 Instructions</h4>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {drill.instructions?.map((inst, i) => <li key={i} style={{ marginBottom: 4 }}>{inst}</li>)}
              </ol>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#10b981' }}>💡 Coaching Points</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {drill.coachingPoints?.map((p, i) => <li key={i} style={{ marginBottom: 4 }}>{p}</li>)}
              </ul>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#8b5cf6' }}>🔄 Variations</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {drill.variations?.map((v, i) => <li key={i} style={{ marginBottom: 4 }}>{v}</li>)}
              </ul>
            </div>
            {onAddToSession && (
              <button onClick={() => onAddToSession(drill)} style={{ width: '100%', padding: '10px 16px', background: cat.color, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>+ Add to Training Session</button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24 }}>⚽ Drill Library</h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{filteredDrills.length} of {safeDrillsData.length} drills</p>
        </div>
        {onBack && <button onClick={onBack} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>← Back</button>}
      </div>

      <input type="text" placeholder="Search drills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 16 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 14 }}>
          <option value="all">All Categories</option>
          {drillCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 14 }}>
          <option value="all">All Difficulties</option>
          {difficultyLevels.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 14 }}>
          <option value="all">All Ages</option>
          {ageGroups.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        <button onClick={() => setSelectedCategory('all')} style={{ padding: '8px 16px', background: selectedCategory === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13 }}>All ({safeDrillsData.length})</button>
        {drillCategories.map(c => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{ padding: '8px 16px', background: selectedCategory === c.id ? `${c.color}33` : 'rgba(255,255,255,0.05)', border: selectedCategory === c.id ? `1px solid ${c.color}` : '1px solid rgba(255,255,255,0.1)', borderRadius: 20, color: selectedCategory === c.id ? c.color : '#fff', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13 }}>{c.icon} {c.name} ({safeDrillsData.filter(d => d.category === c.id).length})</button>
        ))}
      </div>

      {filteredDrills.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', gap: 16 }}>
          {filteredDrills.map(d => <DrillCard key={d.id} drill={d} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.5)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p>No drills found</p>
          <button onClick={() => { setSelectedCategory('all'); setSelectedDifficulty('all'); setSelectedAgeGroup('all'); setSearchQuery(''); }} style={{ marginTop: 16, padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Clear Filters</button>
        </div>
      )}
    </div>
  );
};

export default DrillsPage;
