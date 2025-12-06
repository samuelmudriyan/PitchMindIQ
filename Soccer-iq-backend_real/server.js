const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Environment variables
const MODAL_ENDPOINT = process.env.MODAL_ENDPOINT || 'https://sammywassman--pitchmind-tracker-track-player.modal.run';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// TeamSnap Config
const TEAMSNAP_CLIENT_ID = process.env.TEAMSNAP_CLIENT_ID;
const TEAMSNAP_CLIENT_SECRET = process.env.TEAMSNAP_CLIENT_SECRET;
const TEAMSNAP_REDIRECT_URI = process.env.TEAMSNAP_REDIRECT_URI || 'https://pitchmind-backend-production-483d.up.railway.app/api/teamsnap/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const TEAMSNAP_API = 'https://api.teamsnap.com/v3';
const TEAMSNAP_AUTH = 'https://auth.teamsnap.com/oauth/authorize';
const TEAMSNAP_TOKEN = 'https://auth.teamsnap.com/oauth/token';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
    version: '2.0',
    features: ['video-analysis', 'ai-coach', 'teamsnap-integration'],
    teamsnap: TEAMSNAP_CLIENT_ID ? 'configured' : 'not configured'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
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
  console.log(`🚀 PitchMind Backend running on port ${PORT}`);
  console.log(`📊 Modal endpoint: ${MODAL_ENDPOINT}`);
  console.log(`🤖 Groq AI: ${GROQ_API_KEY ? 'configured' : 'not configured'}`);
  console.log(`🏈 TeamSnap: ${TEAMSNAP_CLIENT_ID ? 'configured' : 'not configured'}`);
});
