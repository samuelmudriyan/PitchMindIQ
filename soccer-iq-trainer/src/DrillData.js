// ============================================================================
// DRILL DATA - Comprehensive drill library with age ranges, difficulties
// ============================================================================

export const drillsData = [
  // PASSING DRILLS
  {
    id: 1,
    name: 'Rondo 4v1',
    category: 'Passing',
    type: 'possession',
    difficulty: 'Beginner',
    duration: '10 min',
    players: '5',
    minAge: 8,
    maxAge: 18,
    icon: '🎯',
    description: 'Basic possession drill focusing on quick passing and movement. Four players keep the ball from one defender in a small space.',
    setup: 'Create a 10x10 yard square. Four players on the outside, one defender in the middle.',
    instructions: [
      'Outside players must stay on their line',
      'Maximum 2 touches per player',
      'Defender who wins the ball swaps with passer',
      'Focus on body positioning and first touch'
    ],
    coachingPoints: ['Quick ball movement', 'Open body position', 'Communication', 'First touch away from pressure']
  },
  {
    id: 2,
    name: 'Rondo 5v2',
    category: 'Passing',
    type: 'possession',
    difficulty: 'Intermediate',
    duration: '15 min',
    players: '7',
    minAge: 10,
    maxAge: 18,
    icon: '🎯',
    description: 'Intermediate possession drill with two defenders. Requires more precise passing and better positioning.',
    setup: 'Create a 15x15 yard square. Five players on the outside, two defenders in the middle.',
    instructions: [
      'Outside players can move along their line',
      'Maximum 2 touches',
      'Split the defenders with passes for bonus points',
      'Defenders work together to press'
    ],
    coachingPoints: ['Splitting defenders', 'Third man runs', 'Pressure recognition', 'Weight of pass']
  },
  {
    id: 3,
    name: 'Y-Passing Pattern',
    category: 'Passing',
    type: 'passing',
    difficulty: 'Beginner',
    duration: '12 min',
    players: '4-8',
    minAge: 6,
    maxAge: 12,
    icon: '🎯',
    description: 'Simple passing pattern in a Y-shape to develop passing accuracy and movement off the ball.',
    setup: 'Set up cones in a Y-shape, approximately 10 yards between each station.',
    instructions: [
      'Pass and follow your ball',
      'Receive across your body',
      'Practice both feet',
      'Add a defender for progression'
    ],
    coachingPoints: ['Accurate passing', 'Movement after passing', 'Communication', 'Proper technique']
  },
  {
    id: 4,
    name: 'Wall Pass Combinations',
    category: 'Passing',
    type: 'passing',
    difficulty: 'Intermediate',
    duration: '15 min',
    players: '6-12',
    minAge: 10,
    maxAge: 18,
    icon: '🎯',
    description: 'Practice give-and-go combinations with a supporting player to beat a defender.',
    setup: 'Create channels with cones. Players work in pairs with passive defenders.',
    instructions: [
      'Player 1 passes to wall player',
      'Wall player lays it off first time',
      'Player 1 accelerates into space',
      'Progress to active defenders'
    ],
    coachingPoints: ['Timing of run', 'Weight of pass', 'First-time passing', 'Acceleration after pass']
  },
  {
    id: 5,
    name: 'Long Ball Accuracy',
    category: 'Passing',
    type: 'passing',
    difficulty: 'Advanced',
    duration: '20 min',
    players: '4-10',
    minAge: 13,
    maxAge: 18,
    icon: '🎯',
    description: 'Develop long-range passing accuracy for switching play and diagonal balls.',
    setup: 'Use full width of field. Target zones at various distances (30-50 yards).',
    instructions: [
      'Driven passes to near targets',
      'Lofted passes to far targets',
      'Practice with both feet',
      'Add movement and timing'
    ],
    coachingPoints: ['Technique for distance', 'Ball flight selection', 'Accuracy under pressure', 'Weight and trajectory']
  },

  // SHOOTING DRILLS
  {
    id: 6,
    name: 'Shooting Stations',
    category: 'Shooting',
    type: 'shooting',
    difficulty: 'Beginner',
    duration: '20 min',
    players: '8-16',
    minAge: 8,
    maxAge: 14,
    icon: '⚽',
    description: 'Multiple shooting stations around the box to practice finishing from different angles and distances.',
    setup: 'Set up 4-6 stations around the penalty area with ball feeders.',
    instructions: [
      'Rotate through each station',
      'Focus on technique before power',
      'Practice both feet',
      '3 shots per station before rotating'
    ],
    coachingPoints: ['Head down, over the ball', 'Non-kicking foot placement', 'Follow through', 'Pick your spot']
  },
  {
    id: 7,
    name: '1v1 to Goal',
    category: 'Shooting',
    type: 'finishing',
    difficulty: 'Intermediate',
    duration: '15 min',
    players: '6-12',
    minAge: 10,
    maxAge: 18,
    icon: '⚽',
    description: 'Attack the goal in 1v1 situations against a defender, developing composure in front of goal.',
    setup: 'Start from 25 yards out. Defender starts 5 yards behind attacker.',
    instructions: [
      'Attacker receives pass and attacks goal',
      'Defender recovers and tries to stop shot',
      'Attacker must shoot before the 18-yard line',
      'Switch roles after each turn'
    ],
    coachingPoints: ['First touch to create space', 'Decision making - shoot or dribble', 'Composure under pressure', 'Finishing technique']
  },
  {
    id: 8,
    name: 'Volleys and Half-Volleys',
    category: 'Shooting',
    type: 'shooting',
    difficulty: 'Advanced',
    duration: '15 min',
    players: '4-8',
    minAge: 12,
    maxAge: 18,
    icon: '⚽',
    description: 'Technical shooting drill focusing on volleys and half-volleys from crosses and cutbacks.',
    setup: 'Wide players deliver crosses, shooters attack the box.',
    instructions: [
      'Start with self-tossed volleys',
      'Progress to fed balls',
      'Then crosses from wide positions',
      'Both feet, various heights'
    ],
    coachingPoints: ['Body position', 'Timing of contact', 'Keep ball down', 'Attack the ball']
  },
  {
    id: 9,
    name: 'Quick Combination Finish',
    category: 'Shooting',
    type: 'finishing',
    difficulty: 'Advanced',
    duration: '20 min',
    players: '6-10',
    minAge: 13,
    maxAge: 18,
    icon: '⚽',
    description: 'Game-realistic shooting after quick combination play around the box.',
    setup: 'Set up passing patterns that end with a shot on goal.',
    instructions: [
      'Run through pattern at match pace',
      'Final pass sets up shot',
      'First-time finish when possible',
      'Add defenders for progression'
    ],
    coachingPoints: ['Timing of runs', 'Quality of final pass', 'First-time shooting', 'Finishing under fatigue']
  },

  // DRIBBLING DRILLS
  {
    id: 10,
    name: 'Cone Weaves',
    category: 'Dribbling',
    type: 'dribbling',
    difficulty: 'Beginner',
    duration: '10 min',
    players: '1-20',
    minAge: 6,
    maxAge: 12,
    icon: '🏃',
    description: 'Basic dribbling through cones to develop close ball control and both feet.',
    setup: 'Line of 8-10 cones, 2 yards apart.',
    instructions: [
      'Dribble through using inside of feet',
      'Then outside of feet only',
      'Alternate feet each cone',
      'Time each run for competition'
    ],
    coachingPoints: ['Small touches', 'Ball close to feet', 'Head up when possible', 'Use both feet']
  },
  {
    id: 11,
    name: '1v1 Attack and Defend',
    category: 'Dribbling',
    type: 'dribbling',
    difficulty: 'Intermediate',
    duration: '15 min',
    players: '8-16',
    minAge: 9,
    maxAge: 18,
    icon: '🏃',
    description: 'Classic 1v1 drill to develop dribbling skills against active defenders.',
    setup: 'Create 15x10 yard grids. Two small goals at each end.',
    instructions: [
      'Attacker tries to beat defender and score',
      'Defender wins by tackling or blocking',
      'Play to one goal, then switch',
      'Rotate partners every 2-3 rounds'
    ],
    coachingPoints: ['Change of pace', 'Body feints', 'Explosive acceleration', 'Protecting the ball']
  },
  {
    id: 12,
    name: 'Skill Moves Practice',
    category: 'Dribbling',
    type: 'dribbling',
    difficulty: 'Intermediate',
    duration: '20 min',
    players: '1-12',
    minAge: 10,
    maxAge: 16,
    icon: '🏃',
    description: 'Practice specific skill moves: stepovers, Cruyff turns, drag backs, and more.',
    setup: 'Open space with cones as imaginary defenders.',
    instructions: [
      'Demonstrate each move slowly',
      'Practice at walking pace',
      'Build up to match speed',
      'Combine moves together'
    ],
    coachingPoints: ['Sell the fake', 'Acceleration after move', 'Timing is everything', 'Practice both directions']
  },
  {
    id: 13,
    name: 'Dribble Gates',
    category: 'Dribbling',
    type: 'dribbling',
    difficulty: 'Beginner',
    duration: '12 min',
    players: '6-16',
    minAge: 6,
    maxAge: 10,
    icon: '🏃',
    description: 'Fun dribbling game where players score points by dribbling through gates.',
    setup: 'Scatter cone gates (2 cones 1 yard apart) around a 25x25 yard area.',
    instructions: [
      'Each player has a ball',
      'Dribble through as many gates as possible',
      'Cannot go through same gate twice in a row',
      'Count points in 60 seconds'
    ],
    coachingPoints: ['Head up to find gates', 'Close control', 'Quick decisions', 'Change of direction']
  },

  // DEFENDING DRILLS
  {
    id: 14,
    name: '1v1 Defensive Stance',
    category: 'Defending',
    type: 'defending',
    difficulty: 'Beginner',
    duration: '15 min',
    players: '6-12',
    minAge: 8,
    maxAge: 14,
    icon: '🛡️',
    description: 'Learn proper defensive body position and footwork for 1v1 situations.',
    setup: 'Pairs facing each other in 10x15 yard channels.',
    instructions: [
      'Defender starts in athletic stance',
      'Attacker tries to beat defender',
      'Focus on delay, not diving in',
      'Show attacker to weaker foot'
    ],
    coachingPoints: ['Low center of gravity', 'Side-on position', 'Patience', 'Watch the ball, not feet']
  },
  {
    id: 15,
    name: 'Pressing Triggers',
    category: 'Defending',
    type: 'tactical',
    difficulty: 'Intermediate',
    duration: '20 min',
    players: '10-16',
    minAge: 11,
    maxAge: 18,
    icon: '🛡️',
    description: 'Team pressing drill focusing on when and how to press collectively.',
    setup: 'Half-field setup with two teams. Attacking team builds from back.',
    instructions: [
      'Identify pressing triggers (bad touch, backwards pass)',
      'First defender presses ball',
      'Supporting players cut passing lanes',
      'Win ball and counter quickly'
    ],
    coachingPoints: ['Communication', 'Compactness', 'Timing of press', 'Cutting passing lanes']
  },
  {
    id: 16,
    name: 'Defensive Shape 4v4',
    category: 'Defending',
    type: 'tactical',
    difficulty: 'Intermediate',
    duration: '20 min',
    players: '8-12',
    minAge: 10,
    maxAge: 18,
    icon: '🛡️',
    description: 'Maintain defensive shape as a unit while the ball moves.',
    setup: '4 defenders vs 4 attackers in half field.',
    instructions: [
      'Attackers move the ball to create space',
      'Defenders shift as a unit',
      'Maintain distances between players',
      'No diving in, stay connected'
    ],
    coachingPoints: ['Shift together', 'Communication', 'Depth and cover', 'When to step and when to drop']
  },
  {
    id: 17,
    name: 'Recovery Runs',
    category: 'Defending',
    type: 'defending',
    difficulty: 'Advanced',
    duration: '15 min',
    players: '6-10',
    minAge: 12,
    maxAge: 18,
    icon: '🛡️',
    description: 'Practice recovering goal-side when beaten or during transitions.',
    setup: 'Start from various positions where defender is wrong-side.',
    instructions: [
      'Attacker plays through ball',
      'Defender must recover goal-side',
      'Track the runner, then the ball',
      'Make recovery run at correct angle'
    ],
    coachingPoints: ['Sprint recovery', 'Angle of run', 'Decision - ball or runner', 'Body position on arrival']
  },

  // TACTICAL DRILLS
  {
    id: 18,
    name: 'Positional Play 6v4',
    category: 'Tactical',
    type: 'tactical',
    difficulty: 'Advanced',
    duration: '25 min',
    players: '10-14',
    minAge: 13,
    maxAge: 18,
    icon: '📋',
    description: 'Positional possession game focusing on creating and exploiting superiorities.',
    setup: 'Half field divided into zones. 6 attackers maintain possession against 4 defenders.',
    instructions: [
      'Create numerical superiority in zones',
      'Progress ball through zones',
      'Find free player to switch play',
      'Play out of pressure'
    ],
    coachingPoints: ['Find the free man', 'Body orientation', 'Third man combinations', 'Playing out of pressure']
  },
  {
    id: 19,
    name: 'Transition Game',
    category: 'Tactical',
    type: 'tactical',
    difficulty: 'Intermediate',
    duration: '25 min',
    players: '12-18',
    minAge: 11,
    maxAge: 18,
    icon: '📋',
    description: 'Quick transitions between attack and defense when possession changes.',
    setup: 'Full or half field with goals. Teams of 5-6 players.',
    instructions: [
      'On turnover, attack immediately',
      'Defending team must recover shape',
      'Play for 3 seconds max before transition',
      'Count goals scored in transition'
    ],
    coachingPoints: ['Quick reactions to turnover', 'Forward passes', 'Recovery runs', 'Counter-pressing']
  },
  {
    id: 20,
    name: 'Building Out from Back',
    category: 'Tactical',
    type: 'tactical',
    difficulty: 'Intermediate',
    duration: '25 min',
    players: '10-14',
    minAge: 10,
    maxAge: 18,
    icon: '📋',
    description: 'Practice playing out from the goalkeeper under various pressing scenarios.',
    setup: 'GK + back 4 + midfielders vs pressing team.',
    instructions: [
      'Start with goal kick',
      'Build through thirds',
      'Pressing team adjusts intensity',
      'Find progression through or over press'
    ],
    coachingPoints: ['Positioning to receive', 'Passing options', 'When to go long', 'Goalkeeper involvement']
  },

  // POSSESSION DRILLS
  {
    id: 21,
    name: 'Keep Ball 6v6',
    category: 'Possession',
    type: 'possession',
    difficulty: 'Intermediate',
    duration: '20 min',
    players: '12-14',
    minAge: 10,
    maxAge: 18,
    icon: '🔄',
    description: 'Standard possession game with focus on keeping the ball under pressure.',
    setup: 'Create a 40x30 yard area. 6v6 with neutral wide players optional.',
    instructions: [
      'Complete X passes to score a point',
      'Must maintain possession for points',
      'Add constraints (2-touch, 1-touch)',
      'Wide neutrals create superiority'
    ],
    coachingPoints: ['Supporting angles', 'Speed of play', 'Body shape to receive', 'Playing into pressure']
  },
  {
    id: 22,
    name: 'End Zone Possession',
    category: 'Possession',
    type: 'possession',
    difficulty: 'Intermediate',
    duration: '20 min',
    players: '10-16',
    minAge: 11,
    maxAge: 18,
    icon: '🔄',
    description: 'Possession with a purpose - work the ball into end zones to score.',
    setup: '40x50 yard area with 10-yard end zones.',
    instructions: [
      'Score by stopping ball in end zone',
      'Cannot dribble into end zone',
      'Must receive pass in end zone',
      'Encourages forward passing'
    ],
    coachingPoints: ['Penetrative passing', 'Forward runs', 'Switching play', 'Patience vs directness']
  },

  // FITNESS DRILLS
  {
    id: 23,
    name: 'Ball Carrying Sprints',
    category: 'Fitness',
    type: 'fitness',
    difficulty: 'Intermediate',
    duration: '15 min',
    players: '4-20',
    minAge: 10,
    maxAge: 18,
    icon: '💪',
    description: 'Speed and conditioning with the ball at feet.',
    setup: 'Cones at 10, 20, 30, 40 yard marks.',
    instructions: [
      'Sprint with ball to first cone and back',
      'Then to second cone and back',
      'Continue pattern',
      '3-4 sets with 90 sec rest'
    ],
    coachingPoints: ['Ball control at speed', 'Quick turns', 'Pacing yourself', 'Maintaining technique when tired']
  },
  {
    id: 24,
    name: 'High Intensity Interval Game',
    category: 'Fitness',
    type: 'fitness',
    difficulty: 'Advanced',
    duration: '20 min',
    players: '8-16',
    minAge: 13,
    maxAge: 18,
    icon: '💪',
    description: 'Small-sided game with work/rest intervals for match fitness.',
    setup: 'Small 3v3 or 4v4 game area with goals.',
    instructions: [
      'Play 90 seconds high intensity',
      '60 seconds rest',
      '6-8 rounds total',
      'Full effort during work periods'
    ],
    coachingPoints: ['Maximum effort', 'Quick transitions', 'Smart recovery use', 'Maintaining quality when fatigued']
  },

  // WARM-UP DRILLS
  {
    id: 25,
    name: 'Dynamic Warm-Up',
    category: 'Warm-up',
    type: 'warmup',
    difficulty: 'Beginner',
    duration: '10 min',
    players: '1-30',
    minAge: 6,
    maxAge: 18,
    icon: '🔥',
    description: 'Standard dynamic warm-up routine to prepare for training or matches.',
    setup: 'Use width of field. Players line up on one side.',
    instructions: [
      'Jogging with arm circles',
      'High knees, butt kicks',
      'Lateral shuffles',
      'Dynamic stretches',
      'Build-up runs'
    ],
    coachingPoints: ['Proper form', 'Gradually increase intensity', 'Full range of motion', 'Stay focused']
  },
  {
    id: 26,
    name: 'Passing Warm-Up',
    category: 'Warm-up',
    type: 'warmup',
    difficulty: 'Beginner',
    duration: '8 min',
    players: '2-24',
    minAge: 6,
    maxAge: 18,
    icon: '🔥',
    description: 'Get touches on the ball while warming up with a partner.',
    setup: 'Pairs with one ball, 10 yards apart.',
    instructions: [
      'Inside foot passes',
      'Outside foot passes',
      'One-touch passing',
      'Movement after passing',
      'Gradually increase distance'
    ],
    coachingPoints: ['Proper technique', 'Both feet', 'Eye contact', 'Quality over speed initially']
  },
  {
    id: 27,
    name: 'Rondo Warm-Up 3v1',
    category: 'Warm-up',
    type: 'warmup',
    difficulty: 'Beginner',
    duration: '10 min',
    players: '4-16',
    minAge: 8,
    maxAge: 18,
    icon: '🔥',
    description: 'Light rondo to get sharp and warm up for the session.',
    setup: 'Small squares, 3 outside players, 1 defender.',
    instructions: [
      'Keep possession with quick passes',
      'Unlimited touches to start',
      'Progress to 2-touch',
      'Defender in for 30 seconds max'
    ],
    coachingPoints: ['Getting warm, not winning', 'Smooth movements', 'Communication', 'Light competition']
  },

  // FINISHING DRILLS  
  {
    id: 28,
    name: 'Crossing and Finishing',
    category: 'Finishing',
    type: 'finishing',
    difficulty: 'Intermediate',
    duration: '20 min',
    players: '8-14',
    minAge: 11,
    maxAge: 18,
    icon: '🥅',
    description: 'Practice attacking crosses from wide areas with proper finishing technique.',
    setup: 'Wide players with balls, 2-3 strikers attack the box.',
    instructions: [
      'Wide player delivers cross',
      'Attackers time their runs',
      'Variety of cross types',
      'Rotate positions'
    ],
    coachingPoints: ['Timing of run', 'Type of finish', 'Near post and far post runs', 'Cutback options']
  },
  {
    id: 29,
    name: 'Breakaway Finishing',
    category: 'Finishing',
    type: 'finishing',
    difficulty: 'Intermediate',
    duration: '15 min',
    players: '6-10',
    minAge: 10,
    maxAge: 18,
    icon: '🥅',
    description: 'Practice finishing 1v1 against the goalkeeper in breakaway situations.',
    setup: 'Balls at halfway line. GK in goal.',
    instructions: [
      'Attacker receives through ball',
      'Take on goalkeeper',
      'Practice different finishes',
      'Add recovering defender for progression'
    ],
    coachingPoints: ['First touch out of feet', 'Composure', 'Read goalkeeper position', 'Picking your spot']
  },
  {
    id: 30,
    name: 'Quick Feet Finishing',
    category: 'Finishing',
    type: 'finishing',
    difficulty: 'Advanced',
    duration: '15 min',
    players: '4-10',
    minAge: 12,
    maxAge: 18,
    icon: '🥅',
    description: 'React quickly to loose balls in the box and finish with minimal touches.',
    setup: 'Coach feeds balls randomly into the box area.',
    instructions: [
      'Ball played into area',
      'First player to react, shoots',
      'One or two touch maximum',
      'Practice with pressure'
    ],
    coachingPoints: ['Anticipation', 'First to the ball', 'Quick release', 'Any surface finish']
  }
];

export default drillsData;
