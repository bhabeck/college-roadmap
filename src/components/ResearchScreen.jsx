import { useState, useRef, useEffect } from "react";

const WORKER_URL = "https://college-roadmap-worker.it-e1f.workers.dev";

const TIER_CONFIG = {
  tier1: { label: "Tier 1 — Best Fits",     style: "t1" },
  tier2: { label: "Tier 2 — Strong Pick",   style: "t2" },
  tier3: { label: "Tier 3 — Worth Knowing", style: "t3" },
};

export default function ResearchScreen({ pillars }) {
  const [activeTab, setActiveTab] = useState("research");
  const [messages, setMessages] = useState([]);
  const [cards, setCards] = useState({ tier1: [], tier2: [], tier3: [] });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef(null);
  const historyRef = useRef([]); // Claude message history
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startConversation();
  }, []);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  function addMessage(role, text, card = null) {
    setMessages((prev) => [...prev, { role, text, card }]);
    if (card) {
      const tier = card.tier || "tier2";
      setCards((prev) => ({
        ...prev,
        [tier]: [...(prev[tier] || []), { ...card, index: Object.values(prev).flat().length }],
      }));
    }
  }

  async function callWorker(userMessage) {
    // Add user message to history
    historyRef.current = [...historyRef.current, { role: "user", content: userMessage }];

    setLoading(true);
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current,
          pillars: pillars,
        }),
      });

      if (!res.ok) throw new Error(`Worker error: ${res.status}`);

      const data = await res.json();
      const { message, card } = data;

      // Add assistant response to history
      historyRef.current = [...historyRef.current, { role: "assistant", content: message }];

      setLoading(false);
      addMessage("ai", message, card || null);
    } catch (err) {
      setLoading(false);
      addMessage("ai", "Sorry, something went wrong reaching the AI. Try again in a moment.");
    }
  }

  async function startConversation() {
    const priorityNames = pillars.map((p) => p.label).join(", ");
    const openingMessage = `My top priorities in order are: ${priorityNames}. I'm ready to find my college.`;
    await callWorker(openingMessage);
  }

  async function sendMsg() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    addMessage("user", text);
    await callWorker(text);
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
            {totalCards > 0 && <span style={s.badge}>{totalCards}</span>}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={s.body}>

        {/* CHAT */}
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
                      🃏 Added to your list — tap to view
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={s.msgAI}>
                <div style={s.avAI}>🗺️</div>
                <div style={s.bubAI}><TypingDots /></div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={s.inputArea}>
            {totalCards > 0 && (
              <button style={s.viewListBtn} onClick={() => setActiveTab("list")}>
                View My List — {totalCards} school{totalCards !== 1 ? "s" : ""} found →
              </button>
            )}
            <div style={s.inputRow}>
              <input
                style={s.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                placeholder="Ask about schools, adjust priorities..."
                disabled={loading}
              />
              <button style={{ ...s.sendBtn, opacity: loading ? 0.5 : 1 }} onClick={sendMsg} disabled={loading}>
                &#8594;
              </button>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div style={{ ...s.right, display: activeTab === "list" ? "flex" : "none" }}>
          <div style={s.listHeader}>
            <div style={s.listTitle}>Your College List</div>
            <div style={s.listSub}>
              {totalCards === 0
                ? "Schools appear here as we research"
                : `${totalCards} school${totalCards !== 1 ? "s" : ""} found`}
            </div>
          </div>
          <div style={s.cardsScroll}>
            {totalCards === 0 ? (
              <div style={s.empty}>
                📚<br /><br />
                Start the conversation and your colleges will appear here.
              </div>
            ) : (
              Object.entries(TIER_CONFIG).map(([tier, config]) =>
                cards[tier] && cards[tier].length > 0 ? (
                  <div key={tier} style={s.tierSection}>
                    <div style={{ ...s.tierBadge, ...s[config.style] }}>
                      {config.label}
                    </div>
                    {cards[tier].map((card, i) => (
                      <SchoolCard key={i} card={card} pillars={pillars} />
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

function SchoolCard({ card, pillars }) {
  const ratingColors = [
    "#3b82f6", "#a78bfa", "#fbbf24", "#34d399", "#f87171",
  ];

  const ratingLabels = pillars ? pillars.map((p) => p.label) : Object.keys(card.ratings || {});

  return (
    <div style={sc.card}>
      <div style={sc.top}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={sc.num}>{String((card.index || 0) + 1).padStart(2, "0")}</div>
          <div style={sc.name}>{card.name}</div>
          <div style={sc.loc}>{card.location}</div>
        </div>
        {card.lacrosse && (
          <span style={card.laxType === "d3" ? sc.laxD3 : sc.laxClub}>
            {card.lacrosse}
          </span>
        )}
      </div>

      <div style={sc.statsStrip}>
        <div style={sc.stat}>
          <div style={sc.statLbl}>Enrollment</div>
          <div style={sc.statVal}>{card.enrollment || "—"}</div>
        </div>
        <div style={{ ...sc.stat, borderRight: "none" }}>
          <div style={sc.statLbl}>Est. Net/yr</div>
          <div style={sc.statVal}>{card.net || "—"}</div>
        </div>
        <div style={sc.stat}>
          <div style={sc.statLbl}>Acceptance</div>
          <div style={sc.statVal}>{card.acceptance || "—"}</div>
        </div>
        <div style={{ ...sc.stat, borderRight: "none", borderTop: "0.5px solid #2a3347" }}>
          <div style={sc.statLbl}>Drive</div>
          <div style={sc.statVal}>{card.drive || "—"}</div>
        </div>
      </div>

      {card.ratings && (
        <div style={sc.ratingsBlock}>
          {Object.entries(card.ratings).map(([label, val], i) => (
            <div key={label} style={sc.ratingRow}>
              <span style={sc.ratingLabel}>{label}</span>
              <div style={sc.track}>
                <div style={{
                  ...sc.fill,
                  width: `${val * 20}%`,
                  background: ratingColors[i % ratingColors.length],
                }} />
              </div>
              <span style={sc.score}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {card.pros && (
        <div style={sc.prosBlock}>
          <div style={sc.prosLabel}>✓ PROS</div>
          {card.pros.map((p, i) => (
            <div key={i} style={sc.pcItem}>
              <span style={sc.prosDot}>•</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      )}

      {card.cons && (
        <div style={sc.consBlock}>
          <div style={sc.consLabel}>✗ CONS</div>
          {card.cons.map((c, i) => (
            <div key={i} style={sc.pcItem}>
              <span style={sc.consDot}>•</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}

      {card.bottomLine && (
        <div style={sc.bottomLine}>
          <strong style={{ color: "#e8edf5", fontWeight: 500 }}>Bottom line:</strong>{" "}
          {card.bottomLine}
        </div>
      )}

      {card.website && (
        <div style={sc.footer}>
          <a href={`https://${card.website}`} target="_blank" rel="noreferrer" style={sc.link}>
            {card.website}
          </a>
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#7d8fa8",
          animation: "dotBounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`,
          display: "inline-block",
        }} />
      ))}
      <style>{`@keyframes dotBounce{0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
    </span>
  );
}

const s = {
  page:        { minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column" },
  header:      { background: "#161b26", borderBottom: "0.5px solid #2a3347", padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  logo:        { display: "flex", alignItems: "center", gap: 10 },
  logoIcon:    { width: 26, height: 26, background: "#3b82f6", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  logoText:    { fontSize: 14, fontWeight: 500, color: "#e8edf5", letterSpacing: "-0.3px" },
  logoAccent:  { color: "#3b82f6" },
  tabs:        { display: "flex" },
  tab:         { fontSize: 13, padding: "8px 14px", border: "none", borderBottom: "2px solid transparent", background: "transparent", color: "#8896b0", cursor: "pointer", fontFamily: "inherit" },
  tabActive:   { fontSize: 13, padding: "8px 14px", border: "none", borderBottom: "2px solid #3b82f6", background: "transparent", color: "#3b82f6", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  badge:       { marginLeft: 6, background: "#0f1e3d", color: "#93c5fd", border: "0.5px solid #1e3a6e", borderRadius: 999, padding: "1px 7px", fontSize: 11 },
  body:        { flex: 1, display: "flex", overflow: "hidden", minHeight: 0 },
  left:        { flex: 1, flexDirection: "column", background: "#161b26", overflow: "hidden", minHeight: 0 },
  right:       { flex: 1, flexDirection: "column", background: "#0f1117", overflow: "hidden", minHeight: 0 },
  messages:    { flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12 },
  msgAI:       { display: "flex", gap: 9, alignItems: "flex-start" },
  msgUser:     { display: "flex", gap: 9, alignItems: "flex-start", flexDirection: "row-reverse" },
  avAI:        { width: 26, height: 26, borderRadius: "50%", background: "#0f1e3d", border: "0.5px solid #1e3a6e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 },
  avUser:      { width: 26, height: 26, borderRadius: "50%", background: "#222b3d", border: "0.5px solid #2a3347", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#8896b0", flexShrink: 0 },
  bubAI:       { maxWidth: "85%", padding: "10px 13px", background: "#1c2333", border: "0.5px solid #2a3347", borderRadius: "2px 12px 12px 12px", fontSize: 13, lineHeight: 1.6, color: "#e8edf5" },
  bubUser:     { maxWidth: "85%", padding: "10px 13px", background: "#0f1e3d", border: "0.5px solid #1e3a6e", borderRadius: "12px 2px 12px 12px", fontSize: 13, lineHeight: 1.6, color: "#93c5fd" },
  cardPill:    { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 12px", background: "#0f1e3d", border: "0.5px solid #1e3a6e", borderRadius: 8, fontSize: 12, color: "#93c5fd", cursor: "pointer", width: "100%" },
  inputArea:   { padding: "10px 14px 14px", borderTop: "0.5px solid #2a3347", background: "#161b26", flexShrink: 0 },
  viewListBtn: { width: "100%", padding: "10px 14px", background: "#0f1e3d", border: "0.5px solid #1e3a6e", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#93c5fd", cursor: "pointer", fontFamily: "inherit", marginBottom: 8, textAlign: "center" },
  inputRow:    { display: "flex", gap: 8, alignItems: "center" },
  input:       { flex: 1, background: "#1c2333", border: "0.5px solid #2a3347", borderRadius: 8, padding: "9px 13px", fontSize: 13, color: "#e8edf5", fontFamily: "inherit", outline: "none" },
  sendBtn:     { width: 36, height: 36, borderRadius: "50%", background: "#3b82f6", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", flexShrink: 0 },
  listHeader:  { padding: "20px 16px 10px", background: "#0f1117", flexShrink: 0 },
  listTitle:   { fontSize: 20, fontWeight: 500, color: "#e8edf5", letterSpacing: "-0.4px", marginBottom: 3 },
  listSub:     { fontSize: 13, color: "#8896b0" },
  cardsScroll: { flex: 1, overflowY: "auto", padding: "4px 14px 40px" },
  empty:       { padding: "52px 20px", textAlign: "center", fontSize: 13, color: "#8896b0", lineHeight: 1.7 },
  tierSection: { paddingTop: 14, marginBottom: 4 },
  tierBadge:   { fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8, padding: "3px 9px", borderRadius: 6, display: "inline-block", marginBottom: 10 },
  t1: { background: "rgba(59,130,246,0.12)", border: "0.5px solid #1e3a6e", color: "#93c5fd" },
  t2: { background: "rgba(167,139,250,0.12)", border: "0.5px solid rgba(167,139,250,0.3)", color: "#c4b5fd" },
  t3: { background: "rgba(245,158,11,0.1)", border: "0.5px solid rgba(245,158,11,0.25)", color: "#fcd34d" },
};

const sc = {
  card:         { background: "#1c2333", border: "0.5px solid #2a3347", borderRadius: 12, marginBottom: 14, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,0.25)" },
  top:          { padding: "14px 14px 11px", background: "#222b3d", borderBottom: "0.5px solid #2a3347", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  num:          { fontSize: 10, fontWeight: 600, color: "#4a5a78", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  name:         { fontSize: 15, fontWeight: 500, color: "#e8edf5", marginBottom: 3 },
  loc:          { fontSize: 11, color: "#7d8fa8" },
  laxD3:        { fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0, background: "rgba(59,130,246,0.15)", border: "0.5px solid #1e3a6e", color: "#93c5fd" },
  laxClub:      { fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0, background: "rgba(245,158,11,0.12)", border: "0.5px solid rgba(245,158,11,0.25)", color: "#fcd34d" },
  statsStrip:   { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", borderBottom: "0.5px solid #2a3347" },
  stat:         { padding: "8px 12px", borderRight: "0.5px solid #2a3347" },
  statLbl:      { fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "#4a5a78", marginBottom: 3 },
  statVal:      { fontSize: 13, fontWeight: 500, color: "#e8edf5" },
  ratingsBlock: { padding: "12px 14px", borderBottom: "0.5px solid #2a3347" },
  ratingRow:    { display: "flex", alignItems: "center", gap: 7, marginBottom: 7 },
  ratingLabel:  { fontSize: 11, color: "#7d8fa8", width: 68, flexShrink: 0 },
  track:        { flex: 1, height: 4, background: "#3d4f6a", borderRadius: 999, overflow: "hidden" },
  fill:         { height: "100%", borderRadius: 999 },
  score:        { fontSize: 11, fontWeight: 500, color: "#e8edf5", width: 14, textAlign: "right" },
  prosBlock:    { padding: "12px 14px", borderBottom: "0.5px solid #2a3347" },
  consBlock:    { padding: "12px 14px", borderBottom: "0.5px solid #2a3347" },
  prosLabel:    { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#34d399", marginBottom: 8 },
  consLabel:    { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#f87171", marginBottom: 8 },
  pcItem:       { display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: "#7d8fa8", lineHeight: 1.55, marginBottom: 6 },
  prosDot:      { color: "#34d399", flexShrink: 0, marginTop: 1 },
  consDot:      { color: "#f87171", flexShrink: 0, marginTop: 1 },
  bottomLine:   { padding: "10px 14px 12px", background: "#252d3d", fontSize: 12, color: "#7d8fa8", lineHeight: 1.6 },
  footer:       { padding: "8px 14px", background: "#1c2333", borderTop: "0.5px solid #2a3347" },
  link:         { fontSize: 11, color: "#3b82f6", textDecoration: "none", fontStyle: "italic" },
};