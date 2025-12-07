import React, { useState, useMemo } from 'react';

const DrillsPage = ({ 
  drillsData, 
  drillCategories, 
  difficultyLevels, 
  ageGroups,
  onAddToSession,
  onBack 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDrill, setExpandedDrill] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter drills based on selections
  const filteredDrills = useMemo(() => {
    let result = [...drillsData];

    if (selectedCategory !== 'all') {
      result = result.filter(d => d.category === selectedCategory);
    }
    if (selectedDifficulty !== 'all') {
      result = result.filter(d => d.difficulty === selectedDifficulty);
    }
    if (selectedAgeGroup !== 'all') {
      result = result.filter(d => d.ageGroup.includes(selectedAgeGroup));
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.focusAreas.some(area => area.toLowerCase().includes(query)) ||
        d.instructions.some(inst => inst.toLowerCase().includes(query))
      );
    }

    return result;
  }, [drillsData, selectedCategory, selectedDifficulty, selectedAgeGroup, searchQuery]);

  // Get category info
  const getCategoryInfo = (categoryId) => {
    return drillCategories.find(c => c.id === categoryId) || { name: categoryId, icon: '⚽', color: '#6b7280' };
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: '#22c55e',
      intermediate: '#f59e0b',
      advanced: '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  // Drill Card Component
  const DrillCard = ({ drill }) => {
    const isExpanded = expandedDrill === drill.id;
    const categoryInfo = getCategoryInfo(drill.category);

    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Header */}
        <div
          onClick={() => setExpandedDrill(isExpanded ? null : drill.id)}
          style={{
            padding: 16,
            cursor: 'pointer',
            borderLeft: `4px solid ${categoryInfo.color}`
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{categoryInfo.icon}</span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{drill.name}</h3>
            </div>
            <span style={{ 
              fontSize: 12, 
              padding: '2px 8px', 
              borderRadius: 12,
              background: getDifficultyColor(drill.difficulty),
              color: '#fff',
              textTransform: 'capitalize'
            }}>
              {drill.difficulty}
            </span>
          </div>

          {/* Quick Info */}
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
            <span>⏱️ {drill.duration} min</span>
            <span>👥 {drill.players}</span>
            <span style={{ color: categoryInfo.color }}>{categoryInfo.name}</span>
          </div>

          {/* Age Groups */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {drill.ageGroup.map(age => (
              <span key={age} style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)'
              }}>
                {age.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Focus Areas */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {drill.focusAreas.slice(0, 3).map((area, i) => (
              <span key={i} style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                background: `${categoryInfo.color}22`,
                color: categoryInfo.color
              }}>
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div style={{ 
            padding: 16, 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.2)'
          }}>
            {/* Equipment */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>🎒 Equipment</h4>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                {drill.equipment.join(', ')}
              </p>
            </div>

            {/* Setup */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>📋 Setup</h4>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                {drill.setup}
              </p>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>📝 Instructions</h4>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {drill.instructions.map((inst, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{inst}</li>
                ))}
              </ol>
            </div>

            {/* Coaching Points */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#10b981' }}>💡 Coaching Points</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {drill.coachingPoints.map((point, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Variations */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#8b5cf6' }}>🔄 Variations</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                {drill.variations.map((variation, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{variation}</li>
                ))}
              </ul>
            </div>

            {/* Add to Session Button */}
            {onAddToSession && (
              <button
                onClick={() => onAddToSession(drill)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: categoryInfo.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                + Add to Training Session
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24 }}>⚽ Drill Library</h2>
          <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            {filteredDrills.length} of {drillsData.length} drills
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search drills by name or focus area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 14,
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: 12, 
        marginBottom: 24 
      }}>
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          <option value="all">All Categories</option>
          {drillCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          style={{
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          <option value="all">All Difficulties</option>
          {difficultyLevels.map(diff => (
            <option key={diff.id} value={diff.id}>{diff.name}</option>
          ))}
        </select>

        {/* Age Group Filter */}
        <select
          value={selectedAgeGroup}
          onChange={(e) => setSelectedAgeGroup(e.target.value)}
          style={{
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          <option value="all">All Ages</option>
          {ageGroups.map(age => (
            <option key={age.id} value={age.id}>{age.name}</option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: viewMode === 'grid' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
              border: viewMode === 'grid' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px 0 0 8px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: viewMode === 'list' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
              border: viewMode === 'list' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0 8px 8px 0',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            List
          </button>
        </div>
      </div>

      {/* Category Quick Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 24, 
        overflowX: 'auto',
        paddingBottom: 8
      }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '8px 16px',
            background: selectedCategory === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            color: '#fff',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontSize: 13
          }}
        >
          All ({drillsData.length})
        </button>
        {drillCategories.map(cat => {
          const count = drillsData.filter(d => d.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === cat.id ? `${cat.color}33` : 'rgba(255,255,255,0.05)',
                border: selectedCategory === cat.id ? `1px solid ${cat.color}` : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                color: selectedCategory === cat.id ? cat.color : '#fff',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: 13
              }}
            >
              {cat.icon} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Drills Grid/List */}
      {filteredDrills.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
          gap: 16
        }}>
          {filteredDrills.map(drill => (
            <DrillCard key={drill.id} drill={drill} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: 48,
          color: 'rgba(255,255,255,0.5)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p>No drills found matching your filters</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSelectedAgeGroup('all');
              setSearchQuery('');
            }}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DrillsPage;
