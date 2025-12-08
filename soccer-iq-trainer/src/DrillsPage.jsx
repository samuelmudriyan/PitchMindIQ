import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Clock, Users, Target, Plus, X, Filter, BookOpen } from 'lucide-react';
import { drillsData } from './DrillData';

// ============================================================================
// DRILLS PAGE - Professional Design with Dropdown Filters
// ============================================================================

const DrillsPage = ({ sessions, setCurrentPage, setSelectedDrillId, setShowModal, searchQuery: externalSearchQuery }) => {
  // Filter state
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [ageFilter, setAgeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Filter options
  const ageGroups = [
    { value: 'all', label: 'All Ages' },
    { value: 'u6-u8', label: 'U6 - U8', range: [6, 8] },
    { value: 'u9-u10', label: 'U9 - U10', range: [9, 10] },
    { value: 'u11-u12', label: 'U11 - U12', range: [11, 12] },
    { value: 'u13-u14', label: 'U13 - U14', range: [13, 14] },
    { value: 'u15-u17', label: 'U15 - U17', range: [15, 17] },
    { value: 'u18+', label: 'U18+', range: [18, 99] },
  ];

  const drillTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'passing', label: 'Passing' },
    { value: 'shooting', label: 'Shooting' },
    { value: 'dribbling', label: 'Dribbling' },
    { value: 'defending', label: 'Defending' },
    { value: 'tactical', label: 'Tactical' },
    { value: 'possession', label: 'Possession' },
    { value: 'finishing', label: 'Finishing' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'warmup', label: 'Warm-up' },
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  // Close dropdown when clicking outside
  const handleBackdropClick = () => {
    setOpenDropdown(null);
  };

  // Filter drills
  const filteredDrills = useMemo(() => {
    return drillsData.filter(drill => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        drill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drill.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Age filter
      let matchesAge = true;
      if (ageFilter !== 'all') {
        const ageOption = ageGroups.find(a => a.value === ageFilter);
        if (ageOption && ageOption.range) {
          const drillMinAge = drill.minAge || 6;
          const drillMaxAge = drill.maxAge || 99;
          matchesAge = drillMinAge <= ageOption.range[1] && drillMaxAge >= ageOption.range[0];
        }
      }
      
      // Type filter
      const matchesType = typeFilter === 'all' || 
        drill.category.toLowerCase() === typeFilter.toLowerCase() ||
        drill.type?.toLowerCase() === typeFilter.toLowerCase();
      
      // Difficulty filter
      const matchesDifficulty = difficultyFilter === 'all' || 
        drill.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
      
      return matchesSearch && matchesAge && matchesType && matchesDifficulty;
    });
  }, [searchQuery, ageFilter, typeFilter, difficultyFilter]);

  // Get active filter count
  const activeFilterCount = [ageFilter, typeFilter, difficultyFilter].filter(f => f !== 'all').length;

  // Clear all filters
  const clearFilters = () => {
    setAgeFilter('all');
    setTypeFilter('all');
    setDifficultyFilter('all');
    setSearchQuery('');
  };

  // Dropdown component
  const FilterDropdown = ({ label, value, options, onChange, dropdownKey }) => {
    const isOpen = openDropdown === dropdownKey;
    const selectedOption = options.find(o => o.value === value);
    
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(isOpen ? null : dropdownKey);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: value !== 'all' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
            border: value !== 'all' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            color: value !== 'all' ? '#10b981' : '#94a3b8',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '140px',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '12px' }}>{label}:</span>
            <span>{selectedOption?.label}</span>
          </span>
          <ChevronDown 
            style={{ 
              width: '16px', 
              height: '16px',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }} 
          />
        </button>
        
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              minWidth: '100%',
              background: '#1a2332',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            {options.map(option => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                  setOpenDropdown(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: value === option.value ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  border: 'none',
                  color: value === option.value ? '#10b981' : '#e2e8f0',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => {
                  if (value !== option.value) e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseOut={e => {
                  if (value !== option.value) e.target.style.background = 'transparent';
                }}
              >
                {option.label}
                {value === option.value && (
                  <span style={{ color: '#10b981' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Difficulty badge colors
  const getDifficultyStyle = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'intermediate':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'advanced':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  // Category icon mapping
  const getCategoryIcon = (category) => {
    const icons = {
      'passing': '🎯',
      'shooting': '⚽',
      'dribbling': '🏃',
      'defending': '🛡️',
      'tactical': '📋',
      'possession': '🔄',
      'finishing': '🥅',
      'fitness': '💪',
      'warmup': '🔥',
      'warm-up': '🔥',
    };
    return icons[category?.toLowerCase()] || '⚽';
  };

  return (
    <div onClick={handleBackdropClick}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#fff',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}>
              Drill Library
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              {filteredDrills.length} drill{filteredDrills.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '12px', 
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
            <Search style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#64748b',
            }} />
            <input
              type="text"
              placeholder="Search drills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '10px 14px 10px 44px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Filter Dropdowns */}
          <FilterDropdown
            label="Age"
            value={ageFilter}
            options={ageGroups}
            onChange={setAgeFilter}
            dropdownKey="age"
          />
          
          <FilterDropdown
            label="Type"
            value={typeFilter}
            options={drillTypes}
            onChange={setTypeFilter}
            dropdownKey="type"
          />
          
          <FilterDropdown
            label="Level"
            value={difficultyFilter}
            options={difficulties}
            onChange={setDifficultyFilter}
            dropdownKey="difficulty"
          />

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#ef4444',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseOut={e => {
                e.target.style.background = 'transparent';
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Drills Grid */}
      {filteredDrills.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}>
            <BookOpen style={{ width: '36px', height: '36px', color: '#475569' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
            No drills found
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '320px', marginBottom: '20px' }}>
            Try adjusting your filters or search query to find what you're looking for.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearFilters();
            }}
            style={{
              padding: '10px 20px',
              background: '#10b981',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {filteredDrills.map((drill) => {
            const diffStyle = getDifficultyStyle(drill.difficulty);
            
            return (
              <div
                key={drill.id}
                onClick={() => {
                  setSelectedDrillId(drill.id);
                  setCurrentPage('drillDetail');
                }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                    }}>
                      {drill.icon || getCategoryIcon(drill.category)}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#f1f5f9',
                        marginBottom: '2px',
                      }}>
                        {drill.name}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: '#64748b',
                      }}>
                        {drill.category}
                      </p>
                    </div>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <span style={{
                    padding: '4px 10px',
                    background: diffStyle.bg,
                    border: `1px solid ${diffStyle.border}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: diffStyle.color,
                  }}>
                    {drill.difficulty || 'All Levels'}
                  </span>
                </div>

                {/* Description */}
                {drill.description && (
                  <p style={{
                    fontSize: '14px',
                    color: '#94a3b8',
                    lineHeight: '1.6',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {drill.description}
                  </p>
                )}

                {/* Meta Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock style={{ width: '14px', height: '14px', color: '#64748b' }} />
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {drill.duration || '15 min'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users style={{ width: '14px', height: '14px', color: '#64748b' }} />
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {drill.players || '8-16'} players
                    </span>
                  </div>
                  {(drill.minAge || drill.maxAge) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Target style={{ width: '14px', height: '14px', color: '#64748b' }} />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                        U{drill.minAge || '6'}-U{drill.maxAge || '18'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Add to Session Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal('addToSession');
                    // You'll need to pass the drill to the modal somehow
                  }}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '10px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    color: '#10b981',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => {
                    e.target.style.background = 'rgba(16, 185, 129, 0.2)';
                  }}
                  onMouseOut={e => {
                    e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                  }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Add to Session
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DrillsPage;
