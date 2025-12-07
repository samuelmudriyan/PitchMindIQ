const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Environment variables
const MODAL_ENDPOINT = process.env.MODAL_ENDPOINT || 'https://pitchmind--pitchmind-gpu-tracker-v6-fastapi-app.modal.run';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// TeamSnap Config
const TEAMSNAP_CLIENT_ID = process.env.TEAMSNAP_CLIENT_ID;
const TEAMSNAP_CLIENT_SECRET = process.env.TEAMSNAP_CLIENT_SECRET;
const TEAMSNAP_REDIRECT_URI = process.env.TEAMSNAP_REDIRECT_URI || 'https://pitchmind-backend-production-483d.up.railway.app/api/teamsnap/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const TEAMSNAP_API = 'https://api.teamsnap.com/v3';
const TEAMSNAP_AUTH = 'https://auth.teamsnap.com/oauth/authorize';
const TEAMSNAP_TOKEN = 'https://auth.teamsnap.com/oauth/token';

// ============================================
// DATABASE SETUP
// ============================================
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      -- Users table (extends Clerk auth)
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(255),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(100),
        organization VARCHAR(255),
        role VARCHAR(100) DEFAULT 'coach',
        profile_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Teams table
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        division_name VARCHAR(255),
        season_name VARCHAR(255),
        jersey_color VARCHAR(50) DEFAULT '#10b981',
        teamsnap_id VARCHAR(255),
        source VARCHAR(50) DEFAULT 'manual',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Players table
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(100) DEFAULT 'Midfielder',
        age INTEGER,
        jersey_number INTEGER,
        jersey_color VARCHAR(50) DEFAULT '#10b981',
        rating INTEGER DEFAULT 70,
        trend VARCHAR(20) DEFAULT 'same',
        teamsnap_id VARCHAR(255),
        imported_from VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, teamsnap_id)
      );

      -- Videos table
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
        filename VARCHAR(255),
        original_name VARCHAR(255),
        duration FLOAT,
        width INTEGER,
        height INTEGER,
        fps FLOAT,
        analyzed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Analyses table (decision points per video)
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
        player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        video_name VARCHAR(255),
        decision_count INTEGER DEFAULT 0,
        avg_rating FLOAT,
        summary TEXT,
        decision_points JSONB,
        processing_info JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Sessions table (training sessions)
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        date DATE,
        time TIME,
        duration INTEGER,
        focus VARCHAR(255),
        notes TEXT,
        drills JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Chat history table
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
      CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
      CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
      CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
      CREATE INDEX IF NOT EXISTS idx_analyses_player_id ON analyses(player_id);
      CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
    `);
    
    // Add unique constraint for teamsnap imports (safe migration)
    try {
      await client.query(`
        ALTER TABLE players 
        ADD CONSTRAINT players_user_teamsnap_unique 
        UNIQUE (user_id, teamsnap_id);
      `);
      console.log('✅ Added unique constraint for TeamSnap imports');
    } catch (err) {
      // Constraint already exists or other issue - ignore
      if (!err.message.includes('already exists')) {
        console.log('Note: Could not add unique constraint:', err.message);
      }
    }
    
    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('Database init error:', err);
  } finally {
    client.release();
  }
}

// Initialize DB on startup
initDatabase();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper: Get or create user from Clerk ID
async function getOrCreateUser(clerkId, userData = {}) {
  const client = await pool.connect();
  try {
    // Try to find existing user
    let result = await client.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
    
    if (result.rows.length === 0) {
      // Create new user
      result = await client.query(
        `INSERT INTO users (clerk_id, email, first_name, last_name) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [clerkId, userData.email || '', userData.firstName || '', userData.lastName || '']
      );
    }
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Middleware: Extract user from Authorization header
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }
  
  const clerkId = authHeader.split(' ')[1];
  
  try {
    const user = await getOrCreateUser(clerkId, req.body.userData || {});
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// File upload config
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 2000 * 1024 * 1024 } }); // 2GB limit

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'PitchMind Backend Running',
    version: '3.0',
    features: ['video-analysis', 'ai-coach', 'teamsnap-integration', 'database'],
    database: DATABASE_URL ? 'connected' : 'not configured',
    teamsnap: TEAMSNAP_CLIENT_ID ? 'configured' : 'not configured'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

// Get user profile
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  res.json(req.user);
});

// Update user profile
app.put('/api/user/profile', authMiddleware, async (req, res) => {
  const { email, firstName, lastName, phone, address, city, state, zipCode, country, organization, role, profileImageUrl } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE users SET 
        email = COALESCE($1, email),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        phone = COALESCE($4, phone),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        zip_code = COALESCE($8, zip_code),
        country = COALESCE($9, country),
        organization = COALESCE($10, organization),
        role = COALESCE($11, role),
        profile_image_url = COALESCE($12, profile_image_url),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [email, firstName, lastName, phone, address, city, state, zipCode, country, organization, role, profileImageUrl, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ============================================
// TEAMS ENDPOINTS
// ============================================

// Get all teams for user
app.get('/api/teams', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM teams WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get teams error:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Create team
app.post('/api/teams', authMiddleware, async (req, res) => {
  const { name, divisionName, seasonName, jerseyColor, teamsnapId, source } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO teams (user_id, name, division_name, season_name, jersey_color, teamsnap_id, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, name, divisionName, seasonName, jerseyColor || '#10b981', teamsnapId, source || 'manual']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create team error:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team
app.put('/api/teams/:id', authMiddleware, async (req, res) => {
  const { name, divisionName, seasonName, jerseyColor } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE teams SET 
        name = COALESCE($1, name),
        division_name = COALESCE($2, division_name),
        season_name = COALESCE($3, season_name),
        jersey_color = COALESCE($4, jersey_color),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, divisionName, seasonName, jerseyColor, req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update team error:', err);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
app.delete('/api/teams/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM teams WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete team error:', err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// ============================================
// PLAYERS ENDPOINTS
// ============================================

// Get all players for user
app.get('/api/players', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, t.name as team_name 
       FROM players p 
       LEFT JOIN teams t ON p.team_id = t.id 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    
    // Get analyses count for each player
    for (let player of result.rows) {
      const analysesResult = await pool.query(
        'SELECT COUNT(*) as count, AVG(avg_rating) as avg_rating FROM analyses WHERE player_id = $1',
        [player.id]
      );
      player.analyses_count = parseInt(analysesResult.rows[0].count) || 0;
      player.overall_rating = analysesResult.rows[0].avg_rating ? Math.round(analysesResult.rows[0].avg_rating * 20) : player.rating;
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error('Get players error:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Get single player with analyses
app.get('/api/players/:id', authMiddleware, async (req, res) => {
  try {
    const playerResult = await pool.query(
      `SELECT p.*, t.name as team_name 
       FROM players p 
       LEFT JOIN teams t ON p.team_id = t.id 
       WHERE p.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const player = playerResult.rows[0];
    
    // Get analyses for this player
    const analysesResult = await pool.query(
      'SELECT * FROM analyses WHERE player_id = $1 ORDER BY created_at DESC',
      [player.id]
    );
    
    player.analyses = analysesResult.rows;
    res.json(player);
  } catch (err) {
    console.error('Get player error:', err);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// Create player
app.post('/api/players', authMiddleware, async (req, res) => {
  const { name, position, age, jerseyNumber, jerseyColor, teamId, teamsnapId, importedFrom } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO players (user_id, team_id, name, position, age, jersey_number, jersey_color, teamsnap_id, imported_from)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, teamId, name, position || 'Midfielder', age, jerseyNumber, jerseyColor || '#10b981', teamsnapId, importedFrom]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create player error:', err);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// Bulk create players (for TeamSnap import)
app.post('/api/players/bulk', authMiddleware, async (req, res) => {
  const { players, teamId } = req.body;
  
  if (!players || !Array.isArray(players)) {
    return res.status(400).json({ error: 'Players array required' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const createdPlayers = [];
    for (const p of players) {
      // Skip if teamsnap_id already exists for this user
      if (p.teamsnapId) {
        const existing = await client.query(
          'SELECT id FROM players WHERE user_id = $1 AND teamsnap_id = $2',
          [req.user.id, p.teamsnapId]
        );
        if (existing.rows.length > 0) {
          console.log(`Skipping duplicate player with teamsnapId: ${p.teamsnapId}`);
          continue;
        }
      }
      
      const result = await client.query(
        `INSERT INTO players (user_id, team_id, name, position, age, jersey_number, jersey_color, teamsnap_id, imported_from)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [req.user.id, teamId || p.teamId, p.name, p.position || 'Midfielder', p.age, p.jerseyNumber, p.jerseyColor || '#10b981', p.teamsnapId, p.importedFrom || 'teamsnap']
      );
      if (result.rows.length > 0) {
        createdPlayers.push(result.rows[0]);
      }
    }
    
    await client.query('COMMIT');
    res.json({ success: true, count: createdPlayers.length, players: createdPlayers });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Bulk create players error:', err);
    res.status(500).json({ error: 'Failed to create players' });
  } finally {
    client.release();
  }
});

// Update player
app.put('/api/players/:id', authMiddleware, async (req, res) => {
  const { name, position, age, jerseyNumber, jerseyColor, teamId, rating, trend } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE players SET 
        name = COALESCE($1, name),
        position = COALESCE($2, position),
        age = COALESCE($3, age),
        jersey_number = COALESCE($4, jersey_number),
        jersey_color = COALESCE($5, jersey_color),
        team_id = COALESCE($6, team_id),
        rating = COALESCE($7, rating),
        trend = COALESCE($8, trend),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [name, position, age, jerseyNumber, jerseyColor, teamId, rating, trend, req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update player error:', err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Delete player
app.delete('/api/players/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM players WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete player error:', err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

// ============================================
// ANALYSES ENDPOINTS
// ============================================

// Get analyses for user
app.get('/api/analyses', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.name as player_name, p.jersey_number, p.jersey_color
       FROM analyses a
       LEFT JOIN players p ON a.player_id = p.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get analyses error:', err);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// Save analysis
app.post('/api/analyses', authMiddleware, async (req, res) => {
  const { playerId, videoId, videoName, decisionCount, avgRating, summary, decisionPoints, processingInfo } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO analyses (user_id, player_id, video_id, video_name, decision_count, avg_rating, summary, decision_points, processing_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, playerId, videoId, videoName, decisionCount, avgRating, summary, JSON.stringify(decisionPoints), JSON.stringify(processingInfo)]
    );
    
    // Update player rating based on recent analyses
    if (playerId) {
      const recentAnalyses = await pool.query(
        'SELECT avg_rating FROM analyses WHERE player_id = $1 ORDER BY created_at DESC LIMIT 5',
        [playerId]
      );
      
      if (recentAnalyses.rows.length > 0) {
        const avgAllRatings = recentAnalyses.rows.reduce((a, b) => a + (b.avg_rating || 0), 0) / recentAnalyses.rows.length;
        const newRating = Math.min(100, Math.max(40, Math.round(avgAllRatings * 20)));
        
        await pool.query(
          'UPDATE players SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newRating, playerId]
        );
      }
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Save analysis error:', err);
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

// ============================================
// SESSIONS ENDPOINTS
// ============================================

// Get sessions
app.get('/api/sessions', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE user_id = $1 ORDER BY date DESC, time DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Create session
app.post('/api/sessions', authMiddleware, async (req, res) => {
  const { title, date, time, duration, focus, notes, drills } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO sessions (user_id, title, date, time, duration, focus, notes, drills)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, title, date, time, duration, focus, notes, JSON.stringify(drills || [])]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session
app.put('/api/sessions/:id', authMiddleware, async (req, res) => {
  const { title, date, time, duration, focus, notes, drills } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE sessions SET 
        title = COALESCE($1, title),
        date = COALESCE($2, date),
        time = COALESCE($3, time),
        duration = COALESCE($4, duration),
        focus = COALESCE($5, focus),
        notes = COALESCE($6, notes),
        drills = COALESCE($7, drills),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [title, date, time, duration, focus, notes, drills ? JSON.stringify(drills) : null, req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
app.delete('/api/sessions/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM sessions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete session error:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// ============================================
// CHAT HISTORY ENDPOINTS
// ============================================

// Get chat history
app.get('/api/chat-history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM chat_history WHERE user_id = $1 ORDER BY created_at ASC LIMIT 100',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get chat history error:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Save chat message
app.post('/api/chat-history', authMiddleware, async (req, res) => {
  const { role, content } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO chat_history (user_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, role, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Save chat error:', err);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

// Clear chat history
app.delete('/api/chat-history', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM chat_history WHERE user_id = $1', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Clear chat error:', err);
    res.status(500).json({ error: 'Failed to clear chat' });
  }
});

// ============================================
// SYNC ENDPOINT (for initial data load)
// ============================================

// Get all user data at once
app.get('/api/sync', authMiddleware, async (req, res) => {
  try {
    const [teams, players, analyses, sessions, chatHistory] = await Promise.all([
      pool.query('SELECT * FROM teams WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]),
      pool.query(`
        SELECT p.*, t.name as team_name 
        FROM players p 
        LEFT JOIN teams t ON p.team_id = t.id 
        WHERE p.user_id = $1 
        ORDER BY p.created_at DESC
      `, [req.user.id]),
      pool.query(`
        SELECT a.*, p.name as player_name, p.jersey_number, p.jersey_color
        FROM analyses a
        LEFT JOIN players p ON a.player_id = p.id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
      `, [req.user.id]),
      pool.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY date DESC', [req.user.id]),
      pool.query('SELECT * FROM chat_history WHERE user_id = $1 ORDER BY created_at ASC LIMIT 100', [req.user.id])
    ]);
    
    res.json({
      user: req.user,
      teams: teams.rows,
      players: players.rows,
      analyses: analyses.rows,
      sessions: sessions.rows,
      chatHistory: chatHistory.rows
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

// ============================================
// VIDEO ANALYSIS ENDPOINT
// ============================================
app.post('/api/analyze', upload.single('video'), async (req, res) => {
  console.log('Analysis request received');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  const { clickX, clickY, clickTimestamp, playerName, jerseyNumber } = req.body;
  console.log(`Processing: ${req.file.filename}, Click: (${clickX}, ${clickY}) at ${clickTimestamp}s`);
  if (playerName) console.log(`Tracking player: ${playerName} #${jerseyNumber || '?'}`);

  try {
    const formData = new FormData();
    formData.append('video', fs.createReadStream(req.file.path), {
      filename: req.file.originalname || 'video.mp4',
      contentType: req.file.mimetype || 'video/mp4'
    });
    formData.append('click_x', String(clickX || '0'));
    formData.append('click_y', String(clickY || '0'));
    formData.append('click_timestamp', String(clickTimestamp || '0'));

    // Use form-data's submit method for proper multipart handling
    const submitPromise = new Promise((resolve, reject) => {
      formData.submit(MODAL_ENDPOINT, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        
        let data = '';
        response.on('data', chunk => { data += chunk; });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            body: data
          });
        });
        response.on('error', reject);
      });
    });

    const modalResponse = await submitPromise;

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete temp file:', err);
    });

    if (modalResponse.statusCode !== 200) {
      console.error('Modal error:', modalResponse.body);
      return res.status(500).json({ error: 'Analysis failed', details: modalResponse.body });
    }

    const results = JSON.parse(modalResponse.body);
    console.log('Analysis complete:', results.decision_points?.length || 0, 'decision points');
    
    res.json(results);

  } catch (error) {
    console.error('Analysis error:', error);
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

// ============================================
// AI COACH ENDPOINT (Groq)
// ============================================
app.post('/api/coach', async (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'AI Coach not configured' });
  }

  try {
    const systemPrompt = `You are an expert soccer/football coach AI assistant for PitchMind, a player development platform. 

You help coaches with:
- Tactical advice and formations
- Training drills and session planning
- Player development strategies
- Game analysis insights
- Decision-making improvement techniques

${context?.playerCount ? `The coach has ${context.playerCount} players on their roster.` : ''}
${context?.players?.length ? `Players: ${context.players.map(p => `${p.name} (${p.position}, Rating: ${p.rating}, #${p.jerseyNumber || '?'})`).join(', ')}` : ''}

Be concise, practical, and actionable. Use soccer terminology appropriately. If asked about specific drills, provide clear step-by-step instructions.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return res.status(500).json({ error: 'AI Coach unavailable' });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';

    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Coach error:', error);
    res.status(500).json({ error: 'AI Coach error', message: error.message });
  }
});

// ============================================
// TEAMSNAP INTEGRATION
// ============================================

// Route 1: Get OAuth URL
app.get('/api/teamsnap/auth', (req, res) => {
  if (!TEAMSNAP_CLIENT_ID) {
    return res.status(500).json({ 
      error: 'TeamSnap not configured',
      message: 'Add TEAMSNAP_CLIENT_ID and TEAMSNAP_CLIENT_SECRET to environment variables'
    });
  }
  
  const authUrl = `${TEAMSNAP_AUTH}?` + new URLSearchParams({
    client_id: TEAMSNAP_CLIENT_ID,
    redirect_uri: TEAMSNAP_REDIRECT_URI,
    response_type: 'code',
    scope: 'read'
  }).toString();
  
  console.log('TeamSnap auth URL generated');
  res.json({ authUrl });
});

// Route 2: OAuth Callback
app.get('/api/teamsnap/callback', async (req, res) => {
  const { code, error } = req.query;
  
  console.log('TeamSnap callback received');
  
  if (error) {
    console.error('TeamSnap auth error:', error);
    return res.redirect(`${FRONTEND_URL}?teamsnap_error=${encodeURIComponent(error)}`);
  }
  
  if (!code) {
    return res.redirect(`${FRONTEND_URL}?teamsnap_error=no_code`);
  }
  
  try {
    const tokenResponse = await fetch(TEAMSNAP_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TEAMSNAP_CLIENT_ID,
        client_secret: TEAMSNAP_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TEAMSNAP_REDIRECT_URI
      }).toString()
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('TeamSnap token error:', errorText);
      return res.redirect(`${FRONTEND_URL}?teamsnap_error=token_failed`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('TeamSnap token obtained successfully');
    
    // Redirect back to frontend with token
    res.redirect(`${FRONTEND_URL}?teamsnap_token=${encodeURIComponent(tokenData.access_token)}`);
    
  } catch (err) {
    console.error('TeamSnap callback error:', err);
    res.redirect(`${FRONTEND_URL}?teamsnap_error=server_error`);
  }
});

// Route 3: Get User's Teams
app.get('/api/teamsnap/teams', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Get current user
    const meResponse = await fetch(`${TEAMSNAP_API}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!meResponse.ok) {
      console.error('TeamSnap /me failed:', meResponse.status);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const meData = await meResponse.json();
    
    // Extract teams link from Collection+JSON
    const userLinks = meData.collection?.items?.[0]?.links || [];
    const teamsLink = userLinks.find(l => l.rel === 'teams');
    
    if (!teamsLink) {
      console.log('No teams found for user');
      return res.json({ teams: [] });
    }
    
    // Fetch teams
    const teamsResponse = await fetch(teamsLink.href, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!teamsResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch teams' });
    }
    
    const teamsData = await teamsResponse.json();
    
    // Parse Collection+JSON format
    const teams = (teamsData.collection?.items || []).map(item => {
      const data = {};
      (item.data || []).forEach(d => {
        data[d.name] = d.value;
      });
      
      const href = item.href || '';
      const idMatch = href.match(/\/teams\/(\d+)/);
      
      return {
        id: idMatch ? idMatch[1] : data.id,
        name: data.name || 'Unknown Team',
        sport: data.sport_id,
        seasonName: data.season_name,
        divisionName: data.division_name,
        leagueName: data.league_name
      };
    });
    
    console.log(`Found ${teams.length} teams`);
    res.json({ teams });
    
  } catch (err) {
    console.error('TeamSnap teams error:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Route 4: Get Team Roster
app.get('/api/teamsnap/roster/:teamId', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { teamId } = req.params;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const membersResponse = await fetch(`${TEAMSNAP_API}/members/search?team_id=${teamId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!membersResponse.ok) {
      console.error('Members fetch failed:', membersResponse.status);
      return res.status(500).json({ error: 'Failed to fetch roster' });
    }
    
    const membersData = await membersResponse.json();
    
    // Parse Collection+JSON
    const players = (membersData.collection?.items || [])
      .map(item => {
        const data = {};
        (item.data || []).forEach(d => {
          data[d.name] = d.value;
        });
        
        // Skip non-players
        if (data.is_non_player === true) return null;
        
        return {
          id: data.id,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          jerseyNumber: data.jersey_number ? parseInt(data.jersey_number) : null,
          position: data.position || null,
          isNonPlayer: data.is_non_player || false,
          birthday: data.birthday
        };
      })
      .filter(p => p !== null);
    
    console.log(`Found ${players.length} players in team ${teamId}`);
    res.json({ teamId, players, count: players.length });
    
  } catch (err) {
    console.error('TeamSnap roster error:', err);
    res.status(500).json({ error: 'Failed to fetch roster' });
  }
});

// Route 5: Check TeamSnap status
app.get('/api/teamsnap/status', (req, res) => {
  res.json({
    configured: !!TEAMSNAP_CLIENT_ID,
    redirectUri: TEAMSNAP_REDIRECT_URI
  });
});

// Helper functions
function mapPosition(tsPosition) {
  if (!tsPosition) return 'Midfielder';
  const pos = tsPosition.toLowerCase();
  if (pos.includes('goal') || pos.includes('keeper') || pos.includes('gk')) return 'Goalkeeper';
  if (pos.includes('def') || pos.includes('back') || pos.includes('cb') || pos.includes('lb') || pos.includes('rb')) return 'Defender';
  if (pos.includes('forward') || pos.includes('striker') || pos.includes('wing') || pos.includes('st') || pos.includes('lw') || pos.includes('rw')) return 'Forward';
  return 'Midfielder';
}

function calculateAge(birthday) {
  if (!birthday) return 0;
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PitchMind Backend v3.0 running on port ${PORT}`);
  console.log(`📊 Modal endpoint: ${MODAL_ENDPOINT}`);
  console.log(`🤖 Groq AI: ${GROQ_API_KEY ? 'configured' : 'not configured'}`);
  console.log(`🏈 TeamSnap: ${TEAMSNAP_CLIENT_ID ? 'configured' : 'not configured'}`);
  console.log(`💾 Database: ${DATABASE_URL ? 'connected' : 'not configured'}`);
});
