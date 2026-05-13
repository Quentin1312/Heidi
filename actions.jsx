// Action modals: Caresser, Laver, Brosser, Friandises
// Each is a fullscreen overlay over the hub with its own mini-mechanic.

// ─── Shared utilities ───────────────────────────────────────────────
function useTimer(seconds, onEnd, running) {
  const [left, setLeft] = React.useState(seconds);
  React.useEffect(() => {
    if (!running) return;
    setLeft(seconds);
    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = seconds - elapsed;
      if (remaining <= 0) {
        clearInterval(id);
        setLeft(0);
        onEnd?.();
      } else setLeft(remaining);
    }, 50);
    return () => clearInterval(id);
  }, [running, seconds]);
  return left;
}

function FloatingHearts({ trigger }) {
  const [hearts, setHearts] = React.useState([]);
  React.useEffect(() => {
    if (!trigger) return;
    const id = trigger.id;
    const x = trigger.x, y = trigger.y;
    const arr = [];
    for (let i = 0; i < 5; i++) {
      arr.push({ id: id + '-' + i, x: x + (Math.random() - 0.5) * 30, y, dx: (Math.random() - 0.5) * 40, life: 1 });
    }
    setHearts((h) => [...h, ...arr]);
    setTimeout(() => setHearts((h) => h.filter((p) => !p.id.startsWith(id + '-'))), 1200);
  }, [trigger]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {hearts.map((p) => (
        <div key={p.id} className="floating-heart"
          style={{ left: p.x, top: p.y, '--dx': p.dx + 'px' }}>💕</div>
      ))}
    </div>
  );
}

// ─── CARESSER ───────────────────────────────────────────────────────
const PET_ZONES = [
  { id: 'head',  x: 50, y: 22, label: 'Tête' },
  { id: 'back',  x: 60, y: 50, label: 'Dos' },
  { id: 'belly', x: 50, y: 65, label: 'Ventre' },
  { id: 'tail',  x: 22, y: 55, label: 'Queue' },
];

function PetAction({ onClose, adjust, setCooldown, setMessage }) {
  const [score, setScore] = React.useState({ good: 0, bad: 0 });
  const [activeZone, setActiveZone] = React.useState(null); // currently pulsing zone
  const [trigger, setTrigger] = React.useState(null);
  const [running, setRunning] = React.useState(true);
  const [purring, setPurring] = React.useState(false);
  const scoreRef = React.useRef(score);
  scoreRef.current = score;

  const left = useTimer(30, () => {
    setRunning(false);
    setCooldown('pet', 3 * 60 * 1000);
    const aff = scoreRef.current.good * 5 - scoreRef.current.bad * 2;
    adjust({ affection: Math.max(-5, aff) });
    setMessage(aff > 15 ? "Heidi ronronne fort 💕" : aff > 5 ? "Heidi apprécie." : "Heidi n'a pas tout aimé…");
    setTimeout(onClose, 1600);
  }, running);

  // rotate active zone every 1.5-2.5s
  React.useEffect(() => {
    if (!running) return;
    const cycle = () => {
      const z = PET_ZONES[Math.floor(Math.random() * PET_ZONES.length)];
      setActiveZone(z.id);
      setTimeout(() => setActiveZone(null), 900);
    };
    cycle();
    const id = setInterval(cycle, 1800);
    return () => clearInterval(id);
  }, [running]);

  const handleZone = (e, zone) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTrigger({ id: 't' + Date.now(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    if (activeZone === zone.id) {
      setScore((s) => ({ ...s, good: s.good + 1 }));
      setPurring(true);
      setTimeout(() => setPurring(false), 800);
    } else {
      setScore((s) => ({ ...s, bad: s.bad + 1 }));
    }
  };

  const mood = purring ? 'love' : 'happy';

  return (
    <div className="action-overlay">
      <div className="action-header">
        <div className="action-title">💕 Caresser</div>
        <div className="action-timer">
          <div className="timer-bar"><div style={{ width: (left / 30 * 100) + '%' }} /></div>
          <span>{Math.ceil(left)}s</span>
        </div>
        <button className="action-close" onClick={onClose}>✕</button>
      </div>

      <div className="action-stage">
        <div className="action-heidi-wrap">
          <Heidi mood={mood} pose="roll" />
          {/* zone overlay */}
          <div className="pet-zones">
            {PET_ZONES.map((z) => (
              <button key={z.id} className={"pet-zone " + (activeZone === z.id ? "pet-zone-active" : "")}
                style={{ left: z.x + '%', top: z.y + '%' }}
                onClick={(e) => handleZone(e, z)}>
                <span className="pet-zone-label">{z.label}</span>
              </button>
            ))}
          </div>
          {purring && <div className="purr-bubble">Prrrrr~</div>}
        </div>
        <FloatingHearts trigger={trigger} />
      </div>

      <div className="action-hud">
        <div className="action-stat"><span>✓</span> {score.good}</div>
        <div className="action-stat action-stat-bad"><span>✗</span> {score.bad}</div>
        <div className="action-hint">Clique sur la zone qui <b>pulse</b> ✨</div>
      </div>
    </div>
  );
}

// ─── LAVER (fur sim) ────────────────────────────────────────────────
// Heidi is rendered with HeidiRealistic; we drive her wet field & foam blobs
// from cursor interaction.
function WashAction({ onClose, adjust, setCooldown, setMessage }) {
  const [step, setStep] = React.useState(0);
  // Wet field over strands
  const wetRef = React.useRef(window.makeWetField());
  const [wetVer, setWetVer] = React.useState(0); // bump to force re-render
  const [foam, setFoam] = React.useState([]); // [{id,x,y,r}]
  const [dryness, setDryness] = React.useState(0);
  const [cursor, setCursor] = React.useState(null);
  const [stageRef, setStageRef] = React.useState(null);
  const [heidiEl, setHeidiEl] = React.useState(null);

  const stepLabels = ['💧 Mouiller', '🧼 Savonner', '🚿 Rincer', '🧻 Sécher', '✨ Terminé !'];
  const stepHints = [
    'Maintiens le jet sur Heidi — vise tous ses poils',
    'Clique pour ajouter de la mousse sur son pelage',
    'Rince — fais tomber toutes les bulles avec le jet',
    'Frotte avec la serviette pour la sécher',
  ];

  const ptrDown = React.useRef(false);

  // Compute average wetness for progress
  const wetAvg = React.useMemo(() => {
    const f = wetRef.current;
    let sum = 0;
    for (let i = 0; i < f.length; i++) sum += f[i];
    return sum / f.length;
  }, [wetVer]);

  // Progress per step
  const stepProgress = (() => {
    if (step === 0) return Math.min(1, wetAvg / 0.7);
    if (step === 1) return Math.min(1, foam.length / 6);
    if (step === 2) return Math.min(1, 1 - (foam.length / 6) - Math.max(0, 0.5 - wetAvg));
    if (step === 3) return Math.min(1, dryness / 1);
    return 1;
  })();

  // Auto-advance when step complete
  React.useEffect(() => {
    if (stepProgress >= 0.99) {
      const t = setTimeout(() => {
        if (step === 0) setStep(1);
        else if (step === 1) setStep(2);
        else if (step === 2) {
          // refresh wet field for drying step (full wet)
          for (let i = 0; i < wetRef.current.length; i++) wetRef.current[i] = Math.min(1, wetRef.current[i] + 0.4);
          setWetVer((v) => v + 1);
          setStep(3);
        }
        else if (step === 3) setStep(4);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [stepProgress, step]);

  // Finish step
  React.useEffect(() => {
    if (step === 4) {
      adjust({ affection: 30, energy: 10 });
      setCooldown('wash', 60 * 60 * 1000);
      setMessage('Heidi est toute fluffy ! ✨');
      setTimeout(onClose, 2200);
    }
  }, [step]);

  // Convert page coord → SVG viewBox coord (0..300, 0..360)
  const toSvg = (clientX, clientY) => {
    if (!heidiEl) return null;
    const rect = heidiEl.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 300;
    const y = ((clientY - rect.top) / rect.height) * 360;
    return { x, y };
  };

  const handleMove = (e) => {
    if (!stageRef) return;
    const rect = stageRef.getBoundingClientRect();
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (!ptrDown.current) return;
    const p = toSvg(e.clientX, e.clientY);
    if (!p) return;
    if (step === 0) {
      window.applyWetAt(wetRef.current, p.x, p.y, 38, 0.18);
      setWetVer((v) => v + 1);
    } else if (step === 2) {
      // Rincer: wet + wash off foam in radius
      window.applyWetAt(wetRef.current, p.x, p.y, 36, 0.12);
      setWetVer((v) => v + 1);
      setFoam((arr) => arr.filter((f) => {
        const dx = f.x - p.x, dy = f.y - p.y;
        return dx * dx + dy * dy > 36 * 36;
      }));
    } else if (step === 3) {
      // Sécher: rub — dryness up; only when actually moving
      const moved = Math.abs(e.movementX) + Math.abs(e.movementY);
      if (moved > 2) {
        setDryness((d) => Math.min(1, d + 0.012));
        // dry wet field locally too
        const f = wetRef.current;
        for (let i = 0; i < f.length; i++) f[i] = Math.max(0, f[i] - 0.005);
        setWetVer((v) => v + 1);
      }
    }
  };

  const handleDown = (e) => {
    if (!stageRef) return;
    ptrDown.current = true;
    const rect = stageRef.getBoundingClientRect();
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (step === 1) {
      const p = toSvg(e.clientX, e.clientY);
      if (!p) return;
      // only place foam on body
      if (Math.hypot((p.x - 150) / 80, (p.y - 220) / 130) < 1.2) {
        setFoam((arr) => [...arr, { id: 'f' + Date.now() + Math.random(), x: p.x, y: p.y, r: 14 + Math.random() * 8 }]);
      }
    }
  };
  const handleUp = () => { ptrDown.current = false; };

  // Mood: grumpy when wet starts, neutral mid, happy when drying
  const mood = step === 0 && wetAvg < 0.3 ? 'grumpy'
             : step === 1 ? 'neutral'
             : step === 2 ? 'neutral'
             : step === 3 ? 'happy'
             : 'love';

  // Heidi looks at cursor
  const lookAt = cursor && stageRef ? {
    x: (cursor.x / stageRef.clientWidth - 0.5) * 1.5,
    y: (cursor.y / stageRef.clientHeight - 0.5) * 1.5,
  } : null;

  return (
    <div className="action-overlay">
      <div className="action-header">
        <div className="action-title">{stepLabels[step]}</div>
        <div className="wash-steps">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={"wash-pip " + (i < step ? "wash-pip-done" : i === step ? "wash-pip-active" : "")} />
          ))}
        </div>
        <button className="action-close" onClick={onClose}>✕</button>
      </div>

      <div className="action-stage wash-stage" ref={setStageRef}
        onMouseMove={handleMove} onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp}>
        {/* Splash drops bg when wet a lot */}
        {wetAvg > 0.3 && step < 3 && (
          <>
            <div className="wash-drop" style={{ left: '30%', top: '40%', animationDelay: '0s' }} />
            <div className="wash-drop" style={{ left: '70%', top: '35%', animationDelay: '0.5s' }} />
            <div className="wash-drop" style={{ left: '50%', top: '60%', animationDelay: '1s' }} />
          </>
        )}

        <div className="bathtub" />

        <div ref={setHeidiEl} className="action-heidi-wrap" style={{ touchAction: 'none' }}>
          <HeidiRealistic
            mood={mood}
            wet={wetRef.current}
            foam={foam}
            dryness={dryness}
            look={lookAt}
            scale={1.0}
            tongueOut={step === 4}
          />
          {step === 4 && (
            <>
              <div className="dry-sparkle" style={{ left: '20%', top: '20%' }}>✨</div>
              <div className="dry-sparkle" style={{ left: '80%', top: '30%', animationDelay: '0.3s' }}>✨</div>
              <div className="dry-sparkle" style={{ left: '50%', top: '5%', animationDelay: '0.6s' }}>✨</div>
            </>
          )}
        </div>

        {cursor && step < 4 && (
          <div className="wash-tool" style={{ left: cursor.x, top: cursor.y }}>
            {step === 0 ? '🚿' : step === 1 ? '🧼' : step === 2 ? '🚿' : '🧻'}
          </div>
        )}
      </div>

      <div className="action-hud">
        {step < 4 && (
          <div className="wash-progress">
            <div className="wash-progress-track">
              <div className="wash-progress-fill" style={{ width: (stepProgress * 100) + '%' }} />
            </div>
          </div>
        )}
        <div className="action-hint">{stepHints[step] || 'Heidi se sent fraîche !'}</div>
      </div>
    </div>
  );
}

// ─── BROSSER ────────────────────────────────────────────────────────
function BrushAction({ onClose, adjust, setCooldown, setMessage, affection }) {
  const [strokes, setStrokes] = React.useState(0);
  const [satisfaction, setSatisfaction] = React.useState(0);
  const [running, setRunning] = React.useState(true);
  const [tooFull, setTooFull] = React.useState(false);
  const lastStroke = React.useRef(0);
  const [stageRef, setStageRef] = React.useState(null);
  const [cursor, setCursor] = React.useState(null);
  const [particles, setParticles] = React.useState([]);

  const satRef = React.useRef(0);
  satRef.current = satisfaction;

  // If she's already very satisfied (affection saturé), she refuses to be brushed
  React.useEffect(() => {
    if (affection >= 95) {
      setTooFull(true);
      setRunning(false);
      setMessage('Heidi a déjà eu sa dose de câlins ! ✋');
      setTimeout(onClose, 1800);
    }
  }, []);

  const finish = (msg) => {
    setRunning(false);
    adjust({ affection: 15 + Math.floor(satRef.current / 10) });
    setMessage(msg);
    setTimeout(onClose, 1500);
  };

  const left = useTimer(20, () => running && finish(satRef.current > 50 ? 'Heidi est zen 🪮' : 'Brossage terminé.'), running);

  const handleStroke = (e) => {
    if (!stageRef || !running) return;
    const rect = stageRef.getBoundingClientRect();
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    const now = Date.now();
    const dt = now - lastStroke.current;
    if (e.movementY > 4 && dt > 300) {
      lastStroke.current = now;
      setStrokes((s) => s + 1);
      const good = dt > 600 && dt < 1500;
      setSatisfaction((s) => {
        const next = Math.min(100, s + (good ? 6 : -2));
        if (next >= 100) {
          // She's had enough — she turns away
          setTimeout(() => finish('Heidi tourne la tête : "ça suffit ! 😤"'), 100);
        }
        return next;
      });
      const id = 'p' + now;
      setParticles((p) => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setParticles((p) => p.filter((q) => q.id !== id)), 1000);
    }
  };

  if (tooFull) {
    return (
      <div className="action-overlay">
        <div className="action-header">
          <div className="action-title">🪮 Brosser</div>
          <button className="action-close" onClick={onClose}>✕</button>
        </div>
        <div className="action-stage">
          <div className="action-heidi-wrap">
            <Heidi mood="grumpy" pose="sit" />
            <div className="purr-bubble" style={{ background: '#FFE5C8' }}>Non merci 🙅‍♀️</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-overlay">
      <div className="action-header">
        <div className="action-title">🪮 Brosser</div>
        <div className="action-timer">
          <div className="timer-bar"><div style={{ width: (left / 20 * 100) + '%' }} /></div>
          <span>{Math.ceil(left)}s</span>
        </div>
        <button className="action-close" onClick={onClose}>✕</button>
      </div>

      <div className="action-stage" ref={setStageRef} onMouseMove={handleStroke}>
        <div className="action-heidi-wrap">
          <Heidi mood={satisfaction > 30 ? 'love' : 'happy'} pose="sit" />
        </div>
        {cursor && <div className="brush-tool" style={{ left: cursor.x, top: cursor.y }}>🪮</div>}
        {particles.map((p) => (
          <div key={p.id} className="fur-particle" style={{ left: p.x, top: p.y }} />
        ))}
      </div>

      <div className="action-hud">
        <div className="sat-meter">
          <span>Satisfaction</span>
          <div className="sat-track"><div className="sat-fill" style={{ width: satisfaction + '%' }} /></div>
        </div>
        <div className="action-hint">Glisse de haut en bas, en <b>rythme</b> 🎵</div>
      </div>
    </div>
  );
}

// ─── FRIANDISES ─────────────────────────────────────────────────────
function TreatAction({ onClose, adjust, setCooldown, setMessage, hunger }) {
  const tooFull = hunger >= 85;
  const [phase, setPhase] = React.useState(tooFull ? 'refused' : 'waiting');
  const [readyAt, setReadyAt] = React.useState(0);
  const [result, setResult] = React.useState(null);

  // Auto-close refusal
  React.useEffect(() => {
    if (phase === 'refused') {
      setMessage('Heidi n\'a plus faim — non merci ! 🙅');
      setTimeout(onClose, 1800);
    }
  }, [phase]);

  // Heidi randomly opens mouth (ready phase) for ~1.5s
  React.useEffect(() => {
    if (phase !== 'waiting') return;
    const t = setTimeout(() => {
      setPhase('ready');
      setReadyAt(Date.now());
      setTimeout(() => {
        setPhase((p) => (p === 'ready' ? 'missed-window' : p));
      }, 1500);
    }, 1500 + Math.random() * 1500);
    return () => clearTimeout(t);
  }, [phase]);

  React.useEffect(() => {
    if (phase === 'missed-window') {
      setResult('miss');
      adjust({ hunger: 5 });
      setMessage('Heidi a reniflé sans manger.');
      setTimeout(onClose, 1800);
    }
  }, [phase]);

  const handleDrop = () => {
    if (phase === 'ready') {
      const dt = Date.now() - readyAt;
      const perfect = dt < 800;
      const hungry = hunger < 30;
      const success = perfect || hungry;
      if (success) {
        adjust({ hunger: 20, affection: 10 });
        setResult('great');
        setMessage('Croque ! Heidi adore ❤️');
      } else {
        adjust({ hunger: 10 });
        setResult('ok');
        setMessage('Bien mangé.');
      }
      setPhase('result');
      setTimeout(onClose, 1800);
    } else if (phase === 'waiting') {
      setResult('early');
      adjust({ hunger: 3 });
      setMessage('Heidi a détourné le regard.');
      setPhase('result');
      setTimeout(onClose, 1800);
    }
  };

  if (phase === 'refused') {
    return (
      <div className="action-overlay">
        <div className="action-header">
          <div className="action-title">🍬 Friandises</div>
          <button className="action-close" onClick={onClose}>✕</button>
        </div>
        <div className="action-stage">
          <div className="action-heidi-wrap">
            <Heidi mood="grumpy" pose="sit" />
            <div className="purr-bubble" style={{ background: '#FFE5C8' }}>Plus faim ! 🙅</div>
          </div>
        </div>
      </div>
    );
  }

  const mood = phase === 'ready' ? 'excited' : phase === 'result' && result !== 'great' ? 'grumpy' : 'happy';

  return (
    <div className="action-overlay">
      <div className="action-header">
        <div className="action-title">🍬 Friandises</div>
        <button className="action-close" onClick={onClose}>✕</button>
      </div>

      <div className="action-stage treat-stage">
        <div className="action-heidi-wrap">
          <Heidi mood={mood} pose="sit" />
          {phase === 'ready' && (
            <div className="treat-cue">
              <span>👅</span>
              <div className="treat-cue-ring" />
            </div>
          )}
        </div>
        <button className={"treat-button " + (phase === 'ready' ? "treat-button-ready" : "")} onClick={handleDrop}>
          <span className="treat-emoji">🍬</span>
          <span>Donner la friandise</span>
        </button>
      </div>

      <div className="action-hud">
        <div className="action-hint">
          {phase === 'waiting' && 'Attends qu\'Heidi soit prête… 👁️'}
          {phase === 'ready' && <b>Maintenant ! 🎯</b>}
          {phase === 'result' && result === 'great' && '⭐ Parfait !'}
          {phase === 'result' && result === 'ok' && 'Pas mal.'}
          {phase === 'result' && result === 'early' && '⚠️ Trop tôt'}
        </div>
      </div>
    </div>
  );
}

window.PetAction = PetAction;
window.WashAction = WashAction;
window.BrushAction = BrushAction;
window.TreatAction = TreatAction;

// ─── DORMIR ─────────────────────────────────────────────────────────
function SleepAction({ onClose, adjust, setMessage, energy }) {
  const [running, setRunning] = React.useState(true);
  const [zzz, setZzz] = React.useState([]);
  const energyRef = React.useRef(energy);
  energyRef.current = energy;

  // Energy regen tick
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      adjust({ energy: 3, hunger: -0.2 });
      // spawn a Zzz
      setZzz((arr) => {
        const id = 'z' + Date.now();
        const next = [...arr, { id, x: 50 + (Math.random() - 0.5) * 20, scale: 0.8 + Math.random() * 0.6 }];
        return next.slice(-6);
      });
    }, 700);
    return () => clearInterval(id);
  }, [running]);

  // Auto-end at 100 energy
  React.useEffect(() => {
    if (energy >= 100 && running) {
      setRunning(false);
      setMessage('Heidi s\'étire et se réveille en pleine forme ✨');
      setTimeout(onClose, 1800);
    }
  }, [energy, running]);

  const wakeUp = () => {
    setRunning(false);
    setMessage(energyRef.current > 60 ? 'Heidi se réveille doucement 🌙' : 'Heidi grogne un peu en se réveillant…');
    setTimeout(onClose, 1200);
  };

  return (
    <div className="action-overlay sleep-overlay">
      <div className="action-header">
        <div className="action-title">😴 Dormir</div>
        <div className="action-timer">
          <div className="timer-bar"><div style={{ width: energy + '%', background: '#A8B5DD' }} /></div>
          <span>{Math.round(energy)}%</span>
        </div>
        <button className="action-close" onClick={wakeUp}>✕</button>
      </div>

      <div className="action-stage sleep-stage">
        {/* Pillow */}
        <div className="sleep-pillow" />
        <div className="action-heidi-wrap">
          <Heidi mood="sleepy" pose="lay" scale={1.2} />
          {/* Zzz particles */}
          {zzz.map((z) => (
            <span key={z.id} className="zzz" style={{ left: z.x + '%', transform: `scale(${z.scale})` }}>Z</span>
          ))}
        </div>
        {/* Moon backdrop */}
        <div className="sleep-moon" />
        <div className="sleep-star" style={{ top: '15%', left: '20%' }} />
        <div className="sleep-star" style={{ top: '25%', left: '70%', animationDelay: '0.4s' }} />
        <div className="sleep-star" style={{ top: '10%', left: '55%', animationDelay: '0.8s' }} />
        <div className="sleep-star" style={{ top: '40%', left: '15%', animationDelay: '1.2s' }} />
      </div>

      <div className="action-hud">
        <button className="wake-btn" onClick={wakeUp}>🌅 Réveiller Heidi</button>
        <div className="action-hint">Heidi récupère son énergie… {Math.round(energy)}%</div>
      </div>
    </div>
  );
}

window.SleepAction = SleepAction;
