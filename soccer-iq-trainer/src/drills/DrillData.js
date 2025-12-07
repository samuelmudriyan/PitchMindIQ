// ============================================
// PITCHMIND DRILL LIBRARY - MAIN INDEX
// 155 Total Drills - Organized by Category
// ============================================

import { passingDrills, dribblingDrills } from './DrillData-part1';
import { shootingDrills, defendingDrills } from './DrillData-part2';
import { goalkeepingDrills, tacticalDrills, setPiecesDrills } from './DrillData-part3';
import { smallSidedDrills, conditioningDrills, warmupDrills } from './DrillData-part4';

// Combine all drills into one array
export const drillsData = [
  ...passingDrills,      // 25 drills (1-25)
  ...dribblingDrills,    // 25 drills (26-50)
  ...shootingDrills,     // 25 drills (51-75)
  ...defendingDrills,    // 20 drills (76-95)
  ...goalkeepingDrills,  // 15 drills (96-110)
  ...tacticalDrills,     // 15 drills (111-125)
  ...setPiecesDrills,    // 10 drills (126-135)
  ...smallSidedDrills,   // 10 drills (136-145)
  ...conditioningDrills, // 5 drills (146-150)
  ...warmupDrills        // 5 drills (151-155)
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

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get drills by category
export const getDrillsByCategory = (category) => {
  return drillsData.filter(drill => drill.category === category);
};

// Get drills by difficulty
export const getDrillsByDifficulty = (difficulty) => {
  return drillsData.filter(drill => drill.difficulty === difficulty);
};

// Get drills by age group
export const getDrillsByAgeGroup = (ageGroup) => {
  return drillsData.filter(drill => drill.ageGroup.includes(ageGroup));
};

// Search drills by name or focus area
export const searchDrills = (query) => {
  const lowerQuery = query.toLowerCase();
  return drillsData.filter(drill => 
    drill.name.toLowerCase().includes(lowerQuery) ||
    drill.category.toLowerCase().includes(lowerQuery) ||
    drill.focusAreas.some(area => area.toLowerCase().includes(lowerQuery)) ||
    drill.instructions.some(inst => inst.toLowerCase().includes(lowerQuery))
  );
};

// Get random drills with optional filters
export const getRandomDrills = (count = 5, filters = {}) => {
  let filtered = [...drillsData];
  
  if (filters.category) {
    filtered = filtered.filter(d => d.category === filters.category);
  }
  if (filters.difficulty) {
    filtered = filtered.filter(d => d.difficulty === filters.difficulty);
  }
  if (filters.ageGroup) {
    filtered = filtered.filter(d => d.ageGroup.includes(filters.ageGroup));
  }
  if (filters.maxDuration) {
    filtered = filtered.filter(d => d.duration <= filters.maxDuration);
  }
  
  // Shuffle and take count
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Get drill by ID
export const getDrillById = (id) => {
  return drillsData.find(drill => drill.id === id);
};

// Get drills by multiple filters
export const filterDrills = (filters = {}) => {
  let result = [...drillsData];
  
  if (filters.category) {
    result = result.filter(d => d.category === filters.category);
  }
  if (filters.difficulty) {
    result = result.filter(d => d.difficulty === filters.difficulty);
  }
  if (filters.ageGroup) {
    result = result.filter(d => d.ageGroup.includes(filters.ageGroup));
  }
  if (filters.minDuration) {
    result = result.filter(d => d.duration >= filters.minDuration);
  }
  if (filters.maxDuration) {
    result = result.filter(d => d.duration <= filters.maxDuration);
  }
  if (filters.players) {
    // Handle player count filtering (e.g., "8" should match "6-12")
    result = result.filter(d => {
      const playerRange = d.players.toString();
      if (playerRange.includes('+')) {
        const min = parseInt(playerRange);
        return filters.players >= min;
      }
      if (playerRange.includes('-')) {
        const [min, max] = playerRange.split('-').map(n => parseInt(n));
        return filters.players >= min && filters.players <= max;
      }
      return parseInt(playerRange) === filters.players;
    });
  }
  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.focusAreas.some(area => area.toLowerCase().includes(query))
    );
  }
  
  return result;
};

// Generate a training session based on criteria
export const generateTrainingSession = (options = {}) => {
  const {
    duration = 90,      // Total session time in minutes
    ageGroup = null,
    focus = null,       // Main focus category
    difficulty = null,
    includeWarmup = true,
    includeCooldown = true
  } = options;
  
  const session = {
    warmup: [],
    main: [],
    cooldown: [],
    totalDuration: 0
  };
  
  let remainingTime = duration;
  
  // Add warm-up (10-15 minutes)
  if (includeWarmup) {
    const warmups = filterDrills({ category: 'warmup', ageGroup, difficulty });
    if (warmups.length > 0) {
      session.warmup = [warmups[Math.floor(Math.random() * warmups.length)]];
      remainingTime -= session.warmup[0].duration;
    }
  }
  
  // Reserve time for cooldown (10 minutes)
  if (includeCooldown) {
    remainingTime -= 10;
  }
  
  // Fill main session
  const mainFilters = { ageGroup, difficulty };
  if (focus) mainFilters.category = focus;
  
  let mainDrills = filterDrills(mainFilters);
  if (mainDrills.length === 0) mainDrills = drillsData;
  
  const shuffled = mainDrills.sort(() => 0.5 - Math.random());
  
  for (const drill of shuffled) {
    if (drill.duration <= remainingTime && drill.category !== 'warmup') {
      session.main.push(drill);
      remainingTime -= drill.duration;
      
      if (session.main.length >= 5 || remainingTime < 10) break;
    }
  }
  
  // Add cooldown
  if (includeCooldown) {
    const cooldowns = drillsData.filter(d => d.name.toLowerCase().includes('cool') || d.name.toLowerCase().includes('stretch'));
    if (cooldowns.length > 0) {
      session.cooldown = [cooldowns[Math.floor(Math.random() * cooldowns.length)]];
    }
  }
  
  // Calculate total duration
  session.totalDuration = 
    session.warmup.reduce((sum, d) => sum + d.duration, 0) +
    session.main.reduce((sum, d) => sum + d.duration, 0) +
    session.cooldown.reduce((sum, d) => sum + d.duration, 0);
  
  return session;
};

// Get category color
export const getCategoryColor = (categoryId) => {
  const category = drillCategories.find(c => c.id === categoryId);
  return category?.color || '#6b7280';
};

// Get difficulty color
export const getDifficultyColor = (difficultyId) => {
  const difficulty = difficultyLevels.find(d => d.id === difficultyId);
  return difficulty?.color || '#6b7280';
};

// Stats
export const getDrillStats = () => {
  return {
    total: drillsData.length,
    byCategory: drillCategories.map(cat => ({
      ...cat,
      count: drillsData.filter(d => d.category === cat.id).length
    })),
    byDifficulty: difficultyLevels.map(diff => ({
      ...diff,
      count: drillsData.filter(d => d.difficulty === diff.id).length
    })),
    byAgeGroup: ageGroups.map(age => ({
      ...age,
      count: drillsData.filter(d => d.ageGroup.includes(age.id)).length
    }))
  };
};

export default drillsData;
