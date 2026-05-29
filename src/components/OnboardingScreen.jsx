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
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🗺️</div>
          <span style={styles.logoText}>College <span style={styles.logoAccent}>Roadmap</span></span>
        </div>
      </div>

      <div style={styles.body}>
        <h1 style={styles.title}>Let's find your college.</h1>
        <p style={styles.sub}>Select what matters to you, then rank them in order of importance. This shapes your entire search.</p>

        <div style={styles.stepLabel}>Step 1 — Select your priorities</div>
        <div style={styles.pillarGrid}>
          {PILLARS.map((p) => (
            <div
              key={p.id}
              style={selected.includes(p.id) ? styles.pillarSelected : styles.pillar}
              onClick={() => togglePillar(p.id)}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>

        <div style={styles.stepLabel}>Step 2 — Rank them</div>
        <p style={styles.hint}>↕ Tap arrows to reorder by importance</p>
        <div style={styles.rankList}>
          {ranked.map((id, i) => {
            const p = PILLARS.find((x) => x.id === id);
            return (
              <div key={id} style={styles.rankItem}>
                <div style={styles.rankNum}>{i + 1}</div>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <span style={styles.rankLabel}>{p.label}</span>
                <div style={styles.udBtns}>
                  <button
                    style={{ ...styles.udBtn, opacity: i === 0 ? 0.25 : 1 }}
                    onClick={() => moveUp(id)}
                    disabled={i === 0}
                  >▲</button>
                  <button
                    style={{ ...styles.udBtn, opacity: i === ranked.length - 1 ? 0.25 : 1 }}
                    onClick={() => moveDown(id)}
                    disabled={i === ranked.length - 1}
                  >▼</button>
                </div>
              </div>
            );
          })}
        </div>

        <button style={styles.startBtn} onClick={() => onStart(ranked.map(id => PILLARS.find(p => p.id === id)))}>
          Start my search →
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "var(--bg-white)",
    borderBottom: "0.5px solid var(--border-light)",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 32, height: 32,
    background: "var(--green-bg)",
    border: "0.5px solid var(--green-border)",
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 500,
    color: "var(--text-page)",
  },
  logoAccent: {
    color: "var(--green)",
  },
  body: {
    maxWidth: 560,
    width: "100%",
    margin: "0 auto",
    padding: "28px 20px 60px",
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    color: "var(--text-page)",
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    color: "var(--text-muted-page)",
    lineHeight: 1.6,
    marginBottom: 24,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "var(--text-muted-page)",
    marginBottom: 10,
  },
  hint: {
    fontSize: 11,
    color: "var(--text-muted-page)",
    marginBottom: 8,
  },
  pillarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    marginBottom: 28,
  },
  pillar: {
    background: "var(--bg-white)",
    border: "0.5px solid var(--border-light)",
    borderRadius: 8,
    padding: "9px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "var(--text-muted-page)",
    cursor: "pointer",
    userSelect: "none",
  },
  pillarSelected: {
    background: "var(--green-bg)",
    border: "0.5px solid var(--green-border)",
    borderRadius: 8,
    padding: "9px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "var(--green-text)",
    fontWeight: 500,
    cursor: "pointer",
    userSelect: "none",
  },
  rankList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 24,
  },
  rankItem: {
    background: "var(--bg-white)",
    border: "0.5px solid var(--border-light)",
    borderRadius: 8,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "var(--text-page)",
  },
  rankNum: {
    width: 22, height: 22,
    borderRadius: "50%",
    background: "var(--green-bg)",
    border: "0.5px solid var(--green-border)",
    color: "var(--green-text)",
    fontSize: 11,
    fontWeight: 600,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  rankLabel: {
    flex: 1,
    fontSize: 13,
    color: "var(--text-page)",
  },
  udBtns: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginLeft: "auto",
  },
  udBtn: {
    width: 24, height: 18,
    border: "0.5px solid var(--border-light)",
    background: "var(--bg)",
    borderRadius: 4,
    fontSize: 10,
    color: "var(--text-muted-page)",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "inherit",
  },
  startBtn: {
    width: "100%",
    padding: "12px",
    background: "var(--green)",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};