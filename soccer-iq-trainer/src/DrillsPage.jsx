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
  const getDifficultyColor = (d) => ({ beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' }[d] || '#6b7280');

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
    minWidth: 140,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 36
  };

  const DrillDetails = ({ drill, cat }) => (
    <div style={{ padding: 18, borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.25)' }}>
      <div style={{ marginBottom: 18 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>🎒 Equipment</h4>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{drill.equipment?.join(', ') || 'None specified'}</p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>📋 Setup</h4>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{drill.setup}</p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>📝 Instructions</h4>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          {drill.instructions?.map((inst, i) => <li key={i} style={{ marginBottom: 4 }}>{inst}</li>)}
        </ol>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#10b981', fontWeight: 600 }}>💡 Coaching Points</h4>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          {drill.coachingPoints?.map((p, i) => <li key={i} style={{ marginBottom: 4 }}>{p}</li>)}
        </ul>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#8b5cf6', fontWeight: 600 }}>🔄 Variations</h4>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          {drill.variations?.map((v, i) => <li key={i} style={{ marginBottom: 4 }}>{v}</li>)}
        </ul>
      </div>
      {onAddToSession && (
        <button
          onClick={(e) => { e.stopPropagation(); onAddToSession(drill); }}
          style={{
            width: '100%', padding: '12px 16px',
            background: cat.color, color: '#fff',
            border: 'none', borderRadius: 10,
            cursor: 'pointer', fontSize: 14, fontWeight: 600,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = 0.9}
          onMouseOut={(e) => e.target.style.opacity = 1}
        >+ Add to Training Session</button>
      )}
    </div>
  );

  const DrillCard = ({ drill }) => {
    const isExpanded = expandedDrill === drill.id;
    const cat = getCategoryInfo(drill.category);

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
            transition: 'all 0.2s',
            marginBottom: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', padding: 16, gap: 16 }}>
            <div style={{ 
              width: 44, height: 44, borderRadius: 10, 
              background: `${cat.color}20`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0
            }}>{cat.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff' }}>{drill.name}</h3>
                <span style={{ 
                  fontSize: 11, padding: '3px 8px', borderRadius: 6,
                  background: getDifficultyColor(drill.difficulty),
                  color: '#fff', textTransform: 'capitalize', fontWeight: 500
                }}>{drill.difficulty}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, flexWrap: 'wrap' }}>
                <span>⏱️ {drill.duration}min</span>
                <span>👥 {drill.players}</span>
                <span style={{ color: cat.color }}>{cat.name}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
              {drill.ageGroup?.slice(0, 2).map(age => (
                <span key={age} style={{
                  fontSize: 10, padding: '3px 6px', borderRadius: 4,
                  background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)'
                }}>{age.toUpperCase()}</span>
              ))}
            </div>
            <div style={{ 
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)', fontSize: 18, flexShrink: 0,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>▾</div>
          </div>
          {isExpanded && <DrillDetails drill={drill} cat={cat} />}
        </div>
      );
    }

    // Grid view card - with breakInside avoid for masonry
    return (
      <div style={{ 
        background: isExpanded ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)', 
        borderRadius: 14, 
        border: isExpanded ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.08)', 
        overflow: 'hidden',
        transition: 'all 0.2s',
        marginBottom: 16,
        breakInside: 'avoid' // Prevents card from breaking across columns
      }}>
        <div
          onClick={() => setExpandedDrill(isExpanded ? null : drill.id)}
          style={{ padding: 18, cursor: 'pointer', borderLeft: `4px solid ${cat.color}` }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff' }}>{drill.name}</h3>
            </div>
            <span style={{ 
              fontSize: 11, padding: '3px 10px', borderRadius: 8,
              background: getDifficultyColor(drill.difficulty),
              color: '#fff', textTransform: 'capitalize', fontWeight: 500
            }}>{drill.difficulty}</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
            <span>⏱️ {drill.duration}min</span>
            <span>👥 {drill.players}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {drill.ageGroup?.map(age => (
              <span key={age} style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 5,
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)'
              }}>{age.toUpperCase()}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {drill.focusAreas?.slice(0, 3).map((a, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 5,
                background: `${cat.color}18`, color: cat.color
              }}>{a}</span>
            ))}
          </div>
          <div style={{ 
            marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)', fontSize: 12
          }}>
            {isExpanded ? '▲ Click to collapse' : '▼ Click for details'}
          </div>
        </div>
        {isExpanded && <DrillDetails drill={drill} cat={cat} />}
      </div>
    );
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, color: '#fff', fontWeight: 700 }}>⚽ Drill Library</h2>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            {filteredDrills.length} of {safeDrillsData.length} drills
          </p>
        </div>
        {onBack && (
          <button onClick={onBack} style={{
            padding: '10px 18px', background: 'rgba(255,255,255,0.08)',
            color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
            fontSize: 14, fontWeight: 500
          }}>← Back</button>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search drills by name or focus area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '14px 18px',
            background: '#1a1f1c', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12, color: '#fff', fontSize: 14,
            boxSizing: 'border-box', outline: 'none'
          }}
        />
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={selectStyle}>
          <option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Categories</option>
          {drillCategories.map(c => (
            <option key={c.id} value={c.id} style={{ background: '#1a1f1c', color: '#fff' }}>{c.icon} {c.name}</option>
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

        {/* View Toggle */}
        <div style={{ display: 'flex', marginLeft: 'auto' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '10px 16px', border: 'none', cursor: 'pointer',
              borderRadius: '10px 0 0 10px', fontSize: 13, fontWeight: 500,
              background: viewMode === 'grid' ? '#10b981' : '#1a1f1c',
              color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s'
            }}
          >▦ Grid</button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '10px 16px', border: 'none', cursor: 'pointer',
              borderRadius: '0 10px 10px 0', fontSize: 13, fontWeight: 500,
              background: viewMode === 'list' ? '#10b981' : '#1a1f1c',
              color: viewMode === 'list' ? '#fff' : 'rgba(255,255,255,0.6)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s'
            }}
          >☰ List</button>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '8px 16px',
            background: selectedCategory === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: 'none', borderRadius: 20,
            color: selectedCategory === 'all' ? '#fff' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            transition: 'all 0.2s'
          }}
        >All ({safeDrillsData.length})</button>
        {drillCategories.map(c => {
          const count = safeDrillsData.filter(d => d.category === c.id).length;
          const isActive = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                padding: '8px 16px',
                background: isActive ? `${c.color}30` : 'rgba(255,255,255,0.05)',
                border: isActive ? `1px solid ${c.color}` : '1px solid transparent',
                borderRadius: 20,
                color: isActive ? c.color : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >{c.icon} {c.name} ({count})</button>
          );
        })}
      </div>

      {/* Drills - Masonry Grid or List */}
      {filteredDrills.length > 0 ? (
        viewMode === 'grid' ? (
          // Masonry layout using CSS columns
          <div style={{
            columnCount: 3,
            columnGap: 16,
            // Responsive column counts
          }}>
            <style>{`
              @media (max-width: 1200px) {
                .masonry-grid { column-count: 2 !important; }
              }
              @media (max-width: 768px) {
                .masonry-grid { column-count: 1 !important; }
              }
            `}</style>
            <div className="masonry-grid" style={{ columnCount: 3, columnGap: 16 }}>
              {filteredDrills.map(drill => <DrillCard key={drill.id} drill={drill} />)}
            </div>
          </div>
        ) : (
          // List view
          <div>
            {filteredDrills.map(drill => <DrillCard key={drill.id} drill={drill} />)}
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No drills found matching your filters</p>
          <p style={{ fontSize: 14, marginBottom: 20, color: 'rgba(255,255,255,0.3)' }}>Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            style={{
              padding: '12px 24px', background: '#10b981',
              color: '#fff', border: 'none', borderRadius: 10,
              cursor: 'pointer', fontSize: 14, fontWeight: 600
            }}
          >Clear All Filters</button>
        </div>
      )}
    </div>
  );
};

export default DrillsPage;
