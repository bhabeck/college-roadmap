import { useState, useRef } from "react";

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
  const dragSrc = useRef(null);

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

  function handleDragStart(e, id) {
    dragSrc.current = id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    e.currentTarget.style.opacity = "0.35";
  }

  function handleDragEnd(e) {
    e.currentTarget.style.opacity = "1";
    document.querySelectorAll(".rank-item").forEach((el) => {
      el.style.borderColor = "";
      el.style.background = "";
    });
    dragSrc.current = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(e, id) {
    e.preventDefault();
    if (dragSrc.current === id) return;
    e.currentTarget.style.borderColor = "#3b82f6";
    e.currentTarget.style.background = "#0f1e3d";
  }

  function handleDragLeave(e) {
    e.currentTarget.style.borderColor = "";
    e.currentTarget.style.background = "";
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    e.currentTarget.style.borderColor = "";
    e.currentTarget.style.background = "";
    if (!dragSrc.current || dragSrc.current === targetId) return;
    const from = ranked.indexOf(dragSrc.current);
    const to = ranked.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const next = [...ranked];
    next.splice(from, 1);
    next.splice(to, 0, dragSrc.current);
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

      <div style={s.body}>
        <div style={s.eyebrow}>College Search 2028</div>
        <h1 style={s.h1}>Let's find the right fit.</h1>
        <p style={s.sub}>Select what matters most, then drag to rank them. Your priorities shape everything about how we search.</p>

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
              {selected.includes(p.id) && (
                <span style={s.checkmark}>✓</span>
              )}
            </div>
          ))}
        </div>

        <div style={s.sectionLabel}>Drag to rank by importance</div>
        <div style={{ ...s.rankHint }}>
          ⠿ Hold and drag to reorder
        </div>
        <div style={s.rankList}>
          {ranked.map((id, i) => {
            const p = PILLARS.find((x) => x.id === id);
            return (
              <div
                key={id}
                className="rank-item"
                draggable
                onDragStart={(e) => handleDragStart(e, id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, id)}
                style={s.rankItem}
              >
                <div style={s.rankNum}>{i + 1}</div>
                <span style={{ fontSize: 15 }}>{p.icon}</span>
                <span style={s.rankLabel}>{p.label}</span>
                <span style={s.gripHandle}>⠿</span>
              </div>
            );
          })}
        </div>

        <button
          style={s.cta}
          onClick={() => onStart(ranked.map((id) => PILLARS.find((p) => p.id === id)))}
        >
          Start searching →
        </button>
      </div>
    </div>
  );
}

const s = {
  page:         { minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column" },
  header:       { background: "#161b26", borderBottom: "0.5px solid #2a3347", padding: "13px 18px", display: "flex", alignItems: "center" },
  logo:         { display: "flex", alignItems: "center", gap: 9 },
  logoMark:     { width: 26, height: 26, borderRadius: 7, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  logoName:     { fontSize: 14, fontWeight: 500, color: "#e8edf5", letterSpacing: "-0.3px" },
  logoAccent:   { color: "#3b82f6" },
  body:         { maxWidth: 540, width: "100%", margin: "0 auto", padding: "28px 18px 60px" },
  eyebrow:      { fontSize: 11, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#3b82f6", marginBottom: 8 },
  h1:           { fontSize: 24, fontWeight: 500, color: "#e8edf5", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 8 },
  sub:          { fontSize: 13, color: "#8896b0", lineHeight: 1.65, marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase", color: "#4a5a78", marginBottom: 8 },
  pillars:      { display: "flex", flexDirection: "column", gap: 5, marginBottom: 28 },
  pillar:       { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#1c2333", border: "0.5px solid #2a3347", borderRadius: 8, cursor: "pointer", userSelect: "none" },
  pillarSel:    { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#0f1e3d", border: "0.5px solid #1e3a6e", borderRadius: 8, cursor: "pointer", userSelect: "none" },
  pillarIcon:   { width: 28, height: 28, borderRadius: 7, background: "#222b3d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pillarIconSel:{ width: 28, height: 28, borderRadius: 7, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pillarLabel:  { flex: 1, fontSize: 13, color: "#e8edf5" },
  pillarLabelSel:{ flex: 1, fontSize: 13, color: "#93c5fd" },
  checkmark:    { fontSize: 13, color: "#93c5fd", fontWeight: 500 },
  rankHint:     { fontSize: 11, color: "#4a5a78", marginBottom: 8 },
  rankList:     { display: "flex", flexDirection: "column", gap: 5, marginBottom: 28 },
  rankItem:     { display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", background: "#1c2333", border: "0.5px solid #2a3347", borderRadius: 8, cursor: "grab", userSelect: "none", transition: "opacity 0.15s" },
  rankNum:      { width: 20, height: 20, borderRadius: "50%", background: "#0f1e3d", border: "0.5px solid #1e3a6e", color: "#93c5fd", fontSize: 10, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rankLabel:    { flex: 1, fontSize: 13, color: "#e8edf5" },
  gripHandle:   { color: "#4a5a78", fontSize: 16, flexShrink: 0 },
  cta:          { width: "100%", padding: "13px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.2px" },
};