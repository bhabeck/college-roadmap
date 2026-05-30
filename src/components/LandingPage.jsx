import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: '💬',
    title: 'Conversation-driven research',
    desc: 'No forms, no filters. Just tell us what matters and we research schools in real time.',
  },
  {
    icon: '🎯',
    title: 'Your priorities, not ours',
    desc: 'Rank what matters most and watch your list build around you, weighted exactly to what you said.',
  },
  {
    icon: '📋',
    title: 'Rich, honest school cards',
    desc: 'Real pros, real cons, real bottom lines. The kind of straight talk you get from a friend who did the research.',
  },
  {
    icon: '🏔️',
    title: 'The whole world of colleges',
    desc: 'No pre-loaded database. AI researches every school live so obscure gems and current data are always in scope.',
  },
  {
    icon: '📍',
    title: 'From research to move-in day',
    desc: 'Visit notes, application tracking, essay help, move-in checklists. One tool for the entire college journey.',
  },
  {
    icon: '🔗',
    title: 'Share with your family',
    desc: 'Your list lives at a shareable URL. Send it to Mom, Dad, your coach. Everyone stays on the same page.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Pick your priorities',
    desc: 'Select what matters to you - outdoor culture, religion, athletics, academics, Greek life, career, and more. Then rank them in order of importance.',
  },
  {
    num: '02',
    title: 'Have a real conversation',
    desc: 'Tell us more about what you are looking for. The AI asks smart follow-up questions and starts surfacing schools that match your specific profile.',
  },
  {
    num: '03',
    title: 'Watch your list build',
    desc: 'As schools are recommended they appear as cards on your list, tiered by fit, with pros, cons, ratings, and a straight-talk bottom line for each one.',
  },
  {
    num: '04',
    title: 'Refine as you go',
    desc: 'Change your mind? Ask about a different school, shift your priorities, or tell us what you did not like. The list evolves with the conversation.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={s.page}>

      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.brand}>
            <div style={s.brandMark}>🗺️</div>
            <span style={s.brandName}>College <span style={s.brandAccent}>Roadmap</span></span>
          </div>
          <button style={s.navCta} onClick={() => navigate('/app')}>
            Try it free
          </button>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroEyebrow}>AI-Powered College Search</div>
          <h1 style={s.heroH1}>
            Find your college<br />
            <span style={s.heroAccent}>through conversation.</span>
          </h1>
          <p style={s.heroSub}>
            No forms. No filters. No database to browse. Just tell us what matters to you and we will research the entire world of colleges to find your fit.
          </p>
          <div style={s.heroCtas}>
            <button style={s.ctaPrimary} onClick={() => navigate('/app')}>
              Start your search
            </button>
            <div style={s.heroNote}>Free · No account required · Takes 2 minutes</div>
          </div>
        </div>

        <div style={s.heroPreview}>
          <div style={s.previewCard}>
            <div style={s.previewMsg}>
              <div style={s.previewAvAI}>🗺️</div>
              <div style={s.previewBubAI}>What matters most to you in a college? Outdoor culture, faith community, athletics, academics?</div>
            </div>
            <div style={{ ...s.previewMsg, flexDirection: 'row-reverse' }}>
              <div style={s.previewAvUsr}>A</div>
              <div style={s.previewBubUsr}>Mountains, strong Christian community, and I want to play lacrosse.</div>
            </div>
            <div style={s.previewMsg}>
              <div style={s.previewAvAI}>🗺️</div>
              <div style={s.previewBubAI}>Perfect profile. Let me find your schools now...</div>
            </div>
            <div style={s.previewSchool}>
              <div style={s.previewSchoolName}>Appalachian State</div>
              <div style={s.previewSchoolSub}>Boone, NC · Blue Ridge at 3,300 ft</div>
              <div style={s.previewBadge}>Club MCLA est. 1970s</div>
            </div>
          </div>
        </div>
      </section>

      <section style={s.features}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>Why College Roadmap</div>
          <h2 style={s.sectionH2}>Built different from every other college tool.</h2>
          <p style={s.sectionSub}>Every other tool makes you browse a database. We make the database irrelevant.</p>
          <div style={s.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={s.howItWorks}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>How it works</div>
          <h2 style={s.sectionH2}>Four steps from blank slate to your list.</h2>
          <div style={s.steps}>
            {STEPS.map((step, i) => (
              <div key={i} style={s.step}>
                <div style={s.stepNum}>{step.num}</div>
                <div style={s.stepContent}>
                  <div style={s.stepTitle}>{step.title}</div>
                  <div style={s.stepDesc}>{step.desc}</div>
                </div>
                {i < STEPS.length - 1 && <div style={s.stepLine} />}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={s.journey}>
  <div style={s.sectionInner}>
    <div style={s.sectionEyebrow}>The full journey</div>
    <h2 style={s.sectionH2}>From first search to move-in day.</h2>
    <p style={s.sectionSub}>Finding your school is just the beginning. College Roadmap follows you through every step of the journey.</p>
    <div style={s.journeyGrid}>
      <div style={s.journeyCard}>
        <div style={s.journeyIcon}>🔍</div>
        <div style={s.journeyPhase}>Phase 1</div>
        <div style={s.journeyTitle}>Research</div>
        <div style={s.journeyDesc}>AI-powered conversations that surface the right schools for your specific priorities. Your tiered list builds as you talk.</div>
        <div style={s.journeyBadge}>Available now</div>
      </div>
      <div style={s.journeyCard}>
        <div style={s.journeyIcon}>🗺️</div>
        <div style={s.journeyPhase}>Phase 2</div>
        <div style={s.journeyTitle}>Visits</div>
        <div style={s.journeyDesc}>Personalized visit checklists, campus notes, photo capture, coach contact tracker, and post-visit ratings. Know what to look for before you go.</div>
        <div style={{ ...s.journeyBadge, ...s.journeyBadgeSoon }}>Coming soon</div>
      </div>
      <div style={s.journeyCard}>
        <div style={s.journeyIcon}>📝</div>
        <div style={s.journeyPhase}>Phase 3</div>
        <div style={s.journeyTitle}>Apply</div>
        <div style={s.journeyDesc}>Deadline tracker, application status board, AI essay assistant, and financial aid comparison. The most stressful part, made manageable.</div>
        <div style={{ ...s.journeyBadge, ...s.journeyBadgeSoon }}>Coming soon</div>
      </div>
      <div style={s.journeyCard}>
        <div style={s.journeyIcon}>🎉</div>
        <div style={s.journeyPhase}>Phase 4</div>
        <div style={s.journeyTitle}>Accepted</div>
        <div style={s.journeyDesc}>Move-in checklist personalized to your school and climate, roommate coordination, orientation prep, and everything you need for day one.</div>
        <div style={{ ...s.journeyBadge, ...s.journeyBadgeSoon }}>Coming soon</div>
      </div>
    </div>
  </div>
</section>
      <section style={s.finalCta}>
        <div style={s.finalCtaInner}>
          <h2 style={s.finalH2}>Ready to find your college?</h2>
          <p style={s.finalSub}>Free, takes 2 minutes to start, and no account required. Just a conversation.</p>
          <button style={s.ctaPrimary} onClick={() => navigate('/app')}>
            Start your search
          </button>
          <div style={{ ...s.heroNote, marginTop: 16 }}>
            College Roadmap · Class of 2028 · 2029 · 2030
          </div>
        </div>
      </section>

    </div>
  )
}

const s = {
  page:              { minHeight: '100vh', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  nav:               { background: '#0f1117', borderBottom: '0.5px solid #2a3347', position: 'sticky', top: 0, zIndex: 100 },
  navInner:          { maxWidth: 1100, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:             { display: 'flex', alignItems: 'center', gap: 9 },
  brandMark:         { width: 26, height: 26, borderRadius: 7, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 },
  brandName:         { fontSize: 15, fontWeight: 500, color: '#e8edf5', letterSpacing: '-0.3px' },
  brandAccent:       { color: '#3b82f6' },
  navCta:            { padding: '8px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  hero:              { background: '#0f1117', padding: '80px 24px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 },
  heroInner:         { maxWidth: 680, textAlign: 'center' },
  heroEyebrow:       { fontSize: 12, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 },
  heroH1:            { fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 600, color: '#e8edf5', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 20 },
  heroAccent:        { color: '#3b82f6' },
  heroSub:           { fontSize: 17, color: '#8896b0', lineHeight: 1.7, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' },
  heroCtas:          { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  ctaPrimary:        { padding: '14px 32px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' },
  heroNote:          { fontSize: 12, color: '#4a5a78' },
  heroPreview:       { width: '100%', maxWidth: 480 },
  previewCard:       { background: '#161b26', border: '0.5px solid #2a3347', borderRadius: 16, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12 },
  previewMsg:        { display: 'flex', gap: 10, alignItems: 'flex-start' },
  previewAvAI:       { width: 28, height: 28, borderRadius: '50%', background: '#0f1e3d', border: '0.5px solid #1e3a6e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  previewAvUsr:      { width: 28, height: 28, borderRadius: '50%', background: '#222b3d', border: '0.5px solid #2a3347', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#8896b0', flexShrink: 0 },
  previewBubAI:      { background: '#1c2333', border: '0.5px solid #2a3347', borderRadius: '2px 12px 12px 12px', padding: '9px 13px', fontSize: 13, color: '#e8edf5', lineHeight: 1.6, maxWidth: '85%' },
  previewBubUsr:     { background: '#0f1e3d', border: '0.5px solid #1e3a6e', borderRadius: '12px 2px 12px 12px', padding: '9px 13px', fontSize: 13, color: '#93c5fd', lineHeight: 1.6, maxWidth: '85%' },
  previewSchool:     { background: '#1c2333', border: '0.5px solid #2a3347', borderRadius: 10, padding: '12px 14px', marginTop: 4 },
  previewSchoolName: { fontSize: 14, fontWeight: 500, color: '#e8edf5', marginBottom: 3 },
  previewSchoolSub:  { fontSize: 11, color: '#7d8fa8', marginBottom: 8 },
  previewBadge:      { display: 'inline-block', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.12)', border: '0.5px solid rgba(245,158,11,0.25)', color: '#fcd34d' },
  features:          { background: '#f8fafc', padding: '80px 24px' },
  sectionInner:      { maxWidth: 1100, margin: '0 auto' },
  sectionEyebrow:    { fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', color: '#3b82f6', marginBottom: 12 },
  sectionH2:         { fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 600, color: '#0f1117', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 12 },
  sectionSub:        { fontSize: 16, color: '#6b7694', lineHeight: 1.65, marginBottom: 48, maxWidth: 560 },
  featureGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  featureCard:       { background: '#ffffff', border: '0.5px solid #e2e6ef', borderRadius: 12, padding: '24px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  featureIcon:       { fontSize: 28, marginBottom: 14 },
  featureTitle:      { fontSize: 15, fontWeight: 500, color: '#0f1117', marginBottom: 8, letterSpacing: '-0.2px' },
  featureDesc:       { fontSize: 13, color: '#6b7694', lineHeight: 1.65 },
  howItWorks:        { background: '#ffffff', padding: '80px 24px' },
  steps:             { display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 680, position: 'relative' },
  step:              { display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: 36, position: 'relative' },
  stepNum:           { width: 40, height: 40, borderRadius: '50%', background: '#0f1e3d', border: '0.5px solid #1e3a6e', color: '#93c5fd', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, letterSpacing: 0.5 },
  stepContent:       { flex: 1, paddingTop: 8 },
  stepTitle:         { fontSize: 16, fontWeight: 500, color: '#0f1117', marginBottom: 6, letterSpacing: '-0.2px' },
  stepDesc:          { fontSize: 13, color: '#6b7694', lineHeight: 1.65 },
  stepLine:          { position: 'absolute', left: 19, top: 44, bottom: 0, width: 1, background: '#e2e6ef' },
  finalCta:          { background: '#0f1117', padding: '80px 24px' },
  finalCtaInner:     { maxWidth: 560, margin: '0 auto', textAlign: 'center' },
  finalH2:           { fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 600, color: '#e8edf5', letterSpacing: '-0.5px', marginBottom: 16 },
  finalSub:          { fontSize: 16, color: '#8896b0', lineHeight: 1.65, marginBottom: 36 },
  journey:           { background: '#f8fafc', padding: '80px 24px' },
  journeyGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 8 },
  journeyCard:       { background: '#ffffff', border: '0.5px solid #e2e6ef', borderRadius: 14, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  journeyIcon:       { fontSize: 28, marginBottom: 4 },
  journeyPhase:      { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#9ba3c0' },
  journeyTitle:      { fontSize: 17, fontWeight: 600, color: '#0f1117', letterSpacing: '-0.3px' },
  journeyDesc:       { fontSize: 13, color: '#6b7694', lineHeight: 1.65, flex: 1 },
  journeyBadge:      { display: 'inline-block', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 999, background: '#e6f4ea', color: '#1a6b2e', border: '0.5px solid #b3d9bc', alignSelf: 'flex-start', marginTop: 8 },
  journeyBadgeSoon:  { background: '#0f1e3d', color: '#93c5fd', border: '0.5px solid #1e3a6e' },
}