// ============================================
// PITCHMIND DRILL LIBRARY - MAIN INDEX
// 155 Total Drills - Organized by Category
// ============================================

import { passingDrills, dribblingDrills } from './DrillData-part1.js';
import { shootingDrills, defendingDrills } from './DrillData-part2.js';
import { goalkeepingDrills, tacticalDrills, setPiecesDrills } from './DrillData-part3.js';
import { smallSidedDrills, conditioningDrills, warmupDrills } from './DrillData-part4.js';

// Combine all drills into one array
export const drillsData = [
  ...passingDrills,
  ...dribblingDrills,
  ...shootingDrills,
  ...defendingDrills,
  ...goalkeepingDrills,
  ...tacticalDrills,
  ...setPiecesDrills,
  ...smallSidedDrills,
  ...conditioningDrills,
  ...warmupDrills
];

// Categories for filtering
export const drillCategories = [
  { id: 'passing', name: 'Passing & Receiving', icon: '⚽', color: '#10b981', count: 25 },
  { id: 'dribbling', name: 'Dribbling & Ball Control', icon: '🏃', color: '#3b82f6', count: 25 },
  { id: 'shooting', name: 'Shooting & Finishing', icon: '🥅', color: '#ef4444', count: 25 },
  { id: 'defending', name: 'Defending', icon: '🛡️', color: '#f59e0b', count: 20 },
  { id: 'goalkeeping', name: 'Goalkeeping', icon: '🧤', color: '#8b5cf6', count: 15 },
  { id: 'tactical', name: 'Tactical & Positioning', icon: '🎯', color: '#ec4899', count: 15 },
  { id: 'setpieces', name: 'Set Pieces', icon: '📐', color: '#06b6d4', count: 10 },
  { id: 'smallsided', name: 'Small-Sided Games', icon: '⚔️', color: '#84cc16', count: 10 },
  { id: 'conditioning', name: 'Conditioning & Fitness', icon: '💪', color: '#f97316', count: 5 },
  { id: 'warmup', name: 'Warm-Up & Cool-Down', icon: '🔥', color: '#6366f1', count: 5 }
];

// Difficulty levels
export const difficultyLevels = [
  { id: 'beginner', name: 'Beginner', color: '#22c55e' },
  { id: 'intermediate', name: 'Intermediate', color: '#f59e0b' },
  { id: 'advanced', name: 'Advanced', color: '#ef4444' }
];

// Age groups
export const ageGroups = [
  { id: 'u8-u10', name: 'U8-U10', minAge: 6, maxAge: 10 },
  { id: 'u11-u13', name: 'U11-U13', minAge: 11, maxAge: 13 },
  { id: 'u14-u16', name: 'U14-U16', minAge: 14, maxAge: 16 },
  { id: 'u17+', name: 'U17+', minAge: 17, maxAge: 99 }
];

// Helper Functions
export const getDrillsByCategory = (category) => {
  return drillsData.filter(drill => drill.category === category);
};

export const getDrillsByDifficulty = (difficulty) => {
  return drillsData.filter(drill => drill.difficulty === difficulty);
};

export const getDrillsByAgeGroup = (ageGroup) => {
  return drillsData.filter(drill => drill.ageGroup.includes(ageGroup));
};

export const searchDrills = (query) => {
  const lowerQuery = query.toLowerCase();
  return drillsData.filter(drill => 
    drill.name.toLowerCase().includes(lowerQuery) ||
    drill.category.toLowerCase().includes(lowerQuery) ||
    drill.focusAreas.some(area => area.toLowerCase().includes(lowerQuery))
  );
};

export const getRandomDrills = (count = 5, filters = {}) => {
  let filtered = [...drillsData];
  if (filters.category) filtered = filtered.filter(d => d.category === filters.category);
  if (filters.difficulty) filtered = filtered.filter(d => d.difficulty === filters.difficulty);
  if (filters.ageGroup) filtered = filtered.filter(d => d.ageGroup.includes(filters.ageGroup));
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getDrillById = (id) => drillsData.find(drill => drill.id === id);

export const filterDrills = (filters = {}) => {
  let result = [...drillsData];
  if (filters.category) result = result.filter(d => d.category === filters.category);
  if (filters.difficulty) result = result.filter(d => d.difficulty === filters.difficulty);
  if (filters.ageGroup) result = result.filter(d => d.ageGroup.includes(filters.ageGroup));
  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(d => d.name.toLowerCase().includes(query) || d.focusAreas.some(a => a.toLowerCase().includes(query)));
  }
  return result;
};

export const getCategoryColor = (categoryId) => {
  const cat = drillCategories.find(c => c.id === categoryId);
  return cat?.color || '#6b7280';
};

export const getDifficultyColor = (difficultyId) => {
  const diff = difficultyLevels.find(d => d.id === difficultyId);
  return diff?.color || '#6b7280';
};

export default drillsData;
