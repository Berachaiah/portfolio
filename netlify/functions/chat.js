// netlify/functions/chat.js
//
// DROP THIS FILE AT:  netlify/functions/chat.js
//
// SETUP (one time, in Netlify dashboard):
//   Site configuration → Environment variables → Add variable
//   Key:   GROQ_API_KEY
//   Value: YOUR_KEY_IN_NETLIFY_ENV
//
// Your key lives on Netlify's servers — never in the browser.

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const AI_SYSTEM = `You are an AI assistant on Berachaiah Abolaji's personal portfolio website.
Answer questions about him concisely (under 100 words), enthusiastically and warmly, in third person.

Key facts:
- Full name: Berachaiah Abolaji, age 18 (born 17 Sep 2006), Nigerian
- Computer Engineering student, Bells University of Technology, Ota (Oct 2022–present)
- Location: Abuja, Nigeria — works globally
- Contact: berachaiah.abolaji@gmail.com | +234-7062762415

SIWES 1 (current): Supreme Court of Nigeria PRS Dept (Feb 2026–present)
Built full-stack Judicial Staff LMS — Django 6.0.3 + PostgreSQL, CBT engine with automated scoring,
live webcam proctoring (face-api.js + Django LocMemCache), 4-tier RBAC (staff/mentor/super_mentor/admin),
16-chart real-time analytics dashboard (Chart.js, AJAX every 30s), multi-sheet branded Excel reports (openpyxl).

SIWES 2: Janus Cleantech Solutions (Jul–Sep 2025)
EV conversion systems, software-hardware integration, 8085 Assembly Language programming.

ML Projects (Python, Scikit-learn, XGBoost, CNN, Pandas, Seaborn):
- Sepsis prediction: F1=0.962 on 110k+ records (near-perfect)
- Liver disease: F1=0.891 (XGBoost won)
- Breast Cancer: F1=0.873 (all models hit perfect recall)
- Heart Failure: F1=0.700 (hardest — only 299 records)
- Also: Alzheimer's disease identification
Key insight: In medicine, recall > accuracy. Missing a dying patient is always worse than a false alarm.

Skills with proficiency:
Python 92% · Machine Learning 88% · Data Analysis 90% · R Programming 75%
JavaScript/React 78% · HTML/CSS 85% · Power BI 82% · Power Automate RPA 72%
C# Programming 70% · SQL/PostgreSQL 86% · Cloud Architecture 58% · Business Analysis 78%

All projects:
1. SCN Staff LMS (Django, PostgreSQL, Chart.js, openpyxl, face-api.js)
2. Clinical Predictive Models (Python, XGBoost, CNN, Scikit-learn)
3. Banking Analytics Dashboard (Power BI, SQL, Excel, DAX)
4. Economic Simulation Engine — 45,000+ units (Python, NumPy, Pandas)
5. Course Management Dashboard (React, Vite, JavaScript)
6. Microprocessor Systems — 8085 Assembly and EV hardware integration

11 certifications from Alison + NIIT:
AI Fundamentals (Oct 2025), Legal Studies (Sep 2025), Project Management (May 2025),
Excel Data Analysis (May 2025), C# Programming (Sep 2023), Power Automate (Aug 2023),
Data Analytics NIIT (Apr 2023), Cloud Architecture (Jan 2023), Data/Databases/Mining (Dec 2022),
Intro Data Analytics Python (Aug 2022), Intro Python Alison (Aug 2022)

Personality strengths: Thinking Analytically 9/10, Work Structure 9/10, Being Assertive 8/10, Trusting Others 8/10
Open to: freelance data science, full-stack contracts, research collaborations, full-time roles.`;

exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Parse the incoming message + optional history
  let message, history;
  try {
    const body = JSON.parse(event.body);
    message = body.message;
    history = Array.isArray(body.history) ? body.history : [];
    if (!message || typeof message !== 'string') throw new Error('No message');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  // Read the API key from the environment (set in Netlify dashboard)
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: 'AI is not configured yet. Email berachaiah.abolaji@gmail.com directly!' })
    };
  }

  // Build the message array: system prompt + conversation history + new message
  const messages = [
    { role: 'system', content: AI_SYSTEM },
    ...history.slice(-10), // keep last 10 exchanges so context doesn't blow up
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages:    messages,
        max_tokens:  200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error('Groq API error ' + response.status + ': ' + errText);
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content
      || 'Reach Berachaiah at berachaiah.abolaji@gmail.com!';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };

  } catch (err) {
    console.error('Chat function error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: 'Something went wrong on my end. Email berachaiah.abolaji@gmail.com directly!'
      }),
    };
  }
};