"use strict";
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const crypto = require("crypto");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const Anthropic = require("@anthropic-ai/sdk");
const { execSync, spawn } = require("child_process");
const Groq = require("groq-sdk");

const PORT = Number(process.env.PORT || 5000);
const ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// 🚀 MODAL GPU ENDPOINT
const MODAL_ENDPOINT = process.env.MODAL_ENDPOINT || "https://meatyhd6--pitchmind-gpu-tracker-v4-fastapi-app.modal.run";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY");
  process.exit(1);
}

if (!MODAL_ENDPOINT) {
  console.warn("⚠️  WARNING: MODAL_ENDPOINT not set - GPU processing disabled");
}

// 🤖 GROQ AI COACH
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
if (!groq) {
  console.warn("⚠️  WARNING: GROQ_API_KEY not set - AI Coach disabled");
}

const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(express.json({ limit: "10gb" }));
app.use(express.urlencoded({ extended: true, limit: "10gb" }));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      return ORIGINS.includes(origin) ? cb(null, true) : cb(new Error("CORS not allowed"), false);
    },
  })
);

const UPLOADS_DIR = path.resolve("./uploads");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");
const FRAMES_DIR = path.join(UPLOADS_DIR, "frames");
for (const d of [UPLOADS_DIR, VIDEOS_DIR, FRAMES_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEOS_DIR),
  filename: (req, file, cb) => {
    const safe = path.basename(file.originalname).replace(/[^\w.\-]+/g, "_");
    cb(null, `${Date.now()}_${crypto.randomUUID()}_${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 * 1024  // 10GB limit
  },
  fileFilter: (req, file, cb) => {
    const ok = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Unsupported video type"));
  },
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/```(?:json)?/gi, "```").replace(/```/g, "");
  const i = cleaned.indexOf("{");
  const j = cleaned.lastIndexOf("}");
  if (i !== -1 && j !== -1 && j > i) {
    try { return JSON.parse(cleaned.slice(i, j + 1)); } catch {}
  }
  const m = cleaned.match(/\{[\s\S]*\}/m);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

async function callClaudeJson({ base64Image, prompt, maxTokens = 1200 }) {
  const resp = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Image } }, { type: "text", text: prompt }] }],
  });
  const text = resp?.content?.[0]?.text ?? "";
  const json = extractJson(text);
  if (!json) throw new Error("No valid JSON in response");
  return json;
}

function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      const dur = Number(metadata?.format?.duration || 0);
      if (!dur) return reject(new Error("Cannot read duration"));
      resolve(dur);
    });
  });
}

async function extractFrame(videoPath, timestamp) {
  const ts = Math.max(0, Number(timestamp) || 0);
  const fname = `frame_${ts.toFixed(2)}s_${Date.now()}_${crypto.randomUUID()}.jpg`;
  const outPath = path.join(FRAMES_DIR, fname);
  
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  }
  
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(ts)
      .outputOptions(["-vframes 1", "-qscale:v 1", "-vf", "scale='min(1920,iw)':-2"])
      .output(outPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
  
  return { timestamp: ts, path: outPath, url: `/uploads/frames/${fname}` };
}

// 🔥 Call Modal GPU for video tracking
async function callModalGPU(videoPath, playerX, playerY, filename, clickTimestamp = 0) {
  const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
  const baseUrl = domain 
    ? (domain.startsWith('http') ? domain : `https://${domain}`)
    : `http://localhost:${PORT}`;
  
  const videoUrl = `${baseUrl}/uploads/videos/${path.basename(videoPath)}`;
  
  console.log(`🚀 Calling Modal GPU...`);
  console.log(`Video URL: ${videoUrl}`);
  console.log(`Click timestamp: ${clickTimestamp}s`);
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2400000);
  
  try {
    const response = await fetch(MODAL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_url: videoUrl,
        player_x: playerX,
        player_y: playerY,
        filename: filename,
        click_timestamp: clickTimestamp
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Modal API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Modal GPU processing failed');
    return result;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') throw new Error('Modal GPU request timed out after 40 minutes');
    throw error;
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok",
    modalConfigured: !!MODAL_ENDPOINT,
    groqConfigured: !!groq
  });
});

// 🤖 AI COACH ENDPOINT - Groq Llama 3.3 70B
app.post("/api/coach", async (req, res) => {
  console.log("🤖 AI COACH REQUEST");
  
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!groq) {
      return res.status(500).json({ error: 'AI Coach not configured - missing GROQ_API_KEY' });
    }

    let teamContext = '';
    if (context) {
      if (context.playerCount > 0) {
        teamContext += `\n\nTeam Information:`;
        teamContext += `\n- Total Players: ${context.playerCount}`;
        if (context.players && context.players.length > 0) {
          teamContext += `\n- Player Roster:`;
          context.players.forEach(p => {
            teamContext += `\n  • ${p.name} (${p.position}, Decision IQ: ${p.rating})`;
          });
        }
      }
      if (context.recentSessions && context.recentSessions.length > 0) {
        teamContext += `\n- Recent Sessions: ${context.recentSessions.map(s => s.title).join(', ')}`;
      }
    }

    const systemPrompt = `You are an elite soccer/football coach AI assistant for PitchMind. You have deep expertise in:

- Tactical formations and systems (4-3-3, 4-4-2, 3-5-2, etc.)
- Player development and training methodologies
- Decision-making under pressure
- Modern coaching philosophies (Guardiola's positional play, Klopp's gegenpressing, etc.)
- Youth development and age-appropriate training
- Match analysis and opponent scouting
- Set piece design and execution
- Physical conditioning and periodization
- Mental performance and team psychology

You provide specific, actionable advice. When suggesting drills, include:
- Clear setup instructions
- Player counts and positions
- Coaching points to emphasize
- Progressions to make it harder/easier

Keep responses focused and practical. Use bullet points for clarity when listing multiple items.
${teamContext}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
    
    console.log("✅ AI Coach response generated");
    res.json({ response });
  } catch (error) {
    console.error('❌ Groq API Error:', error);
    res.status(500).json({ error: 'Failed to get AI response', details: error.message });
  }
});

app.post("/api/upload-video", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No video" });
  return res.json({ success: true, videoId: req.file.filename, videoUrl: `/uploads/videos/${req.file.filename}` });
});

app.post("/api/analyze", upload.single("video"), async (req, res) => {
  console.log("📹 COMBINED UPLOAD + ANALYZE");
  
  try {
    if (!req.file) return res.status(400).json({ error: "No video file" });
    
    const clickX = parseFloat(req.body.clickX);
    const clickY = parseFloat(req.body.clickY);
    const clickTimestamp = parseFloat(req.body.clickTimestamp) || 0;
    
    if (isNaN(clickX) || isNaN(clickY)) return res.status(400).json({ error: "Missing click position" });
    
    const videoPath = req.file.path;
    const filename = req.file.filename;
    
    console.log("Video:", filename);
    console.log("Click position:", clickX, clickY);
    
    const gpuResults = await callModalGPU(videoPath, clickX, clickY, filename, clickTimestamp);
    
    console.log(`✅ Modal found ${gpuResults.decision_points?.length || 0} decision points`);
    
    res.json({
      success: true,
      decision_points: gpuResults.decision_points || [],
      video_metadata: gpuResults.video_metadata,
      processing_info: gpuResults.processing_info
    });
    
  } catch (e) {
    console.error("❌ Error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/analyze-video", async (req, res) => {
  console.log("📹 MODAL GPU - ANALYZE VIDEO");
  
  try {
    const { videoPath, playerPosition } = req.body || {};
    if (!videoPath || !playerPosition) return res.status(400).json({ error: "Missing parameters" });
    
    const abs = path.join(VIDEOS_DIR, path.basename(videoPath));
    if (!fs.existsSync(abs)) return res.status(400).json({ error: "Video file not found" });
    
    const filename = path.basename(abs);
    const duration = await getVideoDuration(abs);
    
    if (duration > 1800) {
      return res.status(400).json({ error: 'Video too long', message: `Please upload clips under 30 minutes.` });
    }
    
    const gpuResults = await callModalGPU(abs, playerPosition.x, playerPosition.y, filename);
    
    if (gpuResults.decision_points.length === 0) {
      return res.json({ success: false, error: "No decision points found in this video." });
    }
    
    const selected = gpuResults.decision_points.slice(0, 5);
    const analyses = [];
    
    for (let i = 0; i < selected.length; i++) {
      const point = selected[i];
      const frameDuring = await extractFrame(abs, point.timestamp);
      
      const analysis = await analyzeDecisionPoint(
        frameDuring.path,
        { x: point.player_position[0] / gpuResults.video_metadata.width * 100, y: point.player_position[1] / gpuResults.video_metadata.height * 100 },
        point.zone
      );
      
      analyses.push({
        timestamp: point.timestamp,
        frameUrl: frameDuring.url,
        playerPosition: { x: point.player_position[0] / gpuResults.video_metadata.width * 100, y: point.player_position[1] / gpuResults.video_metadata.height * 100 },
        zone: point.zone,
        analysis: analysis
      });
      
      if (i < selected.length - 1) await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    res.json({
      success: true,
      totalDecisionPoints: gpuResults.decision_points.length,
      analyses: analyses,
      videoMetadata: gpuResults.video_metadata,
      processingInfo: gpuResults.processing_info
    });
    
  } catch (e) {
    console.error("❌ Error:", e);
    res.status(500).json({ error: e.message });
  }
});

async function analyzeDecisionPoint(framePath, playerPosition, zone) {
  const base64Image = (await fsp.readFile(framePath)).toString("base64");
  
  const prompt = `You are an elite soccer tactical analyst.

PLAYER: Position x=${playerPosition.x.toFixed(1)}%, y=${playerPosition.y.toFixed(1)}%
FIELD ZONE: ${zone}

The player has just received or is about to receive the ball. Analyze this decision moment.

Return JSON:
{
  "situation": "Brief tactical situation (150-200 chars)",
  "playerRole": "Inferred tactical role",
  "fieldLocation": "${zone}",
  "pressureLevel": "Low/Medium/High",
  "keySpaces": "Available space and options",
  "optimalDecision": {
    "action": "Best possible action",
    "reasoning": "Why this is optimal",
    "principle": "Tactical principle"
  },
  "options": [
    { "text": "Option A - detailed description", "points": 90, "feedback": "Tactical feedback", "isOptimal": true },
    { "text": "Option B - detailed description", "points": 75, "feedback": "Why this is decent but not optimal" },
    { "text": "Option C - detailed description", "points": 60, "feedback": "Why this is suboptimal" }
  ]
}`;

  const resp = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Image } }, { type: "text", text: prompt }] }]
  });
  
  const text = resp?.content?.[0]?.text ?? "";
  const json = extractJson(text);
  if (!json) throw new Error("Failed to parse Claude response");
  return json;
}

app.post("/api/analyze-elite-action", async (req, res) => {
  console.log("🎯 ANALYZING ELITE ACTION");

  try {
    const { playerName, situation, userChoice, question } = req.body || {};
    if (!playerName || !situation) return res.status(400).json({ error: "Missing parameters" });

    const prompt = `You are a professional soccer analyst studying ${playerName}'s decision-making in a match.

SITUATION: ${situation}
QUESTION ASKED: ${question}
USER'S CHOICE: "${userChoice}"

Return JSON:
{
  "eliteAction": "Specific description of what ${playerName} would do",
  "whyElite": "Tactical reasoning",
  "tacticalLesson": "Key learning point",
  "matchedUserChoice": true/false,
  "improvementTip": "If user didn't match elite choice, what should they focus on?"
}`;

    const resp = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });
    
    const analysis = extractJson(resp?.content?.[0]?.text ?? "");
    if (!analysis) throw new Error("No valid JSON in response");

    res.json({ success: true, analysis });
  } catch (e) {
    console.error("❌ analyze-elite-action error:", e);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.get("/api/game-library", (_req, res) => {
  const gameLibrary = {
    midfielder: [
      { id:"central-midfielder-1", title:"Kevin De Bruyne - Vision & Passing", description:"Watch elite playmaking", position:"Central Midfielder", youtubeId:"cDjfkqF0pFI", thumbnail:"https://i.ytimg.com/vi/cDjfkqF0pFI/hqdefault.jpg", duration:"10:30", difficulty:"Advanced", keyPlayers:["Kevin De Bruyne"], quizQuestions:[{ timestamp:45, situation:"De Bruyne receives ball in central midfield with passing options on both sides", question:"What should De Bruyne do?", options:[{ text:"Play a safe sideways pass", points:70, feedback:"Safe but doesn't exploit space.", eliteChoice:false },{ text:"Thread a through ball to the striker", points:95, feedback:"Perfect! De Bruyne's signature move.", eliteChoice:true },{ text:"Dribble forward to draw defenders", points:75, feedback:"Good intent but passing is his strength.", eliteChoice:false }]}]}
    ],
    forward: [
      { id:"striker-1", title:"Erling Haaland - Elite Striker Movement", description:"Study world-class finishing", position:"Striker", youtubeId:"pP8r4yDPnyE", thumbnail:"https://i.ytimg.com/vi/pP8r4yDPnyE/hqdefault.jpg", duration:"11:00", difficulty:"Advanced", keyPlayers:["Erling Haaland"], quizQuestions:[{ timestamp:180, situation:"Through ball played behind defense, 1v1 with goalkeeper", question:"What finishing technique?", options:[{ text:"Chip the goalkeeper", points:75, feedback:"Risky technique.", eliteChoice:false },{ text:"Side-foot finish into far corner", points:96, feedback:"Clinical! Haaland's trademark.", eliteChoice:true },{ text:"Power shot near post", points:82, feedback:"Can work but far post is better.", eliteChoice:false }]}]}
    ],
    defender: [
      { id:"center-back-1", title:"Virgil van Dijk - Center Back Masterclass", description:"Elite defensive positioning", position:"Center Back", youtubeId:"x5U41vtX_Nw", thumbnail:"https://i.ytimg.com/vi/x5U41vtX_Nw/hqdefault.jpg", duration:"10:00", difficulty:"Advanced", keyPlayers:["Virgil van Dijk"], quizQuestions:[{ timestamp:75, situation:"Striker making a run, deciding whether to step up", question:"What should Van Dijk do?", options:[{ text:"Step up aggressively to catch offside", points:89, feedback:"Excellent! Van Dijk's awareness.", eliteChoice:true },{ text:"Drop deep to cover space", points:75, feedback:"Safe but reactive.", eliteChoice:false },{ text:"Hold position and wait", points:70, feedback:"Passive approach.", eliteChoice:false }]}]}
    ]
  };
  res.json(gameLibrary);
});

app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📡 Modal GPU: ${MODAL_ENDPOINT ? '✓' : '✗'}`);
  console.log(`🔑 Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗'}`);
  console.log(`🤖 Groq AI Coach: ${groq ? '✓' : '✗'}`);
});
