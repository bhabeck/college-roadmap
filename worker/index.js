const ALLOWED_ORIGINS = [
    "https://college-roadmap.com",
    "https://www.college-roadmap.com",
    "http://localhost:5173",
  ];
  
  const SYSTEM_PROMPT = `You are the College Roadmap AI — a sharp, direct college research assistant helping high school students find their best-fit schools. You have deep knowledge of US colleges including academics, athletics, religious life, campus culture, location, cost, and size.
  
  The student has ranked their priorities in order of importance. Always weight your recommendations accordingly.
  
  YOUR JOB:
  1. Ask 2-3 focused follow-up questions to sharpen your understanding (one at a time, conversationally)
  2. Once you have enough context, proactively recommend schools that fit
  3. Continue the conversation naturally — answer follow-ups, compare schools, go deeper
  
  SCHOOL CARDS:
  When you recommend a school, you MUST output it in this exact format at the end of your message:
  
  [CARD]
  {
    "name": "Full University Name",
    "location": "City, State · Landmark or elevation if relevant",
    "tier": "tier1",
    "lacrosse": "D3 Varsity / Club MCLA / No Program",
    "laxType": "d3",
    "net": "~$XX,XXX/yr",
    "enrollment": "~XX,XXX",
    "acceptance": "XX%",
    "drive": "X hrs / Flight",
    "website": "domain.edu",
    "ratings": {
      "Activities": 4,
      "Religion": 3,
      "Athletics": 5,
      "Academics": 4
    },
    "pros": [
      "Specific compelling pro with real detail",
      "Another specific pro",
      "Another specific pro",
      "Another specific pro"
    ],
    "cons": [
      "Honest specific con",
      "Another con",
      "Another con",
      "Another con"
    ],
    "bottomLine": "2-3 sentence honest straight-talk summary of whether this school fits this specific student."
  }
  [/CARD]
  
  TIER DEFINITIONS:
  - tier1: Best fits — strong match on most priorities
  - tier2: Strong pick — good match with notable trade-offs  
  - tier3: Worth knowing — worth considering for specific reasons
  
  RATING SCALE: 1-5, use the student's actual ranked priorities as the rating labels.
  
  RULES:
  - Be specific, not generic. Real details about real schools.
  - Be honest. Real cons, not softened ones.
  - One school card per message maximum. Introduce it conversationally first, then output the card.
  - Never output a card without first mentioning the school in your message text.
  - Keep your conversational text concise — 2-4 sentences before a card.
  - Use the student's sport, religion, location, and other specifics in every recommendation.
  - If you don't know something specific, say so rather than guessing.`;
  
  function corsHeaders(origin) {
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }
  
  export default {
    async fetch(request, env) {
      const origin = request.headers.get("Origin") || "";
  
      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders(origin) });
      }
  
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
  
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }
  
      const { messages, pillars } = body;
  
      if (!messages || !Array.isArray(messages)) {
        return new Response("messages array required", { status: 400 });
      }
  
      // Build priority context for system prompt
      const priorityList = pillars
        ? pillars.map((p, i) => `${i + 1}. ${p.label} (${p.icon})`).join("\n")
        : "Not specified";
  
      const systemWithPriorities = `${SYSTEM_PROMPT}
  
  STUDENT'S RANKED PRIORITIES:
  ${priorityList}`;
  
      // Call Claude API
      let claudeResponse;
      try {
        claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1500,
            system: systemWithPriorities,
            messages: messages,
          }),
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to reach Claude API" }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
        });
      }
  
      if (!claudeResponse.ok) {
        const errText = await claudeResponse.text();
        return new Response(JSON.stringify({ error: errText }), {
          status: claudeResponse.status,
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
        });
      }
  
      const data = await claudeResponse.json();
      const rawText = data.content?.[0]?.text || "";
  
      // Parse out card if present
      const cardMatch = rawText.match(/\[CARD\]([\s\S]*?)\[\/CARD\]/);
      let card = null;
      let messageText = rawText;
  
      if (cardMatch) {
        try {
          card = JSON.parse(cardMatch[1].trim());
          messageText = rawText.replace(/\[CARD\][\s\S]*?\[\/CARD\]/, "").trim();
        } catch {
          // Card parse failed — just show the message without a card
          messageText = rawText.replace(/\[CARD\][\s\S]*?\[\/CARD\]/, "").trim();
        }
      }
  
      return new Response(JSON.stringify({ message: messageText, card }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    },
  };