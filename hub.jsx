// Hub central scene — Heidi big in middle, gauges top, radial menu bottom.

const HUB_ACTIONS = [
  { id: 'pet',   label: 'Caresser',   icon: '💕' },
  { id: 'wash',  label: 'Laver',      icon: '🧼', cooldown: 'wash' },
  { id: 'brush', label: 'Brosser',    icon: '🪮' },
  { id: 'treat', label: 'Friandises', icon: '🍬' },
  { id: 'sleep', label: 'Dormir',     icon: '😴' },
  { id: 'play',  label: 'Jouer',      icon: '🎮' },
];

function formatCooldown(ms) {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return s + 's';
  const m = Math.ceil(s / 60);
  return m + 'm';
}

function HubScene({ state, onAction, message, palette }) {
  const mood = deriveMood(state.gauges);
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 500); return () => clearInterval(id); }, []);
  const now = Date.now();

  // Find the lowest gauge to display in a thought bubble
  const lowest = Object.entries(state.gauges).reduce((a, b) => (a[1] < b[1] ? a : b));
  const lowestDef = GAUGE_DEFS.find((g) => g.key === lowest[0]);
  const showThought = lowest[1] < 30;

  // Sometimes idle Heidi: pose switching
  const [pose, setPose] = React.useState('sit');
  React.useEffect(() => {
    const id = setInterval(() => {
      if (mood === 'sleepy') setPose('lay');
      else if (Math.random() < 0.15) setPose((p) => (p === 'sit' ? 'lay' : 'sit'));
    }, 6000);
    return () => clearInterval(id);
  }, [mood]);

  return (
    <div className="hub-scene" style={{
      background: `radial-gradient(ellipse at 50% 80%, ${palette.bgWarm} 0%, ${palette.bgCool} 100%)`,
    }}>
      {/* Decorative blurred room */}
      <div className="hub-bg">
        <div className="hub-window" style={{ background: palette.window }}>
          <div className="hub-window-frame" />
          <div className="hub-sun" />
          <div className="hub-cloud" style={{ left: '20%', top: '30%' }} />
          <div className="hub-cloud" style={{ left: '55%', top: '50%' }} />
        </div>
        <div className="hub-plant" />
        <div className="hub-shelf" />
        <div className="hub-frame hub-frame-1" />
        <div className="hub-frame hub-frame-2" />
      </div>

      {/* Cushion */}
      <div className="hub-cushion" style={{ background: palette.cushion }}>
        <div className="hub-cushion-pattern" />
      </div>

      {/* Heidi */}
      <div className="hub-heidi">
        <Heidi mood={mood} pose={pose} scale={1.3} />
        {showThought && (
          <div className="thought-bubble">
            <span style={{ fontSize: 22 }}>{lowestDef.icon}</span>
            <div className="thought-tail" />
            <div className="thought-tail-2" />
          </div>
        )}
      </div>

      {/* Top HUD */}
      <div className="hub-top">
        <Gauges gauges={state.gauges} />
        <button className="appart-btn" onClick={() => onAction('play')}>
          <span className="appart-icon">🏠</span>
          <span>Appart</span>
        </button>
      </div>

      {/* Message toast */}
      {message && <div className="hub-message">{message}</div>}

      {/* Radial action menu */}
      <div className="hub-menu">
        <div className="hub-menu-ring">
          {HUB_ACTIONS.map((a, i) => {
            const cdEnd = a.cooldown ? state.cooldowns[a.cooldown] || 0 : 0;
            const onCd = cdEnd > now;
            // Arc layout: spread along upward arc
            const total = HUB_ACTIONS.length;
            const t = total === 1 ? 0.5 : i / (total - 1);
            const cx = 6 + t * 88;
            const cy = 90 - Math.sin(t * Math.PI) * 55;
            return (
              <button key={a.id}
                className={"menu-btn " + (onCd ? "menu-btn-cd" : "")}
                style={{ left: cx + '%', top: cy + '%' }}
                onClick={() => !onCd && onAction(a.id)}
                disabled={onCd}>
                <span className="menu-btn-icon">{a.icon}</span>
                <span className="menu-btn-label">{a.label}</span>
                {onCd && <span className="menu-btn-cd-label">⏳ {formatCooldown(cdEnd - now)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood badge */}
      <div className="mood-badge">
        <span className="mood-emoji">{moodEmoji(mood)}</span>
        <span>{moodLabel(mood)}</span>
      </div>
    </div>
  );
}

function moodEmoji(m) {
  return { happy: '😊', love: '🥰', sleepy: '😴', excited: '🤩', sad: '😔', grumpy: '😠', neutral: '😺' }[m] || '😺';
}
function moodLabel(m) {
  return { happy: 'Joyeuse', love: 'Câline', sleepy: 'Endormie', excited: 'Excitée', sad: 'Triste', grumpy: 'Boudeuse', neutral: 'Tranquille' }[m] || 'Tranquille';
}

window.HubScene = HubScene;
