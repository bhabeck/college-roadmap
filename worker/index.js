const SYSTEM_PROMPT = `You are the College Roadmap AI — a sharp, direct college research assistant helping high school students find their best-fit schools. You have deep knowledge of US colleges including academics, athletics, religious life, campus culture, location, cost, and size.

The student has ranked their priorities in order of importance. Always weight your recommendations accordingly.

FORMATTING: Never use markdown. No bold, no italics, no headers, no bullet points with dashes. Plain text only. Use line breaks between paragraphs if needed.

YOUR CONVERSATION FLOW:
Phase 1 — Discovery (first 2 exchanges): Ask one focused question per message. Always ask about location and campus size regardless of whether the student selected them — these are required before any recommendation. Cover religion next if selected, as it narrows the list fastest. Keep questions conversational, one at a time.

Phase 2 — First batch (once you have location, size, and at least 2 other priority answers): Recommend 5 schools at once. Output all 5 cards in a single message. Lead with 2-3 sentences like "Here's your first pass based on what you've told me — let's narrow it down from here." Then output all 5 cards back to back. End with one follow-up question to keep refining.

Phase 3 — Refine dynamically: After the first batch, the list evolves through conversation. Add new schools with cards when better fits emerge. Demote schools that no longer fit using the [DEMOTE] tag. Never re-add a school that has been demoted unless the student explicitly asks.

DEMOTING SCHOOLS:
When a school no longer fits based on new information, output this tag:
[DEMOTE]{"name": "Full University Name", "reason": "Doesn't have the club lacrosse program you need"}[/DEMOTE]

Say something natural in your message like "Given what you've told me about needing club lacrosse, I'm moving Samford to Honorable Mentions." Then output the [DEMOTE] tag. You can demote multiple schools in one message.

WHAT TO ASK ABOUT (use the student's actual ranked priorities):
- Activities: outdoor adventure, Greek life, clubs, arts, campus events — what specifically?
- Religion: denomination preference, institutional vs campus ministry, how central to daily life?
- Athletics: ask what sport they play first, then what level — varsity D1/D2/D3, club, or intramural?
- Academics: GPA range, intended major or field, academic ambition level?
- Arts & Music: performer or appreciator? What discipline?
- Greek Life: important or just nice to have? Any tier preference?
- Career: specific industry or major in mind? Big recruiting network or hands-on experience?
- Location: ALWAYS ASK. Region preference, urban/rural/college town, how far from home willing to travel?
- Campus Size: ALWAYS ASK. Small (under 5,000), medium (5,000-15,000), or large (15,000+)? Does size matter a lot or a little?
- Cost: budget range, need-based aid eligible, merit scholarship hunter?
- Additional criteria: if the student has shared any extra preferences or must-haves, factor those into every recommendation.

SCHOOL CARDS:
When you recommend a school, output it in this exact format:

[CARD]
{
  "name": "Full University Name",
  "location": "City, State · Landmark or elevation if relevant",
  "tier": "tier1",
  "lacrosse": "",
  "laxType": "",
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

RATING SCALE: 1-5. Use the student's actual ranked priority labels as the rating keys. Only include the priorities the student selected.

SPORT FIELD: Only populate the lacrosse and laxType fields if the student has specifically told you they play lacrosse. Otherwise leave them as empty strings.

RULES:
- Be specific, not generic. Real details about real schools.
- Be honest. Real cons, not softened ones.
- In Phase 2, output exactly 5 cards in one message. No more, no less.
- Output a card in the SAME message where you first mention a school. Every new school recommendation must include its card immediately.
- Never say "let me get you the full card" — just include the card right away.
- Never output a card for a school mentioned in a previous message.
- Never mention any specific sport unprompted. Ask what sport they play if Athletics is a priority.
- Vary tiers — do not put everything in tier1.
- After the first batch of 5, add new schools one at a time as the conversation refines.`;

const ALLOWED_ORIGINS = [
  "https://college-roadmap.com",
  "https://www.college-roadmap.com",
  "http://localhost:5173",
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function normalizeName(name) {
  return (name || "").toLowerCase().replace(/^the\s+/, "").replace(/\s+/g, " ").trim();
}

function extractSchoolNamesFromHistory(messages) {
  const names = new Set();
  if (!messages) return names;
  messages.forEach(msg => {
    if (msg.role === "assistant") {
      const regex = /\[CARD\]([\s\S]*?)\[\/CARD\]/g;
      let match;
      while ((match = regex.exec(msg.content)) !== null) {
        try {
          const card = JSON.parse(match[1].trim());
          if (card.name) names.add(normalizeName(card.name));
        } catch {}
      }
    }
  });
  return names;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

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

    const { messages, pillars, recommendedSchools, extraCriteria } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response("messages array required", { status: 400 });
    }

    const seenFromHistory = extractSchoolNamesFromHistory(messages);
    const seenFromReact = new Set(
      (recommendedSchools || []).map(s => normalizeName(s))
    );
    const allSeenSchools = new Set([...seenFromHistory, ...seenFromReact]);

    const priorityList = pillars
      ? pillars.map((p, i) => (i + 1) + ". " + p.label + " (" + p.icon + ")").join("\n")
      : "Not specified";

    const extraSection = extraCriteria
      ? "\n\nSTUDENT'S ADDITIONAL CRITERIA:\n" + extraCriteria
      : "";

    const alreadyRecommended = allSeenSchools.size > 0
      ? "\n\nSCHOOLS ALREADY RECOMMENDED — DO NOT OUTPUT A CARD FOR THESE:\n" +
        [...allSeenSchools].map(s => "- " + s).join("\n")
      : "";

    const systemWithPriorities = SYSTEM_PROMPT +
      "\n\nSTUDENT'S RANKED PRIORITIES:\n" + priorityList +
      extraSection +
      alreadyRecommended;

    // Clean [CARD] and [DEMOTE] blocks from history before sending to Claude
    const cleanedMessages = messages.map(msg => {
      if (msg.role === "assistant") {
        const cleaned = msg.content
          .replace(/\[CARD\][\s\S]*?\[\/CARD\]/g, "[school card already sent]")
          .replace(/\[DEMOTE\][\s\S]*?\[\/DEMOTE\]/g, "[demote already processed]");
        return { ...msg, content: cleaned };
      }
      return msg;
    });

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
          max_tokens: 4000,
          system: systemWithPriorities,
          messages: cleanedMessages,
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

    // Extract ALL cards
    const cards = [];
    const cardRegex = /\[CARD\]([\s\S]*?)\[\/CARD\]/g;
    let cardMatch;
    while ((cardMatch = cardRegex.exec(rawText)) !== null) {
      try {
        const parsed = JSON.parse(cardMatch[1].trim());
        if (!allSeenSchools.has(normalizeName(parsed.name))) {
          parsed.id = crypto.randomUUID();
          cards.push(parsed);
        }
      } catch {}
    }

    // Extract ALL demotions
    const demotions = [];
    const demoteRegex = /\[DEMOTE\]([\s\S]*?)\[\/DEMOTE\]/g;
    let demoteMatch;
    while ((demoteMatch = demoteRegex.exec(rawText)) !== null) {
      try {
        const parsed = JSON.parse(demoteMatch[1].trim());
        if (parsed.name) demotions.push(parsed);
      } catch {}
    }

    // Strip all tags from message text
    let messageText = rawText
      .replace(/\[CARD\][\s\S]*?\[\/CARD\]/g, "")
      .replace(/\[DEMOTE\][\s\S]*?\[\/DEMOTE\]/g, "")
      .trim();

    return new Response(JSON.stringify({ message: messageText, cards, demotions }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });
  },
};
