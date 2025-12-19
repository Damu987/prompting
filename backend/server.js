const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const router = express.Router();
const { Low } = require('lowdb');
const { Configuration, OpenAIApi } = require("openai");
const { JSONFile } = require('lowdb/node');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

//lowdb setup
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { users: [], otps: [] });

async function initDb() {
    await db.read();
    db.data = db.data || { users: [], otps: [] };
    await db.write();
}
async function ensureDbStructure() {
  // make sure data structures exist whenever we read the DB
  await db.read();
  db.data = db.data || {}; 
  db.data.users = db.data.users || [];
  db.data.otps = db.data.otps || [];

  // new structures for chat context + stats 
  db.data.chatHistory = db.data.chatHistory || [];
  db.data.stats = db.data.stats || { totalPrompts: 0, messagesPerUser: {} };

  await db.write();
}

initDb();
ensureDbStructure().catch(err => console.error("ensureDbStructure error:", err));

//email setup
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
}
//helpers
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateJwt(user) {
    return jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function findUser(identifier) {
    return db.data.users.find(
        u => u.email === identifier || u.username === identifier
    );
}

//Routes

// SEND OTP
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) return res.json({ ok: false, message: "Email required" });

    await db.read();

    const otp = generateOtp();
    const expires = Date.now() + 5 * 60 * 1000; 

    const existing = db.data.otps.find(o => o.email === email);
    if (existing) {
        existing.otp = otp;
        existing.expires = expires;
    } else {
        db.data.otps.push({ email, otp, expires });
    }

    await db.write();

    console.log("OTP:", otp);

    return res.json({ ok: true, message: "OTP sent!" });
});

// REGISTER USER + CREATE JWT
app.post('/register', async (req, res) => {
    const { username, fullname, email, password, otp } = req.body;

    if (!username || !fullname || !email || !password || !otp)
        return res.json({ ok: false, message: "All fields required" });

    await db.read();

    // FIXED OTP CHECK (convert both sides)
    const otpRecord = db.data.otps.find(
        o => o.email === email && Number(o.otp) === Number(otp)
    );

    if (!otpRecord) return res.json({ ok: false, message: "Invalid OTP" });
    if (Date.now() > otpRecord.expires)
        return res.json({ ok: false, message: "OTP expired" });

    // check user exists
    const exists = db.data.users.find(
        u => u.email === email || u.username === username
    );
    if (exists) return res.json({ ok: false, message: "User already exists" });

    // create user
    const hash = await bcrypt.hash(password, 10);
    const user = {
        id: Date.now().toString(),
        username,
        fullname,
        email,
        passwordHash: hash
    };

    db.data.users.push(user);
    db.data.otps = db.data.otps.filter(o => o.email !== email);

    await db.write();

    // Generate JWT
    const token = generateJwt(user);

    return res.json({
        ok: true,
        message: "Registered successfully",
        token,
        user: { id: user.id, username, fullname, email }
    });
});



// login user + return JWT
app.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password)
        return res.json({ ok: false, message: "Both fields required" });

    await db.read();

    const user = findUser(emailOrUsername);
    if (!user) return res.json({ ok: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.json({ ok: false, message: "Invalid credentials" });

    // ✔ Generate JWT
    const token = generateJwt(user);

    return res.json({
        ok: true,
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, fullname: user.fullname, email: user.email }
    });
});


// ✔ PROTECTED ROUTE
app.get('/me', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ ok: false, message: "No token" });

    const token = auth.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        await db.read();
        const user = db.data.users.find(u => u.id === payload.id);

        if (!user) return res.json({ ok: false, message: "User not found" });

        return res.json({ ok: true, user });
    } catch (err) {
        return res.status(401).json({ ok: false, message: "Invalid token" });
    }
});

// Save chat history item (user + AI response)
app.post("/api/history/save", async (req, res) => {
  try {
    const { userId, userInput, aiResponse } = req.body;
    if (!userId || !userInput || !aiResponse) {
      return res.json({ success: false, message: "All fields required" });
    }

    await ensureDbStructure();
    await db.read();

    // Find or create user's history
    let history = db.data.chatHistory.find(h => h.userId === userId);
    if (!history) {
      history = { userId, messages: [] };
      db.data.chatHistory.push(history);
    }

    // Save user + AI messages
    history.messages.push({ role: "user", content: userInput });
    history.messages.push({ role: "assistant", content: aiResponse });

    // Trim last 50 messages to avoid overflow
    history.messages = history.messages.slice(-50);

    await db.write();

    res.json({ success: true, message: "History saved successfully" });
  } catch (err) {
    console.error("saveHistoryItem Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Fetch chat history for a user
app.get("/api/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await ensureDbStructure();
    await db.read();

    const history = db.data.chatHistory.find(h => h.userId === userId);

    if (!history) {
      return res.json({ history: [] });
    }

    // Convert role-based messages → user/bot pairs
    const pairedHistory = [];
    for (let i = 0; i < history.messages.length; i += 2) {
      const userMsg = history.messages[i];
      const botMsg = history.messages[i + 1];

      if (userMsg && botMsg) {
        pairedHistory.push({
          user: userMsg.content,
          bot: botMsg.content,
        });
      }
    }

    res.json({ history: pairedHistory });
  } catch (err) {
    console.error("fetchHistory Error:", err);
    res.status(500).json({ history: [] });
  }
});


// Chat endpoint (AI response) 
app.post("/api/chat", async (req, res) => {
  try {
    const { userId: rawUserId, prompt: userPrompt } = req.body;
    const userId = rawUserId || "anonymous";

    if (!userPrompt || !userPrompt.trim()) {
      return res.json({ ok: false, message: "Prompt is required" });
    }

    await ensureDbStructure();
    await db.read();

    let history = db.data.chatHistory.find(h => h.userId === userId);
    if (!history) {
      history = { userId, messages: [] };
      db.data.chatHistory.push(history);
    }

    history.messages.push({ role: "user", content: userPrompt });

    const systemInstruction = `
You are an expert FULL-STACK developer.

Task: Generate a developer-friendly, actionable execution plan for any project idea provided by the user.

Follow this exact output structure (do NOT add extra sections):
1. Project Name:
Concept:
Frontend Modules:
Backend Modules:
AI/ML Modules:
API Integrations:
Expected Deliverables:

Rules:
- Generate ONE detailed plan only; do not create multiple versions.
- Include granular step-by-step development tasks for all modules.
- Frontend (Simple Apps):
  * Use HTML/CSS/JS for pages (Landing, Dashboard, Forms, Preview).
  * Include DOM logic, validation, events, rendering, and optional localStorage.
  * Specify which page handles each functionality.
  * Make UI responsive (desktop, tablet, mobile).
  * Use React only if clearly needed for component/state management.
  * Use Chart.js only if charts are required.
- Backend:
  * Use Flask or Django with SQL or MongoDB (auto-select best fit).
  * Include API endpoints (method + route + purpose).
  * Specify DB schema: tables/collections, fields, and roles (e.g., user, admin).
  * Include CRUD operations, authentication (JWT/Session), and data validation if needed.
- AI/ML: Include only if project requires predictions, pattern detection, recommendations, or automation.
- API Integrations: Include only if explicitly required.
- Output must be concise, practical, and fully buildable.
`;

    const messagesPayload = [
      { role: "system", content: systemInstruction },
      ...history.messages.slice(-20)
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: messagesPayload,
        max_tokens: 1800,
        temperature: 0.6
      })
    });

    const data = await response.json();
    let aiContent = data?.choices?.[0]?.message?.content || "";

    aiContent = aiContent.trim();

    // Append AI response to history
    history.messages.push({ role: "assistant", content: aiContent });
    history.messages = history.messages.slice(-20);

    await db.write();

    res.json({ response: aiContent });
  } catch (err) {
    console.error("fetchAIResponse Error:", err);
    res.status(500).json({ response: "Server error" });
  }
});
// Delete a specific user + AI message pair
app.post("/api/chat/delete", async (req, res) => {
  try {
    const { userId, userInput, aiResponse } = req.body;
    if (!userId || !userInput || !aiResponse) {
      return res.json({ success: false, message: "All fields required" });
    }

    await db.read();
    const history = db.data.chatHistory.find(h => h.userId === userId);
    if (!history) return res.json({ success: false, message: "No history found" });

    // Filter out the matching user-bot pair
    let deleted = false;
    for (let i = 0; i < history.messages.length; i++) {
      const msg = history.messages[i];
      if (msg.role === "user" && msg.content === userInput) {
        // Find next assistant message
        const botIndex = history.messages.slice(i + 1).findIndex(m => m.role === "assistant" && m.content === aiResponse);
        if (botIndex !== -1) {
          // Remove user and assistant messages
          history.messages.splice(i, botIndex + 2); 
          deleted = true;
          break;
        }
      }
    }

    if (!deleted) {
      return res.json({ success: false, message: "No matching history item found" });
    }

    await db.write();
    res.json({ success: true, message: "History item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//update user data
app.put("/api/users/update/:id", async (req, res) => {
  try {
    const { username, email, first_name, last_name } = req.body;
    await db.read();

    const user = db.data.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;

    await db.write();
    res.json({ success: true, user });
  } catch (err) {
    console.error("updateUser Error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});
//usage stats
app.get("/api/stats/:userId", async (req, res) => {
  try {
    await ensureDbStructure();
    await db.read();

    const totalPrompts = db.data.stats.totalPrompts || 0;
    const userPrompts = db.data.stats.messagesPerUser[req.params.userId] || 0;

    res.json({ totalPrompts, userPrompts });
  } catch (err) {
    console.error("stats Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});



app.listen(PORT, () =>
    console.log(`Backend running → http://localhost:${PORT}`)
); 