// Realistic Heidi: a fluffy black cat silhouette built from hundreds of fur
// strands. Each strand has a base angle, length, and a per-strand wetness +
// foaminess that the wash game drives. Pose is front-facing sit like the
// reference photo (looking slightly up, tongue blep optional).
//
// Exports:
//   <HeidiRealistic mood={...} wet={Float32Array | null} foam={blobs[]}
//                   dryness={0..1} blink={bool} tongueOut={bool}
//                   onFurInteract={(idx, x, y) => void}
//                   interactive={bool} />
//   makeFurField()  → { strands, body, wet, foam }   (state for wash sim)

const FUR_SEED_PRNG = (() => {
  let s = 0x12345678;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return (s & 0xffffff) / 0xffffff; };
})();

// Anatomy in 0..1 normalized coords for the strand emitter, mapped to 300x360 viewbox.
// Body silhouette path (sit, front-facing).
const HR_BODY_PATH =
  "M 150 80 " +                        // top-of-head
  "C 105 80, 75 110, 75 150 " +        // left side of head
  "C 70 175, 75 195, 90 210 " +        // jowl
  "C 85 220, 80 240, 78 260 " +        // body taper start (L)
  "C 70 290, 70 320, 92 335 " +        // bottom-left flank
  "C 115 345, 185 345, 208 335 " +     // bottom curve
  "C 230 320, 230 290, 222 260 " +     // bottom-right flank
  "C 220 240, 215 220, 210 210 " +     // jowl R
  "C 225 195, 230 175, 225 150 " +     // head right
  "C 225 110, 195 80, 150 80 Z";

// Ear paths
const HR_EAR_L = "M 92 95 L 80 35 L 130 70 Z";
const HR_EAR_R = "M 208 95 L 220 35 L 170 70 Z";

// Build strand list once and cache. Each strand: {x, y, angle (rad, 0=up), length, width, color}
function buildStrands() {
  // Sample points around the body silhouette using a SVG path measurement.
  // We can't run getTotalLength outside DOM, so we hand-pick emitter points
  // by walking the path approximation. Generate strands clustered in dense
  // regions (chest ruff, cheek fluff, tail fluff).
  const strands = [];
  const rand = () => Math.random(); // deterministic-ish per session

  // Outline strands: along approximate body outline (parametric ellipse-ish)
  // Use 220 outline strands.
  const outlinePoints = [
    // (cx, cy of region, rx, ry, angleStart, angleEnd, density, baseAngleMode)
    // Head halo
    { cx: 150, cy: 130, rx: 80, ry: 60, a0: 200, a1: 340, n: 50, mode: 'radial' },
    // Cheek fluff L
    { cx: 80, cy: 175, rx: 14, ry: 32, a0: 130, a1: 250, n: 28, mode: 'side-L' },
    // Cheek fluff R
    { cx: 220, cy: 175, rx: 14, ry: 32, a0: 290, a1: 50, n: 28, mode: 'side-R' },
    // Chest ruff (big fluffy front)
    { cx: 150, cy: 240, rx: 75, ry: 30, a0: 165, a1: 15, n: 60, mode: 'down' },
    // Belly fluff
    { cx: 150, cy: 310, rx: 80, ry: 18, a0: 175, a1: 5, n: 50, mode: 'down' },
    // Left flank
    { cx: 80, cy: 270, rx: 14, ry: 50, a0: 160, a1: 200, n: 25, mode: 'side-L' },
    // Right flank
    { cx: 220, cy: 270, rx: 14, ry: 50, a0: 340, a1: 20, n: 25, mode: 'side-R' },
    // Top of head fluff
    { cx: 150, cy: 85, rx: 50, ry: 8, a0: 195, a1: 345, n: 22, mode: 'up' },
  ];

  let idx = 0;
  for (const r of outlinePoints) {
    for (let i = 0; i < r.n; i++) {
      const t = i / r.n;
      let a0 = r.a0, a1 = r.a1;
      if (a1 < a0) a1 += 360;
      const ang = (a0 + (a1 - a0) * t) * Math.PI / 180;
      const jitter = (rand() - 0.5) * 0.3;
      const x = r.cx + Math.cos(ang) * r.rx + (rand() - 0.5) * 4;
      const y = r.cy + Math.sin(ang) * r.ry + (rand() - 0.5) * 4;

      // base angle (which direction the strand points, 0 = up, +PI/2 = right)
      let baseA;
      if (r.mode === 'radial') {
        baseA = ang + Math.PI / 2; // tangent? actually outward
        baseA = ang; // outward radial
      } else if (r.mode === 'down') {
        baseA = Math.PI / 2 + (rand() - 0.5) * 0.7;
      } else if (r.mode === 'up') {
        baseA = -Math.PI / 2 + (rand() - 0.5) * 0.6;
      } else if (r.mode === 'side-L') {
        baseA = Math.PI + (rand() - 0.5) * 0.8;
      } else if (r.mode === 'side-R') {
        baseA = 0 + (rand() - 0.5) * 0.8;
      } else {
        baseA = ang;
      }

      const len = 14 + rand() * (r.mode === 'down' ? 32 : 22);
      const width = 0.8 + rand() * 1.6;
      // Color: dark with subtle variance
      const v = 8 + Math.floor(rand() * 18);
      const tint = rand() < 0.15 ? `rgb(${v + 8},${v + 4},${v})` :
                   rand() < 0.1 ? `rgb(${v},${v},${v + 6})` :
                                  `rgb(${v},${v},${v})`;
      strands.push({
        idx: idx++,
        x, y, baseA: baseA + jitter,
        len, width, color: tint,
        // curl factor for the strand
        curl: (rand() - 0.5) * 0.6,
      });
    }
  }

  // Interior body strands (texture) — short ones for fluff density
  for (let i = 0; i < 120; i++) {
    const x = 90 + rand() * 120;
    const y = 90 + rand() * 240;
    // skip if outside roughly oval body
    const dx = (x - 150) / 90, dy = (y - 220) / 130;
    if (dx * dx + dy * dy > 1) continue;
    const baseA = -Math.PI / 2 + (rand() - 0.5) * 1.2 + (y - 220) / 200;
    const len = 6 + rand() * 12;
    const width = 0.6 + rand() * 1;
    const v = 12 + Math.floor(rand() * 14);
    strands.push({
      idx: idx++, x, y, baseA, len, width,
      color: `rgb(${v},${v},${v})`,
      curl: (rand() - 0.5) * 0.4,
    });
  }

  return strands;
}

// Module-level cache for stable strand layout across renders.
let __STRAND_CACHE = null;
function getStrands() {
  if (!__STRAND_CACHE) __STRAND_CACHE = buildStrands();
  return __STRAND_CACHE;
}

function strandPath(s, wet, foamPull, gravityPull) {
  // Wet strands: tilt toward gravity, slightly elongate, less curl
  const wetFactor = wet || 0;
  const angle = s.baseA * (1 - wetFactor * 0.6) + (Math.PI / 2) * (wetFactor * 0.85 + gravityPull * 0.2);
  const len = s.len * (1 - wetFactor * 0.15);
  const x2 = s.x + Math.cos(angle) * len;
  const y2 = s.y + Math.sin(angle) * len;
  // control point: introduce curl
  const cx = s.x + Math.cos(angle - 0.3) * len * 0.5 + s.curl * len * (1 - wetFactor);
  const cy = s.y + Math.sin(angle - 0.3) * len * 0.5;
  return `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function HeidiRealistic({
  mood = 'neutral', wet = null, foam = [], dryness = 0,
  blink = false, tongueOut = false, breathing = true,
  scale = 1, interactive = false, onFurInteract,
  look = null, message = null,
}) {
  const strands = getStrands();
  const [tick, setTick] = React.useState(0);

  // gentle sway via tick (breathing)
  React.useEffect(() => {
    if (!breathing) return;
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [breathing]);
  const sway = breathing ? Math.sin(tick / 12) * 0.04 : 0;

  // eye state from mood
  const closedEyes = mood === 'sleepy' || blink;
  const happyEyes = mood === 'happy' || mood === 'love';
  const grumpy = mood === 'grumpy';
  const excited = mood === 'excited';
  const sad = mood === 'sad';

  const eyeR = excited ? 16 : 14;
  const pupilR = excited ? eyeR * 0.45 : grumpy ? eyeR * 0.32 : eyeR * 0.55;
  const lookX = (look?.x || 0) * 3;
  const lookY = (look?.y || 0) * 3;

  const handleMove = (e) => {
    if (!interactive || !onFurInteract) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 360;
    onFurInteract(x, y, e);
  };

  const handleClick = (e) => {
    if (!interactive || !onFurInteract) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 360;
    onFurInteract(x, y, e, true);
  };

  return (
    <svg viewBox="0 0 300 360" width={300 * scale} height={360 * scale}
      style={{ overflow: 'visible', display: 'block', touchAction: 'none' }}
      onMouseMove={handleMove}
      onMouseDown={handleClick}
      onTouchMove={(e) => {
        if (!interactive || !onFurInteract) return;
        const t = e.touches[0]; if (!t) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((t.clientX - rect.left) / rect.width) * 300;
        const y = ((t.clientY - rect.top) / rect.height) * 360;
        onFurInteract(x, y, e);
      }}>
      <defs>
        <radialGradient id="hr-body-grad" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#2a2a2c" />
          <stop offset="60%" stopColor="#161616" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </radialGradient>
        <radialGradient id="hr-eye-grad" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#FFE96B" />
          <stop offset="50%" stopColor="#F5C334" />
          <stop offset="100%" stopColor="#C99020" />
        </radialGradient>
        <linearGradient id="hr-ear-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <radialGradient id="hr-ear-pink" cx="0.5" cy="0.6" r="0.5">
          <stop offset="0%" stopColor="#E8B0A8" />
          <stop offset="100%" stopColor="#A87878" />
        </radialGradient>
        <filter id="hr-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="150" cy="350" rx="120" ry="10" fill="rgba(0,0,0,0.25)" filter="url(#hr-soft-shadow)" />

      {/* Tail behind body */}
      <g transform="translate(220 240)">
        <path d="M 0 0 C 40 -10, 60 -50, 50 -100 C 45 -120, 30 -125, 20 -115"
          fill="url(#hr-body-grad)" stroke="#0a0a0a" strokeWidth="1" opacity="0.9" />
        {/* Tail fluff strands */}
        <g stroke="#0a0a0a" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.85">
          {Array.from({ length: 22 }).map((_, i) => {
            const t = i / 22;
            const cx = t * 50 + Math.sin(t * 3) * 10;
            const cy = -t * 110;
            const ang = -Math.PI / 2 + Math.sin(t * 4) * 0.5 + 0.2;
            const len = 8 + (i % 3) * 4;
            const x2 = cx + Math.cos(ang) * len;
            const y2 = cy + Math.sin(ang) * len;
            return <path key={i} d={`M ${cx} ${cy} L ${x2} ${y2}`} />;
          })}
        </g>
      </g>

      {/* Ears (back layer) */}
      <g>
        <path d={HR_EAR_L} fill="url(#hr-ear-grad)" stroke="#000" strokeWidth="1" />
        <path d={HR_EAR_R} fill="url(#hr-ear-grad)" stroke="#000" strokeWidth="1" />
        {/* Inner pink */}
        <path d="M 100 88 L 95 50 L 122 75 Z" fill="url(#hr-ear-pink)" opacity="0.85" />
        <path d="M 200 88 L 205 50 L 178 75 Z" fill="url(#hr-ear-pink)" opacity="0.85" />
        {/* Ear tufts */}
        <g stroke="#0a0a0a" strokeWidth="1.2" strokeLinecap="round" fill="none">
          <path d="M 80 38 L 76 28 M 82 35 L 80 22 M 84 32 L 86 20" />
          <path d="M 220 38 L 224 28 M 218 35 L 220 22 M 216 32 L 214 20" />
        </g>
      </g>

      {/* Body fill */}
      <path d={HR_BODY_PATH} fill="url(#hr-body-grad)" />

      {/* Strand layer */}
      <g style={{ transform: `rotate(${sway}rad)`, transformOrigin: '150px 200px' }}>
        {strands.map((s) => {
          const wetVal = wet ? wet[s.idx] || 0 : 0;
          const visualWet = Math.max(0, wetVal - dryness);
          const path = strandPath(s, visualWet, 0, 0);
          // wet strands darker + slight shine
          const stroke = visualWet > 0.2
            ? `rgb(${Math.round(4 + (1 - visualWet) * 12)},${Math.round(4 + (1 - visualWet) * 12)},${Math.round(6 + (1 - visualWet) * 14)})`
            : s.color;
          return (
            <path key={s.idx} d={path}
              stroke={stroke}
              strokeWidth={s.width * (1 + visualWet * 0.4)}
              fill="none" strokeLinecap="round"
              opacity={0.9} />
          );
        })}
      </g>

      {/* Wet sheen overlay for wet patches */}
      {wet && (
        <g pointerEvents="none">
          {/* sample a coarse grid of wet hotspots */}
          {strands.filter((_, i) => i % 18 === 0).map((s) => {
            const w = (wet[s.idx] || 0) - dryness;
            if (w < 0.2) return null;
            return (
              <ellipse key={s.idx} cx={s.x} cy={s.y + 4} rx={10 + w * 8} ry={5 + w * 3}
                fill="rgba(120,180,220,0.18)" opacity={w} />
            );
          })}
        </g>
      )}

      {/* Foam blobs */}
      {foam && foam.map((f) => (
        <g key={f.id} transform={`translate(${f.x} ${f.y})`} pointerEvents="none">
          <circle r={f.r * 1.1} fill="#fff" opacity="0.95" />
          <circle cx={-f.r * 0.4} cy={-f.r * 0.3} r={f.r * 0.6} fill="#fff" />
          <circle cx={f.r * 0.45} cy={-f.r * 0.1} r={f.r * 0.5} fill="#fff" />
          <circle cx={f.r * 0.1} cy={f.r * 0.4} r={f.r * 0.55} fill="#fff" />
          <circle cx={-f.r * 0.3} cy={f.r * 0.35} r={f.r * 0.4} fill="#fff" />
          {/* tiny shine */}
          <circle cx={-f.r * 0.3} cy={-f.r * 0.4} r={f.r * 0.18} fill="#fff" opacity="0.8" />
          <circle cx={f.r * 0.1} cy={f.r * 0.15} r={f.r * 0.08} fill="rgba(180,210,230,0.7)" />
        </g>
      ))}

      {/* Face features (top-most so they aren't covered by strands) */}
      <g>
        {/* Eyes */}
        {closedEyes ? (
          <>
            <path d={`M ${118} ${165} q 12 8 24 0`} stroke="#0a0a0a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M ${158} ${165} q 12 8 24 0`} stroke="#0a0a0a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : happyEyes ? (
          <>
            <path d={`M ${118} ${172} q 12 -10 24 0`} stroke="#0a0a0a" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d={`M ${158} ${172} q 12 -10 24 0`} stroke="#0a0a0a" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Left eye */}
            <ellipse cx={130} cy={170} rx={eyeR} ry={sad ? eyeR * 0.9 : grumpy ? eyeR * 0.5 : eyeR}
              fill="url(#hr-eye-grad)" stroke="#0a0a0a" strokeWidth="1.5" />
            <ellipse cx={130 + lookX} cy={170 + lookY} rx={pupilR * 0.55} ry={pupilR}
              fill="#0a0a0a" />
            <circle cx={130 + lookX + 4} cy={170 + lookY - 4} r="2.6" fill="#fff" />
            <circle cx={130 + lookX - 2} cy={170 + lookY + 5} r="1.2" fill="#fff" opacity="0.6" />
            {/* Right eye */}
            <ellipse cx={170} cy={170} rx={eyeR} ry={sad ? eyeR * 0.9 : grumpy ? eyeR * 0.5 : eyeR}
              fill="url(#hr-eye-grad)" stroke="#0a0a0a" strokeWidth="1.5" />
            <ellipse cx={170 + lookX} cy={170 + lookY} rx={pupilR * 0.55} ry={pupilR}
              fill="#0a0a0a" />
            <circle cx={170 + lookX + 4} cy={170 + lookY - 4} r="2.6" fill="#fff" />
            <circle cx={170 + lookX - 2} cy={170 + lookY + 5} r="1.2" fill="#fff" opacity="0.6" />
            {grumpy && (
              <>
                <path d="M 112 158 L 138 164" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" />
                <path d="M 188 158 L 162 164" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
          </>
        )}

        {/* Nose */}
        <path d="M 144 195 L 156 195 L 150 203 Z" fill="#C97B7B" stroke="#0a0a0a" strokeWidth="1.2" strokeLinejoin="round" />
        <line x1="150" y1="203" x2="150" y2="210" stroke="#0a0a0a" strokeWidth="1.4" />

        {/* Mouth */}
        <path d="M 150 210 Q 142 216 138 213" stroke="#0a0a0a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M 150 210 Q 158 216 162 213" stroke="#0a0a0a" strokeWidth="1.6" fill="none" strokeLinecap="round" />

        {/* Tongue blep */}
        {tongueOut && (
          <path d="M 146 213 Q 150 222 154 213 Q 154 220 150 220 Q 146 220 146 213 Z"
            fill="#E89090" stroke="#0a0a0a" strokeWidth="1" />
        )}

        {/* Whiskers — long thin curves */}
        <g stroke="#bababa" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M 120 200 Q 90 198 60 192" />
          <path d="M 120 205 Q 88 208 56 210" />
          <path d="M 120 210 Q 92 218 65 226" />
          <path d="M 180 200 Q 210 198 240 192" />
          <path d="M 180 205 Q 212 208 244 210" />
          <path d="M 180 210 Q 208 218 235 226" />
        </g>

        {/* Eyebrow whiskers */}
        <g stroke="#bababa" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7">
          <path d="M 116 145 Q 100 140 88 138" />
          <path d="M 184 145 Q 200 140 212 138" />
        </g>
      </g>

      {/* Front paws */}
      <g>
        <ellipse cx="118" cy="335" rx="22" ry="12" fill="#0a0a0a" stroke="#000" strokeWidth="1" />
        <ellipse cx="182" cy="335" rx="22" ry="12" fill="#0a0a0a" stroke="#000" strokeWidth="1" />
        {/* paw fur */}
        <g stroke="#0a0a0a" strokeWidth="1.3" strokeLinecap="round" fill="none">
          {Array.from({ length: 14 }).map((_, i) => {
            const off = i / 13;
            const x = 98 + off * 40;
            return <path key={'l' + i} d={`M ${x} ${325 + (i % 2) * 2} L ${x + (Math.random() - 0.5) * 3} ${315}`} />;
          })}
          {Array.from({ length: 14 }).map((_, i) => {
            const off = i / 13;
            const x = 162 + off * 40;
            return <path key={'r' + i} d={`M ${x} ${325 + (i % 2) * 2} L ${x + (Math.random() - 0.5) * 3} ${315}`} />;
          })}
        </g>
      </g>

      {message && (
        <g>
          <rect x="200" y="60" rx="14" ry="14" width="90" height="36" fill="#fff" stroke="#0a0a0a" strokeWidth="2.5" />
          <text x="245" y="84" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="16" fill="#0a0a0a">
            {message}
          </text>
        </g>
      )}
    </svg>
  );
}

// Helper to create a fresh wet field (Float32Array indexed by strand idx)
function makeWetField() {
  const strands = getStrands();
  return new Float32Array(strands.length);
}

// Apply wet at point (px, py) with radius and intensity
function applyWetAt(field, px, py, radius, amount) {
  const strands = getStrands();
  const r2 = radius * radius;
  for (const s of strands) {
    const dx = s.x - px, dy = s.y - py;
    const d2 = dx * dx + dy * dy;
    if (d2 < r2) {
      const fall = 1 - (d2 / r2);
      field[s.idx] = Math.min(1, field[s.idx] + amount * fall);
    }
  }
}

// Strand count
function strandCount() {
  return getStrands().length;
}

window.HeidiRealistic = HeidiRealistic;
window.makeWetField = makeWetField;
window.applyWetAt = applyWetAt;
window.heidiStrandCount = strandCount;
