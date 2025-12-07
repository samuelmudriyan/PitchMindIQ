import React, { useState, useMemo } from 'react';
import drillsData, { drillCategories, difficultyLevels, ageGroups } from './DrillData';

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

    // List View
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

    // Grid View
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
          {/* Header */}
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

          {/* Meta */}
          <div style={{ display: 'flex', gap: 16, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
            <span>⏱️ {drill.duration} min</span>
            <span>👥 {drill.players}</span>
          </div>

          {/* Age Groups */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {drill.ageGroup?.map(age => (
              <span key={age} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 6,
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)'
              }}>{age.toUpperCase()}</span>
            ))}
          </div>

          {/* Focus Areas */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {drill.focusAreas?.slice(0, 3).map((a, i) => (
              <span key={i} style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 6,
                background: `${cat.color}15`, color: cat.color
              }}>{a}</span>
            ))}
          </div>

          {/* Expand hint */}
          <div style={{ 
            marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13
          }}>
            {isExpanded ? '▲ Collapse' : '▼ View Details'}
          </div>
        </div>
        {isExpanded && <DrillDetails drill={drill} cat={cat} />}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
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

      {/* Search */}
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

      {/* Filters */}
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

      {/* Category Pills */}
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

      {/* Drills */}
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
