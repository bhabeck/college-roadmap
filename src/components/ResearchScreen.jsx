import { useState, useRef, useEffect } from "react";

const TIER_CONFIG = {
  tier1: { label: "Tier 1 — Best Fits",        style: "t1" },
  tier2: { label: "Tier 2 — Strong Pick",       style: "t2" },
  tier3: { label: "Tier 3 — Worth Knowing",     style: "t3" },
};

const DEMO_FLOW = [
  { delay: 700,  role: "ai",   text: "Great — I can see your top priorities. Quick question: when you say activities — mountains and hiking, beach and surf, or both?" },
  { delay: 200,  role: "user", text: "Definitely mountains. Hiking, camping, skiing." },
  { delay: 1200, role: "ai",   text: "Got it. For religion — institutional affiliation like Baptist or evangelical, or would strong campus ministry like Cru or RUF work?" },
  { delay: 200,  role: "user", text: "Ideally institutional, but strong campus ministry at a bigger school works too." },
  { delay: 1200, role: "ai",   text: "And athletics — what sport specifically?" },
  { delay: 200,  role: "user", text: "Lacrosse. D3 varsity ideally, established club is fine." },
  {
    delay: 1500, role: "ai",
    text: "Here's where I'd start — Grand Canyon University. Strongest institutional Christian culture I'd recommend, elite 2x national champion club lacrosse, and an organized outdoor rec program with the Grand Canyon, Sedona, and Flagstaff skiing on the calendar.",
    card: {
      name: "Grand Canyon University",
      location: "Phoenix, AZ · Sonoran Desert",
      lacrosse: "Club MCLA — 2x Nat'l Champs",
      laxType: "club",
      net: "~$22K/yr",
      size: "~25,000",
      ratings: { Activities: 4, Religion: 5, Athletics: 4, Academics: 3 },
      bottomLine: "Strongest Christian culture on the list. Elite club lacrosse. Grand Canyon and Sedona on the outdoor rec calendar.",
      tier: "tier1",
    },
  },
  {
    delay: 400, role: "ai",
    text: "Appalachian State is the other top pick — best raw outdoor setting close to home. Boone at 3,300 feet. Cru, RUF, and Campus Christian Fellowship all active on campus.",
    card: {
      name: "Appalachian State",
      location: "Boone, NC · Blue Ridge at 3,300 ft",
      lacrosse: "Club MCLA est. 1970s",
      laxType: "club",
      net: "~$43K OOS",
      size: "~19,000",
      ratings: { Activities: 5, Religion: 3, Athletics: 3, Academics: 3 },
      bottomLine: "Best mountain setting close to home. Robust campus ministry. Only 2.5 hrs from Atlanta.",
      tier: "tier1",
    },
  },
  {
    delay: 400, role: "ai",
    text: "And for lacrosse specifically — University of Lynchburg has the best D3 program of any Christian school I've found. 2015 national runner-up, players from Alpharetta and Roswell on the current roster.",
    card: {
      name: "University of Lynchburg",
      location: "Lynchburg, VA · Blue Ridge Mountains",
      lacrosse: "D3 Varsity — Best Program ★",
      laxType: "d3",
      net: "~$23K/yr",
      size: "~1,800",
      ratings: { Activities: 4, Religion: 4, Athletics: 5, Academics: 3 },
      bottomLine: "Best D3 lacrosse on the list. Most affordable private school. Players from Alpharetta already on the roster.",
      tier: "tier2",
    },
  },
];

export default function ResearchScreen({ pillars }) {
  const [activeTab, setActiveTab] = useState("research");
  const [messages, setMessages] = useState([]);
  const [cards, setCards] = useState({ tier1: [], tier2: [], tier3: [] });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const msgsRef = useRef(null);
  const demoRef = useRef(0);
  const demoStarted = useRef(false);

  useEffect(() => {
    if (demoStarted.current) return;
    demoStarted.current = true;
    // Kick off with a greeting that uses their actual pillars
    const pillarNames = pillars.slice(0, 3).map((p) => p.label).join(", ");
    setTimeout(() => {
      addMessage("ai", `Perfect — your top priorities are ${pillarNames}${pillars.length > 3 ? `, and ${pillars[3].label}` : ""}. Let me ask a couple quick questions to focus the search.`);
      runDemo();
    }, 600);
  }, []);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, typing]);

  function addMessage(role, text, card = null) {
    setMessages((prev) => [...prev, { role, text, card }]);
    if (card) {
      setCards((prev) => ({
        ...prev,
        [card.tier]: [...prev[card.tier], card],
      }));
    }
  }

  function runDemo() {
    const flow = DEMO_FLOW;
    function next() {
      const i = demoRef.current;
      if (i >= flow.length) return;
      demoRef.current++;
      const step = flow[i];
      if (step.role === "ai") {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          addMessage("ai", step.text, step.card || null);
          if (demoRef.current < flow.length) setTimeout(next, flow[demoRef.current].delay);
        }, step.delay);
      } else {
        setTimeout(() => {
          addMessage("user", step.text);
          if (demoRef.current < flow.length) setTimeout(next, flow[demoRef.current].delay);
        }, step.delay);
      }
    }
    setTimeout(next, DEMO_FLOW[0].delay);
  }

  function sendMsg() {
    if (!input.trim()) return;
    addMessage("user", input.trim());
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addMessage("ai", "Good question — in the live app I'd research that right now and surface new cards. Tap \"My List\" to see what we've found so far.");
    }, 1200);
  }

  const totalCards = Object.values(cards).flat().length;

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🗺️</div>
          <span style={s.logoText}>College <span style={s.logoAccent}>Roadmap</span></span>
        </div>
        <div style={s.tabs}>
          <button
            style={activeTab === "research" ? s.tabActive : s.tab}
            onClick={() => setActiveTab("research")}
          >Research</button>
          <button
            style={activeTab === "list" ? s.tabActive : s.tab}
            onClick={() => setActiveTab("list")}
          >
            My List
            {totalCards > 0 && (
              <span style={s.badge}>{totalCards}</span>
            )}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={s.body}>

        {/* LEFT — CHAT */}
        <div style={{ ...s.left, display: activeTab === "research" ? "flex" : "none" }}>
          <div style={s.messages} ref={msgsRef}>
            {messages.map((msg, i) => (
              <div key={i} style={msg.role === "user" ? s.msgUser : s.msgAI}>
                <div style={msg.role === "user" ? s.avUser : s.avAI}>
                  {msg.role === "ai" ? "🗺️" : "A"}
                </div>
                <div style={msg.role === "user" ? s.bubUser : s.bubAI}>
                  {msg.text}
                  {msg.card && (
                    <div style={s.cardPill} onClick={() => setActiveTab("list")}>
                      🃏 Card added — view list
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div style={s.msgAI}>
                <div style={s.avAI}>🗺️</div>
                <div style={s.bubAI}>
                  <TypingDots />
                </div>
              </div>
            )}
          </div>
          <div style={s.inputRow}>
            <input
              style={s.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              placeholder="Ask about schools, adjust priorities..."
            />
            <button style={s.sendBtn} onClick={sendMsg}>→</button>
          </div>
        </div>

        {/* RIGHT — CARDS */}
        <div style={{ ...s.right, display: activeTab === "list" ? "flex" : "none" }}>
          <div style={s.listHeader}>
            <div style={s.listTitle}>Your College List</div>
            <div style={s.listSub}>
              {totalCards === 0 ? "Schools appear here as we research" : `${totalCards} school${totalCards !== 1 ? "s" : ""} found`}
            </div>
          </div>
          <div style={s.cardsScroll}>
            {totalCards === 0 ? (
              <div style={s.empty}>
                📚<br /><br />
                Start the conversation and your colleges will appear here, organized by how well they match your priorities.
              </div>
            ) : (
              Object.entries(TIER_CONFIG).map(([tier, config]) =>
                cards[tier].length > 0 ? (
                  <div key={tier} style={s.tierSection}>
                    <div style={{ ...s.tierBadge, ...s[config.style] }}>{config.label}</div>
                    {cards[tier].map((card, i) => (
                      <SchoolCard key={i} card={card} />
                    ))}
                  </div>
                ) : null
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function SchoolCard({ card }) {
  const ratingColors = {
    Activities: "#4ade80",
    Religion:   "#60a5fa",
    Athletics:  "#fbbf24",
    Academics:  "#a78bfa",
  };

  return (
    <div style={sc.card}>
      <div style={sc.top}>
        <div>
          <div style={sc.name}>{card.name}</div>
          <div style={sc.loc}>{card.location}</div>
        </div>
        <span style={card.laxType === "d3" ? sc.laxD3 : sc.laxClub}>
          {card.lacrosse}
        </span>
      </div>
      <div style={sc.stats}>
        <div style={sc.stat}>
          <div style={sc.statLabel}>Est. Net/yr</div>
          <div style={sc.statVal}>{card.net}</div>
        </div>
        <div style={{ ...sc.stat, borderRight: "none" }}>
          <div style={sc.statLabel}>Size</div>
          <div style={sc.statVal}>{card.size}</div>
        </div>
      </div>
      <div style={sc.ratings}>
        {Object.entries(card.ratings).map(([label, val]) => (
          <div key={label} style={sc.ratingRow}>
            <span style={sc.ratingLabel}>{label}</span>
            <div style={sc.track}>
              <div style={{ ...sc.fill, width: `${val * 20}%`, background: ratingColors[label] || "#4ade80" }} />
            </div>
            <span style={sc.score}>{val}</span>
          </div>
        ))}
      </div>
      <div style={sc.bottomLine}>
        <strong>Bottom line:</strong> {card.bottomLine}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6, height: 6,
            borderRadius: "50%",
            background: "#7d8fa8",
            animation: "dotBounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`@keyframes dotBounce { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }`}</style>
    </span>
  );
}

// ── Page styles ──────────────────────────────────────────
const s = {
  page:       { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  header:     { background: "var(--bg-white)", borderBottom: "0.5px solid var(--border-light)", padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:       { display: "flex", alignItems: "center", gap: 10 },
  logoIcon:   { width: 30, height: 30, background: "var(--green-bg)", border: "0.5px solid var(--green-border)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  logoText:   { fontSize: 15, fontWeight: 500, color: "var(--text-page)" },
  logoAccent: { color: "var(--green)" },
  tabs:       { display: "flex", gap: 4 },
  tab:        { fontSize: 12, padding: "5px 12px", borderRadius: 7, border: "0.5px solid var(--border-light)", background: "transparent", color: "var(--text-muted-page)", cursor: "pointer", fontFamily: "inherit" },
  tabActive:  { fontSize: 12, padding: "5px 12px", borderRadius: 7, border: "0.5px solid var(--green-border)", background: "var(--green-bg)", color: "var(--green-text)", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  badge:      { marginLeft: 6, background: "var(--green-bg)", color: "var(--green-text)", border: "0.5px solid var(--green-border)", borderRadius: 999, padding: "1px 7px", fontSize: 11 },
  body:       { flex: 1, display: "flex", overflow: "hidden" },
  left:       { flex: 1, flexDirection: "column", background: "var(--bg-white)", overflow: "hidden" },
  right:      { flex: 1, flexDirection: "column", background: "var(--bg)", overflow: "hidden" },
  messages:   { flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 },
  msgAI:      { display: "flex", gap: 8, alignItems: "flex-start" },
  msgUser:    { display: "flex", gap: 8, alignItems: "flex-start", flexDirection: "row-reverse" },
  avAI:       { width: 28, height: 28, borderRadius: "50%", background: "var(--green-bg)", border: "0.5px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 },
  avUser:     { width: 28, height: 28, borderRadius: "50%", background: "var(--bg)", border: "0.5px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "var(--text-muted-page)", flexShrink: 0 },
  bubAI:      { maxWidth: "85%", padding: "9px 12px", background: "var(--bg)", border: "0.5px solid var(--border-light)", borderRadius: "2px 12px 12px 12px", fontSize: 13, lineHeight: 1.6, color: "var(--text-page)" },
  bubUser:    { maxWidth: "85%", padding: "9px 12px", background: "var(--green-bg)", border: "0.5px solid var(--green-border)", borderRadius: "12px 2px 12px 12px", fontSize: 13, lineHeight: 1.6, color: "var(--green-text)" },
  cardPill:   { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 10px", background: "var(--bg-white)", border: "0.5px solid var(--border-light)", borderRadius: 6, fontSize: 11, color: "var(--text-muted-page)", cursor: "pointer" },
  inputRow:   { padding: "10px 14px", borderTop: "0.5px solid var(--border-light)", background: "var(--bg-white)", display: "flex", gap: 8, alignItems: "center" },
  input:      { flex: 1, background: "var(--bg)", border: "0.5px solid var(--border-light)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text-page)", fontFamily: "inherit", outline: "none" },
  sendBtn:    { width: 34, height: 34, borderRadius: 8, background: "var(--green)", border: "none", color: "#ffffff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" },
  listHeader: { padding: "12px 14px", background: "var(--bg-white)", borderBottom: "0.5px solid var(--border-light)" },
  listTitle:  { fontSize: 14, fontWeight: 500, color: "var(--text-page)", marginBottom: 2 },
  listSub:    { fontSize: 12, color: "var(--text-muted-page)" },
  cardsScroll:{ flex: 1, overflowY: "auto", padding: "10px 12px" },
  empty:      { padding: "40px 20px", textAlign: "center", fontSize: 13, color: "var(--text-muted-page)", lineHeight: 1.7 },
  tierSection:{ marginBottom: 8 },
  tierBadge:  { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, padding: "3px 10px", borderRadius: 6, display: "inline-block", marginBottom: 8 },
  t1: { background: "var(--green-bg)", border: "0.5px solid var(--green-border)", color: "var(--green-text)" },
  t2: { background: "#dbeafe", border: "0.5px solid #93c5fd", color: "#1e40af" },
  t3: { background: "#fef3c7", border: "0.5px solid #fcd34d", color: "#92400e" },
};

// ── Card styles ──────────────────────────────────────────
const sc = {
  card:        { background: "var(--card)", border: "1px solid var(--border-dark)", borderRadius: 12, marginBottom: 10, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" },
  top:         { padding: "10px 12px 8px", background: "var(--card2)", borderBottom: "0.5px solid var(--border-dark)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  name:        { fontSize: 13, fontWeight: 500, color: "var(--text-card)" },
  loc:         { fontSize: 11, color: "var(--text-muted-card)", marginTop: 2 },
  laxD3:       { fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0, background: "rgba(46,160,67,0.2)", border: "0.5px solid rgba(46,160,67,0.4)", color: "#4ade80" },
  laxClub:     { fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0, background: "rgba(210,153,34,0.2)", border: "0.5px solid rgba(210,153,34,0.4)", color: "#fbbf24" },
  stats:       { display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "0.5px solid var(--border-dark)" },
  stat:        { padding: "7px 11px", borderRight: "0.5px solid var(--border-dark)" },
  statLabel:   { fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-muted-card)", marginBottom: 2 },
  statVal:     { fontSize: 12, fontWeight: 500, color: "var(--text-card)" },
  ratings:     { padding: "9px 11px" },
  ratingRow:   { display: "flex", alignItems: "center", gap: 7, marginBottom: 6 },
  ratingLabel: { fontSize: 11, color: "var(--text-muted-card)", width: 68, flexShrink: 0 },
  track:       { flex: 1, height: 5, background: "var(--text-dim-card)", borderRadius: 999, overflow: "hidden" },
  fill:        { height: "100%", borderRadius: 999 },
  score:       { fontSize: 11, fontWeight: 500, color: "var(--text-card)", width: 14, textAlign: "right" },
  bottomLine:  { padding: "7px 11px 10px", borderTop: "0.5px solid var(--border-dark)", background: "var(--card3)", fontSize: 11, color: "var(--text-muted-card)", lineHeight: 1.55 },
};