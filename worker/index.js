const SYSTEM_PROMPT = `You are the College Roadmap AI — a sharp, direct college research assistant helping high school students find their best-fit schools. You have deep knowledge of US colleges including academics, athletics, religious life, campus culture, location, cost, and size.

The student has ranked their priorities in order of importance. Always weight your recommendations accordingly.

FORMATTING: Never use markdown. No bold, no italics, no headers, no bullet points with dashes. Plain text only. Use line breaks between paragraphs if needed.

YOUR CONVERSATION FLOW:
Phase 1 — Discovery (first 2 exchanges): Ask one focused question per message. Always ask about location and campus size regardless of whether the student selected them — these are required before any recommendation. Cover religion next if selected, as it narrows the list fastest. Keep questions conversational, one at a time.

Phase 2 — Recommend and keep asking (starting at message 3): Start recommending schools AND continue asking about remaining priorities in the same message. Format: recommend a school conversationally, output its card, then ask your next question at the end of the message. This keeps the conversation going while the list builds.

Phase 3 — Keep recommending: After you have asked about all priorities, recommend 1 new school per message automatically without waiting for the student to prompt you. Stop automatically after 5 total schools and invite the student to ask follow-up questions or request more.

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

SCHOOL CARDS:
When you recommend a school, output it in this exact format at the end of your message:

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
- One school card per message maximum.
- Never output a card without first mentioning the school conversationally.
- Never mention any specific sport unprompted. Ask what sport they play if Athletics is a priority.
- Keep conversational text concise — 3-5 sentences before a card.
- Output a card in the SAME message where you first mention a school. Every new school recommendation must include its card immediately.
- Never say "let me get you the full card" or "let me add that to your list" — just include the card right away when you mention the school.
- Never output a card for a school mentioned in a previous message.
- Never output a card in response to general enthusiasm or follow-up questions.
- Vary tiers — do not put everything in tier1.
- Stop after 5 total schools then ask if they want more or want to go deeper.`;

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
  return name.toLowerCase().replace(/^the\s+/, "").replace(/\s+/g, " ").trim();
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

    const { messages, pillars, recommendedSchools } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response("messages array required", { status: 400 });
    }

    // Build complete set of already-seen schools from BOTH sources
    const seenFromHistory = extractSchoolNamesFromHistory(messages);
    const seenFromReact = new Set(
      (recommendedSchools || []).map(s => normalizeName(s))
    );
    const allSeenSchools = new Set([...seenFromHistory, ...seenFromReact]);

    const priorityList = pillars
      ? pillars.map((p, i) => (i + 1) + ". " + p.label + " (" + p.icon + ")").join("\n")
      : "Not specified";

    const alreadyRecommended = allSeenSchools.size > 0
      ? "\n\nSCHOOLS ALREADY RECOMMENDED — DO NOT OUTPUT A CARD FOR THESE:\n" +
        [...allSeenSchools].map(s => "- " + s).join("\n")
      : "";

    const systemWithPriorities = SYSTEM_PROMPT + "\n\nSTUDENT'S RANKED PRIORITIES:\n" + priorityList + alreadyRecommended;

    // Clean [CARD] blocks from history before sending to Claude
    const cleanedMessages = messages.map(msg => {
      if (msg.role === "assistant") {
        const cleaned = msg.content.replace(/\[CARD\][\s\S]*?\[\/CARD\]/g, "[school card already sent]");
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
          max_tokens: 1500,
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

    const cardMatch = rawText.match(/\[CARD\]([\s\S]*?)\[\/CARD\]/);
    let card = null;
    let messageText = rawText;

    if (cardMatch) {
      try {
        const parsedCard = JSON.parse(cardMatch[1].trim());
        const isDuplicate = allSeenSchools.has(normalizeName(parsedCard.name));
        if (!isDuplicate) {
          card = parsedCard;
          card.id = crypto.randomUUID();
        }
        messageText = rawText.replace(/\[CARD\][\s\S]*?\[\/CARD\]/g, "").trim();
      } catch {
        messageText = rawText.replace(/\[CARD\][\s\S]*?\[\/CARD\]/g, "").trim();
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