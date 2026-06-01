import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TIER_CONFIG = {
  tier1: { label: "Tier 1 — Best Fits",     style: "t1" },
  tier2: { label: "Tier 2 — Strong Pick",   style: "t2" },
  tier3: { label: "Tier 3 — Worth Knowing", style: "t3" },
};

export default function SharedListPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | found | notfound

  useEffect(() => {
    if (!sessionId) {
      setStatus("notfound");
      return;
    }
    supabase
      .from("sessions")
      .select("id, pillars, cards, created_at")
      .eq("id", sessionId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus("notfound");
        } else {
          setSession(data);
          setStatus("found");
        }
      });
  }, [sessionId]);

  const cards = session?.cards || { tier1: [], tier2: [], tier3: [] };
  const pillars = session?.pillars || [];
  const totalCards = Object.values(cards).flat().length;

  if (status === "loading") {
    return (
      <div style={s.loadPage}>
        <div style={s.loadDots}>
          <TypingDots />
        </div>
        <div style={s.loadText}>Loading college list…</div>
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div style={s.loadPage}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>🗺️</div>
        <div style={s.notFoundTitle}>List not found</div>
        <div style={s.notFoundSub}>This list doesn't exist or has been removed.</div>
        <button style={s.cta} onClick={() => navigate("/")}>Build your own list →</button>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.brand} onClick={() => navigate("/")}>
            <div style={s.brandMark}>🗺️</div>
            <span style={s.brandName}>College <span style={s.brandAccent}>Roadmap</span></span>
          </div>
          <button style={s.navCta} onClick={() => navigate("/app")}>
            Build your list →
          </button>
        </div>
      </nav>

      <div style={s.container}>
        {/* Header */}
        <div style={s.listHead}>
          <div style={s.eyebrow}>Shared College List</div>
          <h1 style={s.h1}>
            {totalCards} school{totalCards !== 1 ? "s" : ""} researched
          </h1>
          {pillars.length > 0 && (
            <div style={s.pillarsRow}>
              <span style={s.pillarsLabel}>Priorities:</span>
              {pillars.map((p, i) => (
                <span key={i} style={s.pillarChip}>
                  {p.icon} {p.label}
                </span>
              ))}
            </div>
          )}
          <div style={s.readOnly}>Read-only view</div>
        </div>

        {/* Cards */}
        {totalCards === 0 ? (
          <div style={s.empty}>No schools on this list yet.</div>
        ) : (
          Object.entries(TIER_CONFIG).map(([tier, config]) =>
            cards[tier] && cards[tier].length > 0 ? (
              <div key={tier} style={s.tierSection}>
                <div style={{ ...s.tierBadge, ...s[config.style] }}>
                  {config.label}
                </div>
                {cards[tier].map((card, i) => (
                  <SchoolCard key={card.id || i} card={card} pillars={pillars} />
                ))}
              </div>
            ) : null
          )
        )}

        {/* Footer CTA */}
        <div style={s.footerCta}>
          <div style={s.footerText}>Want your own list?</div>
          <button style={s.cta} onClick={() => navigate("/app")}>
            Start your college search →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── School Card (read-only) ─────────────────────────────────────────────────
function SchoolCard({ card }) {
  const ratingColors = ["#3b82f6", "#a78bfa", "#fbbf24", "#34d399", "#f87171"];

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
                <div style={{ ...sc.fill, width: `${val * 20}%`, background: ratingColors[i % ratingColors.length] }} />
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
            <div key={i} style={sc.pcItem}><span style={sc.prosDot}>•</span><span>{p}</span></div>
          ))}
        </div>
      )}

      {card.cons && (
        <div style={sc.consBlock}>
          <div style={sc.consLabel}>✗ CONS</div>
          {card.cons.map((c, i) => (
            <div key={i} style={sc.pcItem}><span style={sc.consDot}>•</span><span>{c}</span></div>
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
          width: 8, height: 8, borderRadius: "50%", background: "#3b82f6",
          animation: "dotBounce 1.2s infinite", animationDelay: `${i * 0.2}s`, display: "inline-block",
        }} />
      ))}
      <style>{`@keyframes dotBounce{0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
    </span>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:         { minHeight: "100vh", background: "#0f1117", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  loadPage:     { minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  loadDots:     { marginBottom: 4 },
  loadText:     { fontSize: 14, color: "#8896b0" },
  notFoundTitle:{ fontSize: 22, fontWeight: 500, color: "#e8edf5", marginBottom: 8 },
  notFoundSub:  { fontSize: 14, color: "#8896b0", marginBottom: 28 },
  nav:          { background: "#0f1117", borderBottom: "0.5px solid #2a3347", position: "sticky", top: 0, zIndex: 100 },
  navInner:     { maxWidth: 720, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand:        { display: "flex", alignItems: "center", gap: 9, cursor: "pointer" },
  brandMark:    { width: 26, height: 26, borderRadius: 7, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  brandName:    { fontSize: 15, fontWeight: 500, color: "#e8edf5", letterSpacing: "-0.3px" },
  brandAccent:  { color: "#3b82f6" },
  navCta:       { padding: "7px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  container:    { maxWidth: 720, margin: "0 auto", padding: "32px 20px 80px" },
  listHead:     { marginBottom: 32 },
  eyebrow:      { fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", color: "#3b82f6", marginBottom: 10 },
  h1:           { fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 600, color: "#e8edf5", letterSpacing: "-0.5px", marginBottom: 16 },
  pillarsRow:   { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 14 },
  pillarsLabel: { fontSize: 12, color: "#4a5a78", marginRight: 2 },
  pillarChip:   { fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "#0f1e3d", border: "0.5px solid #1e3a6e", color: "#93c5fd" },
  readOnly:     { fontSize: 11, color: "#4a5a78", fontStyle: "italic" },
  empty:        { padding: "52px 0", textAlign: "center", fontSize: 14, color: "#8896b0" },
  tierSection:  { paddingTop: 14, marginBottom: 4 },
  tierBadge:    { fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8, padding: "3px 9px", borderRadius: 6, display: "inline-block", marginBottom: 10 },
  t1: { background: "rgba(59,130,246,0.12)", border: "0.5px solid #1e3a6e", color: "#93c5fd" },
  t2: { background: "rgba(167,139,250,0.12)", border: "0.5px solid rgba(167,139,250,0.3)", color: "#c4b5fd" },
  t3: { background: "rgba(245,158,11,0.1)", border: "0.5px solid rgba(245,158,11,0.25)", color: "#fcd34d" },
  footerCta:    { marginTop: 48, padding: "28px 24px", background: "#161b26", border: "0.5px solid #2a3347", borderRadius: 14, textAlign: "center" },
  footerText:   { fontSize: 14, color: "#8896b0", marginBottom: 16 },
  cta:          { padding: "12px 28px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
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
