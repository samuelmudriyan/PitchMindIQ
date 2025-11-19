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
const { execSync } = require("child_process");
const Anthropic = require("@anthropic-ai/sdk");
const { execSync, spawn } = require("child_process");

const PORT = Number(process.env.PORT || 5000);
const ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
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
  limits: { fileSize: 500 * 1024 * 1024 },
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

async function identifyPlayer(framePath, position) {
  try {
    const base64Image = (await fsp.readFile(framePath)).toString("base64");
    const prompt = `TARGET x=${Number(position.x).toFixed(1)}%, y=${Number(position.y).toFixed(1)}%
Only describe the player closest to that point. Return JSON:
{"description":"150+ chars","jerseyColor":"desc","jerseyNumber":"number or null","skinTone":"desc","hairStyle":"desc","bodyBuild":"desc","team":"Left team/Right team","distinctiveFeatures":"desc"}`;
    return await callClaudeJson({ base64Image, prompt, maxTokens: 800 });
  } catch (e) {
    console.error("identifyPlayer:", e.message);
    return null;
  }
}

async function trackPlayerInFrame(framePath, lastPosition, playerDescription) {
  try {
    const base64Image = (await fsp.readFile(framePath)).toString("base64");
    const prompt = `Track player: jersey=${playerDescription?.jerseyColor||"?"} ${playerDescription?.jerseyNumber?("#"+playerDescription.jerseyNumber):""}, team=${playerDescription?.team||"?"}, features=${playerDescription?.distinctiveFeatures||"?"}. Last x=${lastPosition.x.toFixed(1)}%, y=${lastPosition.y.toFixed(1)}%.

CRITICAL: Only mark hasBall as TRUE if the ball is within 1 yard (approximately 1 meter) of the player's feet. The player must be in active control or about to touch the ball.

Return JSON:
{"playerFound":true/false,"position":{"x":number,"y":number},"hasBall":true/false,"confidence":0-100,"tacticalPosition":"role","fieldThird":"Defensive/Middle/Attacking","distanceFromLastPosition":"meters","reason":"brief"}`;
    
    const json = await callClaudeJson({ base64Image, prompt, maxTokens: 1200 });
    const dx = Math.abs((json.position?.x ?? lastPosition.x) - lastPosition.x);
    const dy = Math.abs((json.position?.y ?? lastPosition.y) - lastPosition.y);
    if (Math.hypot(dx, dy) > 30 && json.confidence > 60) json.confidence = Math.max(30, json.confidence - 20);
    
    // If confidence is low, mark as not found
    if (json.confidence < 40) {
      json.playerFound = false;
    }
    
    return json;
  } catch (e) {
    console.error("trackPlayerInFrame:", e.message);
    return { playerFound: false, position: lastPosition, hasBall: false, confidence: 0, tacticalPosition: "Unknown", fieldThird: "Unknown" };
  }
}

async function analyzeFrame(framePath, playerPosition, tacticalPosition = "Unknown") {
  const base64Image = (await fsp.readFile(framePath)).toString("base64");
  const prompt = `Analyze moment for player at x=${playerPosition.x.toFixed(1)}%, y=${playerPosition.y.toFixed(1)}%, role=${tacticalPosition}.

IMPORTANT: 
- Only include the current score in "situation", NOT the game context (championship, cup, etc.)
- Keep situation focused on tactical positioning, numerical advantages, and immediate opportunities
- Be concise and action-focused

Return JSON: {"playerDescription":"...","playerRole":"${tacticalPosition}","positionCorrect":true/false,"actualPosition":"...","teamSide":"Left/Right","fieldLocation":"...","situation":"Score: X-X. [Tactical situation in 150-200 chars focusing on positioning, space, and immediate options]","numericalAdvantage":"...","keySpaces":"...","pressureLevel":"Low/Medium/High","options":[{"text":"...","points":0-100,"feedback":"...","eliteComparison":"..."},{"text":"...","points":0-100,"feedback":"...","eliteComparison":"..."},{"text":"...","points":0-100,"feedback":"...","eliteComparison":"..."}]}`;
  return await callClaudeJson({ base64Image, prompt, maxTokens: 3000 });
}

async function trackPlayerAndFindPossession(videoPath, initialPlayerPosition, videoDuration) {
  const possessionMoments = [];
  const trackingData = [];
  const sampleInterval = 3;
  const maxTs = Math.max(0, Math.floor(videoDuration) - 2);
  let lastPos = initialPlayerPosition;
  let descriptor = null;

  for (let ts = 2; ts < maxTs; ts += sampleInterval) {
    const frame = await extractFrame(videoPath, ts);
    if (!descriptor) descriptor = await identifyPlayer(frame.path, initialPlayerPosition);
    
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tr = await trackPlayerInFrame(frame.path, lastPos, descriptor);
    if (tr.playerFound) {
      lastPos = tr.position;
      trackingData.push({ timestamp: ts, position: tr.position, hasBall: tr.hasBall, confidence: tr.confidence, tacticalPosition: tr.tacticalPosition });
      if (tr.hasBall && tr.confidence > 70) {
        possessionMoments.push({ timestamp: ts, position: tr.position, tacticalPosition: tr.tacticalPosition, framePath: frame.path, frameUrl: frame.url, confidence: tr.confidence });
      }
    }
  }

  if (!possessionMoments.length && trackingData.length) {
    const top = trackingData.filter(f => f.confidence > 40).sort((a,b)=>b.confidence-a.confidence).slice(0,3);
    for (const t of top) {
      const f = await extractFrame(videoPath, t.timestamp);
      possessionMoments.push({ timestamp: t.timestamp, position: t.position, tacticalPosition: t.tacticalPosition, framePath: f.path, frameUrl: f.url, confidence: t.confidence });
    }
  }
  return { possessionMoments, trackingData };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/test-elite", (req, res) => {
  console.log("🔥🔥🔥 TEST ENDPOINT HIT 🔥🔥🔥");
  console.log("Body:", req.body);
  res.json({ test: "success", body: req.body });
});


app.post("/api/upload-video", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No video" });
  return res.json({ success: true, videoId: req.file.filename, videoUrl: `/uploads/videos/${req.file.filename}` });
});

app.post("/api/analyze-player", async (req, res) => {
  try {
    const { videoPath, timestamp, playerPosition, tacticalPosition } = req.body || {};
    if (!videoPath || typeof timestamp !== "number" || !playerPosition) return res.status(400).json({ error: "Missing parameters" });
    const abs = path.isAbsolute(videoPath) ? videoPath : path.join(VIDEOS_DIR, path.basename(videoPath));
    const frame = await extractFrame(abs, timestamp);
    const analysis = await analyzeFrame(frame.path, playerPosition, tacticalPosition || "Unknown");
    res.json({ success: true, timestamp, frameUrl: frame.url, analysis });
  } catch (e) {
    console.error("analyze-player:", e);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.post("/api/analyze-video", async (req, res) => {
  console.log("========================================");
  console.log("📹 PYTHON TRACKING - ANALYZE VIDEO");
  
  try {
    const { videoPath, playerPosition } = req.body || {};
    
    if (!videoPath || !playerPosition) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    
    const abs = path.join(VIDEOS_DIR, path.basename(videoPath));
    
    if (!fs.existsSync(abs)) {
      return res.status(400).json({ error: "Video file not found" });
    }
    
    console.log("🐍 Running Python tracker...");
    console.log("Video:", abs);
    console.log("Player position:", playerPosition);
    
    // Run Python tracking script
    const decisionPoints = await runPythonTracker(abs, playerPosition);
    
    console.log(`✅ Python found ${decisionPoints.length} decision points`);
    
    if (decisionPoints.length === 0) {
      return res.json({
        success: false,
        error: "No decision points found. Ball may not have come within 3 yards of the player."
      });
    }
    
    // Limit to 5 decision points for analysis
    const selected = decisionPoints.slice(0, 5);
    
    console.log(`🧠 Analyzing ${selected.length} decision points with Claude...`);
    
    const analyses = [];
    
    for (const point of selected) {
      // Extract 3 frames: before, during, after
      const frameBefore = await extractFrame(abs, point.clip_start);
      const frameDuring = await extractFrame(abs, point.timestamp);
      const frameAfter = await extractFrame(abs, point.clip_end);
      
      // Analyze with enhanced prompt
      const analysis = await analyzeDecisionWithFullContext(
        [frameBefore, frameDuring, frameAfter],
        point.player_position,
        point.field_third
      );
      
      analyses.push({
        timestamp: point.timestamp,
        frameUrl: frameDuring.url,
        playerPosition: point.player_position,
        tacticalPosition: point.field_third,
        analysis: analysis
      });
    }
    
    console.log("✅ COMPLETE!");
    console.log("========================================");
    
    res.json({
      success: true,
      totalDecisionPoints: decisionPoints.length,
      analyses: analyses
    });
    
  } catch (e) {
    console.error("❌ Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Helper: Run Python tracking script
function runPythonTracker(videoPath, playerPosition) {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [
      'video_tracker.py',
      videoPath,
      (playerPosition.x / 100).toString(),
      (playerPosition.y / 100).toString()
    ]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('[Python]', data.toString().trim());
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python stderr:', stderr);
        return reject(new Error(`Python script failed with code ${code}`));
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${e.message}`));
      }
    });
    
    python.on('error', (err) => {
      reject(new Error(`Failed to start Python: ${err.message}`));
    });
  });
}

// Enhanced analysis function with before/during/after context
async function analyzeDecisionWithFullContext(frames, playerPosition, fieldThird) {
  const [frameBefore, frameDuring, frameAfter] = frames;
  
  const base64Before = (await fsp.readFile(frameBefore.path)).toString("base64");
  const base64During = (await fsp.readFile(frameDuring.path)).toString("base64");
  const base64After = (await fsp.readFile(frameAfter.path)).toString("base64");
  
  const prompt = `You are an elite soccer tactical analyst.

PLAYER: Position x=${playerPosition.x.toFixed(1)}%, y=${playerPosition.y.toFixed(1)}%
FIELD POSITION: ${fieldThird}

YOU HAVE 3 FRAMES:
- FRAME 1 (5 sec BEFORE): Build-up
- FRAME 2 (DECISION MOMENT): Player has ball
- FRAME 3 (10 sec AFTER): Outcome

ANALYZE:

1️⃣ WHAT ACTUALLY HAPPENED (use Frame 3):
- What did the player do?
- What was the result?
- Score this decision: 0-100
- Goal opportunity created?

2️⃣ OPTIMAL DECISION (use Frame 2):
- Best possible action?
- Why maximize goals?
- Tactical principle?

3️⃣ CREATE QUIZ (Frame 2):
- Option A: Optimal (90-100 pts)
- Option B: Decent (75-85 pts)
- Option C: Poor (60-70 pts)

JSON FORMAT:
{
  "situation": "Brief tactical situation (150-200 chars)",
  "playerRole": "Inferred role",
  "fieldLocation": "${fieldThird}",
  "pressureLevel": "Low/Medium/High",
  "whatActuallyHappened": {
    "decision": "Specific action taken",
    "outcome": "Result",
    "scoreForRealDecision": 0-100,
    "goalOpportunityCreated": true/false
  },
  "optimalDecision": {
    "action": "Best action",
    "reasoning": "Why optimal",
    "principle": "Tactical principle"
  },
  "options": [
    {"text": "...", "points": 90-100, "feedback": "...", "isOptimal": true},
    {"text": "...", "points": 75-85, "feedback": "..."},
    {"text": "...", "points": 60-70, "feedback": "..."}
  ]
}`;

  const resp = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "FRAME 1 - Before:" },
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Before } },
        { type: "text", text: "FRAME 2 - Decision:" },
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64During } },
        { type: "text", text: "FRAME 3 - After:" },
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64After } },
        { type: "text", text: prompt }
      ]
    }]
  });
  
  const text = resp?.content?.[0]?.text ?? "";
  const json = extractJson(text);
  
  if (!json) throw new Error("Failed to parse response");
  
  return json;
}

app.post("/api/analyze-elite-action", async (req, res) => {
  console.log("🎯 ANALYZING ELITE ACTION");
  console.log("Full request body:", JSON.stringify(req.body, null, 2));
  console.log("playerName:", req.body?.playerName);
  console.log("situation:", req.body?.situation);
  console.log("playerName type:", typeof req.body?.playerName);
  console.log("situation type:", typeof req.body?.situation);

  try {
    const { playerName, decisionTimestamp, situation, userChoice, question } = req.body || {};
    
    console.log("After destructuring:");
    console.log("playerName:", playerName);
    console.log("situation:", situation);

    if (!playerName || !situation) {
      console.log("❌ FAILED VALIDATION!");
      console.log("playerName is falsy:", !playerName);
      console.log("situation is falsy:", !situation);
      return res.status(400).json({ error: "Missing parameters" });
    }

    const prompt = `You are a professional soccer analyst studying ${playerName}'s decision-making in a match.

SITUATION: ${situation}
QUESTION ASKED: ${question}
USER'S CHOICE: "${userChoice}"

Based on your knowledge of ${playerName}'s playing style and elite tactical principles:

1. What would ${playerName} MOST LIKELY do in this exact situation? (Be specific about the action)
2. Why is this the tactically superior choice?
3. How does this decision demonstrate elite-level game intelligence?
4. Does the user's choice align with what the elite player would do?

Return JSON:
{
  "eliteAction": "Specific description of what ${playerName} would do (2-3 sentences with tactical detail)",
  "whyElite": "Tactical reasoning explaining why this is optimal (2-3 sentences)",
  "tacticalLesson": "Key learning point for the user (1-2 sentences)",
  "matchedUserChoice": true/false,
  "improvementTip": "If user didn't match elite choice, what should they focus on improving?"
}`;

    // For text-based analysis, we'll create a simple completion without image
    const resp = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{ 
        role: "user", 
        content: prompt 
      }],
    });
    
    const text = resp?.content?.[0]?.text ?? "";
    const analysis = extractJson(text);
    
    if (!analysis) {
      throw new Error("No valid JSON in response");
    }

    console.log("✅ Elite analysis complete");
    res.json({ success: true, analysis });
  } catch (e) {
    console.error("❌ analyze-elite-action error:", e);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.get("/api/game-library", (_req, res) => {
  const gameLibrary = {
    midfielder: [
      { 
        id:"central-midfielder-1", 
        title:"Kevin De Bruyne - Vision & Passing", 
        description:"Watch elite playmaking and decision-making", 
        position:"Central Midfielder", 
        youtubeId:"cDjfkqF0pFI", 
        thumbnail:"https://i.ytimg.com/vi/cDjfkqF0pFI/hqdefault.jpg", 
        duration:"10:30", 
        difficulty:"Advanced", 
        keyPlayers:["Kevin De Bruyne"], 
        quizQuestions:[
          { timestamp:45, situation:"De Bruyne receives ball in central midfield with passing options on both sides", question:"What should De Bruyne do?", options:[
            { text:"Play a safe sideways pass to retain possession", points:70, feedback:"Safe but doesn't exploit the space. Elite playmakers look for progressive options first.", eliteChoice:false },
            { text:"Thread a through ball between the defenders to the striker", points:95, feedback:"Perfect! De Bruyne's signature move - spotting runs early and playing weighted passes through tight spaces.", eliteChoice:true },
            { text:"Dribble forward to draw defenders", points:75, feedback:"Good attacking intent, but De Bruyne's strength is his passing, not dribbling in tight spaces.", eliteChoice:false }
          ]},
          { timestamp:125, situation:"Counter-attack opportunity with teammates making runs wide", question:"Which pass should De Bruyne make?", options:[
            { text:"Quick switch to the far winger", points:92, feedback:"Excellent vision! De Bruyne often uses these diagonal switches to exploit space.", eliteChoice:true },
            { text:"Play it forward to the closest forward", points:78, feedback:"Decent choice but doesn't maximize the width advantage.", eliteChoice:false },
            { text:"Hold the ball and wait for support", points:65, feedback:"Too slow for a counter-attack. Transition speed is crucial.", eliteChoice:false }
          ]}
        ]
      },
      { 
        id:"attacking-midfielder-1", 
        title:"Bruno Fernandes - Attacking Midfield", 
        description:"Master creative playmaking in the final third", 
        position:"Attacking Midfielder", 
        youtubeId:"UtBNPQ4vHuo", 
        thumbnail:"https://i.ytimg.com/vi/UtBNPQ4vHuo/hqdefault.jpg", 
        duration:"9:45", 
        difficulty:"Advanced", 
        keyPlayers:["Bruno Fernandes"], 
        quizQuestions:[
          { timestamp:60, situation:"Receiving the ball in the final third with defenders closing down", question:"What's the best decision?", options:[
            { text:"Quick one-two with nearby teammate", points:88, feedback:"Smart! Combination play unlocks tight defenses.", eliteChoice:true },
            { text:"Turn and shoot from distance", points:72, feedback:"Bold but low percentage. Elite players create better chances first.", eliteChoice:false },
            { text:"Pass backwards to reset", points:65, feedback:"Too conservative in a dangerous area.", eliteChoice:false }
          ]}
        ]
      },
      { 
        id:"defensive-midfielder-1", 
        title:"Rodri - Defensive Midfield Intelligence", 
        description:"Learn positioning and ball recovery", 
        position:"Defensive Midfielder", 
        youtubeId:"Lpz4PUPJ5kM", 
        thumbnail:"https://i.ytimg.com/vi/Lpz4PUPJ5kM/hqdefault.jpg", 
        duration:"8:30", 
        difficulty:"Advanced", 
        keyPlayers:["Rodri"], 
        quizQuestions:[
          { timestamp:90, situation:"Opposition building from the back, deciding when to press", question:"When should Rodri press?", options:[
            { text:"Press immediately to force an error", points:68, feedback:"Too aggressive - can be bypassed easily.", eliteChoice:false },
            { text:"Wait for a poor touch or backwards pass, then close down", points:94, feedback:"Perfect timing! Rodri excels at reading these moments.", eliteChoice:true },
            { text:"Drop deep and maintain defensive shape", points:80, feedback:"Safe but passive. Top DMs know when to be proactive.", eliteChoice:false }
          ]}
        ]
      }
    ],
    forward: [
      { 
        id:"striker-1", 
        title:"Erling Haaland - Elite Striker Movement", 
        description:"Study world-class finishing and positioning", 
        position:"Striker", 
        youtubeId:"pP8r4yDPnyE", 
        thumbnail:"https://i.ytimg.com/vi/pP8r4yDPnyE/hqdefault.jpg", 
        duration:"11:00", 
        difficulty:"Advanced", 
        keyPlayers:["Erling Haaland"], 
        quizQuestions:[
          { timestamp:180, situation:"Through ball played behind the defense, 1v1 with goalkeeper", question:"What finishing technique should Haaland use?", options:[
            { text:"Chip the goalkeeper", points:75, feedback:"Risky technique. Works if keeper rushes out.", eliteChoice:false },
            { text:"Side-foot finish into far corner", points:96, feedback:"Clinical! Haaland's trademark - composed, accurate, high percentage finish.", eliteChoice:true },
            { text:"Power shot near post", points:82, feedback:"Can work but keeper has better chance. Far post is statistically better.", eliteChoice:false }
          ]}
        ]
      },
      { 
        id:"winger-1", 
        title:"Mohamed Salah - Winger Decision Making", 
        description:"Learn when to cut inside vs stay wide", 
        position:"Winger", 
        youtubeId:"XbX_rexTv2c", 
        thumbnail:"https://i.ytimg.com/vi/XbX_rexTv2c/hqdefault.jpg", 
        duration:"10:15", 
        difficulty:"Intermediate", 
        keyPlayers:["Mohamed Salah"], 
        quizQuestions:[
          { timestamp:95, situation:"1v1 with full-back on the right wing, space to cut inside", question:"What should Salah do?", options:[
            { text:"Cut inside onto left foot and shoot", points:93, feedback:"Signature Salah! Using his stronger foot from this angle creates the best scoring chance.", eliteChoice:true },
            { text:"Go down the line and cross", points:76, feedback:"Predictable. Defenders expect this and Salah's left foot shot is more dangerous.", eliteChoice:false },
            { text:"Pass backwards to recycle possession", points:68, feedback:"Too negative in a 1v1 situation. Elite wingers back themselves.", eliteChoice:false }
          ]}
        ]
      },
      { 
        id:"second-striker-1", 
        title:"Son Heung-min - Second Striker Intelligence", 
        description:"Master movement between lines", 
        position:"Second Striker", 
        youtubeId:"XDbN1CDGFks", 
        thumbnail:"https://i.ytimg.com/vi/XDbN1CDGFks/hqdefault.jpg", 
        duration:"9:00", 
        difficulty:"Advanced", 
        keyPlayers:["Son Heung-min"], 
        quizQuestions:[
          { timestamp:120, situation:"Team building attack, finding space between midfield and defense", question:"Where should Son position himself?", options:[
            { text:"Drop deep to receive ball to feet", points:78, feedback:"Shows for the ball but doesn't exploit the dangerous space.", eliteChoice:false },
            { text:"Make a run in behind the defensive line", points:91, feedback:"Perfect! Son's elite movement - timing runs into space defenders can't see.", eliteChoice:true },
            { text:"Stay high and pin the center backs", points:72, feedback:"Traditional striker role, but Son's versatility is his strength.", eliteChoice:false }
          ]}
        ]
      }
    ],
    defender: [
      { 
        id:"center-back-1", 
        title:"Virgil van Dijk - Center Back Masterclass", 
        description:"Elite defensive positioning and timing", 
        position:"Center Back", 
        youtubeId:"x5U41vtX_Nw", 
        thumbnail:"https://i.ytimg.com/vi/x5U41vtX_Nw/hqdefault.jpg", 
        duration:"10:00", 
        difficulty:"Advanced", 
        keyPlayers:["Virgil van Dijk"], 
        quizQuestions:[
          { timestamp:75, situation:"Striker making a run, deciding whether to step up or drop off", question:"What should Van Dijk do?", options:[
            { text:"Step up aggressively to catch striker offside", points:89, feedback:"Excellent! Van Dijk's defensive awareness allows him to play a high line.", eliteChoice:true },
            { text:"Drop deep to cover the space in behind", points:75, feedback:"Safe but reactive. Elite defenders dictate terms.", eliteChoice:false },
            { text:"Hold position and wait for the pass", points:70, feedback:"Passive approach. Van Dijk prevents chances, not just reacts.", eliteChoice:false }
          ]}
        ]
      },
      { 
        id:"fullback-1", 
        title:"Trent Alexander-Arnold - Modern Full Back", 
        description:"Master the complete full-back role", 
        position:"Full Back", 
        youtubeId:"DDvzWdlw6no", 
        thumbnail:"https://i.ytimg.com/vi/DDvzWdlw6no/hqdefault.jpg", 
        duration:"9:30", 
        difficulty:"Intermediate", 
        keyPlayers:["Trent Alexander-Arnold"], 
        quizQuestions:[
          { timestamp:140, situation:"Team has possession, space to overlap on the wing", question:"What's Trent's best decision?", options:[
            { text:"Overlap the winger and get to the byline", points:92, feedback:"Perfect! Creating an overload is Trent's specialty.", eliteChoice:true },
            { text:"Stay back to cover potential counter-attack", points:72, feedback:"Too cautious. Modern full-backs contribute heavily in attack.", eliteChoice:false },
            { text:"Cut inside and look for a long diagonal pass", points:85, feedback:"Good vision, but overlapping creates more immediate danger.", eliteChoice:false }
          ]}
        ]
      },
      { 
        id:"defender-aggressive-1", 
        title:"Antonio Rüdiger - Aggressive Defending", 
        description:"Physical and intelligent defending", 
        position:"Center Back", 
        youtubeId:"2SRtEs7DvCo", 
        thumbnail:"https://i.ytimg.com/vi/2SRtEs7DvCo/hqdefault.jpg", 
        duration:"8:45", 
        difficulty:"Advanced", 
        keyPlayers:["Antonio Rüdiger"], 
        quizQuestions:[
          { timestamp:105, situation:"Attacker receiving ball with back to goal", question:"How should Rüdiger defend this?", options:[
            { text:"Get tight immediately and apply pressure", points:94, feedback:"Perfect aggression! Rüdiger's physicality prevents the attacker from turning.", eliteChoice:true },
            { text:"Give space and wait for them to turn", points:68, feedback:"Too passive. Allows attacker time to assess options.", eliteChoice:false },
            { text:"Drop off slightly and cut passing lanes", points:79, feedback:"Decent positioning but doesn't use Rüdiger's physical strength advantage.", eliteChoice:false }
          ]}
        ]
      }
    ]
  };
  res.json(gameLibrary);
});

app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
