import React, { useState, useMemo } from 'react';
import drillsData, { drillCategories, difficultyLevels, ageGroups } from './DrillData';

// ============================================
// INDIVIDUAL DRILL VISUALIZATION CONFIGS
// Each drill ID maps to its unique visualization
// ============================================
const drillVisualConfigs = {
  // ===== PASSING & RECEIVING (1-25) =====
  1: { // Triangle Passing
    type: 'small',
    players: [
      { x: 60, y: 20, color: 'blue', label: 'A' },
      { x: 100, y: 95, color: 'blue', label: 'B' },
      { x: 20, y: 95, color: 'blue', label: 'C' },
    ],
    cones: [{ x: 60, y: 20 }, { x: 100, y: 95 }, { x: 20, y: 95 }],
    ball: { x: 52, y: 25 },
    arrows: [
      { x1: 55, y1: 28, x2: 28, y2: 85, color: 'green' },
      { x1: 30, y1: 95, x2: 90, y2: 95, color: 'green' },
      { x1: 95, y1: 87, x2: 65, y2: 28, color: 'green' },
    ]
  },
  2: { // Rondo 4v1
    type: 'small',
    players: [
      { x: 60, y: 15, color: 'blue', label: '1' },
      { x: 105, y: 60, color: 'blue', label: '2' },
      { x: 60, y: 105, color: 'blue', label: '3' },
      { x: 15, y: 60, color: 'blue', label: '4' },
      { x: 60, y: 60, color: 'red', label: 'D' },
    ],
    ball: { x: 52, y: 20 },
    arrows: [{ x1: 55, y1: 25, x2: 95, y2: 55, color: 'green' }],
    shapes: [{ type: 'rect', x: 15, y: 15, w: 90, h: 90, dashed: true }]
  },
  3: { // Rondo 5v2
    type: 'small',
    players: [
      { x: 60, y: 12, color: 'blue', label: '1' },
      { x: 105, y: 40, color: 'blue', label: '2' },
      { x: 90, y: 100, color: 'blue', label: '3' },
      { x: 30, y: 100, color: 'blue', label: '4' },
      { x: 15, y: 40, color: 'blue', label: '5' },
      { x: 45, y: 55, color: 'red' },
      { x: 75, y: 65, color: 'red' },
    ],
    ball: { x: 52, y: 17 },
  },
  4: { // Wall Pass Combinations
    type: 'field',
    players: [
      { x: 40, y: 70, color: 'blue', label: '1' },
      { x: 100, y: 70, color: 'blue', label: '2' },
      { x: 140, y: 70, color: 'red', label: 'D' },
    ],
    ball: { x: 48, y: 70 },
    arrows: [
      { x1: 52, y1: 68, x2: 90, y2: 68, color: 'green' },
      { x1: 108, y1: 72, x2: 150, y2: 50, color: 'green' },
    ],
    curves: [{ x1: 45, y1: 75, x2: 155, y2: 48, curve: 35, color: 'yellow', dashed: true }]
  },
  5: { // Long Ball Accuracy
    type: 'field',
    players: [
      { x: 35, y: 100, color: 'blue', label: '1' },
      { x: 165, y: 40, color: 'blue', label: '2' },
    ],
    cones: [{ x: 155, y: 30 }, { x: 175, y: 30 }, { x: 155, y: 50 }, { x: 175, y: 50 }],
    ball: { x: 43, y: 98 },
    curves: [{ x1: 45, y1: 95, x2: 158, y2: 45, curve: -45, color: 'green' }]
  },
  6: { // Switching Play
    type: 'field',
    players: [
      { x: 30, y: 90, color: 'blue', label: 'LB' },
      { x: 100, y: 70, color: 'blue', label: 'CM' },
      { x: 170, y: 50, color: 'blue', label: 'RW' },
    ],
    ball: { x: 38, y: 88 },
    arrows: [{ x1: 40, y1: 88, x2: 92, y2: 72, color: 'green' }],
    curves: [{ x1: 105, y1: 68, x2: 162, y2: 52, curve: -20, color: 'green' }]
  },
  7: { // Y Shape Passing
    type: 'small',
    players: [
      { x: 60, y: 105, color: 'blue', label: '1' },
      { x: 60, y: 60, color: 'blue', label: '2' },
      { x: 25, y: 20, color: 'blue', label: '3' },
      { x: 95, y: 20, color: 'blue', label: '4' },
    ],
    cones: [{ x: 60, y: 105 }, { x: 60, y: 60 }, { x: 25, y: 20 }, { x: 95, y: 20 }],
    ball: { x: 52, y: 100 },
    arrows: [
      { x1: 55, y1: 98, x2: 55, y2: 70, color: 'green' },
      { x1: 52, y1: 55, x2: 32, y2: 28, color: 'green', dashed: true },
      { x1: 68, y1: 55, x2: 88, y2: 28, color: 'green', dashed: true },
    ]
  },
  8: { // Through Ball Gates
    type: 'field',
    players: [
      { x: 50, y: 90, color: 'blue', label: '1' },
      { x: 130, y: 50, color: 'blue', label: '2' },
      { x: 100, y: 60, color: 'red' },
      { x: 100, y: 80, color: 'red' },
    ],
    cones: [{ x: 140, y: 40 }, { x: 160, y: 40 }],
    ball: { x: 58, y: 88 },
    arrows: [{ x1: 60, y1: 88, x2: 135, y2: 45, color: 'green' }],
    curves: [{ x1: 135, y1: 52, x2: 150, y2: 42, curve: -10, color: 'yellow', dashed: true }]
  },
  9: { // Overlap Passing
    type: 'field',
    players: [
      { x: 50, y: 80, color: 'blue', label: 'FB' },
      { x: 90, y: 60, color: 'blue', label: 'W' },
      { x: 120, y: 65, color: 'red' },
    ],
    ball: { x: 58, y: 78 },
    arrows: [{ x1: 60, y1: 78, x2: 82, y2: 62, color: 'green' }],
    curves: [{ x1: 55, y1: 82, x2: 150, y2: 40, curve: 40, color: 'yellow', dashed: true }]
  },
  10: { // Pivot Passing
    type: 'small',
    players: [
      { x: 20, y: 60, color: 'blue', label: '1' },
      { x: 60, y: 60, color: 'blue', label: 'P' },
      { x: 100, y: 60, color: 'blue', label: '2' },
    ],
    ball: { x: 28, y: 58 },
    arrows: [
      { x1: 30, y1: 58, x2: 50, y2: 58, color: 'green' },
      { x1: 70, y1: 62, x2: 90, y2: 62, color: 'green' },
    ]
  },
  11: { // One Touch Circle
    type: 'small',
    players: [
      { x: 60, y: 15, color: 'blue' },
      { x: 100, y: 40, color: 'blue' },
      { x: 100, y: 80, color: 'blue' },
      { x: 60, y: 105, color: 'blue' },
      { x: 20, y: 80, color: 'blue' },
      { x: 20, y: 40, color: 'blue' },
    ],
    ball: { x: 52, y: 20 },
    shapes: [{ type: 'circle', x: 60, y: 60, r: 45, dashed: true }]
  },
  12: { // Diagonal Passing Patterns
    type: 'field',
    players: [
      { x: 40, y: 100, color: 'blue', label: '1' },
      { x: 100, y: 60, color: 'blue', label: '2' },
      { x: 160, y: 100, color: 'blue', label: '3' },
    ],
    ball: { x: 48, y: 98 },
    arrows: [
      { x1: 50, y1: 98, x2: 92, y2: 65, color: 'green' },
      { x1: 108, y1: 62, x2: 152, y2: 95, color: 'green' },
    ]
  },
  13: { // Pressure Square
    type: 'small',
    players: [
      { x: 20, y: 20, color: 'blue', label: '1' },
      { x: 100, y: 20, color: 'blue', label: '2' },
      { x: 100, y: 100, color: 'blue', label: '3' },
      { x: 20, y: 100, color: 'blue', label: '4' },
      { x: 60, y: 60, color: 'red', label: 'D' },
    ],
    ball: { x: 28, y: 20 },
    shapes: [{ type: 'rect', x: 20, y: 20, w: 80, h: 80, dashed: true }]
  },
  14: { // Third Man Runs
    type: 'field',
    players: [
      { x: 50, y: 90, color: 'blue', label: '1' },
      { x: 100, y: 70, color: 'blue', label: '2' },
      { x: 140, y: 90, color: 'blue', label: '3' },
    ],
    ball: { x: 58, y: 88 },
    arrows: [{ x1: 60, y1: 88, x2: 92, y2: 72, color: 'green' }],
    curves: [
      { x1: 105, y1: 68, x2: 155, y2: 45, curve: -15, color: 'green' },
      { x1: 145, y1: 88, x2: 160, y2: 50, curve: 20, color: 'yellow', dashed: true },
    ]
  },
  15: { // Receiving Under Pressure
    type: 'small',
    players: [
      { x: 30, y: 60, color: 'blue', label: '1' },
      { x: 90, y: 60, color: 'blue', label: '2' },
      { x: 75, y: 60, color: 'red', label: 'D' },
    ],
    ball: { x: 38, y: 58 },
    arrows: [{ x1: 42, y1: 58, x2: 65, y2: 58, color: 'green' }]
  },
  16: { // Back Foot Receiving
    type: 'small',
    players: [
      { x: 30, y: 60, color: 'blue', label: '1' },
      { x: 90, y: 60, color: 'blue', label: '2' },
    ],
    cones: [{ x: 90, y: 45 }, { x: 90, y: 75 }],
    ball: { x: 38, y: 58 },
    arrows: [{ x1: 42, y1: 58, x2: 80, y2: 58, color: 'green' }]
  },
  17: { // Build Out From Back
    type: 'field',
    players: [
      { x: 25, y: 70, color: 'gk', label: 'GK' },
      { x: 55, y: 50, color: 'blue', label: 'CB' },
      { x: 55, y: 90, color: 'blue', label: 'CB' },
      { x: 100, y: 70, color: 'blue', label: 'CM' },
      { x: 140, y: 50, color: 'red' },
      { x: 140, y: 90, color: 'red' },
    ],
    ball: { x: 32, y: 68 },
    arrows: [
      { x1: 35, y1: 68, x2: 48, y2: 52, color: 'green' },
      { x1: 62, y1: 52, x2: 92, y2: 68, color: 'green', dashed: true },
    ]
  },
  18: { // Passing Sequence
    type: 'field',
    players: [
      { x: 35, y: 70, color: 'blue', label: '1' },
      { x: 80, y: 50, color: 'blue', label: '2' },
      { x: 125, y: 70, color: 'blue', label: '3' },
      { x: 170, y: 50, color: 'blue', label: '4' },
    ],
    ball: { x: 43, y: 68 },
    arrows: [
      { x1: 45, y1: 68, x2: 72, y2: 52, color: 'green' },
      { x1: 88, y1: 52, x2: 117, y2: 68, color: 'green' },
      { x1: 133, y1: 68, x2: 162, y2: 52, color: 'green' },
    ]
  },
  19: { // Two Touch Game
    type: 'small',
    players: [
      { x: 25, y: 35, color: 'blue' },
      { x: 60, y: 20, color: 'blue' },
      { x: 95, y: 35, color: 'blue' },
      { x: 25, y: 85, color: 'blue' },
      { x: 60, y: 100, color: 'blue' },
      { x: 95, y: 85, color: 'blue' },
      { x: 45, y: 60, color: 'red' },
      { x: 75, y: 60, color: 'red' },
    ],
    ball: { x: 60, y: 28 },
    shapes: [{ type: 'rect', x: 15, y: 15, w: 90, h: 90, dashed: true }]
  },
  20: { // Vertical Passing Lanes
    type: 'field',
    players: [
      { x: 50, y: 110, color: 'blue', label: '1' },
      { x: 50, y: 70, color: 'blue', label: '2' },
      { x: 50, y: 30, color: 'blue', label: '3' },
      { x: 100, y: 110, color: 'blue', label: '4' },
      { x: 100, y: 70, color: 'blue', label: '5' },
      { x: 100, y: 30, color: 'blue', label: '6' },
    ],
    ball: { x: 50, y: 102 },
    arrows: [{ x1: 50, y1: 100, x2: 50, y2: 80, color: 'green' }]
  },
  21: { // Bounce Pass
    type: 'small',
    players: [
      { x: 25, y: 60, color: 'blue', label: '1' },
      { x: 60, y: 60, color: 'blue', label: '2' },
      { x: 95, y: 60, color: 'blue', label: '3' },
    ],
    ball: { x: 33, y: 58 },
    arrows: [
      { x1: 35, y1: 58, x2: 52, y2: 58, color: 'green' },
      { x1: 68, y1: 62, x2: 87, y2: 62, color: 'green' },
    ]
  },
  22: { // Crossing Combinations
    type: 'field',
    players: [
      { x: 175, y: 25, color: 'blue', label: 'W' },
      { x: 130, y: 70, color: 'blue', label: 'ST' },
      { x: 145, y: 90, color: 'blue', label: 'M' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 173, y: 33 },
    curves: [{ x1: 172, y1: 30, x2: 135, y2: 65, curve: -25, color: 'white' }],
    arrows: [{ x1: 130, y1: 68, x2: 30, y2: 68, color: 'red' }]
  },
  23: { // Pass and Move Circuit
    type: 'field',
    cones: [{ x: 40, y: 40 }, { x: 100, y: 40 }, { x: 160, y: 40 }, { x: 40, y: 100 }, { x: 100, y: 100 }, { x: 160, y: 100 }],
    players: [
      { x: 40, y: 40, color: 'blue', label: '1' },
      { x: 100, y: 40, color: 'blue', label: '2' },
      { x: 160, y: 40, color: 'blue', label: '3' },
    ],
    ball: { x: 48, y: 40 },
    arrows: [
      { x1: 50, y1: 42, x2: 90, y2: 42, color: 'green' },
      { x1: 45, y1: 48, x2: 45, y2: 90, color: 'yellow', dashed: true },
    ]
  },
  24: { // Aerial Control
    type: 'field',
    players: [
      { x: 50, y: 70, color: 'blue', label: '1' },
      { x: 150, y: 70, color: 'blue', label: '2' },
    ],
    ball: { x: 58, y: 65 },
    curves: [{ x1: 60, y1: 65, x2: 142, y2: 65, curve: -40, color: 'white' }]
  },
  25: { // Passing Under Fatigue
    type: 'field',
    cones: [{ x: 30, y: 50 }, { x: 30, y: 90 }, { x: 100, y: 70 }, { x: 170, y: 50 }, { x: 170, y: 90 }],
    players: [
      { x: 30, y: 70, color: 'blue', label: '1' },
      { x: 100, y: 70, color: 'blue', label: '2' },
      { x: 170, y: 70, color: 'blue', label: '3' },
    ],
    ball: { x: 38, y: 68 },
    arrows: [{ x1: 40, y1: 68, x2: 90, y2: 68, color: 'green' }]
  },

  // ===== DRIBBLING & BALL CONTROL (26-50) =====
  26: { // Cone Weave Dribbling
    type: 'field',
    cones: [{ x: 50, y: 70 }, { x: 80, y: 70 }, { x: 110, y: 70 }, { x: 140, y: 70 }, { x: 170, y: 70 }],
    players: [{ x: 25, y: 70, color: 'blue' }],
    ball: { x: 33, y: 68 },
    paths: [{ d: 'M 38 70 Q 65 50 80 70 Q 95 90 110 70 Q 125 50 140 70 Q 155 90 170 70 L 185 70', color: 'yellow' }]
  },
  27: { // 1v1 Box Battles
    type: 'small',
    players: [
      { x: 40, y: 60, color: 'blue', label: 'ATT' },
      { x: 80, y: 60, color: 'red', label: 'DEF' },
    ],
    ball: { x: 48, y: 58 },
    shapes: [{ type: 'rect', x: 25, y: 30, w: 70, h: 60, dashed: true }],
    cones: [{ x: 25, y: 30 }, { x: 95, y: 30 }, { x: 25, y: 90 }, { x: 95, y: 90 }]
  },
  28: { // Coerver Ball Mastery
    type: 'small',
    players: [{ x: 60, y: 60, color: 'blue' }],
    ball: { x: 60, y: 48 },
    shapes: [{ type: 'circle', x: 60, y: 60, r: 30, dashed: true }],
    text: [{ x: 60, y: 105, content: 'Ball mastery zone', size: 9 }]
  },
  29: { // Speed Dribble Races
    type: 'field',
    cones: [{ x: 30, y: 50 }, { x: 30, y: 90 }, { x: 170, y: 50 }, { x: 170, y: 90 }],
    players: [
      { x: 40, y: 50, color: 'blue', label: '1' },
      { x: 40, y: 90, color: 'blue', label: '2' },
    ],
    ball: { x: 48, y: 50 },
    arrows: [
      { x1: 50, y1: 50, x2: 160, y2: 50, color: 'yellow', dashed: true },
      { x1: 50, y1: 90, x2: 160, y2: 90, color: 'yellow', dashed: true },
    ]
  },
  30: { // Moves Library
    type: 'small',
    players: [{ x: 35, y: 60, color: 'blue' }],
    cones: [{ x: 75, y: 60 }],
    ball: { x: 43, y: 58 },
    arrows: [{ x1: 48, y1: 58, x2: 68, y2: 58, color: 'yellow', dashed: true }],
    curves: [{ x1: 50, y1: 62, x2: 100, y2: 50, curve: 25, color: 'yellow', dashed: true }]
  },
  31: { // Protect the Ball
    type: 'small',
    players: [
      { x: 60, y: 55, color: 'blue', label: 'ATT' },
      { x: 60, y: 80, color: 'red', label: 'DEF' },
    ],
    ball: { x: 52, y: 50 },
    shapes: [{ type: 'circle', x: 60, y: 60, r: 35, dashed: true }],
    text: [{ x: 60, y: 110, content: 'Shielding circle', size: 8 }]
  },
  32: { // Tight Space Dribbling
    type: 'small',
    cones: [{ x: 30, y: 30 }, { x: 90, y: 30 }, { x: 30, y: 90 }, { x: 90, y: 90 }],
    players: [{ x: 60, y: 60, color: 'blue' }],
    ball: { x: 68, y: 58 },
    shapes: [{ type: 'rect', x: 30, y: 30, w: 60, h: 60, dashed: true }],
    text: [{ x: 60, y: 110, content: '5x5 yard box', size: 8 }]
  },
  33: { // Driving to Shot
    type: 'field',
    players: [
      { x: 100, y: 110, color: 'blue' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 108, y: 108 },
    arrows: [
      { x1: 105, y1: 105, x2: 75, y2: 75, color: 'yellow', dashed: true },
      { x1: 70, y1: 72, x2: 30, y2: 70, color: 'red' },
    ]
  },
  34: { // The Gauntlet
    type: 'field',
    cones: [{ x: 60, y: 55 }, { x: 60, y: 85 }, { x: 100, y: 55 }, { x: 100, y: 85 }, { x: 140, y: 55 }, { x: 140, y: 85 }],
    players: [
      { x: 30, y: 70, color: 'blue' },
      { x: 80, y: 70, color: 'red' },
      { x: 120, y: 70, color: 'red' },
    ],
    ball: { x: 38, y: 68 },
    arrows: [{ x1: 42, y1: 68, x2: 170, y2: 68, color: 'yellow', dashed: true }]
  },
  35: { // Turn and Accelerate
    type: 'field',
    cones: [{ x: 60, y: 70 }, { x: 140, y: 70 }],
    players: [{ x: 100, y: 70, color: 'blue' }],
    ball: { x: 100, y: 62 },
    arrows: [
      { x1: 95, y1: 70, x2: 68, y2: 70, color: 'yellow', dashed: true },
      { x1: 105, y1: 70, x2: 132, y2: 70, color: 'yellow', dashed: true },
    ]
  },
  36: { // Dribble Tag
    type: 'small',
    players: [
      { x: 30, y: 40, color: 'blue' },
      { x: 60, y: 90, color: 'blue' },
      { x: 90, y: 50, color: 'blue' },
      { x: 50, y: 60, color: 'red', label: 'IT' },
    ],
    shapes: [{ type: 'rect', x: 15, y: 20, w: 90, h: 90, dashed: true }],
    text: [{ x: 60, y: 8, content: 'Playing area', size: 8 }]
  },
  37: { // Figure 8 Dribbling
    type: 'small',
    cones: [{ x: 40, y: 60 }, { x: 80, y: 60 }],
    players: [{ x: 20, y: 60, color: 'blue' }],
    ball: { x: 28, y: 58 },
    paths: [{ d: 'M 30 60 Q 60 30 80 60 Q 100 90 80 60 Q 60 30 40 60 Q 20 90 40 60', color: 'yellow' }]
  },
  38: { // Beat and Cross
    type: 'field',
    players: [
      { x: 150, y: 110, color: 'blue', label: 'W' },
      { x: 160, y: 90, color: 'red', label: 'D' },
      { x: 100, y: 70, color: 'blue', label: 'ST' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 155, y: 103 },
    curves: [
      { x1: 155, y1: 105, x2: 175, y2: 50, curve: 30, color: 'yellow', dashed: true },
      { x1: 173, y1: 50, x2: 110, y2: 68, curve: -20, color: 'white' },
    ]
  },
  39: { // Dribble into Shooting
    type: 'field',
    cones: [{ x: 90, y: 60 }, { x: 90, y: 80 }],
    players: [
      { x: 100, y: 110, color: 'blue' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 100, y: 102 },
    arrows: [
      { x1: 100, y1: 100, x2: 100, y2: 85, color: 'yellow', dashed: true },
      { x1: 95, y1: 80, x2: 30, y2: 70, color: 'red' },
    ]
  },
  40: { // Speed Ladder Dribbling
    type: 'small',
    players: [{ x: 25, y: 60, color: 'blue' }],
    ball: { x: 33, y: 58 },
    shapes: [{ type: 'rect', x: 45, y: 30, w: 30, h: 60 }],
    lines: [
      { x1: 45, y1: 40, x2: 75, y2: 40 }, { x1: 45, y1: 50, x2: 75, y2: 50 },
      { x1: 45, y1: 60, x2: 75, y2: 60 }, { x1: 45, y1: 70, x2: 75, y2: 70 },
      { x1: 45, y1: 80, x2: 75, y2: 80 },
    ],
    arrows: [{ x1: 35, y1: 60, x2: 40, y2: 35, color: 'yellow', dashed: true }]
  },
  41: { // Shadow Dribbling
    type: 'small',
    players: [
      { x: 40, y: 60, color: 'blue', label: 'Lead' },
      { x: 80, y: 60, color: 'blue', label: 'Copy' },
    ],
    ball: { x: 48, y: 58 },
    arrows: [{ x1: 50, y1: 65, x2: 72, y2: 65, color: 'yellow', dashed: true }]
  },
  42: { // Body Feints Practice
    type: 'small',
    cones: [{ x: 80, y: 60 }],
    players: [{ x: 40, y: 60, color: 'blue' }],
    ball: { x: 48, y: 58 },
    arrows: [{ x1: 52, y1: 55, x2: 72, y2: 45, color: 'yellow', dashed: true }],
    curves: [{ x1: 52, y1: 62, x2: 95, y2: 70, curve: 20, color: 'yellow', dashed: true }]
  },
  43: { // Beat the Press
    type: 'field',
    players: [
      { x: 40, y: 70, color: 'blue' },
      { x: 70, y: 55, color: 'red' },
      { x: 70, y: 85, color: 'red' },
    ],
    ball: { x: 48, y: 68 },
    arrows: [{ x1: 50, y1: 68, x2: 100, y2: 68, color: 'yellow', dashed: true }]
  },
  44: { // Slalom Dribble Course
    type: 'field',
    cones: [{ x: 45, y: 55 }, { x: 65, y: 85 }, { x: 85, y: 55 }, { x: 105, y: 85 }, { x: 125, y: 55 }, { x: 145, y: 85 }],
    players: [{ x: 25, y: 70, color: 'blue' }],
    ball: { x: 33, y: 68 },
    paths: [{ d: 'M 38 70 L 45 58 L 65 82 L 85 58 L 105 82 L 125 58 L 145 82 L 170 70', color: 'yellow' }]
  },
  45: { // Dribble Square Escape
    type: 'small',
    cones: [{ x: 30, y: 30 }, { x: 90, y: 30 }, { x: 30, y: 90 }, { x: 90, y: 90 }],
    players: [
      { x: 60, y: 60, color: 'blue' },
      { x: 60, y: 35, color: 'red' },
    ],
    ball: { x: 68, y: 58 },
    shapes: [{ type: 'rect', x: 30, y: 30, w: 60, h: 60, dashed: true }]
  },
  46: { // Ronaldo Chops
    type: 'small',
    cones: [{ x: 75, y: 60 }],
    players: [{ x: 40, y: 60, color: 'blue' }],
    ball: { x: 48, y: 58 },
    arrows: [
      { x1: 50, y1: 58, x2: 68, y2: 58, color: 'yellow', dashed: true },
      { x1: 68, y1: 55, x2: 68, y2: 40, color: 'yellow', dashed: true },
      { x1: 68, y1: 65, x2: 68, y2: 80, color: 'yellow', dashed: true },
    ],
    text: [{ x: 60, y: 105, content: 'Chop left or right', size: 8 }]
  },
  47: { // Blind Side Turn
    type: 'small',
    players: [
      { x: 50, y: 40, color: 'blue', label: '1' },
      { x: 50, y: 80, color: 'blue', label: '2' },
      { x: 70, y: 85, color: 'red' },
    ],
    ball: { x: 50, y: 48 },
    arrows: [{ x1: 50, y1: 50, x2: 50, y2: 72, color: 'green' }],
    curves: [{ x1: 55, y1: 80, x2: 95, y2: 60, curve: 20, color: 'yellow', dashed: true }]
  },
  48: { // Dribble Fitness Circuit
    type: 'field',
    cones: [{ x: 30, y: 40 }, { x: 80, y: 40 }, { x: 130, y: 40 }, { x: 30, y: 100 }, { x: 80, y: 100 }, { x: 130, y: 100 }],
    players: [{ x: 30, y: 70, color: 'blue' }],
    ball: { x: 38, y: 68 },
    paths: [{ d: 'M 35 65 L 35 45 L 75 45 L 75 95 L 125 95 L 125 45 L 170 70', color: 'yellow' }]
  },
  49: { // Messi Dribbling Patterns
    type: 'small',
    cones: [{ x: 50, y: 50 }, { x: 70, y: 70 }, { x: 50, y: 90 }],
    players: [{ x: 30, y: 70, color: 'blue' }],
    ball: { x: 38, y: 68 },
    paths: [{ d: 'M 40 70 Q 55 45 70 70 Q 55 95 40 70', color: 'yellow' }]
  },
  50: { // Dribble Under Pressure Game
    type: 'small',
    players: [
      { x: 30, y: 50, color: 'blue' },
      { x: 30, y: 80, color: 'blue' },
      { x: 90, y: 50, color: 'red' },
      { x: 90, y: 80, color: 'red' },
    ],
    ball: { x: 38, y: 50 },
    cones: [{ x: 15, y: 35 }, { x: 15, y: 95 }, { x: 105, y: 35 }, { x: 105, y: 95 }],
    shapes: [{ type: 'rect', x: 15, y: 35, w: 90, h: 60, dashed: true }]
  },

  // ===== SHOOTING & FINISHING (51-75) =====
  51: { // Shooting Technique Basics
    type: 'field',
    players: [
      { x: 110, y: 70, color: 'blue' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 110, y: 62 },
    cones: [{ x: 70, y: 55 }, { x: 70, y: 85 }],
    arrows: [{ x1: 105, y1: 65, x2: 30, y2: 70, color: 'red' }]
  },
  52: { // Finishing Crosses
    type: 'field',
    players: [
      { x: 175, y: 30, color: 'blue', label: 'W' },
      { x: 120, y: 60, color: 'blue', label: 'ST' },
      { x: 140, y: 80, color: 'blue', label: 'M' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 173, y: 38 },
    curves: [{ x1: 172, y1: 35, x2: 125, y2: 58, curve: -25, color: 'white' }],
    arrows: [{ x1: 120, y1: 58, x2: 30, y2: 68, color: 'red' }]
  },
  53: { // One Touch Finishing
    type: 'field',
    players: [
      { x: 70, y: 70, color: 'blue', label: 'Pass' },
      { x: 120, y: 70, color: 'blue', label: 'Shoot' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 78, y: 68 },
    arrows: [
      { x1: 80, y1: 68, x2: 110, y2: 68, color: 'green' },
      { x1: 118, y1: 72, x2: 30, y2: 72, color: 'red' },
    ]
  },
  54: { // Shooting Under Pressure
    type: 'field',
    players: [
      { x: 100, y: 70, color: 'blue', label: 'ST' },
      { x: 120, y: 70, color: 'red', label: 'D' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 92, y: 68 },
    arrows: [{ x1: 95, y1: 70, x2: 30, y2: 70, color: 'red' }]
  },
  55: { // Chip and Lob Finishing
    type: 'field',
    players: [
      { x: 100, y: 90, color: 'blue' },
      { x: 35, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 100, y: 82 },
    curves: [{ x1: 100, y1: 82, x2: 25, y2: 60, curve: -35, color: 'red' }]
  },
  56: { // Volleys and Half Volleys
    type: 'field',
    players: [
      { x: 140, y: 105, color: 'blue', label: 'Serve' },
      { x: 100, y: 70, color: 'blue', label: 'Shoot' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 138, y: 97 },
    curves: [{ x1: 138, y1: 100, x2: 100, y2: 75, curve: -20, color: 'white' }],
    arrows: [{ x1: 95, y1: 72, x2: 30, y2: 72, color: 'red' }]
  },
  57: { // Quick Fire Shooting
    type: 'field',
    players: [
      { x: 100, y: 70, color: 'blue' },
      { x: 65, y: 50, color: 'blue', label: 'S1' },
      { x: 65, y: 90, color: 'blue', label: 'S2' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 73, y: 50 },
    arrows: [
      { x1: 75, y1: 52, x2: 92, y2: 68, color: 'green' },
      { x1: 98, y1: 68, x2: 30, y2: 68, color: 'red' },
    ]
  },
  58: { // 1v1 with Goalkeeper
    type: 'field',
    players: [
      { x: 100, y: 70, color: 'blue', label: 'ATT' },
      { x: 35, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 108, y: 68 },
    arrows: [
      { x1: 105, y1: 68, x2: 50, y2: 68, color: 'yellow', dashed: true },
      { x1: 40, y1: 70, x2: 55, y2: 70, color: 'green', dashed: true },
    ]
  },
  59: { // Turn and Shoot
    type: 'field',
    players: [
      { x: 100, y: 70, color: 'blue' },
      { x: 140, y: 70, color: 'blue', label: 'Serve' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 132, y: 68 },
    arrows: [
      { x1: 130, y1: 68, x2: 108, y2: 68, color: 'green' },
      { x1: 92, y1: 72, x2: 30, y2: 72, color: 'red' },
    ],
    curves: [{ x1: 95, y1: 65, x2: 95, y2: 75, curve: 15, color: 'yellow', dashed: true }]
  },
  60: { // Edge of Box Finishing
    type: 'field',
    players: [
      { x: 45, y: 70, color: 'blue' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 45, y: 62 },
    arrows: [{ x1: 43, y1: 65, x2: 28, y2: 65, color: 'red' }],
    shapes: [{ type: 'rect', x: 5, y: 35, w: 35, h: 70, dashed: true }]
  },

  // Continue with more shooting drills...
  61: { // Shooting Reactions
    type: 'field',
    players: [
      { x: 100, y: 70, color: 'blue' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 100, y: 55 },
    arrows: [{ x1: 98, y1: 60, x2: 30, y2: 68, color: 'red' }],
    text: [{ x: 100, y: 100, content: 'React to rebound', size: 8 }]
  },
  62: { // Penalty Practice
    type: 'field',
    players: [
      { x: 46, y: 70, color: 'blue' },
      { x: 20, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 46, y: 62 },
    arrows: [{ x1: 44, y1: 65, x2: 25, y2: 52, color: 'red', dashed: true }],
    shapes: [{ type: 'rect', x: 5, y: 45, w: 3, h: 50 }]
  },

  // ===== DEFENDING (76-95) =====
  76: { // 1v1 Defending Basics
    type: 'small',
    players: [
      { x: 75, y: 60, color: 'red', label: 'DEF' },
      { x: 45, y: 60, color: 'blue', label: 'ATT' },
    ],
    ball: { x: 53, y: 58 },
    arrows: [{ x1: 70, y1: 60, x2: 58, y2: 60, color: 'yellow', dashed: true }],
    text: [{ x: 60, y: 95, content: 'Jockey position', size: 8 }]
  },
  77: { // Pressing Triggers
    type: 'field',
    players: [
      { x: 75, y: 50, color: 'red' },
      { x: 75, y: 90, color: 'red' },
      { x: 120, y: 70, color: 'blue' },
    ],
    ball: { x: 128, y: 68 },
    arrows: [
      { x1: 80, y1: 55, x2: 112, y2: 68, color: 'yellow', dashed: true },
      { x1: 80, y1: 85, x2: 112, y2: 72, color: 'yellow', dashed: true },
    ],
    text: [{ x: 100, y: 115, content: 'Press on bad touch', size: 8 }]
  },
  78: { // Defending Crosses
    type: 'field',
    players: [
      { x: 170, y: 35, color: 'blue', label: 'W' },
      { x: 140, y: 70, color: 'red', label: 'CB' },
      { x: 155, y: 55, color: 'red', label: 'FB' },
      { x: 25, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 168, y: 43 },
    arrows: [{ x1: 145, y1: 70, x2: 135, y2: 55, color: 'yellow', dashed: true }]
  },
  79: { // Recovery Runs
    type: 'field',
    players: [
      { x: 80, y: 70, color: 'red', label: 'DEF' },
      { x: 140, y: 50, color: 'blue', label: 'ATT' },
      { x: 25, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 148, y: 48 },
    curves: [{ x1: 75, y1: 72, x2: 35, y2: 65, curve: 20, color: 'yellow', dashed: true }],
    arrows: [{ x1: 145, y1: 52, x2: 35, y2: 68, color: 'red', dashed: true }]
  },
  80: { // Defensive Shape Back 4
    type: 'field',
    players: [
      { x: 50, y: 45, color: 'red', label: 'LB' },
      { x: 75, y: 55, color: 'red', label: 'CB' },
      { x: 125, y: 55, color: 'red', label: 'CB' },
      { x: 150, y: 45, color: 'red', label: 'RB' },
      { x: 25, y: 70, color: 'gk', label: 'GK' },
    ],
    lines: [{ x1: 45, y1: 52, x2: 155, y2: 52, color: 'yellow', dashed: true }],
    text: [{ x: 100, y: 75, content: 'Defensive line', size: 8 }]
  },

  // ===== GOALKEEPING (96-110) =====
  96: { // Basic Shot Stopping
    type: 'field',
    players: [
      { x: 25, y: 70, color: 'gk', label: 'GK' },
      { x: 80, y: 50, color: 'blue', label: '1' },
      { x: 80, y: 90, color: 'blue', label: '2' },
    ],
    ball: { x: 88, y: 50 },
    arrows: [
      { x1: 85, y1: 52, x2: 32, y2: 65, color: 'red' },
      { x1: 85, y1: 88, x2: 32, y2: 75, color: 'red', dashed: true },
    ]
  },
  97: { // Diving Technique
    type: 'field',
    players: [
      { x: 25, y: 70, color: 'gk', label: 'GK' },
      { x: 70, y: 50, color: 'blue' },
      { x: 70, y: 90, color: 'blue' },
    ],
    ball: { x: 78, y: 50 },
    arrows: [
      { x1: 75, y1: 52, x2: 28, y2: 52, color: 'red' },
      { x1: 75, y1: 88, x2: 28, y2: 88, color: 'red', dashed: true },
    ],
    curves: [
      { x1: 27, y1: 68, x2: 27, y2: 55, curve: -10, color: 'yellow', dashed: true },
      { x1: 27, y1: 72, x2: 27, y2: 85, curve: 10, color: 'yellow', dashed: true },
    ]
  },
  98: { // Distribution Feet
    type: 'field',
    players: [
      { x: 25, y: 70, color: 'gk', label: 'GK' },
      { x: 70, y: 40, color: 'blue', label: 'FB' },
      { x: 70, y: 100, color: 'blue', label: 'FB' },
      { x: 130, y: 70, color: 'blue', label: 'CM' },
    ],
    ball: { x: 33, y: 70 },
    arrows: [
      { x1: 35, y1: 68, x2: 62, y2: 45, color: 'green' },
      { x1: 35, y1: 72, x2: 62, y2: 95, color: 'green', dashed: true },
    ]
  },

  // ===== TACTICAL (111-125) =====
  111: { // Positional Play Rondo
    type: 'field',
    players: [
      { x: 25, y: 70, color: 'gk' },
      { x: 50, y: 45, color: 'blue' },
      { x: 50, y: 95, color: 'blue' },
      { x: 80, y: 55, color: 'blue' },
      { x: 80, y: 85, color: 'blue' },
      { x: 110, y: 70, color: 'blue' },
      { x: 140, y: 50, color: 'blue' },
      { x: 140, y: 90, color: 'blue' },
      { x: 95, y: 65, color: 'red' },
      { x: 95, y: 80, color: 'red' },
    ],
    ball: { x: 110, y: 62 }
  },
  112: { // Shadow Play
    type: 'field',
    players: [
      { x: 25, y: 70, color: 'gk' },
      { x: 55, y: 40, color: 'blue' },
      { x: 55, y: 100, color: 'blue' },
      { x: 55, y: 60, color: 'blue' },
      { x: 55, y: 80, color: 'blue' },
      { x: 100, y: 50, color: 'blue' },
      { x: 100, y: 70, color: 'blue' },
      { x: 100, y: 90, color: 'blue' },
      { x: 145, y: 55, color: 'blue' },
      { x: 160, y: 70, color: 'blue' },
      { x: 145, y: 85, color: 'blue' },
    ],
    ball: { x: 100, y: 62 },
    arrows: [{ x1: 105, y1: 68, x2: 138, y2: 58, color: 'green' }]
  },

  // ===== SET PIECES (126-135) =====
  126: { // Corner Kick Attacking
    type: 'field',
    players: [
      { x: 192, y: 8, color: 'blue', label: 'K' },
      { x: 155, y: 55, color: 'blue' },
      { x: 145, y: 70, color: 'blue' },
      { x: 155, y: 85, color: 'blue' },
      { x: 120, y: 70, color: 'blue', label: 'Edge' },
      { x: 175, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 192, y: 8 },
    curves: [{ x1: 190, y1: 12, x2: 155, y2: 60, curve: -35, color: 'white' }]
  },
  127: { // Free Kick Routines
    type: 'field',
    players: [
      { x: 100, y: 70, color: 'blue', label: '1' },
      { x: 90, y: 78, color: 'blue', label: '2' },
      { x: 130, y: 60, color: 'red' },
      { x: 130, y: 70, color: 'red' },
      { x: 130, y: 80, color: 'red' },
      { x: 175, y: 70, color: 'gk', label: 'GK' },
    ],
    ball: { x: 100, y: 62 },
    arrows: [{ x1: 105, y1: 65, x2: 165, y2: 55, color: 'white' }]
  },

  // ===== SMALL-SIDED GAMES (136-145) =====
  136: { // Classic 4v4
    type: 'field',
    players: [
      { x: 45, y: 45, color: 'blue' },
      { x: 45, y: 95, color: 'blue' },
      { x: 75, y: 60, color: 'blue' },
      { x: 75, y: 80, color: 'blue' },
      { x: 155, y: 45, color: 'red' },
      { x: 155, y: 95, color: 'red' },
      { x: 125, y: 60, color: 'red' },
      { x: 125, y: 80, color: 'red' },
    ],
    ball: { x: 100, y: 70 },
    shapes: [{ type: 'rect', x: 5, y: 60, w: 8, h: 20 }, { type: 'rect', x: 187, y: 60, w: 8, h: 20 }]
  },
  137: { // 3v3 Line Soccer
    type: 'field',
    players: [
      { x: 50, y: 50, color: 'blue' },
      { x: 50, y: 90, color: 'blue' },
      { x: 75, y: 70, color: 'blue' },
      { x: 150, y: 50, color: 'red' },
      { x: 150, y: 90, color: 'red' },
      { x: 125, y: 70, color: 'red' },
    ],
    ball: { x: 100, y: 70 },
    lines: [{ x1: 10, y1: 70, x2: 10, y2: 70 }, { x1: 190, y1: 70, x2: 190, y2: 70 }]
  },

  // ===== CONDITIONING (146-150) =====
  146: { // Interval Running with Ball
    type: 'field',
    cones: [{ x: 30, y: 70 }, { x: 170, y: 70 }],
    players: [{ x: 40, y: 70, color: 'blue' }],
    ball: { x: 48, y: 68 },
    arrows: [
      { x1: 50, y1: 68, x2: 160, y2: 68, color: 'yellow' },
      { x1: 160, y1: 72, x2: 50, y2: 72, color: 'green', dashed: true },
    ],
    text: [
      { x: 100, y: 55, content: 'Sprint with ball', size: 9 },
      { x: 100, y: 90, content: 'Jog back', size: 9 },
    ]
  },

  // ===== WARMUP (151-155) =====
  151: { // Dynamic Warmup
    type: 'field',
    players: [
      { x: 40, y: 35, color: 'blue' },
      { x: 70, y: 35, color: 'blue' },
      { x: 100, y: 35, color: 'blue' },
      { x: 130, y: 35, color: 'blue' },
      { x: 160, y: 35, color: 'blue' },
    ],
    cones: [{ x: 40, y: 100 }, { x: 70, y: 100 }, { x: 100, y: 100 }, { x: 130, y: 100 }, { x: 160, y: 100 }],
    arrows: [
      { x1: 40, y1: 45, x2: 40, y2: 90, color: 'green', dashed: true },
      { x1: 70, y1: 45, x2: 70, y2: 90, color: 'green', dashed: true },
      { x1: 100, y1: 45, x2: 100, y2: 90, color: 'green', dashed: true },
    ]
  },
  152: { // Rondo Warmup
    type: 'small',
    players: [
      { x: 60, y: 18, color: 'blue' },
      { x: 102, y: 60, color: 'blue' },
      { x: 60, y: 102, color: 'blue' },
      { x: 18, y: 60, color: 'blue' },
    ],
    ball: { x: 52, y: 22 },
    shapes: [{ type: 'circle', x: 60, y: 60, r: 42, dashed: true }]
  },
};

// ============================================
// VISUALIZATION RENDERER
// ============================================
const DrillVisualization = ({ drill }) => {
  const config = drillVisualConfigs[drill.id];
  
  // Default config if specific one doesn't exist
  const defaultConfig = {
    type: 'field',
    players: [{ x: 100, y: 70, color: 'blue' }],
    ball: { x: 108, y: 68 }
  };
  
  const cfg = config || defaultConfig;
  const isSmall = cfg.type === 'small';
  const viewBox = isSmall ? '0 0 120 120' : '0 0 200 140';
  const maxWidth = isSmall ? 260 : 320;

  const colors = {
    blue: '#3b82f6',
    red: '#ef4444',
    gk: '#22c55e',
    green: '#10b981',
    yellow: '#fbbf24',
    white: '#ffffff'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 16 }}>
      <svg viewBox={viewBox} style={{ width: '100%', maxWidth, background: '#1a472a', borderRadius: 8, border: '2px solid #2d5a3d' }}>
        {/* Field markings */}
        {isSmall ? (
          <rect x="10" y="10" width="100" height="100" fill="none" stroke="#3d7a4a" strokeWidth="2" strokeDasharray="5,5" />
        ) : (
          <>
            <rect x="5" y="5" width="190" height="130" fill="none" stroke="#3d7a4a" strokeWidth="2" />
            <line x1="100" y1="5" x2="100" y2="135" stroke="#3d7a4a" strokeWidth="1.5" />
            <circle cx="100" cy="70" r="20" fill="none" stroke="#3d7a4a" strokeWidth="1.5" />
            <rect x="5" y="35" width="30" height="70" fill="none" stroke="#3d7a4a" strokeWidth="1" />
            <rect x="165" y="35" width="30" height="70" fill="none" stroke="#3d7a4a" strokeWidth="1" />
            <rect x="5" y="50" width="3" height="40" fill="#fff" opacity="0.5" />
            <rect x="192" y="50" width="3" height="40" fill="#fff" opacity="0.5" />
          </>
        )}

        {/* Shapes */}
        {cfg.shapes?.map((s, i) => {
          if (s.type === 'rect') return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray={s.dashed ? "5,5" : "0"} opacity="0.4" />;
          if (s.type === 'circle') return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray={s.dashed ? "5,5" : "0"} opacity="0.4" />;
          return null;
        })}

        {/* Lines */}
        {cfg.lines?.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={colors[l.color] || '#fbbf24'} strokeWidth="1.5" strokeDasharray={l.dashed ? "4,4" : "0"} />
        ))}

        {/* Paths */}
        {cfg.paths?.map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke={colors[p.color] || '#fbbf24'} strokeWidth="2" strokeDasharray="5,4" />
        ))}

        {/* Cones */}
        {cfg.cones?.map((c, i) => (
          <polygon key={i} points={`${c.x},${c.y-7} ${c.x-6},${c.y+5} ${c.x+6},${c.y+5}`} fill="#f97316" stroke="#fff" strokeWidth="1" />
        ))}

        {/* Arrows */}
        {cfg.arrows?.map((a, i) => {
          const id = `arrow-${drill.id}-${i}`;
          const color = colors[a.color] || '#10b981';
          return (
            <g key={i}>
              <defs><marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={color} /></marker></defs>
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={color} strokeWidth="2" strokeDasharray={a.dashed ? "5,4" : "0"} markerEnd={`url(#${id})`} />
            </g>
          );
        })}

        {/* Curved arrows */}
        {cfg.curves?.map((c, i) => {
          const id = `curve-${drill.id}-${i}`;
          const color = colors[c.color] || '#10b981';
          const midX = (c.x1 + c.x2) / 2;
          const midY = (c.y1 + c.y2) / 2 + (c.curve || -20);
          return (
            <g key={i}>
              <defs><marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={color} /></marker></defs>
              <path d={`M ${c.x1} ${c.y1} Q ${midX} ${midY} ${c.x2} ${c.y2}`} fill="none" stroke={color} strokeWidth="2" strokeDasharray={c.dashed ? "5,4" : "0"} markerEnd={`url(#${id})`} />
            </g>
          );
        })}

        {/* Players */}
        {cfg.players?.map((p, i) => {
          const color = colors[p.color] || '#3b82f6';
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="12" fill={color} stroke="#fff" strokeWidth="2" />
              {p.label && <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">{p.label}</text>}
            </g>
          );
        })}

        {/* Ball */}
        {cfg.ball && <circle cx={cfg.ball.x} cy={cfg.ball.y} r="5" fill="#fff" stroke="#333" strokeWidth="1" />}

        {/* Text labels */}
        {cfg.text?.map((t, i) => (
          <text key={i} x={t.x} y={t.y} textAnchor="middle" fill="#fff" fontSize={t.size || 8} opacity="0.8">{t.content}</text>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></span> Players</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span> Defenders</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></span> GK</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '8px solid #f97316' }}></span> Cones</span>
      </div>
    </div>
  );
};

// ============================================
// MAIN DRILLS PAGE (Same as before)
// ============================================
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
      result = result.filter(d => d.name?.toLowerCase().includes(q) || d.focusAreas?.some(a => a.toLowerCase().includes(q)));
    }
    return result;
  }, [safeDrillsData, selectedCategory, selectedDifficulty, selectedAgeGroup, searchQuery]);

  const getCategoryInfo = (id) => drillCategories.find(c => c.id === id) || { name: id, icon: '⚽', color: '#6b7280' };
  const getDifficultyInfo = (d) => ({ beginner: { color: '#22c55e', label: 'Beginner' }, intermediate: { color: '#f59e0b', label: 'Intermediate' }, advanced: { color: '#ef4444', label: 'Advanced' } }[d] || { color: '#6b7280', label: d });
  const clearFilters = () => { setSelectedCategory('all'); setSelectedDifficulty('all'); setSelectedAgeGroup('all'); setSearchQuery(''); };
  const selectStyle = { padding: '10px 14px', background: '#1a1f1c', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, cursor: 'pointer', outline: 'none', minWidth: 150, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36 };

  const DrillDetails = ({ drill, cat }) => (
    <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
      <DrillVisualization drill={drill} />
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>🎒 Equipment</h4>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{drill.equipment?.join(', ') || 'None'}</p>
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
      {onAddToSession && <button onClick={(e) => { e.stopPropagation(); onAddToSession(drill); }} style={{ width: '100%', padding: '14px 20px', background: cat.color, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>+ Add to Training Session</button>}
    </div>
  );

  const DrillCard = ({ drill }) => {
    const isExpanded = expandedDrill === drill.id;
    const cat = getCategoryInfo(drill.category);
    const diff = getDifficultyInfo(drill.difficulty);

    if (viewMode === 'list') {
      return (
        <div onClick={() => setExpandedDrill(isExpanded ? null : drill.id)} style={{ background: isExpanded ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: 12, border: isExpanded ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', cursor: 'pointer', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{cat.icon}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#fff' }}>{drill.name}</h3>
              <div style={{ display: 'flex', gap: 16, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}><span>⏱️ {drill.duration} min</span><span>👥 {drill.players}</span><span style={{ color: cat.color }}>{cat.name}</span></div>
            </div>
            <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: diff.color, color: '#fff', fontWeight: 600 }}>{diff.label}</span>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</div>
          </div>
          {isExpanded && <DrillDetails drill={drill} cat={cat} />}
        </div>
      );
    }

    return (
      <div style={{ background: isExpanded ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)', borderRadius: 16, border: isExpanded ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div onClick={() => setExpandedDrill(isExpanded ? null : drill.id)} style={{ padding: 20, cursor: 'pointer', borderLeft: `4px solid ${cat.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}><span style={{ fontSize: 24 }}>{cat.icon}</span><h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{drill.name}</h3></div>
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: diff.color, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{diff.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}><span>⏱️ {drill.duration} min</span><span>👥 {drill.players}</span></div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>{drill.ageGroup?.map(age => <span key={age} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>{age.toUpperCase()}</span>)}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{drill.focusAreas?.slice(0, 3).map((a, i) => <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: `${cat.color}15`, color: cat.color }}>{a}</span>)}</div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{isExpanded ? '▲ Collapse' : '▼ View Details & Diagram'}</div>
        </div>
        {isExpanded && <DrillDetails drill={drill} cat={cat} />}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h2 style={{ margin: 0, fontSize: 28, color: '#fff', fontWeight: 700 }}>⚽ Drill Library</h2><p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>{filteredDrills.length} of {safeDrillsData.length} drills</p></div>
        {onBack && <button onClick={onBack} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>← Back</button>}
      </div>
      <input type="text" placeholder="Search drills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '14px 18px', marginBottom: 20, background: '#1a1f1c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', fontSize: 15, boxSizing: 'border-box', outline: 'none' }} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={selectStyle}><option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Categories</option>{drillCategories.map(c => <option key={c.id} value={c.id} style={{ background: '#1a1f1c', color: '#fff' }}>{c.name}</option>)}</select>
        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} style={selectStyle}><option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Difficulties</option>{difficultyLevels.map(d => <option key={d.id} value={d.id} style={{ background: '#1a1f1c', color: '#fff' }}>{d.name}</option>)}</select>
        <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)} style={selectStyle}><option value="all" style={{ background: '#1a1f1c', color: '#fff' }}>All Ages</option>{ageGroups.map(a => <option key={a.id} value={a.id} style={{ background: '#1a1f1c', color: '#fff' }}>{a.name}</option>)}</select>
        <div style={{ marginLeft: 'auto', display: 'flex' }}><button onClick={() => setViewMode('grid')} style={{ padding: '10px 18px', border: 'none', cursor: 'pointer', borderRadius: '10px 0 0 10px', fontSize: 14, fontWeight: 500, background: viewMode === 'grid' ? '#10b981' : '#1a1f1c', color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.6)' }}>▦ Grid</button><button onClick={() => setViewMode('list')} style={{ padding: '10px 18px', border: 'none', cursor: 'pointer', borderRadius: '0 10px 10px 0', fontSize: 14, fontWeight: 500, background: viewMode === 'list' ? '#10b981' : '#1a1f1c', color: viewMode === 'list' ? '#fff' : 'rgba(255,255,255,0.6)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>☰ List</button></div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <button onClick={() => setSelectedCategory('all')} style={{ padding: '10px 18px', background: selectedCategory === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 25, color: selectedCategory === 'all' ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>All ({safeDrillsData.length})</button>
        {drillCategories.slice(0, 6).map(c => { const count = safeDrillsData.filter(d => d.category === c.id).length; const isActive = selectedCategory === c.id; return <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{ padding: '10px 18px', background: isActive ? `${c.color}25` : 'rgba(255,255,255,0.05)', border: isActive ? `1px solid ${c.color}` : '1px solid transparent', borderRadius: 25, color: isActive ? c.color : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>{c.icon} {c.name} ({count})</button>; })}
      </div>
      {filteredDrills.length > 0 ? (<div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(380px, 1fr))' : '1fr', gap: 20, alignItems: 'start' }}>{filteredDrills.map(drill => <DrillCard key={drill.id} drill={drill} />)}</div>) : (<div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.4)' }}><div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div><p style={{ fontSize: 18, marginBottom: 24 }}>No drills found</p><button onClick={clearFilters} style={{ padding: '14px 28px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>Clear Filters</button></div>)}
    </div>
  );
};

export default DrillsPage;
