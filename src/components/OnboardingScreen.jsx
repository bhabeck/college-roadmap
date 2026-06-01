import { useState } from "react";

const PILLARS = [
  { id: "activities", label: "Activities",   icon: "🏔️" },
  { id: "religion",   label: "Religion",     icon: "✝️" },
  { id: "athletics",  label: "Athletics",    icon: "🏈" },
  { id: "academics",  label: "Academics",    icon: "📚" },
  { id: "arts",       label: "Arts & Music", icon: "🎵" },
  { id: "greek",      label: "Greek Life",   icon: "🏛️" },
  { id: "career",     label: "Career",       icon: "💼" },
  { id: "location",   label: "Location",     icon: "📍" },
  { id: "size",       label: "Campus Size",  icon: "🏫" },
  { id: "cost",       label: "Cost",         icon: "💰" },
];

export default function OnboardingScreen({ onStart }) {
  const [selected, setSelected] = useState(["activities", "religion", "athletics", "academics"]);
  const [ranked, setRanked] = useState(["activities", "religion", "athletics", "academics"]);
  const [extraCriteria, setExtraCriteria] = useState("");

  function togglePillar(id) {
    if (selected.includes(id)) {
      if (selected.length <= 1) return;
      setSelected(selected.filter((x) => x !== id));
      setRanked(ranked.filter((x) => x !== id));
    } else {
      setSelected([...selected, id]);
      setRanked([...ranked, id]);
    }
  }

  function moveUp(id) {
    const i = ranked.indexOf(id);
    if (i <= 0) return;
    const next = [...ranked];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setRanked(next);
  }

  function moveDown(id) {
    const i = ranked.indexOf(id);
    if (i >= ranked.length - 1) return;
    const next = [...ranked];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setRanked(next);
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoMark}>🗺️</div>
          <span style={s.logoName}>College <span style={s.logoAccent}>Roadmap</span></span>
        </div>
      </div>

      <div style={s.scroll}>
        <div style={s.body}>
          <div style={s.eyebrow}>College Search 2028</div>
          <h1 style={s.h1}>Let's find the right fit.</h1>
          <p style={s.sub}>Select what matters most, rank them in order, then tell us anything else.</p>

          <div style={s.sectionLabel}>What matters to you</div>
          <div style={s.pillars}>
            {PILLARS.map((p) => (
              <div
                key={p.id}
                style={selected.includes(p.id) ? s.pillarSel : s.pillar}
                onClick={() => togglePillar(p.id)}
              >
                <div style={selected.includes(p.id) ? s.pillarIconSel : s.pillarIcon}>
                  <span style={{ fontSize: 15 }}>{p.icon}</span>
                </div>
                <span style={selected.includes(p.id) ? s.pillarLabelSel : s.pillarLabel}>
                  {p.label}
                </span>
                {selected.includes(p.id) && <span style={s.checkmark}>✓</span>}
              </div>
            ))}
          </div>

          <div style={s.sectionLabel}>Rank by importance</div>
          <p style={s.rankHint}>Tap the arrows to reorder</p>
          <div style={s.rankList}>
            {ranked.map((id, i) => {
              const p = PILLARS.find((x) => x.id === id);
              return (
                <div key={id} style={s.rankItem}>
                  <div style={s.rankNum}>{i + 1}</div>
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <span style={s.rankLabel}>{p.label}</span>
                  <div style={s.udBtns}>
                    <button style={{ ...s.udBtn, opacity: i === 0 ? 0.2 : 1 }} onClick={() => moveUp(id)} disabled={i === 0}>▲</button>
                    <button style={{ ...s.udBtn, opacity: i === ranked.length - 1 ? 0.2 : 1 }} onClick={() => moveDown(id)} disabled={i === ranked.length - 1}>▼</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={s.sectionLabel}>Anything else?</div>
          <p style={s.rankHint}>Add any must-haves, deal-breakers, or things that matter that aren't on the list above.</p>
          <textarea
            style={s.textarea}
            value={extraCriteria}
            onChange={(e) => setExtraCriteria(e.target.value)}
            placeholder="e.g. I want a strong study abroad program, I need to be within 4 hours of home, I'm interested in ROTC..."
            rows={3}
          />

          <button
            style={s.cta}
            onClick={() => onStart(ranked.map((id) => PILLARS.find((p) => p.id === id)), extraCriteria.trim())}
          >
            Start searching →
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:          { height: "100%", background: "#0f1117", display: "flex", flexDirection: "column", overflow: "hidden" },
  header:        { background: "#161b26", borderBottom: "0.5px solid #2a3347", padding: "13px 18px", paddingTop: "max(13px, env(safe-area-inset-top))", display: "flex", alignItems: "center", flexShrink: 0 },
  logo:          { display: "flex", alignItems: "center", gap: 9 },
  logoMark:      { width: 26, height: 26, borderRadius: 7, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  logoName:      { fontSize: 14, fontWeight: 500, color: "#e8edf5", letterSpacing: "-0.3px" },
  logoAccent:    { color: "#3b82f6" },
  scroll:        { flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" },
  body:          { maxWidth: 540, width: "100%", margin: "0 auto", padding: "24px 16px", paddingBottom: "max(40px, env(safe-area-inset-bottom))" },
  eyebrow:       { fontSize: 11, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#3b82f6", marginBottom: 8 },
  h1:            { fontSize: 22, fontWeight: 500, color: "#e8edf5", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 8 },
  sub:           { fontSize: 13, color: "#8896b0", lineHeight: 1.65, marginBottom: 24 },
  sectionLabel:  { fontSize: 11, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase", color: "#4a5a78", marginBottom: 8 },
  rankHint:      { fontSize: 11, color: "#4a5a78", marginBottom: 8 },
  pillars:       { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 24 },
  pillar:        { display: "flex", alignItems: "center", gap: 8, padding: "11px 10px", background: "#1c2333", border: "0.5px solid #2a3347", borderRadius: 8, cursor: "pointer", userSelect: "none", minWidth: 0 },
  pillarSel:     { display: "flex", alignItems: "center", gap: 8, padding: "11px 10px", background: "#0f1e3d", border: "0.5px solid #1e3a6e", borderRadius: 8, cursor: "pointer", userSelect: "none", minWidth: 0 },
  pillarIcon:    { width: 26, height: 26, borderRadius: 6, background: "#222b3d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pillarIconSel: { width: 26, height: 26, borderRadius: 6, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pillarLabel:   { flex: 1, fontSize: 12, color: "#8896b0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  pillarLabelSel:{ flex: 1, fontSize: 12, color: "#93c5fd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  checkmark:     { fontSize: 11, color: "#93c5fd", fontWeight: 500, flexShrink: 0 },
  rankList:      { display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 },
  rankItem:      { display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", background: "#1c2333", border: "0.5px solid #2a3347", borderRadius: 8, userSelect: "none" },
  rankNum:       { width: 22, height: 22, borderRadius: "50%", background: "#0f1e3d", border: "0.5px solid #1e3a6e", color: "#93c5fd", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rankLabel:     { flex: 1, fontSize: 13, color: "#e8edf5" },
  udBtns:        { display: "flex", flexDirection: "column", gap: 3 },
  udBtn:         { width: 32, height: 24, background: "#222b3d", border: "0.5px solid #2a3347", borderRadius: 5, fontSize: 10, color: "#8896b0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", padding: 0 },
  textarea:      { width: "100%", background: "#1c2333", border: "0.5px solid #2a3347", borderRadius: 8, padding: "12px 13px", fontSize: 14, color: "#e8edf5", fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.6, marginBottom: 24, boxSizing: "border-box" },
  cta:           { width: "100%", padding: "15px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.2px" },
};
