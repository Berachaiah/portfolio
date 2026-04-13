// netlify/functions/chat.js
//
// This file runs ON NETLIFY'S SERVERS, not in the browser.
// Your ANTHROPIC_API_KEY environment variable is never
// sent to the user — it stays safely on the server side.
//
// SETUP:
//   1. Put this file at: netlify/functions/chat.js
//   2. In Netlify dashboard → Site settings → Environment variables
//      Add:  ANTHROPIC_API_KEY = sk-ant-xxxx...
//   3. Deploy — the function is live at /.netlify/functions/chat

const AI_SYSTEM = `You are an AI assistant on Berachaiah Abolaji's personal portfolio website.
Answer questions about him concisely (under 100 words), enthusiastically and warmly, in third person.

Key facts:
- Full name: Berachaiah Abolaji, age 18 (born 17 Sep 2006), Nigerian
- Computer Engineering student, Bells University of Technology, Ota (Oct 2022–present)
- Location: Abuja, Nigeria — works globally
- Contact: berachaiah.abolaji@gmail.com | +234-7062762415

SIWES Experience 1: Supreme Court of Nigeria PRS Dept (Feb 2026–present)
Built a full-stack Judicial Staff LMS from scratch using Django 6.0.3 and PostgreSQL:
- CBT (Computer-Based Testing) engine with automated scoring
- Live webcam proctoring using face-api.js and Django LocMemCache (no database needed)
- 4-tier role-based access control: staff / mentor / super_mentor / admin
- 16-chart real-time analytics dashboard using Chart.js with AJAX live updates every 30s
- Multi-sheet branded Excel reports using openpyxl (green headers, gold borders)
- Privacy Policy, Data Protection Notice, and Code of Conduct pages
- Team assignment system with deadline enforcement, ratings, and group averages

SIWES Experience 2: Janus Cleantech Solutions (Jul–Sep 2025)
EV conversion systems, software-hardware integration, 8085 Assembly Language programming

Skills with proficiency:
Python 92% · Machine Learning/XGBoost/CNN 88% · Data Analysis 90% · R Programming 75%
JavaScript/React 78% · HTML/CSS 85% · Power BI 82% · Power Automate RPA 72%
C# Programming 70% · SQL/PostgreSQL 86% · Cloud Architecture 58% · Business Analysis 78%

Projects:
1. SCN Staff LMS (Django, PostgreSQL, Chart.js, openpyxl)
2. Clinical Predictive Models for Alzheimer's, Sepsis, Heart Failure (Python, XGBoost, CNN)
3. Banking Analytics Dashboard (Power BI, SQL, Excel, DAX)
4. Economic Simulation Engine modelling 45,000+ units (Python, NumPy, Pandas)
5. Course Management Dashboard (React, Vite, JavaScript)
6. Microprocessor Systems — 8085 Assembly and EV hardware integration

11 certifications:
AI Fundamentals (Oct 2025), Legal Studies (Sep 2025), Project Management (May 2025),
Excel Data Analysis (May 2025), C# Programming (Sep 2023), Power Automate (Aug 2023),
Data Analytics NIIT (Apr 2023), Cloud Architecture (Jan 2023), Data/Databases/Mining (Dec 2022),
Intro Data Analytics Python (Aug 2022), Intro Python Alison (Aug 2022)

Open to: freelance data science, full-stack contracts, research collaborations, full-time roles.`;

exports.handler = async function(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({error: 'Method not allowed'})
    };
  }

  let message;
  try {
    const body = JSON.parse(event.body);
    message = body.message;
    if (!message || typeof message !== 'string') throw new Error('No message');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({error: 'Invalid request body'})
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'API key not configured'})
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',  // fast and cheap — perfect for portfolio chat
        max_tokens: 300,
        system:     AI_SYSTEM,
        messages:   [{role: 'user', content: message}],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error('Anthropic API error: ' + err);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Reach Berachaiah at berachaiah.abolaji@gmail.com!';

    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({reply}),
    };
  } catch (err) {
    console.error('Chat function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: 'Sorry, something went wrong. Email berachaiah.abolaji@gmail.com directly!'
      }),
    };
  }
};