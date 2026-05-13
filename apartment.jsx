// Apartment top-down map + 3 minigames (Laser / Hide & Seek / Feather)

// ─── APARTMENT MAP ──────────────────────────────────────────────────
// Layout matches the user's floor plan. Coordinates in % within the
// 1200x600 viewBox area. Three clickable hot zones launch minigames.

function ApartmentMap({ onPick, onBack, gauges }) {
  const [hover, setHover] = React.useState(null);

  const ZONES = [
    { id: 'laser', title: 'Chasse au laser', emoji: '🔴', room: 'Chambre / Couloir',
      desc: 'Attrape le point rouge avant qu\'il disparaisse',
      reward: '+Ennui +Curiosité',
      target: { x: 720, y: 360, w: 200, h: 130 } },
    { id: 'feather', title: 'Attrape la plume', emoji: '🪶', room: 'Arbre à chat',
      desc: 'Timing : clique pile quand elle bondit',
      reward: '+Ennui +Affection',
      target: { x: 555, y: 90, w: 130, h: 100 } },
    { id: 'hideseek', title: 'Cache-cache', emoji: '🙈', room: 'Multi-pièces',
      desc: 'Trouve Heidi en 3 rounds',
      reward: '+Ennui +Curiosité +Affection',
      target: { x: 220, y: 270, w: 200, h: 200 } },
  ];

  return (
    <div className="apartment-scene">
      <div className="apartment-header">
        <button className="back-btn" onClick={onBack}>← Retour</button>
        <h2 className="apartment-title">L'appartement d'Heidi</h2>
        <div className="apartment-sub">Choisis une zone de jeu</div>
      </div>

      <div className="apartment-wrap">
        <svg viewBox="0 0 1200 600" className="apartment-svg" preserveAspectRatio="xMidYMid meet">
          {/* Walls / floor — main outer plan */}
          <defs>
            <pattern id="wood" patternUnits="userSpaceOnUse" width="60" height="14">
              <rect width="60" height="14" fill="#E8C9A3" />
              <line x1="0" y1="0" x2="60" y2="0" stroke="#C9A87C" strokeWidth="1" />
              <line x1="20" y1="14" x2="60" y2="14" stroke="#C9A87C" strokeWidth="1" />
              <line x1="0" y1="14" x2="15" y2="14" stroke="#C9A87C" strokeWidth="1" />
            </pattern>
            <pattern id="tile" patternUnits="userSpaceOnUse" width="40" height="40">
              <rect width="40" height="40" fill="#E5E5E0" />
              <rect x="0.5" y="0.5" width="39" height="39" fill="none" stroke="#C8C8C0" strokeWidth="1" />
            </pattern>
            <pattern id="bath" patternUnits="userSpaceOnUse" width="30" height="30">
              <rect width="30" height="30" fill="#DCEAF2" />
              <rect x="0.5" y="0.5" width="29" height="29" fill="none" stroke="#B5CCD9" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Outer floor */}
          <rect x="20" y="20" width="1160" height="560" fill="url(#wood)" stroke="#1a1a1a" strokeWidth="4" rx="6" />

          {/* Cuisine (tiled) */}
          <rect x="20" y="20" width="200" height="560" fill="url(#tile)" stroke="#1a1a1a" strokeWidth="4" />
          <text x="120" y="290" textAnchor="middle" className="room-label">CUISINE</text>
          {/* counter */}
          <rect x="40" y="60" width="160" height="40" fill="#fff" stroke="#1a1a1a" strokeWidth="3" rx="4" />
          <rect x="40" y="510" width="160" height="50" fill="#fff" stroke="#1a1a1a" strokeWidth="3" rx="4" />
          <rect x="55" y="515" width="40" height="40" fill="#D4D4D4" stroke="#1a1a1a" strokeWidth="2" />

          {/* Entrée */}
          <rect x="20" y="20" width="80" height="80" fill="#F0E0C8" stroke="#1a1a1a" strokeWidth="3" />
          <text x="60" y="65" textAnchor="middle" className="room-label-sm">ENTRÉE</text>
          {/* Door notch */}
          <rect x="14" y="50" width="10" height="30" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />

          {/* Salle de bain */}
          <rect x="220" y="20" width="170" height="560" fill="url(#bath)" stroke="#1a1a1a" strokeWidth="4" />
          <text x="305" y="135" textAnchor="middle" className="room-label">SALLE</text>
          <text x="305" y="160" textAnchor="middle" className="room-label">DE BAIN</text>
          {/* tub */}
          <rect x="240" y="450" width="130" height="110" fill="#fff" stroke="#1a1a1a" strokeWidth="3" rx="14" />
          <rect x="252" y="462" width="106" height="86" fill="#BFD9E8" stroke="#1a1a1a" strokeWidth="2" rx="10" />

          {/* Couloir label — top strip */}
          <text x="500" y="50" className="room-label-sm">COULOIR</text>

          {/* Arbre à chat */}
          <g>
            <rect x="555" y="90" width="130" height="100" fill="#9DD6BD" stroke="#1a1a1a" strokeWidth="3" rx="6" />
            <text x="620" y="145" textAnchor="middle" className="room-label-sm">Arbre à chat</text>
            {/* tower silhouette */}
            <rect x="600" y="60" width="40" height="40" fill="#C9956B" stroke="#1a1a1a" strokeWidth="2.5" rx="4" />
            <rect x="612" y="40" width="16" height="22" fill="#1a1a1a" />
            <rect x="606" y="42" width="28" height="6" fill="#FFD93D" />
          </g>

          {/* Bureau */}
          <g>
            <rect x="730" y="90" width="160" height="100" fill="#E5C9F0" stroke="#1a1a1a" strokeWidth="3" rx="6" />
            <text x="810" y="145" textAnchor="middle" className="room-label-sm">Bureau</text>
            <rect x="745" y="50" width="130" height="34" fill="#A87B5C" stroke="#1a1a1a" strokeWidth="3" rx="3" />
          </g>

          {/* Fauteuil bureau (préféré fenêtre) */}
          <g>
            <rect x="1040" y="70" width="100" height="130" fill="#F5C8B0" stroke="#1a1a1a" strokeWidth="3" rx="10" />
            <text x="1090" y="145" textAnchor="middle" className="room-label-xs">Fauteuil</text>
            {/* window strip */}
            <rect x="1148" y="60" width="14" height="180" fill="#1a1a1a" />
            <rect x="1152" y="70" width="6" height="35" fill="#A8D8EA" />
            <rect x="1152" y="115" width="6" height="35" fill="#A8D8EA" />
            <rect x="1152" y="160" width="6" height="35" fill="#A8D8EA" />
            <rect x="1152" y="205" width="6" height="35" fill="#A8D8EA" />
            {/* sparkle note */}
            <g className="apt-note">
              <line x1="1090" y1="75" x2="1100" y2="38" stroke="#1a1a1a" strokeWidth="1.5" />
              <text x="1075" y="32" className="apt-note-text">Elle adore regarder dehors</text>
            </g>
          </g>

          {/* Lit */}
          <g>
            <rect x="440" y="240" width="280" height="190" fill="#FFE5B4" stroke="#1a1a1a" strokeWidth="3.5" rx="8" />
            {/* mattress / pillows */}
            <rect x="455" y="255" width="100" height="60" fill="#fff" stroke="#1a1a1a" strokeWidth="2" rx="6" />
            <text x="580" y="345" textAnchor="middle" className="room-label">LIT</text>
            <text x="580" y="375" textAnchor="middle" className="room-label-xs">(spot dodo)</text>
          </g>

          {/* Dressing */}
          <g>
            <rect x="440" y="470" width="240" height="80" fill="#C9B59C" stroke="#1a1a1a" strokeWidth="3" rx="4" />
            <line x1="500" y1="470" x2="500" y2="550" stroke="#1a1a1a" strokeWidth="2" />
            <line x1="560" y1="470" x2="560" y2="550" stroke="#1a1a1a" strokeWidth="2" />
            <line x1="620" y1="470" x2="620" y2="550" stroke="#1a1a1a" strokeWidth="2" />
            <text x="560" y="515" textAnchor="middle" className="room-label-sm">Dressing</text>
          </g>

          {/* Fauteuil chambre (spot dodo) */}
          <g>
            <rect x="710" y="470" width="100" height="90" fill="#F5C8B0" stroke="#1a1a1a" strokeWidth="3" rx="10" />
            <rect x="715" y="475" width="90" height="20" fill="#E0A88C" stroke="#1a1a1a" strokeWidth="2" rx="4" />
            <text x="760" y="525" textAnchor="middle" className="room-label-xs">Fauteuil</text>
            <g className="apt-note">
              <line x1="760" y1="565" x2="760" y2="585" stroke="#1a1a1a" strokeWidth="1.5" />
              <text x="760" y="595" textAnchor="middle" className="apt-note-text">Elle adore dormir dessus</text>
            </g>
          </g>

          {/* Gamelles */}
          <g>
            <rect x="850" y="490" width="120" height="55" fill="#FFD9D9" stroke="#1a1a1a" strokeWidth="3" rx="6" />
            <circle cx="875" cy="517" r="14" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
            <circle cx="875" cy="517" r="8" fill="#D5A878" />
            <circle cx="915" cy="517" r="14" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
            <circle cx="915" cy="517" r="8" fill="#A8D8EA" />
            <text x="910" y="565" textAnchor="middle" className="room-label-xs">Gamelles</text>
          </g>

          {/* Litière */}
          <g>
            <rect x="990" y="490" width="150" height="60" fill="#D8D2C2" stroke="#1a1a1a" strokeWidth="3" rx="6" />
            <rect x="998" y="498" width="134" height="44" fill="#C2B89E" stroke="#1a1a1a" strokeWidth="1.5" />
            <text x="1065" y="575" textAnchor="middle" className="room-label-xs">Litière</text>
          </g>

          {/* heidi silhouette wandering — placed near bed */}
          <g transform="translate(560 220) scale(0.42)">
            <Heidi mood="happy" pose="sit" scale={1} />
          </g>

          {/* Clickable hot zones */}
          {ZONES.map((z) => (
            <g key={z.id} className={"apt-zone " + (hover === z.id ? "apt-zone-hover" : "")}
              onMouseEnter={() => setHover(z.id)} onMouseLeave={() => setHover(null)}
              onClick={() => onPick(z.id)}>
              <rect x={z.target.x} y={z.target.y} width={z.target.w} height={z.target.h}
                fill={hover === z.id ? "rgba(255,217,61,0.35)" : "rgba(255,217,61,0.0)"}
                stroke="#FFD93D" strokeWidth={hover === z.id ? "4" : "0"} strokeDasharray="6 4" rx="8" />
            </g>
          ))}
        </svg>

        <div className="apartment-zones-info">
          {ZONES.map((z) => (
            <button key={z.id} className={"zone-card " + (hover === z.id ? "zone-card-hover" : "")}
              onMouseEnter={() => setHover(z.id)} onMouseLeave={() => setHover(null)}
              onClick={() => onPick(z.id)}>
              <div className="zone-emoji">{z.emoji}</div>
              <div className="zone-info">
                <div className="zone-title">{z.title}</div>
                <div className="zone-room">{z.room}</div>
                <div className="zone-desc">{z.desc}</div>
                <div className="zone-reward">{z.reward}</div>
              </div>
              <div className="zone-go">▶</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MINIGAME 1: LASER ──────────────────────────────────────────────
function LaserGame({ onEnd, adjust }) {
  const [score, setScore] = React.useState(0);
  const [pos, setPos] = React.useState({ x: 50, y: 50 });
  const [heidiPos, setHeidiPos] = React.useState({ x: 30, y: 70 });
  const [running, setRunning] = React.useState(true);
  const [hit, setHit] = React.useState(null);
  const startedAt = React.useRef(Date.now());

  const left = useTimer(30, () => {
    setRunning(false);
    let e = 5, c = 5;
    if (score >= 15) { e = 20; c = 15; }
    else if (score >= 10) { e = 15; c = 10; }
    else { e = 10; c = 5; }
    adjust({ boredom: e, curiosity: c });
    setTimeout(() => onEnd(score), 1500);
  }, running);

  React.useEffect(() => {
    if (!running) return;
    const elapsed = (Date.now() - startedAt.current) / 1000;
    const dur = elapsed < 10 ? 2000 : elapsed < 20 ? 1500 : 1000;
    const id = setTimeout(() => {
      // miss — laser moves on its own
      setPos({ x: 15 + Math.random() * 70, y: 25 + Math.random() * 55 });
    }, dur);
    return () => clearTimeout(id);
  }, [pos, running]);

  const clickLaser = (e) => {
    e.stopPropagation();
    setScore((s) => s + 1);
    setHit({ x: pos.x, y: pos.y, id: Date.now() });
    setHeidiPos({ x: pos.x - 8, y: pos.y + 5 });
    setTimeout(() => setPos({ x: 15 + Math.random() * 70, y: 25 + Math.random() * 55 }), 200);
  };

  return (
    <div className="minigame-overlay">
      <div className="minigame-header">
        <div className="minigame-title">🔴 Chasse au laser</div>
        <div className="minigame-stats">
          <span className="ms-pill">⏱ {Math.ceil(left)}s</span>
          <span className="ms-pill ms-score">⭐ {score}</span>
        </div>
        <button className="action-close" onClick={() => onEnd(score)}>✕</button>
      </div>
      <div className="minigame-stage laser-stage">
        {/* room hint */}
        <div className="laser-room">
          <div className="laser-furniture laser-bed" />
          <div className="laser-furniture laser-rug" />
        </div>
        {/* heidi crouched */}
        <div className="laser-heidi" style={{ left: heidiPos.x + '%', top: heidiPos.y + '%' }}>
          <Heidi mood="excited" pose="crouch" scale={0.7}
            look={{ x: (pos.x - heidiPos.x) / 30, y: (pos.y - heidiPos.y) / 30 }} />
        </div>
        {/* laser dot */}
        {running && (
          <button className="laser-dot" style={{ left: pos.x + '%', top: pos.y + '%' }} onClick={clickLaser} aria-label="laser">
            <span className="laser-core" />
            <span className="laser-halo" />
          </button>
        )}
        {hit && <div key={hit.id} className="laser-burst" style={{ left: hit.x + '%', top: hit.y + '%' }} />}
        {!running && <div className="minigame-end">⭐ Score : {score}</div>}
      </div>
      <div className="minigame-foot">Clique sur le laser avant qu'il bouge !</div>
    </div>
  );
}

// ─── MINIGAME 2: HIDE & SEEK ────────────────────────────────────────
function HideSeekGame({ onEnd, adjust }) {
  const HIDESPOTS = [
    [
      { id: 'fridge', label: 'Frigo', x: 12, y: 35 },
      { id: 'counter', label: 'Sous le plan', x: 12, y: 70 },
      { id: 'sink', label: 'Évier', x: 12, y: 18 },
      { id: 'cabinet', label: 'Placard', x: 25, y: 50 },
    ],
    [
      { id: 'tub', label: 'Baignoire', x: 30, y: 75 },
      { id: 'curtain', label: 'Rideau', x: 30, y: 30 },
      { id: 'cabinet2', label: 'Meuble', x: 30, y: 55 },
      { id: 'basket', label: 'Panier à linge', x: 33, y: 18 },
    ],
    [
      { id: 'bed', label: 'Sous le lit', x: 60, y: 50 },
      { id: 'dressing', label: 'Dressing', x: 55, y: 80 },
      { id: 'chair', label: 'Fauteuil', x: 80, y: 80 },
      { id: 'litter', label: 'Litière', x: 92, y: 80 },
      { id: 'desk', label: 'Bureau', x: 80, y: 22 },
    ],
  ];
  const ROOM_NAMES = ['Cuisine', 'Salle de bain', 'Chambre'];

  const [round, setRound] = React.useState(0);
  const [hideAt, setHideAt] = React.useState(null);
  const [revealed, setRevealed] = React.useState(false);
  const [results, setResults] = React.useState([]); // bool per round
  const [showHint, setShowHint] = React.useState(false);
  const durations = [15, 12, 10];
  const [done, setDone] = React.useState(false);

  // pick a hiding spot for the round
  React.useEffect(() => {
    if (round >= 3) return;
    const spots = HIDESPOTS[round];
    setHideAt(spots[Math.floor(Math.random() * spots.length)]);
    setRevealed(false);
    setShowHint(false);
    const hintT = setTimeout(() => setShowHint(true), 5000);
    return () => clearTimeout(hintT);
  }, [round]);

  const left = useTimer(durations[round] || 1, () => {
    if (round >= 3 || done) return;
    setRevealed('timeout');
    setResults((r) => [...r, false]);
    setTimeout(() => setRound((r) => r + 1), 1800);
  }, !revealed && round < 3);

  React.useEffect(() => {
    if (round >= 3 && !done) {
      setDone(true);
      const found = results.filter(Boolean).length;
      let b = 5, c = 0, a = 0;
      if (found === 3) { b = 25; c = 20; a = 10; }
      else if (found === 2) { b = 15; c = 10; }
      adjust({ boredom: b, curiosity: c, affection: a });
      setTimeout(() => onEnd(found), 2200);
    }
  }, [round]);

  const handleSpot = (s) => {
    if (revealed) return;
    if (s.id === hideAt.id) {
      setRevealed('found');
      setResults((r) => [...r, true]);
      setTimeout(() => setRound((r) => r + 1), 1600);
    } else {
      // wrong guess — just a wiggle, no penalty
    }
  };

  const spots = round < 3 ? HIDESPOTS[round] : [];
  const found = results.filter(Boolean).length;

  return (
    <div className="minigame-overlay">
      <div className="minigame-header">
        <div className="minigame-title">🙈 Cache-cache</div>
        <div className="minigame-stats">
          <span className="ms-pill">{round < 3 ? `Round ${round + 1}/3` : 'Terminé'}</span>
          <span className="ms-pill">{ROOM_NAMES[round] || ''}</span>
          {round < 3 && <span className="ms-pill ms-score">⏱ {Math.ceil(left)}s</span>}
        </div>
        <button className="action-close" onClick={() => onEnd(found)}>✕</button>
      </div>
      <div className="minigame-stage hs-stage">
        <div className={"hs-room hs-room-" + round}>
          {spots.map((s) => (
            <button key={s.id} className={"hs-spot " + (revealed && s.id === hideAt?.id ? "hs-spot-revealed" : "")}
              style={{ left: s.x + '%', top: s.y + '%' }}
              onClick={() => handleSpot(s)}>
              <span className="hs-spot-label">{s.label}</span>
              {showHint && !revealed && s.id === hideAt?.id && (
                <span className="hs-hint">〰️</span>
              )}
              {revealed === 'found' && s.id === hideAt?.id && (
                <div className="hs-pop"><Heidi mood="excited" pose="sit" scale={0.4} /></div>
              )}
              {revealed === 'timeout' && s.id === hideAt?.id && (
                <div className="hs-pop"><Heidi mood="grumpy" pose="sit" scale={0.4} /></div>
              )}
            </button>
          ))}
          {round >= 3 && <div className="minigame-end">{found}/3 trouvés</div>}
        </div>
      </div>
      <div className="minigame-foot">
        {round < 3 ? 'Clique sur le meuble où Heidi se cache.' : 'Bravo !'}
        {showHint && round < 3 && !revealed && <span className="hint-toast"> 🔊 Petit miaulement…</span>}
      </div>
    </div>
  );
}

// ─── MINIGAME 3: FEATHER ────────────────────────────────────────────
function FeatherGame({ onEnd, adjust }) {
  const [score, setScore] = React.useState(0);
  const [combo, setCombo] = React.useState(0);
  const [running, setRunning] = React.useState(true);
  const [pos, setPos] = React.useState({ x: 50, y: 50 });
  const [phase, setPhase] = React.useState('move'); // move | jump | caught | miss
  const [heidi, setHeidi] = React.useState('crouch');
  const startedAt = React.useRef(Date.now());

  const left = useTimer(25, () => {
    setRunning(false);
    let e = 10, a = 10;
    if (score >= 35) { e = 25; a = 20; }
    else if (score >= 20) { e = 15; a = 15; }
    adjust({ boredom: e, affection: a });
    setTimeout(() => onEnd(score), 1600);
  }, running);

  // movement loop — feather wanders
  React.useEffect(() => {
    if (!running) return;
    if (phase !== 'move') return;
    const id = setInterval(() => {
      setPos((p) => {
        const elapsed = (Date.now() - startedAt.current) / 1000;
        const speed = 1 + elapsed / 12;
        return {
          x: Math.max(15, Math.min(85, p.x + (Math.random() - 0.5) * 8 * speed)),
          y: Math.max(20, Math.min(75, p.y + (Math.random() - 0.5) * 6 * speed)),
        };
      });
    }, 200);
    // randomly trigger a "jump" window
    const jumpT = setTimeout(() => {
      setPhase('jump');
      setHeidi('jump');
      setTimeout(() => {
        // if user didn't catch in time → miss
        setPhase((p) => {
          if (p === 'jump') {
            setCombo(0);
            setHeidi('crouch');
            return 'move';
          }
          return p;
        });
      }, 900);
    }, 1200 + Math.random() * 1400);
    return () => { clearInterval(id); clearTimeout(jumpT); };
  }, [phase, running]);

  const handleClick = () => {
    if (phase === 'jump') {
      const newCombo = combo + 1;
      const mult = newCombo >= 3 ? 2 : newCombo >= 2 ? 1.5 : 1;
      setScore((s) => s + Math.round(5 * mult));
      setCombo(newCombo);
      setPhase('caught');
      setHeidi('jump');
      setTimeout(() => { setHeidi('crouch'); setPhase('move'); }, 700);
    } else {
      // raté
      setCombo(0);
    }
  };

  return (
    <div className="minigame-overlay">
      <div className="minigame-header">
        <div className="minigame-title">🪶 Attrape la plume</div>
        <div className="minigame-stats">
          <span className="ms-pill">⏱ {Math.ceil(left)}s</span>
          <span className="ms-pill ms-score">⭐ {score}</span>
          {combo >= 2 && <span className="ms-pill ms-combo">🔥 ×{combo}</span>}
        </div>
        <button className="action-close" onClick={() => onEnd(score)}>✕</button>
      </div>
      <div className="minigame-stage feather-stage">
        <div className="feather-room" />
        <div className="feather-heidi">
          <Heidi mood="excited" pose={heidi} scale={0.7}
            look={{ x: (pos.x - 50) / 50, y: (pos.y - 50) / 50 }} />
        </div>
        {running && (
          <button className={"feather " + (phase === 'jump' ? "feather-glow" : "")}
            style={{ left: pos.x + '%', top: pos.y + '%' }} onClick={handleClick}>
            <span className="feather-icon">🪶</span>
            <span className="feather-string" />
          </button>
        )}
        {phase === 'jump' && <div className="feather-cue">Attrape !</div>}
        {!running && <div className="minigame-end">⭐ Score : {score}</div>}
      </div>
      <div className="minigame-foot">Clique pile quand Heidi <b>bondit</b> 💫</div>
    </div>
  );
}

window.ApartmentMap = ApartmentMap;
window.LaserGame = LaserGame;
window.HideSeekGame = HideSeekGame;
window.FeatherGame = FeatherGame;
