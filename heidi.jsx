// Heidi sprite — semi-realistic SVG.
// Style: soft gradients, thin fur strokes, amber iris eyes, no thick outlines.
// API identique: mood, pose, style, look, scale, breathing

// ── Defs partagées (gradients + filtres) ──────────────────────────
function HeidiDefs() {
  return (
    <defs>
      <radialGradient id="hd-body" cx="0.42" cy="0.32" r="0.72">
        <stop offset="0%"   stopColor="#2a2a38" />
        <stop offset="45%"  stopColor="#181820" />
        <stop offset="100%" stopColor="#0a0a0e" />
      </radialGradient>

      <radialGradient id="hd-chest" cx="0.5" cy="0.55" r="0.52">
        <stop offset="0%"   stopColor="#38384e" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#0a0a0e" stopOpacity="0"   />
      </radialGradient>

      <radialGradient id="hd-iris" cx="0.36" cy="0.3" r="0.75">
        <stop offset="0%"   stopColor="#FFF07A" />
        <stop offset="38%"  stopColor="#E89012" />
        <stop offset="78%"  stopColor="#8B4800" />
        <stop offset="100%" stopColor="#2a1500" />
      </radialGradient>

      <radialGradient id="hd-ear-pink" cx="0.5" cy="0.65" r="0.6">
        <stop offset="0%"   stopColor="#E8A898" />
        <stop offset="100%" stopColor="#9a5252" />
      </radialGradient>

      <radialGradient id="hd-nose" cx="0.38" cy="0.28" r="0.65">
        <stop offset="0%"   stopColor="#E89898" />
        <stop offset="100%" stopColor="#B05858" />
      </radialGradient>

      <filter id="hd-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
  );
}

// ── Œil semi-réaliste ──────────────────────────────────────────────
function SemiEye({ cx, cy, r, mood, look, side }) {
  const lx = (look?.x || 0) * r * 0.26;
  const ly = (look?.y || 0) * r * 0.26;

  if (mood === 'sleepy') {
    return (
      <g>
        <path d={`M ${cx - r} ${cy + r * 0.05} Q ${cx} ${cy + r * 0.72} ${cx + r} ${cy + r * 0.05}`}
          fill="#0d0d14" stroke="#080808" strokeWidth="1.1" strokeLinecap="round" />
        <path d={`M ${cx - r * 0.55} ${cy - r * 0.05} Q ${cx} ${cy + r * 0.18} ${cx + r * 0.55} ${cy - r * 0.05}`}
          stroke="#1e1e28" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>
    );
  }

  if (mood === 'happy' || mood === 'love') {
    return (
      <g>
        <path d={`M ${cx - r} ${cy + r * 0.38} Q ${cx} ${cy - r * 0.72} ${cx + r} ${cy + r * 0.38}`}
          stroke="#080808" strokeWidth="1.9" fill="none" strokeLinecap="round" />
        <path d={`M ${cx - r * 0.62} ${cy + r * 0.52} Q ${cx} ${cy + r * 0.72} ${cx + r * 0.62} ${cy + r * 0.52}`}
          stroke="#0a0a0a" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.32" />
      </g>
    );
  }

  const ry  = mood === 'grumpy' ? r * 0.56 : mood === 'sad' ? r * 0.86 : r;
  const pRY = mood === 'excited' ? r * 0.72 : mood === 'grumpy' ? r * 0.33 : r * 0.6;
  const pRX = mood === 'excited' ? r * 0.3  : r * 0.19;

  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r}      ry={ry}       fill="#13100a" />
      <ellipse cx={cx} cy={cy} rx={r*0.86} ry={ry*0.86}  fill="url(#hd-iris)" />
      <ellipse cx={cx + lx} cy={cy + ly} rx={pRX} ry={pRY} fill="#040404" />
      <circle  cx={cx + lx + r * 0.3}  cy={cy + ly - r * 0.27} r={r * 0.21} fill="rgba(255,255,255,0.93)" />
      <circle  cx={cx + lx - r * 0.18} cy={cy + ly + r * 0.3}  r={r * 0.09} fill="rgba(255,255,255,0.42)" />
      <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill="none" stroke="#060606" strokeWidth="0.85" />

      {mood === 'grumpy' && (
        <path
          d={side === 'L'
            ? `M ${cx - r * 1.18} ${cy - ry - r * 0.28} L ${cx + r * 0.28} ${cy - ry + r * 0.12}`
            : `M ${cx - r * 0.28} ${cy - ry - r * 0.28} L ${cx + r * 1.18} ${cy - ry + r * 0.12}`}
          stroke="#080808" strokeWidth="1.55" strokeLinecap="round" />
      )}
    </g>
  );
}

// ── Bouche ────────────────────────────────────────────────────────
function SemiMouth({ cx, cy, mood }) {
  if (mood === 'sleepy') return null;

  if (mood === 'happy' || mood === 'love') {
    return (
      <g>
        <path d={`M ${cx-7} ${cy} Q ${cx-3.5} ${cy+5} ${cx} ${cy+1}`}
          stroke="#080808" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d={`M ${cx} ${cy+1} Q ${cx+3.5} ${cy+5} ${cx+7} ${cy}`}
          stroke="#080808" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {mood === 'love' && (
          <path d="M -4 0 Q -4 5 0 6 Q 4 5 4 0 Q 2 -3 0 -5 Q -2 -3 -4 0"
            transform={`translate(${cx} ${cy+5})`}
            fill="#E89898" stroke="#080808" strokeWidth="0.7" opacity="0.88" />
        )}
      </g>
    );
  }
  if (mood === 'grumpy') {
    return <path d={`M ${cx-6} ${cy+4} Q ${cx} ${cy} ${cx+6} ${cy+4}`}
      stroke="#080808" strokeWidth="1.4" fill="none" strokeLinecap="round" />;
  }
  if (mood === 'sad') {
    return <path d={`M ${cx-5} ${cy+5} Q ${cx} ${cy+1} ${cx+5} ${cy+5}`}
      stroke="#080808" strokeWidth="1.4" fill="none" strokeLinecap="round" />;
  }
  return (
    <g>
      <path d={`M ${cx-6} ${cy+1} Q ${cx-3} ${cy+4.5} ${cx} ${cy+1}`}
        stroke="#080808" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d={`M ${cx} ${cy+1} Q ${cx+3} ${cy+4.5} ${cx+6} ${cy+1}`}
        stroke="#080808" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {mood === 'excited' && (
        <ellipse cx={cx} cy={cy+6.5} rx="3.2" ry="2.4" fill="url(#hd-nose)" opacity="0.72" />
      )}
    </g>
  );
}

// ── Tête ──────────────────────────────────────────────────────────
function SemiHead({ cx, cy, mood, look }) {
  const earTilt = mood === 'sad' ? -14 : mood === 'grumpy' ? -22 : mood === 'excited' ? 6 : 0;

  return (
    <g>
      {/* Oreille gauche */}
      <g transform={`rotate(${earTilt} ${cx-30} ${cy-18})`}>
        <path d={`M ${cx-44} ${cy+2} L ${cx-36} ${cy-50} L ${cx-16} ${cy-16} Z`}
          fill="url(#hd-body)" stroke="#080808" strokeWidth="0.75" strokeLinejoin="round" />
        <path d={`M ${cx-38} ${cy-7} L ${cx-32} ${cy-40} L ${cx-21} ${cy-16} Z`}
          fill="url(#hd-ear-pink)" opacity="0.88" />
        <g stroke="#0e0e14" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.62">
          <path d={`M ${cx-36} ${cy-48} L ${cx-38} ${cy-57}`} />
          <path d={`M ${cx-33} ${cy-47} L ${cx-34} ${cy-56}`} />
          <path d={`M ${cx-30} ${cy-46} L ${cx-30} ${cy-55}`} />
        </g>
      </g>

      {/* Oreille droite */}
      <g transform={`rotate(${-earTilt} ${cx+30} ${cy-18})`}>
        <path d={`M ${cx+44} ${cy+2} L ${cx+36} ${cy-50} L ${cx+16} ${cy-16} Z`}
          fill="url(#hd-body)" stroke="#080808" strokeWidth="0.75" strokeLinejoin="round" />
        <path d={`M ${cx+38} ${cy-7} L ${cx+32} ${cy-40} L ${cx+21} ${cy-16} Z`}
          fill="url(#hd-ear-pink)" opacity="0.88" />
        <g stroke="#0e0e14" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.62">
          <path d={`M ${cx+36} ${cy-48} L ${cx+38} ${cy-57}`} />
          <path d={`M ${cx+33} ${cy-47} L ${cx+34} ${cy-56}`} />
          <path d={`M ${cx+30} ${cy-46} L ${cx+30} ${cy-55}`} />
        </g>
      </g>

      {/* Tête */}
      <ellipse cx={cx} cy={cy} rx={44} ry={41}
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />

      {/* Joues */}
      <ellipse cx={cx-43} cy={cy+13} rx={10} ry={15}
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.65" />
      <ellipse cx={cx+43} cy={cy+13} rx={10} ry={15}
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.65" />

      {/* Texture fourrure tête */}
      <g stroke="#28283a" strokeWidth="0.65" fill="none" strokeLinecap="round" opacity="0.52">
        <path d={`M ${cx-20} ${cy-28} Q ${cx-11} ${cy-35} ${cx} ${cy-34}`} />
        <path d={`M ${cx} ${cy-34} Q ${cx+11} ${cy-35} ${cx+20} ${cy-28}`} />
        <path d={`M ${cx-9}  ${cy-38} Q ${cx} ${cy-43} ${cx+9}  ${cy-38}`} />
        <path d={`M ${cx-38} ${cy+4}  Q ${cx-45} ${cy+10} ${cx-42} ${cy+20}`} />
        <path d={`M ${cx+38} ${cy+4}  Q ${cx+45} ${cy+10} ${cx+42} ${cy+20}`} />
        <path d={`M ${cx-30} ${cy-32} Q ${cx-22} ${cy-37} ${cx-14} ${cy-34}`} />
        <path d={`M ${cx+30} ${cy-32} Q ${cx+22} ${cy-37} ${cx+14} ${cy-34}`} />
      </g>

      {/* Yeux */}
      <SemiEye cx={cx-15} cy={cy-2} r={9}  mood={mood} look={look} side="L" />
      <SemiEye cx={cx+15} cy={cy-2} r={9}  mood={mood} look={look} side="R" />

      {/* Nez */}
      <path d={`M ${cx-4.5} ${cy+13} L ${cx+4.5} ${cy+13} L ${cx} ${cy+18.5} Z`}
        fill="url(#hd-nose)" stroke="#080808" strokeWidth="0.75" strokeLinejoin="round" />
      <line x1={cx} y1={cy+18.5} x2={cx} y2={cy+22}
        stroke="#080808" strokeWidth="0.95" strokeLinecap="round" />

      {/* Bouche */}
      <SemiMouth cx={cx} cy={cy+22} mood={mood} />

      {/* Moustaches */}
      <g stroke="#c8c8c8" strokeWidth="0.72" fill="none" strokeLinecap="round" opacity="0.72">
        <line x1={cx-16} y1={cy+17} x2={cx-44} y2={cy+14} />
        <line x1={cx-16} y1={cy+21} x2={cx-46} y2={cy+22} />
        <line x1={cx-16} y1={cy+25} x2={cx-42} y2={cy+30} />
        <line x1={cx+16} y1={cy+17} x2={cx+44} y2={cy+14} />
        <line x1={cx+16} y1={cy+21} x2={cx+46} y2={cy+22} />
        <line x1={cx+16} y1={cy+25} x2={cx+42} y2={cy+30} />
      </g>
      {/* Moustaches sourcils */}
      <g stroke="#c0c0c0" strokeWidth="0.65" fill="none" strokeLinecap="round" opacity="0.55">
        <path d={`M ${cx-17} ${cy-13} Q ${cx-30} ${cy-17} ${cx-40} ${cy-16}`} />
        <path d={`M ${cx+17} ${cy-13} Q ${cx+30} ${cy-17} ${cx+40} ${cy-16}`} />
      </g>
    </g>
  );
}

// ── Texture fourrure corps ─────────────────────────────────────────
function FurStrokes({ lines }) {
  return (
    <g stroke="#26263a" strokeWidth="0.68" fill="none" strokeLinecap="round" opacity="0.44">
      {lines.map(([d], i) => <path key={i} d={d} />)}
    </g>
  );
}

// ── Poses ─────────────────────────────────────────────────────────
function SemiSit({ mood, look }) {
  return (
    <g>
      {/* Queue */}
      <path d="M 78 178 Q 38 168 32 132 Q 29 103 46 96 Q 62 92 66 112"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" strokeLinejoin="round" strokeLinecap="round" />
      <g stroke="#28283a" strokeWidth="0.65" fill="none" strokeLinecap="round" opacity="0.58">
        <path d="M 46 96 Q 40 90 44 83" />
        <path d="M 51 94 Q 47 88 51 82" />
        <path d="M 56 92 Q 54 86 58 80" />
      </g>

      {/* Corps */}
      <path d="M 95 108 Q 49 113 47 163 Q 43 200 60 220 Q 80 233 110 231 Q 145 231 162 220 Q 179 200 175 163 Q 171 118 125 108 Z"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" strokeLinejoin="round" />
      <path d="M 96 148 Q 87 167 90 190 Q 100 208 110 207 Q 122 207 130 190 Q 133 170 125 150"
        fill="url(#hd-chest)" />

      {/* Texture fourrure corps */}
      <g stroke="#26263a" strokeWidth="0.68" fill="none" strokeLinecap="round" opacity="0.44">
        <path d="M 100 153 Q 97 161 99 169" />
        <path d="M 107 150 Q 104 159 106 167" />
        <path d="M 114 148 Q 111 157 113 165" />
        <path d="M 121 150 Q 119 159 121 167" />
        <path d="M 128 153 Q 126 161 128 169" />
        <path d="M 60 162 Q 54 168 57 176" />
        <path d="M 56 180 Q 50 187 53 195" />
        <path d="M 163 162 Q 169 168 165 176" />
        <path d="M 167 180 Q 173 187 169 195" />
        <path d="M 88 195 Q 86 202 89 208" />
        <path d="M 133 195 Q 135 202 132 208" />
      </g>

      {/* Pattes avant */}
      <ellipse cx="85"  cy="225" rx="16" ry="9"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />
      <ellipse cx="135" cy="225" rx="16" ry="9"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />
      <g stroke="#1a1a22" strokeWidth="0.7" strokeLinecap="round">
        <line x1="78"  y1="220" x2="78"  y2="228" />
        <line x1="84"  y1="219" x2="84"  y2="227" />
        <line x1="90"  y1="220" x2="90"  y2="228" />
        <line x1="128" y1="220" x2="128" y2="228" />
        <line x1="134" y1="219" x2="134" y2="227" />
        <line x1="140" y1="220" x2="140" y2="228" />
      </g>

      <SemiHead cx={110} cy={76} mood={mood} look={look} />
    </g>
  );
}

function SemiLay({ mood, look }) {
  return (
    <g>
      {/* Corps couché */}
      <ellipse cx="110" cy="178" rx="88" ry="52"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" />
      <ellipse cx="106" cy="185" rx="54" ry="22" fill="url(#hd-chest)" />
      {/* Queue */}
      <path d="M 176 173 Q 202 163 197 138 Q 190 118 168 128"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" strokeLinejoin="round" />
      {/* Pattes repliées */}
      <ellipse cx="57" cy="200" rx="13" ry="7"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />
      <g stroke="#26263a" strokeWidth="0.68" fill="none" strokeLinecap="round" opacity="0.44">
        <path d="M 75 178 Q 72 183 75 188" />
        <path d="M 92 174 Q 89 180 92 185" />
        <path d="M 110 172 Q 108 178 110 183" />
        <path d="M 128 174 Q 126 180 128 185" />
        <path d="M 146 178 Q 144 183 146 188" />
      </g>
      <SemiHead cx={68} cy={148} mood={mood} look={look} />
    </g>
  );
}

function SemiCrouch({ mood, look }) {
  return (
    <g>
      <path d="M 58 198 Q 47 202 47 218 L 174 218 Q 181 202 165 198 Q 165 164 130 157 Q 95 157 58 177 Z"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" strokeLinejoin="round" />
      <path d="M 168 202 Q 213 200 219 182 Q 222 164 208 168"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" strokeLinejoin="round" />
      <ellipse cx="68"  cy="220" rx="12" ry="6"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />
      <ellipse cx="153" cy="220" rx="12" ry="6"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />
      <g stroke="#26263a" strokeWidth="0.68" fill="none" strokeLinecap="round" opacity="0.44">
        <path d="M 80 186 Q 77 192 80 197" />
        <path d="M 100 181 Q 97 187 100 192" />
        <path d="M 120 179 Q 118 185 120 190" />
        <path d="M 140 181 Q 138 187 140 192" />
      </g>
      <SemiHead cx={70} cy={136} mood={mood} look={look} />
    </g>
  );
}

function SemiJump({ mood, look }) {
  return (
    <g transform="rotate(-12 110 130)">
      <path d="M 54 128 Q 44 107 64 92 Q 100 77 145 87 Q 181 97 181 128 Q 181 158 145 163 Q 95 166 64 156 Q 49 148 54 128 Z"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" strokeLinejoin="round" />
      <path d="M 176 128 Q 219 108 224 82 Q 219 67 200 78"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" strokeLinejoin="round" />
      <ellipse cx="53" cy="133" rx="14" ry="7"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" transform="rotate(-30 53 133)" />
      <ellipse cx="57" cy="112" rx="13" ry="7"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" transform="rotate(-45 57 112)" />
      <g stroke="#26263a" strokeWidth="0.68" fill="none" strokeLinecap="round" opacity="0.44">
        <path d="M 100 114 Q 98 121 100 127" />
        <path d="M 120 111 Q 118 118 120 124" />
        <path d="M 140 114 Q 138 121 140 127" />
      </g>
      <SemiHead cx={74} cy={102} mood={mood} look={look} />
    </g>
  );
}

function SemiRoll({ mood, look }) {
  return (
    <g>
      <ellipse cx="110" cy="190" rx="84" ry="39"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" />
      <ellipse cx="110" cy="182" rx="52" ry="21" fill="url(#hd-chest)" />
      {/* Pattes en l'air */}
      <ellipse cx="80"  cy="154" rx="9" ry="13" fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />
      <ellipse cx="100" cy="149" rx="9" ry="13" fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />
      <ellipse cx="140" cy="154" rx="9" ry="13" fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />
      <ellipse cx="160" cy="159" rx="9" ry="13" fill="url(#hd-body)" stroke="#080808" strokeWidth="0.72" />
      {/* Petits coussins roses */}
      <ellipse cx="80"  cy="143" rx="3.2" ry="2.2" fill="url(#hd-ear-pink)" opacity="0.78" />
      <ellipse cx="100" cy="138" rx="3.2" ry="2.2" fill="url(#hd-ear-pink)" opacity="0.78" />
      <ellipse cx="140" cy="143" rx="3.2" ry="2.2" fill="url(#hd-ear-pink)" opacity="0.78" />
      <ellipse cx="160" cy="148" rx="3.2" ry="2.2" fill="url(#hd-ear-pink)" opacity="0.78" />
      {/* Queue */}
      <path d="M 193 185 Q 223 170 219 144"
        fill="url(#hd-body)" stroke="#080808" strokeWidth="0.78" strokeLinejoin="round" />
      <g stroke="#26263a" strokeWidth="0.68" fill="none" strokeLinecap="round" opacity="0.44">
        <path d="M 74 186 Q 72 192 75 196" />
        <path d="M 110 183 Q 108 189 110 194" />
        <path d="M 146 186 Q 144 192 147 196" />
      </g>
      <SemiHead cx={44} cy={184} mood={mood} look={look} />
    </g>
  );
}

// ── Composant Rive (chat animé avec suivi de souris) ──────────────
function HeidiRive({ scale = 1 }) {
  const canvasRef = React.useRef(null);
  const riveRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || typeof rive === 'undefined') return;
    const r = new rive.Rive({
      src: 'heidi.riv',
      canvas: canvasRef.current,
      autoplay: true,
      stateMachines: 'State Machine 1',
      onLoad: () => r.resizeDrawingSurfaceToCanvas(),
    });
    riveRef.current = r;
    return () => { try { r.cleanup(); } catch(e) {} };
  }, []);

  const size = Math.round(300 * scale);
  return (
    <canvas ref={canvasRef} width={size} height={size}
      style={{ width: size + 'px', height: size + 'px', display: 'block' }} />
  );
}

// ── Composant principal ────────────────────────────────────────────
function Heidi({ mood = 'neutral', pose = 'sit', style, look, scale = 1, breathing = true, ...rest }) {
  // Chat Rive pour la pose assise (hub principal)
  if (pose === 'sit') {
    return <HeidiRive scale={scale} />;
  }
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!breathing) return;
    const id = setInterval(() => setTick(t => t + 1), 160);
    return () => clearInterval(id);
  }, [breathing]);
  const breathY = breathing ? Math.sin(tick / 10) * 0.009 : 0;

  const PoseMap = {
    sit:    SemiSit,
    lay:    SemiLay,
    crouch: SemiCrouch,
    jump:   SemiJump,
    roll:   SemiRoll,
  };
  const PoseComp = PoseMap[pose] || SemiSit;

  return (
    <svg viewBox="0 0 220 240" width={220 * scale} height={240 * scale}
      className={breathing ? 'heidi-breathing' : ''}
      style={{ overflow: 'visible' }}>
      <HeidiDefs />
      {/* Ombre portée douce */}
      <ellipse cx="110" cy="236" rx="80" ry="7"
        fill="rgba(0,0,0,0.18)" filter="url(#hd-shadow)" />
      <g style={{ transform: `scaleY(${1 + breathY})`, transformOrigin: '110px 210px' }}>
        <PoseComp mood={mood} look={look} />
      </g>
    </svg>
  );
}

window.Heidi = Heidi;
window.HeidiHead = SemiHead;
